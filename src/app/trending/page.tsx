'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaSearch, FaCaretUp, FaCaretDown, FaExternalLinkAlt, FaRegStar, FaStar } from 'react-icons/fa';
import ConnectWalletButton from '../components/ConnectWalletButton';
import Banner from '../components/Banner';
import { getCryptoIconUrl } from '../utils/cryptoIcons';

// Define types
type TrendingToken = {
  id: number;
  name: string;
  symbol: string;
  logo: string;
  price: string;
  priceUsd: string;
  change24h: string;
  marketCap: string;
  volume24h: string;
  rank: number;
  favorite: boolean;
  sparkline: number[];
};

// Mock data for trending tokens
const mockTrendingTokens: TrendingToken[] = [
  {
    id: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: getCryptoIconUrl('btc'),
    price: '65,432.78',
    priceUsd: '$65,432.78',
    change24h: '+2.5%',
    marketCap: '$1.24T',
    volume24h: '$42.8B',
    rank: 1,
    favorite: true,
    sparkline: [42, 45, 43, 47, 50, 48, 52, 53, 56, 54, 58, 60, 58, 62, 65]
  },
  {
    id: 2,
    name: 'Ethereum',
    symbol: 'ETH',
    logo: getCryptoIconUrl('eth'),
    price: '3,456.92',
    priceUsd: '$3,456.92',
    change24h: '+1.8%',
    marketCap: '$415.7B',
    volume24h: '$18.2B',
    rank: 2,
    favorite: true,
    sparkline: [32, 30, 33, 35, 34, 37, 36, 39, 38, 40, 42, 41, 43, 45, 44]
  },
  {
    id: 3,
    name: 'Solana',
    symbol: 'SOL',
    logo: getCryptoIconUrl('sol'),
    price: '142.35',
    priceUsd: '$142.35',
    change24h: '+4.2%',
    marketCap: '$62.8B',
    volume24h: '$3.5B',
    rank: 3,
    favorite: false,
    sparkline: [22, 24, 23, 26, 25, 28, 30, 29, 32, 31, 34, 33, 36, 38, 37]
  },
  {
    id: 4,
    name: 'Binance Coin',
    symbol: 'BNB',
    logo: getCryptoIconUrl('bnb'),
    price: '567.89',
    priceUsd: '$567.89',
    change24h: '-0.7%',
    marketCap: '$87.3B',
    volume24h: '$2.1B',
    rank: 4,
    favorite: false,
    sparkline: [28, 27, 29, 26, 28, 25, 27, 24, 26, 23, 25, 22, 24, 21, 23]
  },
  {
    id: 5,
    name: 'XRP',
    symbol: 'XRP',
    logo: getCryptoIconUrl('xrp'),
    price: '0.5432',
    priceUsd: '$0.5432',
    change24h: '-1.2%',
    marketCap: '$28.9B',
    volume24h: '$1.7B',
    rank: 5,
    favorite: false,
    sparkline: [18, 17, 19, 16, 18, 15, 17, 14, 16, 13, 15, 12, 14, 11, 13]
  },
  {
    id: 6,
    name: 'Cardano',
    symbol: 'ADA',
    logo: getCryptoIconUrl('ada'),
    price: '0.4321',
    priceUsd: '$0.4321',
    change24h: '+0.5%',
    marketCap: '$15.2B',
    volume24h: '$0.8B',
    rank: 6,
    favorite: true,
    sparkline: [12, 13, 11, 14, 10, 15, 9, 16, 8, 17, 7, 18, 6, 19, 5]
  },
  {
    id: 7,
    name: 'Dogecoin',
    symbol: 'DOGE',
    logo: getCryptoIconUrl('doge'),
    price: '0.1234',
    priceUsd: '$0.1234',
    change24h: '+8.7%',
    marketCap: '$16.8B',
    volume24h: '$2.3B',
    rank: 7,
    favorite: false,
    sparkline: [8, 10, 9, 11, 10, 12, 11, 13, 12, 14, 13, 15, 14, 16, 15]
  },
  {
    id: 8,
    name: 'Polygon',
    symbol: 'MATIC',
    logo: getCryptoIconUrl('matic'),
    price: '0.7654',
    priceUsd: '$0.7654',
    change24h: '+3.2%',
    marketCap: '$7.5B',
    volume24h: '$0.6B',
    rank: 8,
    favorite: false,
    sparkline: [14, 15, 13, 16, 12, 17, 11, 18, 10, 19, 9, 20, 8, 21, 7]
  },
  {
    id: 9,
    name: 'Avalanche',
    symbol: 'AVAX',
    logo: getCryptoIconUrl('avax'),
    price: '34.56',
    priceUsd: '$34.56',
    change24h: '+2.1%',
    marketCap: '$12.3B',
    volume24h: '$0.9B',
    rank: 9,
    favorite: true,
    sparkline: [20, 22, 21, 23, 22, 24, 23, 25, 24, 26, 25, 27, 26, 28, 27]
  },
  {
    id: 10,
    name: 'Chainlink',
    symbol: 'LINK',
    logo: getCryptoIconUrl('link'),
    price: '15.43',
    priceUsd: '$15.43',
    change24h: '-0.3%',
    marketCap: '$8.7B',
    volume24h: '$0.5B',
    rank: 10,
    favorite: false,
    sparkline: [16, 15, 17, 14, 18, 13, 19, 12, 20, 11, 21, 10, 22, 9, 23]
  }
];

