'use client';

import { useState } from 'react';
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
  
  // Use memetoken data for airdrops
  const airdrops: Airdrop[] = memetokenData.slice(0, 30); // Limit to 30 tokens for better performance

  return (
    <div className="min-h-screen bg-[#0b1217] text-white p-6">
      {/* Header */}
      <Header/>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Airdrops</h1>
          <p className="text-gray-400 text-sm">Hurry up! Claim your free tokens before they run out.</p>
        </div>
        <div>
          <ConnectWalletButton />
        </div>
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

      {/* Filter and Create Button */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-2">
          <h3 className="mr-2 text-gray-400 flex items-center">State</h3>
          <button 
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-1.5 rounded-md transition-all duration-200 relative ${activeFilter === 'active' ? 'bg-primary text-white' : 'bg-transparent text-gray-400 hover:text-white'}`}
          >
            Active
            {activeFilter === 'active' && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
            )}
          </button>
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-md transition-all duration-200 relative ${activeFilter === 'all' ? 'bg-primary text-white' : 'bg-transparent text-gray-400 hover:text-white'}`}
          >
            All
            {activeFilter === 'all' && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
            )}
          </button>
        </div>
        <button className="bg-[#00b8d8] hover:bg-[#00a2c0] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
          CREATE AIRDROP
        </button>
      </div>

      {/* Airdrops Grid */}
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
    </div>
  );
}
