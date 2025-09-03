'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaSearch, FaCaretUp, FaCaretDown, FaExternalLinkAlt, FaRegStar, FaStar } from 'react-icons/fa';
import ConnectWalletButton from '../../components/ConnectWalletButton';
import Banner from '../../components/Banner';
import { getCryptoIconUrl } from '../utils/cryptoIcons';
import Header from '../../components/Header';
import { coinGeckoService, CoinGeckoMarketData } from '../../api/coingecko/trending';

// Define types
type TrendingToken = {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  priceUsd: string;
  change24h: number;
  change24hFormatted: string;
  marketCap: number;
  marketCapFormatted: string;
  volume24h: number;
  volume24hFormatted: string;
  rank: number;
  favorite: boolean;
  sparkline: number[];
};

type GlobalMarketData = {
  totalMarketCap: string;
  totalVolume: string;
  btcDominance: string;
  marketCapChange24h: number;
  volumeChange24h: number;
};

// Convert CoinGecko data to TrendingToken format
const convertToTrendingToken = (coin: CoinGeckoMarketData, favorites: Set<string>): TrendingToken => {
  return {
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    logo: coin.image,
    price: coin.current_price,
    priceUsd: `$${coinGeckoService.formatPrice(coin.current_price)}`,
    change24h: coin.price_change_percentage_24h || 0,
    change24hFormatted: coinGeckoService.formatPercentageChange(coin.price_change_percentage_24h || 0),
    marketCap: coin.market_cap,
    marketCapFormatted: coinGeckoService.formatMarketCap(coin.market_cap),
    volume24h: coin.total_volume,
    volume24hFormatted: coinGeckoService.formatVolume(coin.total_volume),
    rank: coin.market_cap_rank,
    favorite: favorites.has(coin.id),
    sparkline: coin.sparkline_in_7d?.price?.slice(-15) || []
  };
};

