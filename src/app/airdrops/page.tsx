'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ConnectWalletButton from '../../components/ConnectWalletButton';
import Header from '../../components/Header';
import memetokenData from '../data/memetoken.json';

// Interface matching the structure from memetoken.json
interface Airdrop {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null;
  last_updated: string;
}

export default function AirdropsPage() {
  const [activeFilter, setActiveFilter] = useState<'active' | 'all'>('active');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use memetoken data for airdrops
  const airdrops: Airdrop[] = memetokenData.slice(0, 30); // Limit to 30 tokens for better performance

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b1217] text-white p-6">
      {/* Header */}
      {/* <Header/> */}
      <div className="flex justify-between items-center mb-6">
 
        <div className="relative">
          <div className="absolute right-0 -top-24">
            {/* <Image 
              src="/airdrops/parachute-tokens.png" 
              alt="Airdrop Tokens" 
              width={300} 
              height={200}
              className="opacity-80"
            /> */}
          </div>
        </div>
      </div>


      {/* Skeleton Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, index) => (
            <div 
              key={index}
              className="bg-[#142028] rounded-lg overflow-hidden border border-gray-800 animate-pulse"
            >
              <div className="p-4 flex items-start">
                <div className="w-16 h-16 mr-4 relative">
                  <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-700 rounded animate-pulse mb-2 w-32"></div>
                  <div className="flex items-center mb-1">
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-20 mr-2"></div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-16 mr-2"></div>
                    <div className="h-5 bg-gray-700 rounded-full animate-pulse w-12"></div>
                  </div>
                  <div className="h-3 bg-gray-700 rounded animate-pulse w-40"></div>
                </div>
              </div>
              <div className="border-t border-gray-800 p-2">
                <div className="w-full h-8 bg-gray-700 rounded-md animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Airdrops Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {airdrops
            .filter(airdrop => activeFilter === 'all' || 
              // For 'active' filter, show only airdrops from the last 30 days
              (activeFilter === 'active' && 
                new Date(airdrop.last_updated).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000)))
            .map((airdrop) => (
          <div 
            key={airdrop.id} 
            className={`bg-[#142028] rounded-lg overflow-hidden border animate-fadeIn ${hoveredCard === airdrop.id ? 'border-primary shadow-lg shadow-primary/10' : 'border-gray-800'} transition-all duration-300 hover:translate-y-[-2px]`}
            onMouseEnter={() => setHoveredCard(airdrop.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ animationDelay: `${parseInt(airdrop.id) * 100}ms` }}
          >
            <div className="p-4 flex items-start">
              <div className="w-16 h-16 mr-4 relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                  <Image 
                    src={airdrop.image || '/placeholder.png'} 
                    alt={airdrop.name} 
                    width={56} 
                    height={56} 
                    className="rounded-full"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{airdrop.name}</h3>
                <div className="flex items-center mb-1">
                  <span className="text-gray-400 mr-1">Total Supply:</span>
                  <span className="font-medium">
                    {airdrop.circulating_supply ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(airdrop.circulating_supply) : 'N/A'}
                  </span>
                  {airdrop.symbol && (
                    <span className="ml-2 bg-gray-700 text-xs px-2 py-0.5 rounded-full text-gray-300">
                      {airdrop.symbol.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  Updated: {new Date(airdrop.last_updated).toLocaleDateString()} {new Date(airdrop.last_updated).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 p-2">
              <button 
                className={`w-full py-1.5 rounded-md transition-all duration-300 flex items-center justify-center space-x-2 group
                  ${hoveredCard === airdrop.id ? 'bg-primary text-white' : 'bg-transparent hover:bg-gray-700 text-gray-300 hover:text-white'}`}
              >
                <span className="text-sm group-hover:scale-110 transition-transform duration-200">🎁</span>
                <span className="text-sm font-medium">GO TO CLAIM</span>
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
