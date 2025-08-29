"use client";

import React, { useState, useEffect } from "react";
import Banner from "../../components/Banner";
import HotPairsTicker from "../../components/HotPairsTicker";
import ConnectWalletButton from '../../components/ConnectWalletButton';

// Define types for our data
type HotPair = {
  id: number;
  symbol: string;
  price: string;
  change: string;
};

type TokenPair = {
  id: number;
  symbol: string;
  address: string;
  network: string;
  timeAdded: string;
  formattedTime: string;
  price: string;
  liquidity: string;
  poolAmount: string;
  poolVariation: string;
  poolRemaining: string;
  rugPulled?: boolean;
  favorite?: boolean;
};

// Mock data for hot pairs
const hotPairs: HotPair[] = [
  { id: 1, symbol: "PEPE/ETH", price: "$0.00000123", change: "+5.67%" },
  { id: 2, symbol: "SHIB/ETH", price: "$0.00000789", change: "-2.34%" },
  { id: 3, symbol: "DOGE/ETH", price: "$0.07123", change: "+1.23%" },
  { id: 4, symbol: "FLOKI/ETH", price: "$0.00001234", change: "+12.34%" },
  { id: 5, symbol: "ELON/ETH", price: "$0.00000045", change: "-3.45%" },
  { id: 6, symbol: "WOJAK/ETH", price: "$0.00000078", change: "+8.92%" },
  { id: 7, symbol: "BONK/ETH", price: "$0.00000012", change: "+15.67%" },
  { id: 8, symbol: "CAT/ETH", price: "$0.00000567", change: "-1.23%" },
  { id: 9, symbol: "DEGEN/ETH", price: "$0.00000345", change: "+4.56%" },
  { id: 10, symbol: "APE/ETH", price: "$1.23", change: "-0.78%" },
];

// Mock data for token pairs
const mockPairs: TokenPair[] = [
  {
    id: 1,
    symbol: "FUSE",
    address: "0x744...b2e1",
    network: "WETH",
    timeAdded: "2025-08-28T02:18:51",
    formattedTime: "2 m 8 s",
    price: "$0.0,5428",
    liquidity: "$14,453.65",
    poolAmount: "1 ETH",
    poolVariation: "58.38%",
    poolRemaining: "1.58 ETH",
    rugPulled: false
  },
  {
    id: 2,
    symbol: "WIZARDS",
    address: "0x01...54b0d",
    network: "WETH",
    timeAdded: "2025-08-28T02:25:34",
    formattedTime: "12 m 32 s",
    price: "$0.0,5647",
    liquidity: "$30,583.51",
    poolAmount: "1 ETH",
    poolVariation: "235.30%",
    poolRemaining: "3.35 ETH",
    rugPulled: false
  },
  {
    id: 3,
    symbol: "Ethereum",
    address: "0xe32...4644",
    network: "WETH",
    timeAdded: "2025-08-28T02:02:13",
    formattedTime: "19 m 44 s",
    price: "$0.0,7036",
    liquidity: "$7,079.08",
    poolAmount: "1 ETH",
    poolVariation: "0%",
    poolRemaining: "0.01 ETH",
    rugPulled: false
  },
  {
    id: 4,
    symbol: "WIZARDS",
    address: "0xd31...e4dc",
    network: "WETH",
    timeAdded: "2025-08-28T02:08:51",
    formattedTime: "20 m 8 s",
    price: "-",
    liquidity: "$105",
    poolAmount: "1 ETH",
    poolVariation: "-99.98%",
    poolRemaining: "0 ETH",
    rugPulled: true
  },
  {
    id: 5,
    symbol: "WIZARDS",
    address: "0xa7e...31e8",
    network: "WETH",
    timeAdded: "2025-08-28T02:01:15",
    formattedTime: "20 m 44 s",
    price: "$0.0005785",
    liquidity: "$59,746.96",
    poolAmount: "1 ETH",
    poolVariation: "554.96%",
    poolRemaining: "6.55 ETH",
    rugPulled: false
  }
];

