'use client';

import { useState } from 'react';
import Image from 'next/image';
import ConnectWalletButton from '../components/ConnectWalletButton';

interface Airdrop {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  total: string;
  createdDate: string;
  createdTime: string;
}

export default function AirdropsPage() {
  const [activeFilter, setActiveFilter] = useState<'active' | 'all'>('active');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Mock data for airdrops
  const airdrops: Airdrop[] = [
    {
      id: '1',
      name: 'Pepe-X King',
      symbol: 'PXK',
      logo: '/airdrops/pepe-x.png',
      total: '50.00',
      createdDate: 'Aug 21',
      createdTime: '01:38:09'
    },
    {
      id: '2',
      name: 'DOLPHIN PROJECT',
      symbol: 'DOLPHIN',
      logo: '/airdrops/dolphin.png',
      total: '2.00M',
      createdDate: 'Aug 10',
      createdTime: '07:09:14'
    },
    {
      id: '3',
      name: 'CLEONS',
      symbol: 'CLE',
      logo: '/airdrops/cleons.png',
      total: '12.00M',
      createdDate: 'Aug 10',
      createdTime: '04:19:28'
    },
    {
      id: '4',
      name: 'DOLPHIN PROJECT',
      symbol: 'DOLPHIN',
      logo: '/airdrops/dolphin.png',
      total: '100.00K',
      createdDate: 'Aug 9',
      createdTime: '06:15:45'
    },
    {
      id: '5',
      name: 'DOLPHIN PROJECT',
      symbol: 'DOLPHIN',
      logo: '/airdrops/dolphin.png',
      total: '100.00K',
      createdDate: 'Aug 9',
      createdTime: '06:00:14'
    },
    {
      id: '6',
      name: 'JUJI Panda',
      symbol: 'JUJI',
      logo: '/airdrops/juji.png',
      total: '10.00K',
      createdDate: 'Aug 8',
      createdTime: '21:24:42'
    },
    {
      id: '7',
      name: 'AyyLmaos',
      symbol: 'AYYS',
      logo: '/airdrops/ayylmaos.png',
      total: '7.00K',
      createdDate: 'Jul 14',
      createdTime: '22:45:28'
    },
    {
      id: '8',
      name: 'BRO on BASE',
      symbol: 'BRO',
      logo: '/airdrops/bro.png',
      total: '350.00K',
      createdDate: 'Jun 10',
      createdTime: '09:12:31'
    },
    {
      id: '9',
      name: 'Gremly',
      symbol: 'GREMLY',
      logo: '/airdrops/gremly.png',
      total: '225.79B',
      createdDate: 'Jun 25',
      createdTime: '17:31:21'
    },
    {
      id: '10',
      name: 'TAIKI INU',
      symbol: 'TAIKI',
      logo: '/airdrops/taiki.png',
      total: '500.00M',
      createdDate: 'Jun 3',
      createdTime: '03:12:40'
    },
    {
      id: '11',
      name: 'Grump',
      symbol: 'GRUMP',
      logo: '/airdrops/grump.png',
      total: '15.10M',
      createdDate: 'May 13',
      createdTime: '13:43:52'
    },
    {
      id: '12',
      name: 'MemeCoinTracker',
      symbol: 'MCT',
      logo: '/airdrops/mct.png',
      total: '8.00M',
      createdDate: 'May 11',
      createdTime: '23:44:43'
    },
    {
      id: '13',
      name: 'Paft Drunk',
      symbol: 'PAFT',
      logo: '/airdrops/paft.png',
      total: '8.00M',
      createdDate: 'May 4',
      createdTime: '21:21:17'
    },
    {
      id: '14',
      name: 'ethereum maxi',
      symbol: 'ethmaxi',
      logo: '/airdrops/ethmaxi.png',
      total: '1.00M',
      createdDate: 'Apr 24',
      createdTime: '05:43:51'
    },
    {
      id: '15',
      name: 'Sna-King Trump',
      symbol: 'SNAKT',
      logo: '/airdrops/snakt.png',
      total: '3.50M',
      createdDate: 'Apr 9',
      createdTime: '09:22:15'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b1217] text-white p-6">
      {/* Header */}
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
            <Image 
              src="/airdrops/parachute-tokens.png" 
              alt="Airdrop Tokens" 
              width={300} 
              height={200}
              className="opacity-80"
            />
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
              ['Aug', 'Jul'].includes(airdrop.createdDate.split(' ')[0])))
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
                  {airdrop.name === 'Pepe-X King' && (
                    <div className="absolute inset-0 z-10">
                      <div className="absolute top-0 left-0 w-full h-full">
                        <div className="w-16 h-8 relative">
                          <svg className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20 w-12 h-6" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0L14.5 4.5L19.5 5.25L15.75 8.75L16.75 13.75L12 11.5L7.25 13.75L8.25 8.75L4.5 5.25L9.5 4.5L12 0Z" fill="#FFD700"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-[#1a2730]">
                    {airdrop.name === 'Pepe-X King' && (
                      <div className="w-full h-full bg-green-700 flex items-center justify-center">
                        <span className="text-2xl">🐸</span>
                      </div>
                    )}
                    {airdrop.name === 'DOLPHIN PROJECT' && (
                      <div className="w-full h-full bg-blue-900 flex items-center justify-center">
                        <span className="text-2xl">🐬</span>
                      </div>
                    )}
                    {airdrop.name === 'CLEONS' && (
                      <div className="w-full h-full bg-yellow-900 flex items-center justify-center">
                        <span className="text-2xl">👑</span>
                      </div>
                    )}
                    {airdrop.name === 'JUJI Panda' && (
                      <div className="w-full h-full bg-amber-600 flex items-center justify-center">
                        <span className="text-2xl">🐼</span>
                      </div>
                    )}
                    {airdrop.name === 'AyyLmaos' && (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-2xl">👽</span>
                      </div>
                    )}
                    {airdrop.name === 'BRO on BASE' && (
                      <div className="w-full h-full bg-blue-800 flex items-center justify-center">
                        <span className="text-2xl">🐐</span>
                      </div>
                    )}
                    {airdrop.name === 'Gremly' && (
                      <div className="w-full h-full bg-green-600 flex items-center justify-center">
                        <span className="text-2xl">👺</span>
                      </div>
                    )}
                    {airdrop.name === 'TAIKI INU' && (
                      <div className="w-full h-full bg-orange-600 flex items-center justify-center">
                        <span className="text-2xl">🦊</span>
                      </div>
                    )}
                    {airdrop.name === 'Grump' && (
                      <div className="w-full h-full bg-purple-700 flex items-center justify-center">
                        <span className="text-2xl">😾</span>
                      </div>
                    )}
                    {airdrop.name === 'MemeCoinTracker' && (
                      <div className="w-full h-full bg-purple-900 flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                    )}
                    {airdrop.name === 'Paft Drunk' && (
                      <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                        <span className="text-2xl">🤖</span>
                      </div>
                    )}
                    {airdrop.name === 'ethereum maxi' && (
                      <div className="w-full h-full bg-blue-900 flex items-center justify-center">
                        <span className="text-2xl">💎</span>
                      </div>
                    )}
                    {airdrop.name === 'Sna-King Trump' && (
                      <div className="w-full h-full bg-blue-800 flex items-center justify-center">
                        <span className="text-2xl">👑</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{airdrop.name}</h3>
                <div className="flex items-center mb-1">
                  <span className="text-gray-400 mr-1">Total:</span>
                  <span className="font-medium">{airdrop.total}</span>
                  {airdrop.symbol && (
                    <span className="ml-2 bg-gray-700 text-xs px-2 py-0.5 rounded-full text-gray-300">
                      {airdrop.symbol}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  Created {airdrop.createdDate} {airdrop.createdTime}
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