// Sparkline chart component
const SparklineChart = ({ data, change }: { data: number[], change: number }) => {
  const isPositive = change >= 0;
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
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalData, setGlobalData] = useState<GlobalMarketData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof TrendingToken; direction: 'ascending' | 'descending' } | null>(null);
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [activeFilter, setActiveFilter] = useState<'all' | 'gainers' | 'losers' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Load market data from CoinGecko
  const loadMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get top 20 cryptocurrencies and global data in parallel
      const [marketData, globalResponse] = await Promise.all([
        coinGeckoService.getTopCryptocurrencies(20),
        coinGeckoService.getGlobalMarketData().catch(err => {
          console.warn('Global data failed, using fallback:', err);
          return { data: { 
            total_market_cap: { usd: 0 }, 
            total_volume: { usd: 0 }, 
            market_cap_percentage: { btc: 0 },
            market_cap_change_percentage_24h_usd: 0
          }};
        })
      ]);
      
      // Convert to TrendingToken format
      const trendingTokens = marketData.map(coin => convertToTrendingToken(coin, favorites));
      
      // Set global market data with fallback
      const global = globalResponse.data;
      setGlobalData({
        totalMarketCap: global.total_market_cap?.usd ? coinGeckoService.formatMarketCap(global.total_market_cap.usd) : 'N/A',
        totalVolume: global.total_volume?.usd ? coinGeckoService.formatVolume(global.total_volume.usd) : 'N/A',
        btcDominance: global.market_cap_percentage?.btc ? `${global.market_cap_percentage.btc.toFixed(1)}%` : 'N/A',
        marketCapChange24h: global.market_cap_change_percentage_24h_usd || 0,
        volumeChange24h: 0 // CoinGecko doesn't provide volume change in global endpoint
      });
      
      setTokens(trendingTokens);
    } catch (err) {
      console.error('Error loading market data:', err);
      setError('Failed to load market data. Using cached data if available.');
      
      // Try to show cached data if available
      if (tokens.length === 0) {
        setError('Failed to load market data. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status for a token
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    
    // Update tokens with new favorite status
    setTokens(tokens.map(token => 
      token.id === id ? { ...token, favorite: newFavorites.has(id) } : token
    ));
  };

  // Load data on component mount and set up refresh interval
  useEffect(() => {
    loadMarketData();
    
    // Refresh data every 10 minutes to reduce API calls
    const interval = setInterval(() => {
      // Only refresh if not currently loading
      if (!loading) {
        loadMarketData();
      }
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loading]);

  // Update favorites when tokens change
  useEffect(() => {
    setTokens(prevTokens => 
      prevTokens.map(token => ({
        ...token,
        favorite: favorites.has(token.id)
      }))
    );
  }, [favorites]);

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
        return matchesSearch && token.change24h > 0;
      } else if (activeFilter === 'losers') {
        return matchesSearch && token.change24h < 0;
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
    <div className="min-h-screen  text-white">
      {/* Banner */}
      {/* <Header /> */}
      
      {/* Header with search and wallet */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Top 20 Cryptocurrencies</h1>
          
          <div className="flex items-center space-x-4">
         
       
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-lg ${activeFilter === 'all' ? 'bg-cyan-500' : 'bg-gray-800'}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${activeFilter === 'gainers' ? 'bg-cyan-500' : 'bg-gray-800'}`}
              onClick={() => setActiveFilter('gainers')}
            >
              Gainers
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${activeFilter === 'losers' ? 'bg-cyan-500' : 'bg-gray-800'}`}
              onClick={() => setActiveFilter('losers')}
            >
              Losers
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${activeFilter === 'favorites' ? 'bg-cyan-500' : 'bg-gray-800'}`}
              onClick={() => setActiveFilter('favorites')}
            >
              Favorites
            </button>
          </div>
          
          <div className="flex space-x-2 ml-auto">
            <button
              className={`px-4 py-2 rounded-lg ${timeframe === '1h' ? 'bg-cyan-500' : 'bg-gray-800'}`}
              onClick={() => setTimeframe('1h')}
            >
              1H
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${timeframe === '24h' ? 'bg-cyan-500' : 'bg-gray-800'}`}
              onClick={() => setTimeframe('24h')}
            >
              24H
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${timeframe === '7d' ? 'bg-cyan-500' : 'bg-gray-800'}`}
              onClick={() => setTimeframe('7d')}
            >
              7D
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${timeframe === '30d' ? 'bg-cyan-500' : 'bg-gray-800'}`}
              onClick={() => setTimeframe('30d')}
            >
              30D
            </button>
          </div>
        </div>
        
        {/* Skeleton Loading State */}
        {loading && (
          <>
            {/* Skeleton Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--border-color)]">
                  <div className="h-4 bg-gray-700 rounded animate-pulse mb-2 w-24"></div>
                  <div className="h-6 bg-gray-700 rounded animate-pulse mb-1 w-32"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
                </div>
              ))}
            </div>

            {/* Skeleton Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-[var(--card-bg)] rounded-lg overflow-hidden border border-[var(--border-color)]">
                <thead className="bg-[var(--header-bg)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">24h Change</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Market Cap</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Volume (24h)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Chart</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {[...Array(20)].map((_, index) => (
                    <tr key={index} className="hover:bg-[var(--hover-bg)] transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-6"></div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-700 rounded-full animate-pulse mr-3"></div>
                          <div>
                            <div className="h-4 bg-gray-700 rounded animate-pulse w-16 mb-1"></div>
                            <div className="h-3 bg-gray-700 rounded animate-pulse w-12"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-8 bg-gray-700 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 w-4 bg-gray-700 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="text-red-400">{error}</div>
            <button 
              onClick={loadMarketData}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Trending Stats Cards */}
        {globalData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--border-color)]">
              <h3 className="text-gray-400 text-sm mb-1">Total Market Cap</h3>
              <div className="text-xl font-bold">{globalData.totalMarketCap}</div>
              <div className={`text-sm ${globalData.marketCapChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {coinGeckoService.formatPercentageChange(globalData.marketCapChange24h)} (24h)
              </div>
            </div>
            
            <div className="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--border-color)]">
              <h3 className="text-gray-400 text-sm mb-1">24h Trading Volume</h3>
              <div className="text-xl font-bold">{globalData.totalVolume}</div>
              <div className="text-gray-400 text-sm">Global volume</div>
            </div>
            
            <div className="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--border-color)]">
              <h3 className="text-gray-400 text-sm mb-1">BTC Dominance</h3>
              <div className="text-xl font-bold">{globalData.btcDominance}</div>
              <div className="text-gray-400 text-sm">Market share</div>
            </div>
          </div>
        )}
        
        {/* Tokens Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[var(--card-bg)] rounded-lg overflow-hidden border border-[var(--border-color)]">
              <thead className="bg-[var(--header-bg)]">
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
                    <div className="text-sm font-medium">{token.priceUsd}</div>
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <div className="text-sm font-medium">{token.change24hFormatted}</div>
                  </td>
                  <td className="px-4 py-4">
                    <SparklineChart data={token.sparkline} change={token.change24h} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">{token.marketCapFormatted}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm">{token.volume24hFormatted}</div>
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
        )}
        
        {/* Hot Trends Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Hot Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Trending Category Cards */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-4 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer">
              <h3 className="font-medium mb-2">DeFi</h3>
              <div className="text-sm text-gray-400 mb-2">Top DeFi tokens by market cap</div>
              <div className="flex items-center justify-between">
                <div className="text-green-500">+5.2%</div>
                <div className="text-sm text-gray-400">24h change</div>
              </div>
            </div>
            
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-4 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer">
              <h3 className="font-medium mb-2">NFTs</h3>
              <div className="text-sm text-gray-400 mb-2">Top NFT tokens by volume</div>
              <div className="flex items-center justify-between">
                <div className="text-red-500">-2.8%</div>
                <div className="text-sm text-gray-400">24h change</div>
              </div>
            </div>
            
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-4 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer">
              <h3 className="font-medium mb-2">Layer 2</h3>
              <div className="text-sm text-gray-400 mb-2">Top L2 scaling solutions</div>
              <div className="flex items-center justify-between">
                <div className="text-green-500">+8.7%</div>
                <div className="text-sm text-gray-400">24h change</div>
              </div>
            </div>
            
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-4 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer">
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
