"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import dynamic from 'next/dynamic';
import { streamingService } from '@/services/StreamingService';

const WebRTCBroadcaster = dynamic(() => import('@/components/WebRTCBroadcaster'), { ssr: false });
const WebRTCViewer = dynamic(() => import('@/components/WebRTCViewer'), { ssr: false });
const StreamIOBroadcaster = dynamic(() => import('@/components/StreamIOBroadcaster'), { ssr: false });
const StreamIOViewer = dynamic(() => import('@/components/StreamIOViewer'), { ssr: false });
const StreamIOLiveStreams = dynamic(() => import('@/components/StreamIOLiveStreams'), { ssr: false });
import { FaRocket, FaFire, FaUsers, FaChartLine, FaGlobe, FaArrowUp, FaPlay, FaPlus, FaEye, FaStar, FaCrown } from 'react-icons/fa';
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
  const [streamTitle, setStreamTitle] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeStreams, setActiveStreams] = useState<any[]>([]);
  
  // Stream.io state
  const [streamingPlatform, setStreamingPlatform] = useState<'webrtc' | 'streamio'>('streamio');
  const [isStreamIOStreaming, setIsStreamIOStreaming] = useState(false);
  const [selectedStreamIOStream, setSelectedStreamIOStream] = useState<{id: string, title: string} | null>(null);
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
    // Use HTTP-based streaming service instead of Socket.IO
    console.log('🔌 Connecting to HTTP streaming service...');

    // Start polling for active streams
    const stopPolling = streamingService.startStreamPolling((streams) => {
      console.log('📡 Received active streams:', streams);
      setActiveStreams(streams);
    });

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

      // Update live stream viewer counts for demo streams
      setLiveStreams(prev => prev.map(stream => ({
        ...stream,
        viewerCount: stream.viewerCount + Math.floor(Math.random() * 10) - 5
      })));
    }, 10000);

    return () => {
      stopPolling();
      clearInterval(interval);
    };
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

  const handleStartStream = () => {
    if (!streamTitle.trim()) {
      alert('Please enter a stream title');
      return;
    }
    
    if (streamingPlatform === 'webrtc') {
      setIsStreaming(true);
    } else {
      setIsStreamIOStreaming(true);
    }
    setShowCreateStream(false);
  };

  const handleStreamEnd = () => {
    setIsStreaming(false);
    setIsStreamIOStreaming(false);
    setStreamTitle('');
  };

  // Stream.io handlers
  const handleStreamIOStreamSelect = (streamId: string, streamTitle: string) => {
    setSelectedStreamIOStream({ id: streamId, title: streamTitle });
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
          {/* Platform Selector */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setStreamingPlatform('streamio')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                streamingPlatform === 'streamio'
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FaCrown className="w-4 h-4" />
              Stream.io Pro
            </button>
            <button
              onClick={() => setStreamingPlatform('webrtc')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                streamingPlatform === 'webrtc'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FaStar className="w-4 h-4" />
              WebRTC
            </button>
          </div>
          
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
        {streamingPlatform === 'streamio' ? (
          // Stream.io Live Streams
          <StreamIOLiveStreams onStreamSelect={handleStreamIOStreamSelect} />
        ) : (
          // WebRTC Streams
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Active Live Streams</h2>
              <div className="text-sm text-gray-400">
                {activeStreams.length} WebRTC streams • {liveStreams.length} demo streams
              </div>
            </div>
        
        {/* Real WebRTC Streams */}
        {activeStreams.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cyan-400">🔴 Live WebRTC Streams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeStreams.map((stream) => (
                <div
                  key={stream.broadcasterId}
                  className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => setSelectedStream({
                    id: stream.broadcasterId,
                    title: stream.streamTitle || 'Live Stream',
                    description: 'Real-time WebRTC stream',
                    category: 'live',
                    streamerAddress: stream.walletAddress || '',
                    streamerName: `${stream.walletAddress?.slice(0, 6)}...${stream.walletAddress?.slice(-4)}` || 'Anonymous',
                    startTime: Date.now(),
                    viewerCount: stream.viewerCount || 0,
                    isLive: true,
                    likes: 0
                  })}
                >
                  {/* Stream Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-cyan-900/20 to-purple-900/20 flex items-center justify-center">
                    <FaPlay className="w-12 h-12 text-white/60" />
                    
                    {/* Live Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-xs font-medium">LIVE</span>
                    </div>
                    
                    {/* WebRTC Badge */}
                    <div className="absolute top-3 right-3 bg-cyan-600 px-2 py-1 rounded text-white text-xs">
                      WebRTC
                    </div>
                    
                    {/* Viewer Count */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 px-2 py-1 rounded text-white text-xs">
                      <FaEye />
                      {stream.viewerCount || 0}
                    </div>
                  </div>
                  
                  {/* Stream Info */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2 line-clamp-2">{stream.streamTitle || 'Live Stream'}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">Real-time WebRTC stream</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">{stream.walletAddress?.[0] || 'A'}</span>
                        </div>
                        <span className="text-gray-300 text-sm">
                          {stream.walletAddress ? `${stream.walletAddress.slice(0, 6)}...${stream.walletAddress.slice(-4)}` : 'Anonymous'}
                        </span>
                      </div>
                      
                      <span className="px-2 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-400">
                        live
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
            {/* Demo Streams */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-400">📺 Demo Streams</h3>
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

      {/* Create Stream Modal */}
      {showCreateStream && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1923] rounded-xl border border-gray-800 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              Start Live Stream - {streamingPlatform === 'streamio' ? 'Stream.io Pro' : 'WebRTC'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stream Title
                </label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="Enter your stream title..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              
              {streamingPlatform === 'streamio' && (
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-1">
                    <FaCrown className="w-4 h-4" />
                    Stream.io Professional
                  </div>
                  <p className="text-gray-300 text-xs">
                    Enterprise-grade streaming with HD quality, global CDN, and built-in chat
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleStartStream}
                  disabled={!streamTitle.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Stream
                </button>
                <button
                  onClick={() => setShowCreateStream(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stream.io Broadcaster */}
      {isStreamIOStreaming && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 p-4 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Broadcasting: {streamTitle}</h2>
                <p className="text-cyan-400 text-sm">Powered by Stream.io Professional</p>
              </div>
              <button
                onClick={handleStreamEnd}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                End Stream
              </button>
            </div>
            <StreamIOBroadcaster
              streamTitle={streamTitle}
              onStreamEnd={handleStreamEnd}
            />
          </div>
        </div>
      )}

      {/* WebRTC Broadcaster */}
      {isStreaming && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 p-4 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Broadcasting: {streamTitle}</h2>
                <p className="text-gray-400 text-sm">WebRTC P2P Streaming</p>
              </div>
              <button
                onClick={handleStreamEnd}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                End Stream
              </button>
            </div>
            <WebRTCBroadcaster
              streamTitle={streamTitle}
              onStreamEnd={handleStreamEnd}
            />
          </div>
        </div>
      )}

      {/* Stream.io Viewer */}
      {selectedStreamIOStream && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 p-4 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Watching: {selectedStreamIOStream.title}</h2>
                <p className="text-cyan-400 text-sm">Stream.io Professional Quality</p>
              </div>
              <button
                onClick={() => setSelectedStreamIOStream(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
            <StreamIOViewer
              streamId={selectedStreamIOStream.id}
              streamTitle={selectedStreamIOStream.title}
              onStreamEnd={() => setSelectedStreamIOStream(null)}
            />
          </div>
        </div>
      )}

      {/* WebRTC Viewer */}
      {selectedStream && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 p-4 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Watching: {selectedStream.title}</h2>
                <p className="text-gray-400 text-sm">WebRTC P2P Connection</p>
              </div>
              <button
                onClick={() => setSelectedStream(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
            <WebRTCViewer
              broadcasterId={selectedStream.id}
              streamTitle={selectedStream.title}
              onStreamEnd={() => setSelectedStream(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