export default function LivePairs() {
  const [darkMode] = useState(true);
  const [pairs, setPairs] = useState<TokenPair[]>(mockPairs);
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

  // Sort pairs
  const requestSort = (key: keyof TokenPair) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and filtering
  const sortedPairs = React.useMemo(() => {
    // First filter the pairs by search term and active filter
    const filteredItems = pairs.filter(pair => {
      // Apply search filter
      const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        pair.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply category filter
      let matchesFilter = true;
      if (activeFilter === 'verified') {
        matchesFilter = !pair.rugPulled;
      } else if (activeFilter === 'favorites') {
        matchesFilter = !!pair.favorite;
      }
      
      return matchesSearch && matchesFilter;
    });
    
    // Then sort them if a sort config exists
    if (sortConfig !== null) {
      filteredItems.sort((a, b) => {
        const aValue = a[sortConfig.key] as string | number;
        const bValue = b[sortConfig.key] as string | number;
        
        // Handle special cases for sorting
        if (sortConfig.key === 'poolVariation') {
          // Remove % sign and convert to number for comparison
          const aNum = parseFloat(aValue.toString().replace('%', ''));
          const bNum = parseFloat(bValue.toString().replace('%', ''));
          return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
        }
        
        // Handle price sorting (remove $ and commas)
        if (sortConfig.key === 'price' || sortConfig.key === 'liquidity') {
          // Handle special case for rug pulled tokens with '-' as price
          if (aValue === '-') return sortConfig.direction === 'ascending' ? -1 : 1;
          if (bValue === '-') return sortConfig.direction === 'ascending' ? 1 : -1;
          
          const aNum = parseFloat(aValue.toString().replace(/[$,]/g, ''));
          const bNum = parseFloat(bValue.toString().replace(/[$,]/g, ''));
          return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
        }
        
        // For dates
        if (sortConfig.key === 'timeAdded') {
          const aDate = new Date(aValue.toString()).getTime();
          const bDate = new Date(bValue.toString()).getTime();
          return sortConfig.direction === 'ascending' ? aDate - bDate : bDate - aDate;
        }
        
        // Default string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? 
            aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        
        // Default numeric comparison
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredItems;
  }, [pairs, searchTerm, sortConfig, activeFilter]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPairs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPairs.length / itemsPerPage);

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top banner ad */}
      <Banner />

      {/* Hot pairs ticker */}
      <HotPairsTicker pairs={hotPairs} />
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold">Live New Pairs</div>
          <span className="ml-2 text-gray-400">2:32</span>
        </div>
        
        <div className="flex-1 mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search pair by symbol, name, contract or token"
              className="w-full py-2 px-10 rounded-full bg-opacity-10 bg-gray-800 border border-border-color focus:outline-none focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary">
              🔍
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-700">
            ⚙️
          </button>
          <button className="p-2 rounded-full hover:bg-gray-700">
            ⭐
          </button>
          <ConnectWalletButton />
        </div>
      </header>

      {/* Hot pairs ticker */}
      <div className="hot-pairs-ticker flex items-center py-2 px-4 overflow-x-auto">
        <div className="flex items-center bg-[#332700] text-yellow-500 px-2 py-1 rounded mr-2">
          <span className="mr-1">🔥</span>
          <span className="font-medium">HOT PAIRS</span>
        </div>
        
        {hotPairs.map((pair) => (
          <div key={pair.id} className="flex items-center mx-2">
            <span className="text-gray-400 mr-1">#{pair.id}</span>
            <span className="font-medium mr-1">{pair.symbol}</span>
            <span className={`text-sm ${pair.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {pair.change}
            </span>
          </div>
        ))}
        
        <div className="ml-auto flex items-center bg-yellow-800 bg-opacity-30 px-2 py-1 rounded">
          <span className="text-yellow-500 mr-1">🔥</span>
          <span className="text-yellow-500 font-medium">SUPPLY</span>
          <span className="ml-1 text-yellow-500">$900</span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">LIVE NEW PAIRS</h1>
          <div className="flex items-center text-sm text-gray-400">
            <span>New pairs listed on</span>
            <span className="text-blue-400 mx-1">Ethereum</span>
            <span>exchanges with pool variation in real time</span>
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="flex justify-between mb-4">
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 rounded-md border transition-colors duration-200 ${activeFilter === 'all' ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'}`}
              onClick={() => setActiveFilter('all')}
            >
              All Pairs
            </button>
            <button 
              className={`px-3 py-1 rounded-md border transition-colors duration-200 ${activeFilter === 'verified' ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'}`}
              onClick={() => setActiveFilter('verified')}
            >
              Verified Only
            </button>
            <button 
              className={`px-3 py-1 rounded-md border transition-colors duration-200 ${activeFilter === 'favorites' ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'}`}
              onClick={() => setActiveFilter('favorites')}
            >
              Favorites
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Find by symbol, name, token contract or pair address"
              className="py-2 px-4 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 w-96"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
            {searchTerm && (
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Table header */}
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="py-2 px-4 cursor-pointer hover:text-primary" onClick={() => requestSort('symbol')}>
                  Pair Info {sortConfig?.key === 'symbol' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th className="py-2 px-4 cursor-pointer hover:text-primary" onClick={() => requestSort('timeAdded')}>
                  Listed Since {sortConfig?.key === 'timeAdded' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th className="py-2 px-4 cursor-pointer hover:text-primary" onClick={() => requestSort('price')}>
                  Token Price USD {sortConfig?.key === 'price' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th className="py-2 px-4">Initial Liquidity</th>
                <th className="py-2 px-4 cursor-pointer hover:text-primary" onClick={() => requestSort('liquidity')}>
                  Total Liquidity {sortConfig?.key === 'liquidity' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th className="py-2 px-4">Pool Amount</th>
                <th className="py-2 px-4 cursor-pointer hover:text-primary" onClick={() => requestSort('poolVariation')}>
                  Pool Variation {sortConfig?.key === 'poolVariation' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th className="py-2 px-4">Pool Remaining</th>
                <th className="py-2 px-4">Audit</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((pair) => (
                <tr 
                  key={pair.id} 
                  className="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30 transition-all duration-150 cursor-pointer relative overflow-hidden group"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    const highlight = document.createElement('div');
                    highlight.className = 'absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300';
                    el.appendChild(highlight);
                    setTimeout(() => highlight.remove(), 500);
                  }}
                  onClick={() => alert(`View details for ${pair.symbol}`)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white mr-2 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                        {pair.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{pair.symbol}</div>
                        <div className="text-xs text-gray-400">{pair.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-1">⏱</span>
                      <span>{pair.formattedTime}</span>
                      <div className="ml-1 text-xs text-gray-500">
                        {new Date(pair.timeAdded).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {pair.rugPulled ? (
                      <div className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                        <span className="text-gray-400">RUG PULLED</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="font-medium">{pair.price}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {/* Add a small fake chart indicator */}
                          <div className="inline-flex items-center space-x-1">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="inline-block w-1 h-3 bg-green-500 rounded-sm"></span>
                            <span className="inline-block w-1 h-2 bg-green-500 rounded-sm"></span>
                            <span className="inline-block w-1 h-4 bg-green-500 rounded-sm"></span>
                            <span className="inline-block w-1 h-1 bg-green-500 rounded-sm"></span>
                            <span className="inline-block w-1 h-3 bg-green-500 rounded-sm"></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-900 bg-opacity-30 flex items-center justify-center text-blue-400 mr-2">
                        <span className="text-xs">Ξ</span>
                      </div>
                      <div className="text-xs">
                        <div className="font-medium text-blue-400">{pair.network}</div>
                        <div className="text-gray-400">
                          {new Date(pair.timeAdded).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <div className="font-medium">{pair.liquidity}</div>
                      <div className="flex items-center mt-1">
                        <div className="w-24 h-1 bg-gray-700 rounded overflow-hidden">
                          {/* Scale based on liquidity amount - simplified for demo */}
                          <div 
                            className="h-full bg-blue-500"
                            style={{ 
                              width: `${Math.min(parseFloat(pair.liquidity.replace(/[$,]/g, '')) / 1000, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-yellow-500 mr-2">
                        <span className="text-xs">Ξ</span>
                      </div>
                      <span>{pair.poolAmount}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`px-2 py-1 rounded text-center ${
                      pair.poolVariation.startsWith('-') 
                        ? 'bg-red-900 bg-opacity-30 text-red-500' 
                        : pair.poolVariation === '0%' 
                          ? 'bg-gray-700 text-gray-400' 
                          : 'bg-green-900 bg-opacity-30 text-green-500'
                    }`}>
                      {pair.poolVariation}
                      {pair.poolVariation !== '0%' && (
                        <div className="flex justify-center mt-1">
                          <div className="w-16 h-1 bg-gray-700 rounded overflow-hidden">
                            <div 
                              className={`h-full ${pair.poolVariation.startsWith('-') ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(parseFloat(pair.poolVariation), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-green-500 mr-2">
                        <span className="text-xs">Ξ</span>
                      </div>
                      <span>{pair.poolRemaining}</span>
                      {parseFloat(pair.poolRemaining) > 0 && (
                        <div className="ml-2 w-16 h-1 bg-gray-700 rounded overflow-hidden">
                          <div 
                            className="h-full bg-green-500"
                            style={{ 
                              width: `${Math.min(parseFloat(pair.poolRemaining) / 10 * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="px-2 py-1 border border-gray-600 rounded hover:bg-gray-700 transition-colors duration-200" 
                        onClick={(e) => toggleFavorite(pair.id, e)}
                      >
                        <span className={`${pair.favorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors duration-200`}>❤</span>
                      </button>
                      {!pair.rugPulled && (
                        <button 
                          className="px-2 py-1 bg-blue-900 bg-opacity-30 text-blue-400 rounded hover:bg-blue-800 text-xs transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`View audit for ${pair.symbol}`);
                          }}
                        >
                          Audit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* No results message */}
        {sortedPairs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-xl font-medium mb-2">No pairs found</div>
            <div className="text-sm">
              {activeFilter !== 'all' ? 
                `Try changing your filter from "${activeFilter}" to "all"` : 
                'Try adjusting your search term'}
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {sortedPairs.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="text-gray-400">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedPairs.length)} of {sortedPairs.length} pairs
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 rounded ${currentPage === pageNum ? 'bg-primary text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