// Sparkline chart component
const SparklineChart = ({ data, change }: { data: number[], change: string }) => {
  const isPositive = change.startsWith('+');
  const color = isPositive ? '#26a69a' : '#ef5350';
  
  // Calculate the path for the sparkline
  const width = 100;
  const height = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function TrendingPage() {
  const [darkMode] = useState(true);
  const [tokens, setTokens] = useState<TrendingToken[]>(mockTrendingTokens);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof TrendingToken; direction: 'ascending' | 'descending' } | null>(null);
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [activeFilter, setActiveFilter] = useState<'all' | 'gainers' | 'losers' | 'favorites'>('all');
  
  // Toggle favorite status for a token
  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTokens(tokens.map(token => 
      token.id === id ? { ...token, favorite: !token.favorite } : token
    ));
  };

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Sort tokens
  const requestSort = (key: keyof TrendingToken) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedTokens = React.useMemo(() => {
    const sortableTokens = [...tokens];
    if (sortConfig !== null) {
      sortableTokens.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTokens;
  }, [tokens, sortConfig]);

  // Filter tokens
  const filteredTokens = React.useMemo(() => {
    return sortedTokens.filter(token => {
      const matchesSearch = token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           token.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeFilter === 'gainers') {
        return matchesSearch && token.change24h.startsWith('+');
      } else if (activeFilter === 'losers') {
        return matchesSearch && token.change24h.startsWith('-');
      } else if (activeFilter === 'favorites') {
        return matchesSearch && token.favorite;
      } else {
        return matchesSearch;
      }
    });
  }, [sortedTokens, searchTerm, activeFilter]);

  // Get sort direction indicator
  const getSortDirectionIndicator = (key: keyof TrendingToken) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <FaCaretUp className="ml-1" /> : <FaCaretDown className="ml-1" />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Banner */}
      <Banner />
      
      {/* Header with search and wallet */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Trending</h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tokens..."
                className="bg-gray-800 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
            <ConnectWalletButton />
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-lg ${activeFilter === 'all' ? 'bg-blue-600' : 'bg-gray-800'}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${activeFilter === 'gainers' ? 'bg-blue-600' : 'bg-gray-800'}`}
              onClick={() => setActiveFilter('gainers')}
            >
              Gainers
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${activeFilter === 'losers' ? 'bg-blue-600' : 'bg-gray-800'}`}
              onClick={() => setActiveFilter('losers')}
            >
              Losers
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${activeFilter === 'favorites' ? 'bg-blue-600' : 'bg-gray-800'}`}
              onClick={() => setActiveFilter('favorites')}
            >
              Favorites
            </button>
          </div>
          
          <div className="flex space-x-2 ml-auto">
            <button
              className={`px-4 py-2 rounded-lg ${timeframe === '1h' ? 'bg-blue-600' : 'bg-gray-800'}`}
              onClick={() => setTimeframe('1h')}
            >
              1H
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${timeframe === '24h' ? 'bg-blue-600' : 'bg-gray-800'}`}
              onClick={() => setTimeframe('24h')}
            >
              24H
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${timeframe === '7d' ? 'bg-blue-600' : 'bg-gray-800'}`}
              onClick={() => setTimeframe('7d')}
            >
              7D
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${timeframe === '30d' ? 'bg-blue-600' : 'bg-gray-800'}`}
              onClick={() => setTimeframe('30d')}
            >
              30D
            </button>
          </div>
        </div>
        
        {/* Trending Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0f1923] p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">Total Market Cap</h3>
            <div className="text-xl font-bold">$2.45T</div>
            <div className="text-green-500 text-sm">+1.8% (24h)</div>
          </div>
          
          <div className="bg-[#0f1923] p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">24h Trading Volume</h3>
            <div className="text-xl font-bold">$98.7B</div>
            <div className="text-red-500 text-sm">-2.3% (24h)</div>
          </div>
          
          <div className="bg-[#0f1923] p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">BTC Dominance</h3>
            <div className="text-xl font-bold">48.2%</div>
            <div className="text-green-500 text-sm">+0.5% (24h)</div>
          </div>
        </div>
        
        {/* Tokens Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => requestSort('rank')}
                  >
                    Rank {getSortDirectionIndicator('rank')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => requestSort('name')}
                  >
                    Name {getSortDirectionIndicator('name')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => requestSort('price')}
                  >
                    Price {getSortDirectionIndicator('price')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => requestSort('change24h')}
                  >
                    24h Change {getSortDirectionIndicator('change24h')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <span>Chart (7d)</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => requestSort('marketCap')}
                  >
                    Market Cap {getSortDirectionIndicator('marketCap')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => requestSort('volume24h')}
                  >
                    Volume (24h) {getSortDirectionIndicator('volume24h')}
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTokens.map((token) => (
                <tr 
                  key={token.id} 
                  className="hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => console.log(`Navigate to token details: ${token.symbol}`)}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">#{token.rank}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 relative">
                        <Image 
                          src={token.logo} 
                          alt={token.name} 
                          width={32} 
                          height={32} 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">{token.name}</div>
                        <div className="text-sm text-gray-400">{token.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">${token.price}</div>
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap ${token.change24h.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    <div className="text-sm font-medium">{token.change24h}</div>
                  </td>
                  <td className="px-4 py-4">
                    <SparklineChart data={token.sparkline} change={token.change24h} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">{token.marketCap}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">{token.volume24h}</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button 
                        onClick={(e) => toggleFavorite(token.id, e)}
                        className="text-yellow-500 focus:outline-none"
                      >
                        {token.favorite ? <FaStar /> : <FaRegStar />}
                      </button>
                      <button className="text-blue-500 focus:outline-none">
                        <FaExternalLinkAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Hot Trends Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Hot Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Trending Category Cards */}
            <div className="bg-[#0f1923] rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer">
              <h3 className="font-medium mb-2">DeFi</h3>
              <div className="text-sm text-gray-400 mb-2">Top DeFi tokens by market cap</div>
              <div className="flex items-center justify-between">
                <div className="text-green-500">+5.2%</div>
                <div className="text-sm text-gray-400">24h change</div>
              </div>
            </div>
            
            <div className="bg-[#0f1923] rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer">
              <h3 className="font-medium mb-2">NFTs</h3>
              <div className="text-sm text-gray-400 mb-2">Top NFT tokens by volume</div>
              <div className="flex items-center justify-between">
                <div className="text-red-500">-2.8%</div>
                <div className="text-sm text-gray-400">24h change</div>
              </div>
            </div>
            
            <div className="bg-[#0f1923] rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer">
              <h3 className="font-medium mb-2">Layer 2</h3>
              <div className="text-sm text-gray-400 mb-2">Top L2 scaling solutions</div>
              <div className="flex items-center justify-between">
                <div className="text-green-500">+8.7%</div>
                <div className="text-sm text-gray-400">24h change</div>
              </div>
            </div>
            
            <div className="bg-[#0f1923] rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer">
              <h3 className="font-medium mb-2">Meme Coins</h3>
              <div className="text-sm text-gray-400 mb-2">Top meme coins by volume</div>
              <div className="flex items-center justify-between">
                <div className="text-green-500">+12.4%</div>
                <div className="text-sm text-gray-400">24h change</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
