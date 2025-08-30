'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

const GainersLosers = () => {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/gainerloser.json');
        const data = await response.json();
        setCoins(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching coin data:', error);
        setIsLoading(false);
      }
    };

    fetchCoins();
  }, []);

  // Sort coins by price change percentage
  const gainers = [...coins]
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5);

  const losers = [...coins]
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5);

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 10) return price.toFixed(2);
    return price.toFixed(2);
  };

  return (
    <div className="bg-[#111] rounded-xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Market Movers</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('gainers')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'gainers'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            Top Gainers
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'losers'
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            Top Losers
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-gray-400 text-sm">
                <th className="text-left py-2">#</th>
                <th className="text-left py-2">Coin</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">24h Change</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'gainers' ? gainers : losers).map((coin, index) => (
                <tr key={coin.id} className="border-t border-gray-800">
                  <td className="py-3 text-gray-400">{index + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-3 rounded-full overflow-hidden">
                        <Image
                          src={coin.image}
                          alt={coin.name}
                          width={32}
                          height={32}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-white">{coin.name}</div>
                        <div className="text-gray-400 text-xs">{coin.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right text-white">
                    ${formatPrice(coin.current_price)}
                  </td>
                  <td className={`py-3 text-right ${
                    coin.price_change_percentage_24h >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}>
                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GainersLosers;
