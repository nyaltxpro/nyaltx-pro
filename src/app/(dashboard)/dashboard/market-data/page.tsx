'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMarketData } from '../../../../api/websocket/useMarketData';
import DailyGainers from '../../../../components/DailyGainers';
import RecentlyAddedCoins from '../../../../components/RecentlyAddedCoins';
import TrendingCoins from '../../../../components/TrendingCoins';

export default function MarketDataPage() {
  const [selectedCoins, setSelectedCoins] = useState<string[]>([
    'bitcoin', 'ethereum', 'solana', 'arbitrum', 'binancecoin'
  ]);
  const [customCoin, setCustomCoin] = useState('');
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');
  
  // Use our websocket hook to get market data
  const { 
    marketData, 
    isLoading, 
    error, 
    isConnected 
  } = useMarketData({
    coinIds: selectedCoins,
    pollingInterval: 15000, // Update every 15 seconds
  });
  
  // Add a custom coin to the tracked list
  const handleAddCoin = () => {
    if (customCoin && !selectedCoins.includes(customCoin)) {
      setSelectedCoins([...selectedCoins, customCoin]);
      setCustomCoin('');
    }
  };
  
  // Remove a coin from the tracked list
  const handleRemoveCoin = (coin: string) => {
    setSelectedCoins(selectedCoins.filter(c => c !== coin));
  };
  
  // Format price with appropriate decimal places
  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 10) return price.toFixed(2);
    return price.toFixed(2);
  };
  
  // Format large numbers with K, M, B suffixes
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
  
  // Get price change percentage based on selected timeframe
  const getPriceChange = (coin: any) => {
    switch (timeframe) {
      case '1h':
        return coin.price_change_percentage_1h_in_currency;
      case '7d':
        return coin.price_change_percentage_7d_in_currency;
      default:
        return coin.price_change_percentage_24h;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Crypto Market Data</h1>
          <p className="text-gray-400">
            Real-time market data powered by CoinGecko API with WebSocket simulation
          </p>
          <div className="mt-4 flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'} - Updates every 15 seconds
            </span>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tracked Coins</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setTimeframe('1h')}
                    className={`px-3 py-1 text-sm rounded ${timeframe === '1h' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    1H
                  </button>
                  <button 
                    onClick={() => setTimeframe('24h')}
                    className={`px-3 py-1 text-sm rounded ${timeframe === '24h' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    24H
                  </button>
                  <button 
                    onClick={() => setTimeframe('7d')}
                    className={`px-3 py-1 text-sm rounded ${timeframe === '7d' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    7D
                  </button>
                </div>
              </div>
              
              <div className="flex mb-4">
                <input
                  type="text"
                  value={customCoin}
                  onChange={(e) => setCustomCoin(e.target.value)}
                  placeholder="Add coin (e.g., cardano)"
                  className="flex-1 px-4 py-2 bg-gray-700 rounded-l focus:outline-none"
                />
                <button
                  onClick={handleAddCoin}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r"
                >
                  Add
                </button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 p-4 bg-red-900 bg-opacity-20 rounded">
                  Error loading market data. Please try again later.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="pb-2">#</th>
                        <th className="pb-2">Coin</th>
                        <th className="pb-2">Price</th>
                        <th className="pb-2">Change ({timeframe})</th>
                        <th className="pb-2">Market Cap</th>
                        <th className="pb-2">Volume (24h)</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketData.map((coin, index) => (
                        <tr key={coin.id} className="border-b border-gray-700">
                          <td className="py-4">{coin.market_cap_rank || index + 1}</td>
                          <td className="py-4">
                            <div className="flex items-center">
                              <Image
                                src={coin.image}
                                alt={coin.name}
                                width={24}
                                height={24}
                                className="mr-2 rounded-full"
                                unoptimized
                              />
                              <div>
                                <div className="font-medium">{coin.name}</div>
                                <div className="text-gray-400 text-sm">{coin.symbol.toUpperCase()}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">${formatPrice(coin.current_price)}</td>
                          <td className="py-4">
                            <span className={getPriceChange(coin) >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {getPriceChange(coin) >= 0 ? '+' : ''}{getPriceChange(coin)?.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-4">{formatNumber(coin.market_cap)}</td>
                          <td className="py-4">{formatNumber(coin.total_volume)}</td>
                          <td className="py-4">
                            <button
                              onClick={() => handleRemoveCoin(coin.id)}
                              className="text-red-500 hover:text-red-400"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Daily Gainers & Losers</h2>
              <DailyGainers />
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <TrendingCoins />
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <RecentlyAddedCoins />
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">About This Page</h2>
              <p className="text-gray-400 mb-4">
                This page demonstrates the use of our custom WebSocket implementation 
                that simulates real-time data using the CoinGecko API with rate limiting.
              </p>
              <p className="text-gray-400 mb-4">
                The data is automatically refreshed every 15 seconds to provide 
                near real-time market information without exceeding API rate limits.
              </p>
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="text-sm font-semibold mb-2">Implementation Details:</h3>
                <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                  <li>Rate-limited CoinGecko API client</li>
                  <li>WebSocket simulation with polling</li>
                  <li>React hooks for easy component integration</li>
                  <li>Automatic data refresh</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
