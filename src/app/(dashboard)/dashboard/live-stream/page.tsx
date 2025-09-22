"use client";

import { useState, useEffect } from 'react';
import LiveStream from '@/components/LiveStream';
import { FaRocket, FaFire, FaUsers, FaChartLine, FaGlobe, FaArrowUp } from 'react-icons/fa';

interface StreamStats {
  totalViewers: number;
  activeTokens: number;
  totalVolume: number;
  topGainers: Array<{
    symbol: string;
    change: number;
    volume: number;
  }>;
}

export default function LiveStreamPage() {
  const [stats, setStats] = useState<StreamStats>({
    totalViewers: 1247,
    activeTokens: 156,
    totalVolume: 2840000,
    topGainers: [
      { symbol: 'PEPE', change: 45.2, volume: 890000 },
      { symbol: 'DOGE', change: 23.1, volume: 650000 },
      { symbol: 'SHIB', change: 18.7, volume: 420000 },
    ]
  });

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'trending' | 'new' | 'volume'>('all');

  useEffect(() => {
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalViewers: prev.totalViewers + Math.floor(Math.random() * 20) - 10,
        totalVolume: prev.totalVolume + Math.floor(Math.random() * 10000),
        topGainers: prev.topGainers.map(token => ({
          ...token,
          change: token.change + (Math.random() * 2 - 1),
          volume: token.volume + Math.floor(Math.random() * 5000)
        }))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Stream</h1>
          <p className="text-gray-400">Real-time token activity and community updates</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            LIVE
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaUsers className="text-cyan-400 text-xl" />
            <span className="text-gray-300 text-sm">Total Viewers</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatNumber(stats.totalViewers)}</div>
          <div className="text-green-400 text-sm">+12% from yesterday</div>
        </div>

        <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaRocket className="text-purple-400 text-xl" />
            <span className="text-gray-300 text-sm">Active Tokens</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.activeTokens}</div>
          <div className="text-green-400 text-sm">+8 new today</div>
        </div>

        <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaChartLine className="text-emerald-400 text-xl" />
            <span className="text-gray-300 text-sm">24h Volume</span>
          </div>
          <div className="text-2xl font-bold text-white">${formatNumber(stats.totalVolume)}</div>
          <div className="text-green-400 text-sm">+24% from yesterday</div>
        </div>

        <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaGlobe className="text-yellow-400 text-xl" />
            <span className="text-gray-300 text-sm">Global Rank</span>
          </div>
          <div className="text-2xl font-bold text-white">#3</div>
          <div className="text-green-400 text-sm">↑2 positions</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All Activity', icon: FaGlobe },
          { id: 'trending', label: 'Trending', icon: FaArrowUp },
          { id: 'new', label: 'New Tokens', icon: FaFire },
          { id: 'volume', label: 'High Volume', icon: FaChartLine },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedFilter(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedFilter === id
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Main Live Stream Component */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <LiveStream className="h-[600px]" />
        </div>
        
        {/* Top Gainers Sidebar */}
        <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FaArrowUp className="text-green-400" />
            Top Gainers
          </h3>
          
          <div className="space-y-4">
            {stats.topGainers.map((token, index) => (
              <div key={token.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{token.symbol}</div>
                    <div className="text-gray-400 text-xs">${formatNumber(token.volume)}</div>
                  </div>
                </div>
                <div className="text-green-400 font-semibold">
                  +{token.change.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
            View All Tokens
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
          <FaRocket className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Create Token</h3>
          <p className="text-gray-400 text-sm mb-4">Launch your own token and join the stream</p>
          <button className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
            Get Started
          </button>
        </div>

        <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
          <FaFire className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Join Community</h3>
          <p className="text-gray-400 text-sm mb-4">Connect with other traders and builders</p>
          <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Join Now
          </button>
        </div>

        <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
          <FaChartLine className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Start Trading</h3>
          <p className="text-gray-400 text-sm mb-4">Trade tokens with zero fees</p>
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Trade Now
          </button>
        </div>
      </div>
    </div>
  );
}
