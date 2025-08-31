'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getRecentlyAddedCoins } from '../api/coingecko/client';

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

export default function RecentlyAddedCoins() {
  const [coins, setCoins] = useState<RecentCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentCoins = async () => {
      try {
        setLoading(true);
        const data = await getRecentlyAddedCoins('usd', 10);
        setCoins(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recently added coins:', err);
        setError('Failed to load recently added coins');
        setLoading(false);
      }
    };

    fetchRecentCoins();

    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchRecentCoins, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

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

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Recently Added Coins</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 bg-red-900 bg-opacity-20 rounded">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          {coins.map((coin) => (
            <div key={coin.id} className=" rounded-lg p-2 flex justify-between items-center">
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
              
              <div className="text-right">
                <div className="font-medium">${formatPrice(coin.current_price)}</div>
                <div className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
          
          {coins.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              No recently added coins found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
