"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import LiveStream from '@/components/LiveStream';
import CreateLiveStream from '@/components/CreateLiveStream';
import LiveStreamViewer from '@/components/LiveStreamViewer';
import { FaRocket, FaFire, FaUsers, FaChartLine, FaGlobe, FaArrowUp, FaPlay, FaPlus, FaEye } from 'react-icons/fa';
import Image from 'next/image';

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

interface LiveStreamData {
  id: string;
  title: string;
  description: string;
  category: string;
  streamerAddress: string;
  streamerName: string;
  startTime: number;
  viewerCount: number;
  isLive: boolean;
  likes: number;
  thumbnail?: string;
}

export default function LiveStreamPage() {
  const { address, isConnected } = useAccount();
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
  const [showCreateStream, setShowCreateStream] = useState(false);
  const [selectedStream, setSelectedStream] = useState<LiveStreamData | null>(null);
  const [liveStreams, setLiveStreams] = useState<LiveStreamData[]>([
    {
      id: '1',
      title: 'Trading Bitcoin Live - Market Analysis & Predictions',
      description: 'Join me for live Bitcoin trading and market analysis. We\'ll look at charts, discuss strategies, and take live trades!',
      category: 'trading',
      streamerAddress: '0x1234567890123456789012345678901234567890',
      streamerName: 'CryptoTraderPro',
      startTime: Date.now() - 3600000, // 1 hour ago
      viewerCount: 234,
      isLive: true,
      likes: 89,
      thumbnail: '/stream-thumbnails/bitcoin-trading.jpg'
    },
    {
      id: '3',
      title: 'Meme Coin Hunting - Finding the Next 100x',
      description: 'Searching for the next big meme coin! Come join the hunt and let\'s find some gems together.',
      category: 'trading',
      streamerAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      streamerName: 'MemeHunter',
      startTime: Date.now() - 900000, // 15 minutes ago
      viewerCount: 89,
      isLive: true,
      likes: 45,
      thumbnail: '/stream-thumbnails/meme-hunting.jpg'
    }
  ]);

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

      // Update live stream viewer counts
      setLiveStreams(prev => prev.map(stream => ({
        ...stream,
        viewerCount: stream.viewerCount + Math.floor(Math.random() * 10) - 5
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatDuration = (startTime: number) => {
    const duration = Date.now() - startTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:00`;
    return `${minutes}:${Math.floor((duration % (1000 * 60)) / 1000).toString().padStart(2, '0')}`;
  };

  const handleStreamCreated = (streamData: any) => {
    setLiveStreams(prev => [streamData, ...prev]);
    setShowCreateStream(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trading': return 'bg-green-500/20 text-green-400';
      case 'education': return 'bg-blue-500/20 text-blue-400';
      case 'news': return 'bg-purple-500/20 text-purple-400';
      case 'community': return 'bg-yellow-500/20 text-yellow-400';
      case 'gaming': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Streams</h1>
          <p className="text-gray-400">Watch live streams and create your own with wallet connection</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            {liveStreams.length} LIVE
          </div>
          
          <button
            onClick={() => setShowCreateStream(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
          >
            <FaPlus />
            Go Live
          </button>
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

      {/* Live Streams Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Active Live Streams</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveStreams.map((stream) => (
            <div
              key={stream.id}
              className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => setSelectedStream(stream)}
            >
              {/* Stream Thumbnail */}
              <div className="relative aspect-video bg-gray-800">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 flex items-center justify-center">
                  <FaPlay className="w-12 h-12 text-white/60" />
                </div>
                
                {/* Live Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-medium">LIVE</span>
                </div>
                
                {/* Duration */}
                <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded text-white text-xs">
                  {formatDuration(stream.startTime)}
                </div>
                
                {/* Viewer Count */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 px-2 py-1 rounded text-white text-xs">
                  <FaEye />
                  {stream.viewerCount}
                </div>
              </div>
              
              {/* Stream Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2 line-clamp-2">{stream.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{stream.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">{stream.streamerName[0]}</span>
                    </div>
                    <span className="text-gray-300 text-sm">{stream.streamerName}</span>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(stream.category)}`}>
                    {stream.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {liveStreams.length === 0 && (
          <div className="text-center py-12">
            <FaPlay className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Live Streams</h3>
            <p className="text-gray-500 mb-4">Be the first to go live and share your content!</p>
            <button
              onClick={() => setShowCreateStream(true)}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
            >
              Start Streaming
            </button>
          </div>
        )}
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

      {/* Modals */}
      {showCreateStream && (
        <CreateLiveStream
          onStreamCreated={handleStreamCreated}
          onClose={() => setShowCreateStream(false)}
        />
      )}

      {selectedStream && (
        <LiveStreamViewer
          streamData={selectedStream}
          onClose={() => setSelectedStream(null)}
        />
      )}
    </div>
  );
}
