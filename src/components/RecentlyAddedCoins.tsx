'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getRecentlyAddedCoins } from '../api/coingecko/client';
import { useRouter } from 'next/navigation';
import tokens from '@/data/tokens.json';
import { fetchCoinPlatforms } from '@/api/coingecko/api';

interface RecentCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
}

// Local storage key for caching
const STORAGE_KEY = 'recently_added_coins';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

export default function RecentlyAddedCoins() {
  const [coins, setCoins] = useState<RecentCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to retry fetching data
  const retryFetch = () => {
    setError(null);
    setLoading(true);
    // This will trigger the useEffect to run again
    setCoins([]);
  };

  useEffect(() => {
    // Function to load data from cache
    const loadFromCache = () => {
      try {
        if (typeof window !== 'undefined') {
          const cachedData = localStorage.getItem(STORAGE_KEY);
          if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            const now = Date.now();

            // Check if cache is still valid (not expired)
            if (now - timestamp < CACHE_EXPIRY) {
              console.log('Loading recently added coins from cache');
              setCoins(data);
              setLoading(false);
              return true;
            }
          }
        }
        return false;
      } catch (e) {
        console.error('Error loading from cache:', e);
        return false;
      }
    };

    // Function to save data to cache
    const saveToCache = (data: RecentCoin[]) => {
      try {
        if (typeof window !== 'undefined') {
          const cacheData = {
            data,
            timestamp: Date.now(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
        }
      } catch (e) {
        console.error('Error saving to cache:', e);
      }
    };

    const fetchRecentCoins = async (retries = 2) => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          // Try to load from cache first if we're in loading state
          if (loading && loadFromCache()) {
            return; // Exit if we successfully loaded from cache
          }

          setLoading(true);
          setError(null);
          
          const data = await getRecentlyAddedCoins('usd', 10);
          
          if (data && data.length > 0) {
            setCoins(data);
            saveToCache(data); // Save the fresh data to cache
            setError(null);
            setLoading(false);
            return;
          } else {
            throw new Error('No data received from API');
          }
        } catch (err) {
          console.error(`Error fetching recently added coins (attempt ${attempt + 1}):`, err);

          if (attempt < retries) {
            // Wait before retrying with exponential backoff
            const delay = 1000 * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          // Final attempt failed - check for cached data
          if (!loadFromCache()) {
            setError('Failed to load recently added coins. Please check your connection and try again.');
          } else {
            console.log('Using cached data due to API failure');
          }

          setLoading(false);
        }
      }
    };

    // Try to load from cache immediately
    if (!loadFromCache()) {
      fetchRecentCoins();
    }

    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchRecentCoins, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [loading]);

  // Format price with appropriate decimal places
  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 10) return price.toFixed(2);
    return price.toFixed(2);
  };

  // Format market cap and volume
  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const handleNavigate = async (coin: RecentCoin) => {
    const base = coin.symbol?.toUpperCase() || coin.name?.toUpperCase();
    if (!base) return;

    const list = tokens as Array<{ symbol: string; chain: string; address: string; name: string }>;
    const matches = list.filter(t => t.symbol.toUpperCase() === base);
    let selected = matches.find(t => t.chain && t.chain.toLowerCase() === 'ethereum') || matches[0];
    let chain = selected?.chain;
    let address = selected?.address;

    if (!chain || !address) {
      try {
        const platforms = await fetchCoinPlatforms(coin.id);
        if (platforms) {
          const platformToChain: Record<string, string> = {
            ethereum: 'ethereum',
            'binance-smart-chain': 'binance',
            'polygon-pos': 'polygon',
            avalanche: 'avalanche',
            fantom: 'fantom',
            base: 'base',
            'arbitrum-one': 'arbitrum',
            'optimistic-ethereum': 'optimism',
            solana: 'solana',
          };
          const preference = [
            'ethereum',
            'arbitrum-one',
            'optimistic-ethereum',
            'base',
            'polygon-pos',
            'binance-smart-chain',
            'avalanche',
            'fantom',
            'solana',
          ];
          for (const key of preference) {
            const addr = (platforms as any)[key];
            if (addr) {
              chain = platformToChain[key] || key;
              address = addr;
              break;
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch platforms for', coin.id, e);
      }
    }

    const params = new URLSearchParams({ base });
    if (chain) params.set('chain', chain);
    if (address) params.set('address', address);

    router.push(`/dashboard/trade?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Recently Added Coins</h2>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={`skeleton-${index}`} className="rounded-lg p-2 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-700/60 rounded-full mr-3"></div>
                <div>
                  <div className="h-4 bg-gray-700/60 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-700/60 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-700/60 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-700/60 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 max-w-sm mx-auto">
            <div className="text-red-400 mb-2">⚠️ Failed to load recently added coins</div>
            <p className="text-gray-400 text-sm mb-3">{error}</p>
            <button
              onClick={retryFetch}
              className="px-4 py-2 bg-[#00b8d8] hover:bg-[#00a6c4] text-white rounded-full text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : coins.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400">
            <div className="text-2xl mb-2">🆕</div>
            <p>No recently added coins available</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {coins.map(coin => (
            <div
              key={coin.id}
              className="rounded-lg p-2 flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer hover:bg-gray-800/40"
              onClick={() => handleNavigate(coin)}
            >
              <div className="flex items-center">
                <div className="relative h-8 w-8 mr-3">
                  <Image
                    src={coin.image}
                    alt={coin.name}
                    fill
                    className="rounded-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <div className="font-medium">{coin.name}</div>
                  <div className="text-gray-400 text-xs">{coin.symbol.toUpperCase()}</div>
                </div>
              </div>

              <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 flex justify-between sm:block">
                <div className="font-medium">${formatPrice(coin.current_price)}</div>
                <div
                  className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
