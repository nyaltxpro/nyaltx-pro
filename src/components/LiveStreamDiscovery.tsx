"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { FaPlay, FaUsers, FaEye, FaClock, FaFire, FaPlus } from 'react-icons/fa';
import { liveStreamWebSocket, LiveStreamData, WebSocketStreamMessage } from '@/services/LiveStreamWebSocket';
import PumpFunLiveStream from './PumpFunLiveStream';
import LiveStreamViewer from './LiveStreamViewer';

interface LiveStreamDiscoveryProps {
  className?: string;
}

export default function LiveStreamDiscovery({ className = "" }: LiveStreamDiscoveryProps) {
  const { address, isConnected } = useAccount();
  
  // State
  const [activeStreams, setActiveStreams] = useState<LiveStreamData[]>([]);
  const [selectedStream, setSelectedStream] = useState<LiveStreamData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isConnectedToWS, setIsConnectedToWS] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Categories for filtering
  const categories = [
    { id: 'all', label: '🔥 All Streams', color: 'bg-gradient-to-r from-red-500 to-orange-500' },
    { id: 'trading', label: '📈 Trading', color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
    { id: 'education', label: '🎓 Education', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    { id: 'news', label: '📰 News', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'community', label: '💬 Community', color: 'bg-gradient-to-r from-yellow-500 to-amber-500' },
    { id: 'gaming', label: '🎮 Gaming', color: 'bg-gradient-to-r from-indigo-500 to-purple-500' },
    { id: 'other', label: '🌟 Other', color: 'bg-gradient-to-r from-gray-500 to-slate-500' }
  ];
  
  const [selectedCategory, setSelectedCategory] = useState('all');

  // WebSocket connection and stream updates
  useEffect(() => {
    const handleWebSocketMessage = (message: WebSocketStreamMessage) => {
      switch (message.type) {
        case 'connection_status':
          setIsConnectedToWS(message.data.status === 'connected');
          break;
        case 'stream_created':
          setActiveStreams(prev => [message.data, ...prev]);
          break;
        case 'stream_ended':
          setActiveStreams(prev => prev.filter(stream => stream.id !== message.streamId));
          break;
        case 'stream_updated':
          setActiveStreams(prev => 
            prev.map(stream => 
              stream.id === message.streamId ? message.data : stream
            )
          );
          break;
      }
    };

    liveStreamWebSocket.subscribeToGlobal(handleWebSocketMessage);
    
    // Fetch initial streams
    fetchActiveStreams();
    
    return () => {
      liveStreamWebSocket.unsubscribeFromGlobal(handleWebSocketMessage);
    };
  }, []);

  const fetchActiveStreams = async () => {
    try {
      setLoading(true);
      // In a real implementation, you'd fetch from your API
      // For now, we'll use mock data
      const mockStreams: LiveStreamData[] = [
        {
          id: 'stream_1',
          title: 'Bitcoin Technical Analysis - Bull Run Incoming? 🚀',
          description: 'Deep dive into BTC charts and market analysis',
          streamerId: '0x1234...5678',
          streamerName: 'CryptoAnalyst',
          category: 'trading',
          isLive: true,
          viewerCount: 1247,
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          tags: ['bitcoin', 'analysis', 'trading'],
          chatEnabled: true,
          donationsEnabled: true,
          thumbnail: '/api/placeholder/320/180'
        },
        {
          id: 'stream_2',
          title: 'DeFi Yield Farming Strategies for 2024',
          description: 'Learn the best yield farming protocols and strategies',
          streamerId: '0x9876...5432',
          streamerName: 'DeFiMaster',
          category: 'education',
          isLive: true,
          viewerCount: 892,
          startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          tags: ['defi', 'yield', 'education'],
          chatEnabled: true,
          donationsEnabled: true,
          thumbnail: '/api/placeholder/320/180'
        },
        {
          id: 'stream_3',
          title: 'Live: Crypto Market News & Updates',
          description: 'Breaking news and market updates',
          streamerId: '0xabcd...efgh',
          streamerName: 'NewsTrader',
          category: 'news',
          isLive: true,
          viewerCount: 2156,
          startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          tags: ['news', 'market', 'updates'],
          chatEnabled: true,
          donationsEnabled: true,
          thumbnail: '/api/placeholder/320/180'
        }
      ];
      
      setActiveStreams(mockStreams);
    } catch (error) {
      console.error('Failed to fetch streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStreams = selectedCategory === 'all' 
    ? activeStreams 
    : activeStreams.filter(stream => stream.category === selectedCategory);

  const formatDuration = (startedAt: string) => {
    const duration = Date.now() - new Date(startedAt).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleStreamClick = (stream: LiveStreamData) => {
    setSelectedStream(stream);
  };

  const handleCreateStream = () => {
    if (!isConnected) {
      alert('Please connect your wallet to create a stream');
      return;
    }
    setShowCreateModal(true);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-900 to-black ${className}`}>
      
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🎥 Live Streams</h1>
              <p className="text-gray-400">
                Watch live crypto content • {activeStreams.length} streams • {activeStreams.reduce((sum, s) => sum + s.viewerCount, 0).toLocaleString()} viewers
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnectedToWS ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-400">
                  {isConnectedToWS ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <button
                onClick={handleCreateStream}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
              >
                <FaPlus />
                Go Live
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? `${category.color} text-white shadow-lg`
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Streams Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-700"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                    <div className="h-3 bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredStreams.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-xl font-bold text-white mb-2">No Live Streams</h3>
            <p className="text-gray-400 mb-6">
              {selectedCategory === 'all' 
                ? 'No one is streaming right now. Be the first to go live!'
                : `No ${categories.find(c => c.id === selectedCategory)?.label.replace(/[^\w\s]/gi, '')} streams are currently active.`
              }
            </p>
            <button
              onClick={handleCreateStream}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
            >
              Start Streaming
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStreams.map((stream) => (
              <div
                key={stream.id}
                className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer group"
                onClick={() => handleStreamClick(stream)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-700">
                  <img
                    src={stream.thumbnail || '/api/placeholder/320/180'}
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Live Indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 px-2 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white text-xs font-medium">LIVE</span>
                  </div>
                  
                  {/* Duration */}
                  <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-white text-xs">
                    {formatDuration(stream.startedAt)}
                  </div>
                  
                  {/* Viewer Count */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-white text-xs">
                    <FaUsers />
                    <span>{stream.viewerCount.toLocaleString()}</span>
                  </div>
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <FaPlay className="text-white text-xl ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stream Info */}
                <div className="p-4">
                  <h3 className="text-white font-medium text-sm line-clamp-2 mb-2">
                    {stream.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {stream.streamerName[0].toUpperCase()}
                    </div>
                    <span className="text-gray-400 text-sm">{stream.streamerName}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-700 rounded-full">
                      {categories.find(c => c.id === stream.category)?.label.replace(/[^\w\s]/gi, '') || stream.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <FaClock />
                      <span>{formatDuration(stream.startedAt)}</span>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {stream.tags && stream.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {stream.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stream Viewer Modal */}
      {selectedStream && (
        <LiveStreamViewer
          streamData={selectedStream}
          onClose={() => setSelectedStream(null)}
        />
      )}

      {/* Create Stream Modal */}
      {showCreateModal && (
        <PumpFunLiveStream
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
