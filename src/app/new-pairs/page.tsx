'use client';

import React, { useState, useEffect } from 'react';
import { FaRegStar, FaStar, FaCaretUp, FaCaretDown, FaExternalLinkAlt, FaSearch } from 'react-icons/fa';
import ConnectWalletButton from '../../components/ConnectWalletButton';
import Banner from '../../components/Banner';
import Header from '@/components/Header';

// Define types
type TokenPair = {
  id: number;
  name: string;
  symbol: string;
  price: string;
  priceUsd: string;
  change24h: string;
  liquidity: string;
  volume24h: string;
  created: string;
  verified: boolean;
  favorite: boolean;
  score: number;
};

// Mock data for new pairs
const mockNewPairs: TokenPair[] = [
  {
    id: 1,
    name: 'PEPE',
    symbol: 'PEPE/ETH',
    price: '0.000000',
    priceUsd: '$0.000000',
    change24h: '+12.5%',
    liquidity: '$875,234',
    volume24h: '$1,234,567',
    created: 'Aug 27 08:23',
    verified: true,
    favorite: false,
    score: 99
  },
  {
    id: 2,
    name: 'SHIB',
    symbol: 'SHIB/ETH',
    price: '0.000012',
    priceUsd: '$0.000012',
    change24h: '-3.2%',
    liquidity: '$12,345,678',
    volume24h: '$5,678,901',
    created: 'Aug 27 10:45',
    verified: true,
    favorite: true,
    score: 95
  },
  {
    id: 3,
    name: 'FLOKI',
    symbol: 'FLOKI/ETH',
    price: '0.000045',
    priceUsd: '$0.000045',
    change24h: '+8.7%',
    liquidity: '$5,432,109',
    volume24h: '$3,210,987',
    created: 'Aug 27 12:19',
    verified: false,
    favorite: false,
    score: 87
  },
  {
    id: 4,
    name: 'DOGE',
    symbol: 'DOGE/ETH',
    price: '0.000789',
    priceUsd: '$0.000789',
    change24h: '+1.5%',
    liquidity: '$9,876,543',
    volume24h: '$4,321,098',
    created: 'Aug 27 14:32',
    verified: true,
    favorite: false,
    score: 92
  },
  {
    id: 5,
    name: 'WOJAK',
    symbol: 'WOJAK/ETH',
    price: '0.000002',
    priceUsd: '$0.000002',
    change24h: '-5.4%',
    liquidity: '$345,678',
    volume24h: '$987,654',
    created: 'Aug 27 15:47',
    verified: false,
    favorite: false,
    score: 78
  },
  {
    id: 6,
    name: 'BONK',
    symbol: 'BONK/ETH',
    price: '0.000001',
    priceUsd: '$0.000001',
    change24h: '+22.3%',
    liquidity: '$234,567',
    volume24h: '$876,543',
    created: 'Aug 27 16:58',
    verified: false,
    favorite: true,
    score: 85
  },
  {
    id: 7,
    name: 'ELON',
    symbol: 'ELON/ETH',
    price: '0.000003',
    priceUsd: '$0.000003',
    change24h: '-2.1%',
    liquidity: '$456,789',
    volume24h: '$765,432',
    created: 'Aug 27 18:05',
    verified: true,
    favorite: false,
    score: 88
  },
  {
    id: 8,
    name: 'CAT',
    symbol: 'CAT/ETH',
    price: '0.000056',
    priceUsd: '$0.000056',
    change24h: '+4.8%',
    liquidity: '$567,890',
    volume24h: '$654,321',
    created: 'Aug 27 19:23',
    verified: false,
    favorite: false,
    score: 82
  },
  {
    id: 9,
    name: 'SNEK',
    symbol: 'SNEK/ETH',
    price: '0.000023',
    priceUsd: '$0.000023',
    change24h: '+15.7%',
    liquidity: '$678,901',
    volume24h: '$543,210',
    created: 'Aug 27 20:41',
    verified: true,
    favorite: true,
    score: 91
  },
  {
    id: 10,
    name: 'TURBO',
    symbol: 'TURBO/ETH',
    price: '0.000078',
    priceUsd: '$0.000078',
    change24h: '-8.3%',
    liquidity: '$789,012',
    volume24h: '$432,109',
    created: 'Aug 27 22:14',
    verified: false,
    favorite: false,
    score: 76
  }
];

