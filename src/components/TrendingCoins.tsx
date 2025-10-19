'use client';

import { fetchCoinPlatforms } from '@/api/coingecko/api';
import tokens from '@/data/tokens.json';
import { useTrendingCoins } from '@/hooks/useTrendingCoins';
import { CachedTrendingCoin } from '@/store/slices/searchCacheSlice';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface DexScreenerBoost {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
}

export default function TrendingCoins() {
  const { trendingCoins, loading, error, refreshTrendingCoins, hasCachedData } = useTrendingCoins();
  const router = useRouter();
  
  // DexScreener boosted tokens state
  const [boostedTokens, setBoostedTokens] = useState<DexScreenerBoost[]>([]);
  const [boostedLoading, setBoostedLoading] = useState(false);
  const [boostedError, setBoostedError] = useState<string | null>(null);
  const [showBoosted, setShowBoosted] = useState(true);

  // Format BTC price with appropriate decimal places
  const formatBtcPrice = (price: number) => {
    if (price < 0.00001) return price.toFixed(8);
    if (price < 0.0001) return price.toFixed(7);
    if (price < 0.001) return price.toFixed(6);
    return price.toFixed(6);
  };

  // Format USD price with appropriate decimal places
  const formatUsdPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (numPrice < 0.000001) return `$${numPrice.toFixed(8)}`;
    if (numPrice < 0.0001) return `$${numPrice.toFixed(6)}`;
    if (numPrice < 0.01) return `$${numPrice.toFixed(4)}`;
    if (numPrice < 1) return `$${numPrice.toFixed(3)}`;
    return `$${numPrice.toFixed(2)}`;
  };

  // Format volume with K/M/B suffixes
  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  // Fetch DexScreener boosted tokens
  const fetchBoostedTokens = async () => {
    try {
      setBoostedLoading(true);
      setBoostedError(null);
      
      const response = await fetch('https://api.dexscreener.com/token-boosts/top/v1');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBoostedTokens(data.slice(0, 5)); // Show top 5 boosted tokens
    } catch (err) {
      console.error('Error fetching boosted tokens:', err);
      setBoostedError('Failed to load boosted tokens');
    } finally {
      setBoostedLoading(false);
    }
  };

  // Load boosted tokens on component mount
  useEffect(() => {
    fetchBoostedTokens();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchBoostedTokens, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = async (coin: CachedTrendingCoin) => {
    const base = coin.symbol?.toUpperCase() || coin.name?.toUpperCase();
    if (!base) return;

    // First check local tokens data
    const list = tokens as Array<{ symbol: string; chain: string; address: string; name: string }>;
    const matches = list.filter(t => t.symbol.toUpperCase() === base);
    let selected = matches.find(t => t.chain && t.chain.toLowerCase() === 'ethereum') || matches[0];
    let chain = selected?.chain;
    let address = selected?.address;

    // If not found in local data, use cached contract addresses from Redux
    if (!chain || !address) {
      if (coin.primaryChain && coin.primaryAddress) {
        chain = coin.primaryChain;
        address = coin.primaryAddress;
        console.log(`🔗 Using cached contract address for ${coin.symbol}: ${chain}/${address}`);
      } else if (coin.contractAddresses && Object.keys(coin.contractAddresses).length > 0) {
        // Use the first available contract address
        const availableChains = Object.keys(coin.contractAddresses);
        const chainPreference = ['ethereum', 'arbitrum', 'optimism', 'base', 'polygon', 'binance'];

        for (const preferredChain of chainPreference) {
          if (coin.contractAddresses[preferredChain]) {
            chain = preferredChain;
            address = coin.contractAddresses[preferredChain];
            break;
          }
        }

        // If no preferred chain found, use the first available
        if (!chain && availableChains.length > 0) {
          chain = availableChains[0];
          address = coin.contractAddresses[chain];
        }

        console.log(`🔗 Using cached contract address for ${coin.symbol}: ${chain}/${address}`);
      }
    }

    // Fallback: fetch fresh contract addresses if still not found
    if (!chain || !address) {
      try {
        console.log(`🔍 Fetching fresh contract addresses for ${coin.symbol}...`);
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
            if (addr && addr !== '0x0000000000000000000000000000000000000000') {
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
    params.set('coingecko_id', coin.id);

    router.push(`/dashboard/trade?${params.toString()}`);
  };

  // Handle navigation for boosted tokens
  const handleBoostedNavigate = (token: DexScreenerBoost) => {
    const base = token.baseToken.symbol.toUpperCase();
    const chainMapping: { [key: string]: string } = {
      'ethereum': 'ethereum',
      'bsc': 'binance',
      'polygon': 'polygon',
      'arbitrum': 'arbitrum',
      'optimism': 'optimism',
      'base': 'base',
      'avalanche': 'avalanche',
      'fantom': 'fantom',
      'solana': 'solana'
    };
    
    const chain = chainMapping[token.chainId] || token.chainId;
    const address = token.baseToken.address;
    
    const params = new URLSearchParams({ base });
    if (chain) params.set('chain', chain);
    if (address) params.set('address', address);
    params.set('dexscreener_pair', token.pairAddress);
    
    router.push(`/dashboard/trade?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Trending Tokens</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBoosted(true)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                showBoosted 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🚀 Boosted
            </button>
            <button
              onClick={() => setShowBoosted(false)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                !showBoosted 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📈 Trending
            </button>
          </div>
        </div>
        {/* <div className="flex items-center gap-2">
          {hasCachedData && (
            <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
              📱 Cached
            </span>
          )}
          <button
            onClick={refreshTrendingCoins}
            disabled={loading}
            className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors"
            title="Refresh trending coins"
          >
            {loading ? '🔄' : '↻'} Refresh
          </button>
        </div> */}
      </div>

      {showBoosted ? (
        // DexScreener Boosted Tokens Section
        boostedLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-gray-400">Loading boosted tokens...</span>
          </div>
        ) : boostedError ? (
          <div className="text-red-500 p-4 bg-red-900 bg-opacity-20 rounded">
            <div className="flex justify-between items-center">
              <span>{boostedError}</span>
              <button
                onClick={fetchBoostedTokens}
                className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {boostedTokens.map((token, index) => (
              <div
                key={`${token.chainId}-${token.pairAddress}`}
                className="rounded-lg p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer hover:bg-gray-800/40 border border-orange-500/20 bg-orange-900/10"
                onClick={() => handleBoostedNavigate(token)}
              >
                <div className="flex items-center">
                  <div className="relative h-8 w-8 mr-3 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <span className="text-orange-400 font-bold text-sm">
                      {token.baseToken.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {token.baseToken.name}
                      <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                        🚀 BOOSTED
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs flex items-center gap-2">
                      <span>{token.baseToken.symbol.toUpperCase()}</span>
                      <span className="bg-gray-700 text-gray-300 px-1 rounded text-xs">
                        {token.chainId.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="font-medium text-sm text-green-400">
                    {formatUsdPrice(token.priceUsd)}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center justify-end gap-2">
                    <span className={`${token.priceChange.h24 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {token.priceChange.h24 >= 0 ? '+' : ''}{token.priceChange.h24.toFixed(2)}%
                    </span>
                    <span>Vol: {formatVolume(token.volume.h24)}</span>
                  </div>
                </div>
              </div>
            ))}

            {boostedTokens.length === 0 && (
              <div className="text-center text-gray-400 py-4">No boosted tokens found</div>
            )}
          </div>
        )
      ) : (
        // Original Trending Coins Section
        loading && !hasCachedData ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-400">Loading trending coins...</span>
          </div>
        ) : error && !hasCachedData ? (
          <div className="text-red-500 p-4 bg-red-900 bg-opacity-20 rounded">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={refreshTrendingCoins}
                className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {trendingCoins.slice(0, 5).map(coin => (
              <div
                key={coin.id}
                className="rounded-lg p-2 flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer hover:bg-gray-800/40"
                onClick={() => handleNavigate(coin)}
              >
                <div className="flex items-center">
                  <div className="relative h-8 w-8 mr-3">
                    <Image
                      src={coin.thumb}
                      alt={coin.name}
                      fill
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="font-medium">{coin.name}</div>
                    <div className="text-gray-400 text-xs flex items-center gap-2">
                      <span>{coin.symbol.toUpperCase()}</span>
                      {coin.primaryChain && (
                        <span className="bg-blue-900/30 text-blue-300 px-1 rounded text-xs">
                          {coin.primaryChain}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 flex justify-between sm:block">
                  <div className="font-medium text-sm flex items-center">
                    {coin.price_btc && (
                      <span className="text-orange-400">{formatBtcPrice(coin.price_btc)}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>Rank #{coin.market_cap_rank || 'N/A'}</span>
                    {coin.contractAddresses && Object.keys(coin.contractAddresses).length > 0 && (
                      <span className="text-green-400" title="Contract addresses cached">
                        🔗
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {trendingCoins.length === 0 && (
              <div className="text-center text-gray-400 py-4">No trending coins found</div>
            )}
          </div>
        )
      )}
    </div>
  );
}
