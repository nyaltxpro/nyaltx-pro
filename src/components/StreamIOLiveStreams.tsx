'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { streamIOService, LiveStream, StreamUser } from '@/services/StreamIOService';
import { FaUsers, FaPlay, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface StreamIOLiveStreamsProps {
  onStreamSelect: (streamId: string, streamTitle: string) => void;
}

export default function StreamIOLiveStreams({ onStreamSelect }: StreamIOLiveStreamsProps) {
  const { address, isConnected } = useAccount();
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Stream.io service
  useEffect(() => {
    if (!isConnected || !address) {
      setError('Please connect your wallet to view live streams');
      setIsLoading(false);
      return;
    }

    const initializeService = async () => {
      try {
        const user: StreamUser = {
          id: address.toLowerCase(),
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          walletAddress: address,
          image: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
        };

        await streamIOService.initialize(user);
        setIsInitialized(true);
        setError(null);
        
        // Load initial streams
        await loadLiveStreams();
      } catch (error) {
        console.error('❌ Failed to initialize streaming service:', error);
        setError('Failed to initialize streaming service');
      }
    };

    initializeService();
  }, [isConnected, address]);

  // Load live streams
  const loadLiveStreams = async () => {
    if (!isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const streams = await streamIOService.getActiveLiveStreams();
      setLiveStreams(streams);
      
      console.log(`✅ Loaded ${streams.length} live streams`);
    } catch (error) {
      console.error('❌ Failed to load live streams:', error);
      setError('Failed to load live streams');
      toast.error('Failed to load live streams');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh streams every 10 seconds
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      loadLiveStreams();
    }, 10000);

    return () => clearInterval(interval);
  }, [isInitialized]);

  // Manual refresh
  const handleRefresh = () => {
    loadLiveStreams();
    toast.success('Refreshed live streams');
  };

  // Join stream
  const handleJoinStream = (stream: LiveStream) => {
    console.log('🎯 Joining stream:', stream.id);
    onStreamSelect(stream.id, stream.title);
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just started';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Please connect your wallet to view live streams</p>
        </div>
      </div>
    );
  }

  if (error && !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Streams</h2>
          <p className="text-gray-400 mt-1">Powered by Stream.io</p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <FaSync className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {isLoading && liveStreams.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading live streams...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && isInitialized && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && liveStreams.length === 0 && !error && (
        <div className="text-center py-12">
          <FaPlay className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No Live Streams</h3>
          <p className="text-gray-500">No one is streaming right now. Be the first to go live!</p>
        </div>
      )}

      {/* Streams Grid */}
      {liveStreams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveStreams.map((stream) => (
            <div
              key={stream.id}
              className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer group"
              onClick={() => handleJoinStream(stream)}
            >
              {/* Stream Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-cyan-900/30 to-purple-900/30 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <FaPlay className="w-12 h-12 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-white font-medium">Join Stream</p>
                  </div>
                </div>
                
                {/* Live Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-red-600 rounded-full text-white text-xs font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
                
                {/* Viewer Count */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-full text-white text-xs">
                  <FaUsers className="w-3 h-3" />
                  <span>{stream.viewerCount}</span>
                </div>
              </div>

              {/* Stream Info */}
              <div className="p-4">
                <h3 className="font-medium text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                  {stream.title}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                      {stream.hostName.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{stream.hostName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatTimeAgo(stream.createdAt)}</span>
                    <span>{stream.hostWallet.slice(0, 6)}...{stream.hostWallet.slice(-4)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stream Count */}
      {liveStreams.length > 0 && (
        <div className="text-center text-gray-500 text-sm">
          Showing {liveStreams.length} live stream{liveStreams.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
