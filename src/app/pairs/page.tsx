"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Banner from "../../components/Banner";
import HotPairsTicker from "../../components/HotPairsTicker";
import ConnectWalletButton from '../../components/ConnectWalletButton';
import Header from "@/components/Header";
import { getTradingPairs, TradingPair } from "../../api/coingecko/pairs";
import PairsTable from "../../components/PairsTable";

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
  const router = useRouter();
  const [darkMode] = useState(true);
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof TradingPair; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'favorites'>('all');
  const itemsPerPage = 10;
  
  // Fetch trading pairs data from CoinGecko
  useEffect(() => {
    const fetchPairs = async () => {
      try {
        setIsLoading(true);
        const data = await getTradingPairs('usd', currentPage, itemsPerPage, false, 'market_cap_desc', '1h,24h,7d');
        setPairs(data);
      } catch (error) {
        console.error('Error fetching trading pairs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPairs();
  }, [currentPage]);
  
  // Store favorites in state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Load favorites from localStorage on component mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('favoritePairs');
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavorites(new Set(parsedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, []);
  
  // Toggle favorite status for a pair
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    
    // Save to local storage
    localStorage.setItem('favoritePairs', JSON.stringify([...newFavorites]));
  };

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Request sort by key
  const requestSort = (key: keyof TradingPair) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and filtering
  const sortedPairs = React.useMemo(() => {
    // First filter the pairs by search term and active filter
    const filteredItems = pairs.filter(pair => {
      // Apply search filter
      const matchesSearch = 
        pair.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        pair.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        false;
      
      // Apply category filter
      let matchesFilter = true;
      if (activeFilter === 'verified') {
        // Consider verified if it has market cap rank
        matchesFilter = !!pair.market_cap_rank;
      } else if (activeFilter === 'favorites') {
        matchesFilter = favorites.has(pair.id);
      }
      
      return matchesSearch && matchesFilter;
    });
    
    // Then sort them if a sort config exists
    if (sortConfig !== null) {
      filteredItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle numeric comparison
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        
        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? 
            aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        
        // Default comparison for other types
        if (aValue !== null && aValue !== undefined && bValue !== null && bValue !== undefined) {
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return filteredItems;
  }, [pairs, searchTerm, sortConfig, activeFilter, favorites]);

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
      
      <Header/>

      {/* Hot pairs ticker */}
      {/* <div className="hot-pairs-ticker flex items-center py-2 px-4 overflow-x-auto">
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
      </div> */}

      {/* Main content */}
      <main className="flex-1 p-2 md:p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">LIVE NEW PAIRS</h1>
          <div className="flex items-center text-sm text-gray-400">
            <span>New pairs listed on</span>
            <span className="text-blue-400 mx-1">Ethereum</span>
            <span>exchanges with pool variation in real time</span>
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
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
              className="py-2 px-4 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 w-full md:w-96"
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

        {/* Real-time pairs data table */}
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          {isLoading ? (
            <div className="w-full p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                  <th className="py-2 px-4">#</th>
                  <th className="py-2 px-4">Favorite</th>
                  <th className="py-2 px-4 cursor-pointer hover:text-primary" onClick={() => requestSort('name' as keyof TradingPair)}>
                    Name {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </th>
                  <th className="py-2 px-4 cursor-pointer hover:text-primary" onClick={() => requestSort('current_price' as keyof TradingPair)}>
                    Price {sortConfig?.key === 'current_price' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </th>
                  <th className="py-2 px-4 cursor-pointer hover:text-primary" onClick={() => requestSort('price_change_percentage_24h' as keyof TradingPair)}>
                    24h % {sortConfig?.key === 'price_change_percentage_24h' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </th>
                  <th className="py-2 px-4 cursor-pointer hover:text-primary hidden md:table-cell" onClick={() => requestSort('market_cap' as keyof TradingPair)}>
                    Market Cap {sortConfig?.key === 'market_cap' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </th>
                  <th className="py-2 px-4 cursor-pointer hover:text-primary hidden lg:table-cell" onClick={() => requestSort('total_volume' as keyof TradingPair)}>
                    Volume (24h) {sortConfig?.key === 'total_volume' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((pair) => (
                  <tr 
                    key={pair.id} 
                    className="border-b border-gray-800 hover:bg-gray-800 hover:bg-opacity-30 transition-all duration-150 cursor-pointer"
                    onClick={() => router.push(`/trade?base=${pair.symbol.toUpperCase()}&quote=USDT`)}
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      {pair.market_cap_rank || '-'}
                    </td>
                    <td 
                      className="py-3 px-4 whitespace-nowrap text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(pair.id, e);
                      }}
                    >
                      <span className={`${favorites.has(pair.id) ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-400 transition-colors duration-200`}>★</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 mr-3">
                          <Image
                            src={pair.image}
                            alt={pair.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                            unoptimized
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{pair.name}</div>
                          <div className="text-xs text-gray-400">{pair.symbol.toUpperCase()}/USDT</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: pair.current_price < 1 ? 4 : 2,
                        maximumFractionDigits: pair.current_price < 1 ? 6 : 2,
                      }).format(pair.current_price)}
                    </td>
                    <td className={`py-3 px-4 whitespace-nowrap text-sm ${
                      (pair.price_change_percentage_24h || 0) > 0 
                        ? 'text-green-500' 
                        : (pair.price_change_percentage_24h || 0) < 0 
                          ? 'text-red-500' 
                          : ''
                    }`}>
                      {pair.price_change_percentage_24h 
                        ? `${pair.price_change_percentage_24h > 0 ? '+' : ''}${pair.price_change_percentage_24h.toFixed(2)}%` 
                        : '0.00%'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm hidden md:table-cell">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact',
                        maximumFractionDigits: 2
                      }).format(pair.market_cap)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm hidden lg:table-cell">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact',
                        maximumFractionDigits: 2
                      }).format(pair.total_volume)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* No results message */}
        {!isLoading && sortedPairs.length === 0 && (
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
        {!isLoading && sortedPairs.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 text-sm">
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
