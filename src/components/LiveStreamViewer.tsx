"use client";

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { FaHeart, FaComment, FaShare, FaUsers, FaEye, FaPaperPlane, FaGift } from 'react-icons/fa';
import Image from 'next/image';

interface Comment {
  id: string;
  user: {
    address: string;
    name?: string;
    avatar?: string;
  };
  message: string;
  timestamp: number;
  isSuperchat?: boolean;
  amount?: number;
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
  stream?: MediaStream;
}

interface LiveStreamViewerProps {
  streamData: LiveStreamData;
  onClose: () => void;
}

export default function LiveStreamViewer({ streamData, onClose }: LiveStreamViewerProps) {
  const { address, isConnected } = useAccount();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState(streamData.likes || 0);
  const [viewerCount, setViewerCount] = useState(streamData.viewerCount);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

  // Mock comments generator
  const generateMockComment = (): Comment => {
    const mockUsers = [
      { address: '0x1234...5678', name: 'CryptoTrader', avatar: '/avatars/trader.png' },
      { address: '0x9876...5432', name: 'DiamondHands', avatar: '/avatars/diamond.png' },
      { address: '0xabcd...efgh', name: 'MoonBoy', avatar: '/avatars/moon.png' },
    ];

    const messages = [
      "Great analysis! 🚀",
      "When moon? 🌙",
      "This is bullish AF 📈",
      "Thanks for the insights!",
      "LFG! 🔥",
      "Diamond hands only 💎",
      "Best stream ever!",
      "WAGMI 💪",
      "To the moon! 🚀",
      "Hodling strong! 💎🙌"
    ];

    return {
      id: Math.random().toString(36).substr(2, 9),
      user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: Date.now(),
      isSuperchat: Math.random() > 0.9,
      amount: Math.random() > 0.9 ? Math.floor(Math.random() * 100) + 10 : undefined
    };
  };

  useEffect(() => {
    // Set up video stream if available
    if (streamData.stream && videoRef.current) {
      videoRef.current.srcObject = streamData.stream;
    }

    // Generate mock comments periodically
    const commentInterval = setInterval(() => {
      const newComment = generateMockComment();
      setComments(prev => [newComment, ...prev.slice(0, 49)]);
    }, Math.random() * 5000 + 3000);

    // Update viewer count periodically
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 10000);

    return () => {
      clearInterval(commentInterval);
      clearInterval(viewerInterval);
    };
  }, [streamData.stream]);

  // Auto-scroll comments
  useEffect(() => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = 0;
    }
  }, [comments]);

  const handleSendComment = () => {
    if (!isConnected) {
      alert('Please connect your wallet to comment');
      return;
    }

    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      user: {
        address: address!,
        name: `${address?.slice(0, 6)}...${address?.slice(-4)}`
      },
      message: newComment,
      timestamp: Date.now()
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleLike = () => {
    if (!isConnected) {
      alert('Please connect your wallet to like');
      return;
    }

    setHasLiked(!hasLiked);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const formatDuration = (startTime: number) => {
    const duration = Date.now() - startTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Video Player */}
        <div className="relative flex-1 bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Stream Overlay */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-semibold">LIVE</span>
                  <span className="text-white">{formatDuration(streamData.startTime)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-white">
                  <FaUsers />
                  <span>{viewerCount.toLocaleString()}</span>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 text-xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Stream Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">{streamData.title}</h2>
                <p className="text-gray-300">{streamData.streamerName}</p>
                <span className="inline-block px-2 py-1 bg-cyan-600 text-white text-xs rounded-full mt-1">
                  {streamData.category}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
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
                  <FaShare />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FaComment />
            Live Chat
          </h3>
          <p className="text-gray-400 text-sm">{comments.length} messages</p>
        </div>

        {/* Comments Feed */}
        <div 
          ref={commentsRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-lg ${
                comment.isSuperchat 
                  ? 'bg-yellow-500/20 border border-yellow-500/30' 
                  : 'bg-gray-800/50'
              }`}
            >
              {comment.isSuperchat && (
                <div className="flex items-center gap-2 mb-2">
                  <FaGift className="text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">
                    Super Chat ${comment.amount}
                  </span>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">
                    {comment.user.name?.[0] || comment.user.address[2]}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-sm font-medium truncate">
                      {comment.user.name || `${comment.user.address.slice(0, 6)}...${comment.user.address.slice(-4)}`}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {formatTimeAgo(comment.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-sm break-words">
                    {comment.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-700">
          {isConnected ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={handleSendComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaPaperPlane />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Connect wallet to chat</p>
              <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
