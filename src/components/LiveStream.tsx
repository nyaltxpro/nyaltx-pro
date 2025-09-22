"use client";

import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaHeart, FaComment, FaShare, FaRocket, FaFire, FaDollarSign } from 'react-icons/fa';
import Image from 'next/image';

interface StreamActivity {
  id: string;
  type: 'buy' | 'sell' | 'create' | 'comment' | 'milestone';
  timestamp: number;
  user: {
    address: string;
    avatar?: string;
    name?: string;
  };
  token: {
    symbol: string;
    name: string;
    address: string;
    image?: string;
  };
  amount?: number;
  value?: number;
  message?: string;
  milestone?: string;
}

interface LiveStreamProps {
  tokenAddress?: string;
  className?: string;
}

export default function LiveStream({ tokenAddress, className = "" }: LiveStreamProps) {
  const [activities, setActivities] = useState<StreamActivity[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerCount, setViewerCount] = useState(1247);
  const [likes, setLikes] = useState(892);
  const [hasLiked, setHasLiked] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);
  const activitiesRef = useRef<HTMLDivElement>(null);

  // Mock data generator for live activities
  const generateMockActivity = (): StreamActivity => {
    const types: StreamActivity['type'][] = ['buy', 'sell', 'create', 'comment', 'milestone'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const mockTokens = [
      { symbol: 'PEPE', name: 'Pepe Coin', address: '0x123...', image: '/crypto-icons/color/pepe.svg' },
      { symbol: 'DOGE', name: 'Dogecoin', address: '0x456...', image: '/crypto-icons/color/doge.svg' },
      { symbol: 'SHIB', name: 'Shiba Inu', address: '0x789...', image: '/crypto-icons/color/shib.svg' },
      { symbol: 'FLOKI', name: 'Floki Inu', address: '0xabc...', image: '/crypto-icons/color/floki.svg' },
    ];

    const mockUsers = [
      { address: '0x1234...5678', name: 'CryptoWhale', avatar: '/avatars/whale.png' },
      { address: '0x9876...5432', name: 'DiamondHands', avatar: '/avatars/diamond.png' },
      { address: '0xabcd...efgh', name: 'MoonBoy', avatar: '/avatars/moon.png' },
      { address: '0x5555...7777', name: 'HODLer', avatar: '/avatars/hodl.png' },
    ];

    const messages = [
      "🚀 TO THE MOON!",
      "This is going parabolic!",
      "Diamond hands only 💎",
      "Best community ever!",
      "WAGMI 🔥",
      "LFG!!!",
      "This is the way",
      "Bullish AF 📈"
    ];

    const milestones = [
      "Reached 1000 holders!",
      "Market cap hit $1M!",
      "Listed on DEX!",
      "Community milestone achieved!",
      "New ATH reached!"
    ];

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: Date.now(),
      user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
      token: mockTokens[Math.floor(Math.random() * mockTokens.length)],
      amount: type === 'buy' || type === 'sell' ? Math.random() * 10000 : undefined,
      value: type === 'buy' || type === 'sell' ? Math.random() * 5000 : undefined,
      message: type === 'comment' ? messages[Math.floor(Math.random() * messages.length)] : undefined,
      milestone: type === 'milestone' ? milestones[Math.floor(Math.random() * milestones.length)] : undefined,
    };
  };

  // Add new activities periodically
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const newActivity = generateMockActivity();
      setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50 activities
      
      // Simulate viewer count changes
      setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, Math.random() * 3000 + 2000); // Random interval between 2-5 seconds

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Auto-scroll to latest activity
  useEffect(() => {
    if (activitiesRef.current && activities.length > 0) {
      activitiesRef.current.scrollTop = 0;
    }
  }, [activities]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const getActivityIcon = (type: StreamActivity['type']) => {
    switch (type) {
      case 'buy': return <FaRocket className="text-green-400" />;
      case 'sell': return <FaDollarSign className="text-red-400" />;
      case 'create': return <FaFire className="text-purple-400" />;
      case 'comment': return <FaComment className="text-blue-400" />;
      case 'milestone': return <FaHeart className="text-yellow-400" />;
    }
  };

  const getActivityColor = (type: StreamActivity['type']) => {
    switch (type) {
      case 'buy': return 'border-green-500/30 bg-green-500/10';
      case 'sell': return 'border-red-500/30 bg-red-500/10';
      case 'create': return 'border-purple-500/30 bg-purple-500/10';
      case 'comment': return 'border-blue-500/30 bg-blue-500/10';
      case 'milestone': return 'border-yellow-500/30 bg-yellow-500/10';
    }
  };

  const handleLike = () => {
    setHasLiked(!hasLiked);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // In a real implementation, you'd use the Fullscreen API
  };

  return (
    <div 
      ref={streamRef}
      className={`relative bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}
    >
      {/* Stream Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">LIVE</span>
            </div>
            <div className="text-gray-300">
              👥 {viewerCount.toLocaleString()} viewers
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              {isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white" />}
            </button>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              {isMuted ? <FaVolumeMute className="text-white" /> : <FaVolumeUp className="text-white" />}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              {isFullscreen ? <FaCompress className="text-white" /> : <FaExpand className="text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Stream Content */}
      <div className="h-96 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <FaRocket className="w-12 h-12 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">NYALTX Live Stream</h3>
          <p className="text-gray-300">Real-time token activity and community updates</p>
        </div>
      </div>

      {/* Stream Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                hasLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
              }`}
            >
              <FaHeart />
              <span>{likes}</span>
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors">
              <FaComment />
              <span>Chat</span>
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors">
              <FaShare />
              <span>Share</span>
            </button>
          </div>
          
          <div className="text-gray-300 text-sm">
            🔥 {activities.length} activities today
          </div>
        </div>
      </div>

      {/* Live Activity Feed - Side Panel */}
      <div className="absolute top-0 right-0 w-80 h-full bg-black/60 backdrop-blur-md border-l border-white/10">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Live Activity</h3>
          <p className="text-gray-400 text-sm">Real-time token updates</p>
        </div>
        
        <div 
          ref={activitiesRef}
          className="h-full overflow-y-auto p-4 space-y-3"
          style={{ maxHeight: 'calc(100% - 80px)' }}
        >
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-3 rounded-lg border ${getActivityColor(activity.type)} transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-sm font-medium truncate">
                      {activity.user.name || `${activity.user.address.slice(0, 6)}...${activity.user.address.slice(-4)}`}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-gray-300 text-sm">
                    {activity.type === 'buy' && (
                      <span>
                        Bought <span className="text-green-400">{formatNumber(activity.amount!)}</span> {activity.token.symbol}
                        <span className="text-gray-400"> (${formatNumber(activity.value!)})</span>
                      </span>
                    )}
                    {activity.type === 'sell' && (
                      <span>
                        Sold <span className="text-red-400">{formatNumber(activity.amount!)}</span> {activity.token.symbol}
                        <span className="text-gray-400"> (${formatNumber(activity.value!)})</span>
                      </span>
                    )}
                    {activity.type === 'create' && (
                      <span>Created new token <span className="text-purple-400">{activity.token.symbol}</span></span>
                    )}
                    {activity.type === 'comment' && (
                      <span className="text-blue-300">"{activity.message}"</span>
                    )}
                    {activity.type === 'milestone' && (
                      <span className="text-yellow-300">🎉 {activity.milestone}</span>
                    )}
                  </div>
                  
                  {(activity.type === 'buy' || activity.type === 'sell' || activity.type === 'create') && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                      <span className="text-gray-400 text-xs">{activity.token.symbol}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">No activities yet</div>
              <div className="text-gray-600 text-sm">Waiting for live updates...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