export default function NewPairsPage() {
  const [darkMode] = useState(true);
  const [pairs, setPairs] = useState<TokenPair[]>(mockNewPairs);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof TokenPair; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'favorites'>('all');
  const itemsPerPage = 10;
  
  // Toggle favorite status for a pair
  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPairs(pairs.map(pair => 
      pair.id === id ? { ...pair, favorite: !pair.favorite } : pair
    ));
  };

  // Toggle dark mode
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
    setCurrentPage(1);
  };

  // Sort pairs
  const requestSort = (key: keyof TokenPair) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedPairs = React.useMemo(() => {
    const sortablePairs = [...pairs];
    if (sortConfig !== null) {
      sortablePairs.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortablePairs;
  }, [pairs, sortConfig]);

  // Filter pairs
  const filteredPairs = React.useMemo(() => {
    return sortedPairs.filter(pair => {
      const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           pair.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeFilter === 'verified') {
        return matchesSearch && pair.verified;
      } else if (activeFilter === 'favorites') {
        return matchesSearch && pair.favorite;
      } else {
        return matchesSearch;
      }
    });
  }, [sortedPairs, searchTerm, activeFilter]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPairs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPairs.length / itemsPerPage);

  // Get sort direction indicator
  const getSortDirectionIndicator = (key: keyof TokenPair) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <FaCaretUp className="ml-1" /> : <FaCaretDown className="ml-1" />;
  };

  return (
    <div className="min-h-screen bg-[#0b1217] text-white">
      {/* Banner */}
      <Header/>
      
      {/* Header with search and wallet */}
      <div className="container mx-auto px-4 py-4">
     
        
        {/* Filters */}
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded-lg ${activeFilter === 'all' ? 'bg-blue-600' : 'bg-gray-800'}`}
            onClick={() => setActiveFilter('all')}
          >
            All Pairs
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${activeFilter === 'verified' ? 'bg-blue-600' : 'bg-gray-800'}`}
            onClick={() => setActiveFilter('verified')}
          >
            Verified Only
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${activeFilter === 'favorites' ? 'bg-blue-600' : 'bg-gray-800'}`}
            onClick={() => setActiveFilter('favorites')}
          >
            Favorites
          </button>
        </div>
        
        {/* Pairs Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => requestSort('symbol')}
                  >
                    Pair {getSortDirectionIndicator('symbol')}
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
                    onClick={() => requestSort('priceUsd')}
                  >
                    Price (USD) {getSortDirectionIndicator('priceUsd')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => requestSort('change24h')}
                  >
                    24h {getSortDirectionIndicator('change24h')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => requestSort('liquidity')}
                  >
                    Liquidity {getSortDirectionIndicator('liquidity')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => requestSort('volume24h')}
                  >
                    Volume 24h {getSortDirectionIndicator('volume24h')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <button 
                    className="flex items-center focus:outline-none" 
                    onClick={() => requestSort('created')}
                  >
                    Created {getSortDirectionIndicator('created')}
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentItems.map((pair) => (
                <tr 
                  key={pair.id} 
                  className="hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => console.log(`Navigate to pair details: ${pair.symbol}`)}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      <div className="relative w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{pair.score}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="mr-2">
                        {pair.verified && (
                          <span className="bg-green-500 rounded-full w-3 h-3 inline-block mr-1" title="Verified"></span>
                        )}
                      </div>
                      <span className="font-medium">{pair.symbol}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">{pair.price}</td>
                  <td className="px-4 py-4">{pair.priceUsd}</td>
                  <td className={`px-4 py-4 ${pair.change24h.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {pair.change24h}
                  </td>
                  <td className="px-4 py-4">{pair.liquidity}</td>
                  <td className="px-4 py-4">{pair.volume24h}</td>
                  <td className="px-4 py-4">{pair.created}</td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button 
                        onClick={(e) => toggleFavorite(pair.id, e)}
                        className="text-yellow-500 focus:outline-none"
                      >
                        {pair.favorite ? <FaStar /> : <FaRegStar />}
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
