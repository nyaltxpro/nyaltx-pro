'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  FaSearch, 
  FaFilter, 
  FaChartLine, 
  FaExchangeAlt, 
  FaInfoCircle, 
  FaStar, 
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExternalLinkAlt
} from 'react-icons/fa';
import Banner from '../../components/Banner';
import ConnectWalletButton from '../../components/ConnectWalletButton';
import { getCryptoIconUrl } from '../utils/cryptoIcons';
import Header from '@/components/Header';

// Pool type definition
type Pool = {
  id: string;
  token0: {
    symbol: string;
    name: string;
  };
  token1: {
    symbol: string;
    name: string;
  };
  tvl: number;
  volume24h: number;
  volume7d: number;
  fees24h: number;
  apr: number;
  network: string;
  protocol: string;
  isFavorite: boolean;
};

// Network type definition
type Network = {
  id: string;
  name: string;
  icon: string;
};

// Protocol type definition
type Protocol = {
  id: string;
  name: string;
  icon: string;
};

export default function PoolsPage() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Pool; direction: 'ascending' | 'descending' } | null>(
    { key: 'tvl', direction: 'descending' }
  );
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'favorites'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Mock data for pools
  const [pools, setPools] = useState<Pool[]>([
    {
      id: '1',
      token0: { symbol: 'ETH', name: 'Ethereum' },
      token1: { symbol: 'USDT', name: 'Tether' },
      tvl: 245000000,
      volume24h: 12500000,
      volume7d: 87500000,
      fees24h: 37500,
      apr: 12.5,
      network: 'ethereum',
      protocol: 'uniswap',
      isFavorite: false
    },
    {
      id: '2',
      token0: { symbol: 'BTC', name: 'Bitcoin' },
      token1: { symbol: 'USDC', name: 'USD Coin' },
      tvl: 320000000,
      volume24h: 18000000,
      volume7d: 126000000,
      fees24h: 54000,
      apr: 10.2,
      network: 'ethereum',
      protocol: 'uniswap',
      isFavorite: true
    },
    {
      id: '3',
      token0: { symbol: 'ETH', name: 'Ethereum' },
      token1: { symbol: 'USDC', name: 'USD Coin' },
      tvl: 198000000,
      volume24h: 9800000,
      volume7d: 68600000,
      fees24h: 29400,
      apr: 8.9,
      network: 'ethereum',
      protocol: 'uniswap',
      isFavorite: false
    },
    {
      id: '4',
      token0: { symbol: 'MATIC', name: 'Polygon' },
      token1: { symbol: 'USDT', name: 'Tether' },
      tvl: 78000000,
      volume24h: 5200000,
      volume7d: 36400000,
      fees24h: 15600,
      apr: 15.3,
      network: 'polygon',
      protocol: 'quickswap',
      isFavorite: false
    },
    {
      id: '5',
      token0: { symbol: 'SOL', name: 'Solana' },
      token1: { symbol: 'USDC', name: 'USD Coin' },
      tvl: 145000000,
      volume24h: 8700000,
      volume7d: 60900000,
      fees24h: 26100,
      apr: 11.8,
      network: 'solana',
      protocol: 'raydium',
      isFavorite: true
    },
    {
      id: '6',
      token0: { symbol: 'AVAX', name: 'Avalanche' },
      token1: { symbol: 'USDC', name: 'USD Coin' },
      tvl: 92000000,
      volume24h: 6100000,
      volume7d: 42700000,
      fees24h: 18300,
      apr: 14.2,
      network: 'avalanche',
      protocol: 'trader_joe',
      isFavorite: false
    },
    {
      id: '7',
      token0: { symbol: 'BNB', name: 'BNB' },
      token1: { symbol: 'BUSD', name: 'Binance USD' },
      tvl: 175000000,
      volume24h: 9300000,
      volume7d: 65100000,
      fees24h: 27900,
      apr: 9.6,
      network: 'bsc',
      protocol: 'pancakeswap',
      isFavorite: false
    },
    {
      id: '8',
      token0: { symbol: 'ARB', name: 'Arbitrum' },
      token1: { symbol: 'ETH', name: 'Ethereum' },
      tvl: 68000000,
      volume24h: 4500000,
      volume7d: 31500000,
      fees24h: 13500,
      apr: 16.8,
      network: 'arbitrum',
      protocol: 'camelot',
      isFavorite: true
    },
    {
      id: '9',
      token0: { symbol: 'OP', name: 'Optimism' },
      token1: { symbol: 'ETH', name: 'Ethereum' },
      tvl: 52000000,
      volume24h: 3800000,
      volume7d: 26600000,
      fees24h: 11400,
      apr: 15.5,
      network: 'optimism',
      protocol: 'velodrome',
      isFavorite: false
    },
    {
      id: '10',
      token0: { symbol: 'LINK', name: 'Chainlink' },
      token1: { symbol: 'ETH', name: 'Ethereum' },
      tvl: 87000000,
      volume24h: 5800000,
      volume7d: 40600000,
      fees24h: 17400,
      apr: 12.1,
      network: 'ethereum',
      protocol: 'sushiswap',
      isFavorite: false
    }
  ]);

  // Mock data for networks
  const networks: Network[] = [
    { id: 'ethereum', name: 'Ethereum', icon: getCryptoIconUrl('eth') },
    { id: 'bsc', name: 'BNB Chain', icon: getCryptoIconUrl('bnb') },
    { id: 'polygon', name: 'Polygon', icon: getCryptoIconUrl('matic') },
    { id: 'arbitrum', name: 'Arbitrum', icon: getCryptoIconUrl('arb') },
    { id: 'optimism', name: 'Optimism', icon: getCryptoIconUrl('op') },
    { id: 'avalanche', name: 'Avalanche', icon: getCryptoIconUrl('avax') },
    { id: 'solana', name: 'Solana', icon: getCryptoIconUrl('sol') },
  ];

  // Mock data for protocols
  const protocols: Protocol[] = [
    { id: 'uniswap', name: 'Uniswap', icon: getCryptoIconUrl('uni') },
    { id: 'pancakeswap', name: 'PancakeSwap', icon: getCryptoIconUrl('cake') },
    { id: 'sushiswap', name: 'SushiSwap', icon: getCryptoIconUrl('sushi') },
    { id: 'quickswap', name: 'QuickSwap', icon: '/quickswap.png' },
    { id: 'trader_joe', name: 'Trader Joe', icon: '/traderjoe.png' },
    { id: 'raydium', name: 'Raydium', icon: '/raydium.png' },
    { id: 'camelot', name: 'Camelot', icon: '/camelot.png' },
    { id: 'velodrome', name: 'Velodrome', icon: '/velodrome.png' },
  ];

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setPools(pools.map(pool => 
      pool.id === id ? { ...pool, isFavorite: !pool.isFavorite } : pool
    ));
  };

  // Request sort
  const requestSort = (key: keyof Pool) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  // Filter pools
  const filteredPools = pools.filter(pool => {
    // Search term filter
    const searchMatch = 
      pool.token0.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.token1.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.token0.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.token1.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Network filter
    const networkMatch = selectedNetwork ? pool.network === selectedNetwork : true;
    
    // Protocol filter
    const protocolMatch = selectedProtocol ? pool.protocol === selectedProtocol : true;
    
    // Favorites filter
    const favoriteMatch = filterType === 'favorites' ? pool.isFavorite : true;
    
    return searchMatch && networkMatch && protocolMatch && favoriteMatch;
  });

  // Sort pools
  const sortedPools = React.useMemo(() => {
    const sortablePools = [...filteredPools];
    if (sortConfig !== null) {
      sortablePools.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortablePools;
  }, [filteredPools, sortConfig]);

  // Pagination
  const poolsPerPage = 5;
  const indexOfLastPool = currentPage * poolsPerPage;
  const indexOfFirstPool = indexOfLastPool - poolsPerPage;
  const currentPools = sortedPools.slice(indexOfFirstPool, indexOfLastPool);
  const totalPages = Math.ceil(sortedPools.length / poolsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Get sort icon
  const getSortIcon = (key: keyof Pool) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort className="ml-1" />;
    }
    return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Banner */}
      
      <Header/>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
      
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0f1923] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Value Locked</div>
            <div className="text-xl font-bold">$1.46B</div>
            <div className="text-green-500 text-sm">+2.5% (24h)</div>
          </div>
          
          <div className="bg-[#0f1923] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">24h Volume</div>
            <div className="text-xl font-bold">$83.7M</div>
            <div className="text-red-500 text-sm">-1.2% (24h)</div>
          </div>
          
          <div className="bg-[#0f1923] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Fees (24h)</div>
            <div className="text-xl font-bold">$251.1K</div>
            <div className="text-green-500 text-sm">+3.7% (24h)</div>
          </div>
          
          <div className="bg-[#0f1923] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Active Pools</div>
            <div className="text-xl font-bold">1,245</div>
            <div className="text-green-500 text-sm">+12 (24h)</div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-[#0f1923] rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search pools by token name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className={`px-4 py-2 rounded-lg ${filterType === 'all' ? 'bg-blue-600' : 'bg-gray-800'}`}
                onClick={() => setFilterType('all')}
              >
                All Pools
              </button>
              <button 
                className={`px-4 py-2 rounded-lg ${filterType === 'favorites' ? 'bg-blue-600' : 'bg-gray-800'}`}
                onClick={() => setFilterType('favorites')}
              >
                <FaStar className="inline mr-1" /> Favorites
              </button>
              <button 
                className={`px-4 py-2 rounded-lg ${showFilters ? 'bg-blue-600' : 'bg-gray-800'}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="inline mr-1" /> Filters
              </button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Network</label>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className={`px-3 py-1 rounded-lg text-sm ${selectedNetwork === null ? 'bg-blue-600' : 'bg-gray-800'}`}
                      onClick={() => setSelectedNetwork(null)}
                    >
                      All
                    </button>
                    {networks.map(network => (
                      <button 
                        key={network.id}
                        className={`px-3 py-1 rounded-lg text-sm flex items-center ${selectedNetwork === network.id ? 'bg-blue-600' : 'bg-gray-800'}`}
                        onClick={() => setSelectedNetwork(network.id)}
                      >
                        <Image src={network.icon} width={16} height={16} alt={network.name} className="mr-1" />
                        {network.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Protocol</label>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className={`px-3 py-1 rounded-lg text-sm ${selectedProtocol === null ? 'bg-blue-600' : 'bg-gray-800'}`}
                      onClick={() => setSelectedProtocol(null)}
                    >
                      All
                    </button>
                    {protocols.map(protocol => (
                      <button 
                        key={protocol.id}
                        className={`px-3 py-1 rounded-lg text-sm flex items-center ${selectedProtocol === protocol.id ? 'bg-blue-600' : 'bg-gray-800'}`}
                        onClick={() => setSelectedProtocol(protocol.id)}
                      >
                        <Image src={protocol.icon} width={16} height={16} alt={protocol.name} className="mr-1" />
                        {protocol.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Pools Table */}
        <div className="bg-[#0f1923] rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-800 text-gray-400 text-sm">
                  <th className="px-4 py-3 text-left">Pool</th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer"
                    onClick={() => requestSort('tvl')}
                  >
                    <div className="flex items-center justify-end">
                      TVL {getSortIcon('tvl')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer"
                    onClick={() => requestSort('volume24h')}
                  >
                    <div className="flex items-center justify-end">
                      Volume (24h) {getSortIcon('volume24h')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer"
                    onClick={() => requestSort('volume7d')}
                  >
                    <div className="flex items-center justify-end">
                      Volume (7d) {getSortIcon('volume7d')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer"
                    onClick={() => requestSort('fees24h')}
                  >
                    <div className="flex items-center justify-end">
                      Fees (24h) {getSortIcon('fees24h')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer"
                    onClick={() => requestSort('apr')}
                  >
                    <div className="flex items-center justify-end">
                      APR {getSortIcon('apr')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPools.map((pool) => (
                  <tr key={pool.id} className="border-t border-gray-800 hover:bg-gray-800">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <button 
                          onClick={() => toggleFavorite(pool.id)}
                          className={`mr-2 ${pool.isFavorite ? 'text-yellow-400' : 'text-gray-600'}`}
                        >
                          <FaStar />
                        </button>
                        <div className="flex items-center">
                          <div className="relative flex">
                            <Image 
                              src={getCryptoIconUrl(pool.token0.symbol.toLowerCase())} 
                              width={24} 
                              height={24} 
                              alt={pool.token0.symbol} 
                              className="z-10"
                            />
                            <Image 
                              src={getCryptoIconUrl(pool.token1.symbol.toLowerCase())} 
                              width={24} 
                              height={24} 
                              alt={pool.token1.symbol} 
                              className="-ml-2"
                            />
                          </div>
                          <div className="ml-2">
                            <div className="font-medium">{pool.token0.symbol}/{pool.token1.symbol}</div>
                            <div className="text-xs text-gray-400">
                              {networks.find(n => n.id === pool.network)?.name} • 
                              {protocols.find(p => p.id === pool.protocol)?.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-medium">
                      {formatCurrency(pool.tvl)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {formatCurrency(pool.volume24h)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {formatCurrency(pool.volume7d)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {formatCurrency(pool.fees24h)}
                    </td>
                    <td className="px-4 py-4 text-right text-green-500 font-medium">
                      {pool.apr.toFixed(1)}%
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button className="p-2 bg-blue-900 hover:bg-blue-800 rounded-lg" title="Add Liquidity">
                          <FaExchangeAlt className="text-blue-400" />
                        </button>
                        <button className="p-2 bg-blue-900 hover:bg-blue-800 rounded-lg" title="View Charts">
                          <FaChartLine className="text-blue-400" />
                        </button>
                        <button className="p-2 bg-blue-900 hover:bg-blue-800 rounded-lg" title="View Details">
                          <FaExternalLinkAlt className="text-blue-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
              <div className="text-sm text-gray-400">
                Showing {indexOfFirstPool + 1} to {Math.min(indexOfLastPool, sortedPools.length)} of {sortedPools.length} pools
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg ${currentPage === 1 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-lg ${currentPage === number ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg ${currentPage === totalPages ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Info Section */}
        <div className="bg-[#0f1923] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">About Pool Explorer</h2>
          <div className="text-gray-400">
            <p className="mb-4">
              The Pool Explorer allows you to discover and analyze liquidity pools across multiple networks and protocols. 
              Find the best opportunities for providing liquidity and earning fees.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <FaInfoCircle className="mr-2 text-blue-400" /> Understanding TVL
                </h3>
                <p className="text-sm">
                  Total Value Locked (TVL) represents the sum of all assets deposited in a liquidity pool. 
                  Higher TVL generally indicates more stable prices with less slippage.
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <FaInfoCircle className="mr-2 text-blue-400" /> APR Explained
                </h3>
                <p className="text-sm">
                  Annual Percentage Rate (APR) shows the estimated yearly return from providing liquidity, 
                  including trading fees and any additional rewards from the protocol.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
