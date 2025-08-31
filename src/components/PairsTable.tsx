'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaSort, FaSortUp, FaSortDown, FaStar } from 'react-icons/fa';
import { TradingPair } from '../api/coingecko/pairs';

interface PairsTableProps {
  pairs: TradingPair[];
  isLoading: boolean;
}

type SortField = 'market_cap' | 'current_price' | 'price_change_percentage_24h' | 'total_volume';
type SortDirection = 'asc' | 'desc';

const PairsTable: React.FC<PairsTableProps> = ({ pairs, isLoading }) => {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('market_cap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format currency
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: num < 1 ? 4 : 2,
      maximumFractionDigits: num < 1 ? 6 : 2,
    }).format(num);
  };

  // Format percentage
  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
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

  // Sort pairs
  const sortedPairs = [...pairs].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // Handle row click
  const handleRowClick = (pair: TradingPair) => {
    router.push(`/trade?base=${pair.symbol.toUpperCase()}&quote=USDT`);
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-transparent">
        <thead>
          <tr className="text-left text-sm font-medium text-gray-400 uppercase tracking-wider">
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Favorite</th>
            <th className="px-4 py-3">Name</th>
            <th 
              className="px-4 py-3 cursor-pointer"
              onClick={() => handleSort('current_price')}
            >
              <div className="flex items-center">
                Price {getSortIcon('current_price')}
              </div>
            </th>
            <th 
              className="px-4 py-3 cursor-pointer"
              onClick={() => handleSort('price_change_percentage_24h')}
            >
              <div className="flex items-center">
                24h % {getSortIcon('price_change_percentage_24h')}
              </div>
            </th>
            <th 
              className="px-4 py-3 cursor-pointer"
              onClick={() => handleSort('market_cap')}
            >
              <div className="flex items-center">
                Market Cap {getSortIcon('market_cap')}
              </div>
            </th>
            <th 
              className="px-4 py-3 cursor-pointer"
              onClick={() => handleSort('total_volume')}
            >
              <div className="flex items-center">
                Volume (24h) {getSortIcon('total_volume')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedPairs.map((pair) => (
            <tr 
              key={pair.id} 
              className="border-b border-gray-800 hover:bg-gray-800/30 cursor-pointer transition-colors"
              onClick={() => handleRowClick(pair)}
            >
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                {pair.market_cap_rank || '-'}
              </td>
              <td 
                className="px-4 py-4 whitespace-nowrap text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(pair.id);
                }}
              >
                <FaStar className={favorites.has(pair.id) ? "text-yellow-400" : "text-gray-600"} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
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
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                {formatCurrency(pair.current_price)}
              </td>
              <td className={`px-4 py-4 whitespace-nowrap text-sm ${
                pair.price_change_percentage_24h > 0 
                  ? 'text-green-500' 
                  : pair.price_change_percentage_24h < 0 
                    ? 'text-red-500' 
                    : ''
              }`}>
                {formatPercentage(pair.price_change_percentage_24h)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                {formatCurrency(pair.market_cap)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                {formatCurrency(pair.total_volume)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PairsTable;
