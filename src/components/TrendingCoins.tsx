'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getTrendingCoins } from '../api/coingecko/client';

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  score: number;
  price_btc: number;
}

export default function TrendingCoins() {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        setLoading(true);
        const data = await getTrendingCoins();
        
        // CoinGecko returns trending coins in a nested structure
        if (data && data.coins) {
          const formattedCoins = data.coins.map((item: any) => ({
            id: item.item.id,
            name: item.item.name,
            symbol: item.item.symbol,
            market_cap_rank: item.item.market_cap_rank,
            thumb: item.item.thumb,
            score: item.item.score,
            price_btc: item.item.price_btc
          }));
          
          setTrendingCoins(formattedCoins);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trending coins:', err);
        setError('Failed to load trending coins');
        setLoading(false);
      }
    };

    fetchTrendingCoins();

    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchTrendingCoins, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Format BTC price with appropriate decimal places
  const formatBtcPrice = (price: number) => {
    if (price < 0.00001) return price.toFixed(8);
    if (price < 0.0001) return price.toFixed(7);
    if (price < 0.001) return price.toFixed(6);
    return price.toFixed(6);
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Trending Search List</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 bg-red-900 bg-opacity-20 rounded">
          {error}
        </div>
      ) : (
        <div className="space-y-3">
          {trendingCoins.map((coin) => (
            <div key={coin.id} className="rounded-lg p-2 flex flex-col sm:flex-row sm:justify-between sm:items-center">
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
                  <div className="text-gray-400 text-xs">{coin.symbol.toUpperCase()}</div>
                </div>
              </div>
              
              <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 flex justify-between sm:block">
                <div className="font-medium text-sm flex items-center">
                  {/* <Image 
                    src="/bitcoin.svg" 
                    alt="BTC" 
                    width={12} 
                    height={12} 
                    className="mr-1"
                    unoptimized
                  /> */}
                  {/* {formatBtcPrice(coin.price_btc)} */}
                </div>
                <div className="text-xs text-gray-400">
                  Rank #{coin.market_cap_rank || 'N/A'}
                </div>
              </div>
            </div>
          ))}
          
          {trendingCoins.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              No trending coins found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
