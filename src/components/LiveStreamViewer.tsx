"use client";

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { FaHeart, FaShare, FaUsers, FaPaperPlane, FaTimes, FaComment, FaGift, FaVolumeMute, FaVolumeUp, FaExpand, FaCompress } from 'react-icons/fa';
import { liveStreamWebSocket, LiveStreamData, StreamMessage, WebSocketStreamMessage } from '@/services/LiveStreamWebSocket';

interface LiveStreamViewerProps {
  streamData: LiveStreamData;
  onClose: () => void;
}

export default function LiveStreamViewer({ streamData, onClose }: LiveStreamViewerProps) {
  const { address, isConnected } = useAccount();
  
  // Stream state
  const [currentStream, setCurrentStream] = useState<LiveStreamData>(streamData);
  const [viewerCount, setViewerCount] = useState(streamData.viewerCount || 0);
  const [isLive, setIsLive] = useState(streamData.isLive);
  
  // Chat state
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(true);
  
  // UI state
  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnectedToWS, setIsConnectedToWS] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // WebSocket connection and message handling
  useEffect(() => {
    const handleWebSocketMessage = (message: WebSocketStreamMessage) => {
      switch (message.type) {
        case 'connection_status':
          setIsConnectedToWS(message.data.status === 'connected');
          break;
        case 'stream_ended':
          if (message.streamId === currentStream.id) {
            setIsLive(false);
            // Auto-close viewer when stream ends
            setTimeout(() => onClose(), 3000);
          }
          break;
        case 'stream_updated':
          if (message.streamId === currentStream.id) {
            setCurrentStream(message.data);
            setViewerCount(message.data.viewerCount);
          }
          break;
        case 'chat_message':
          if (message.streamId === currentStream.id) {
            setMessages(prev => [...prev, message.data]);
          }
          break;
        case 'viewer_joined':
        case 'viewer_left':
          if (message.streamId === currentStream.id) {
            setViewerCount(message.data.viewerCount);
          }
          break;
        case 'donation':
          if (message.streamId === currentStream.id) {
            setMessages(prev => [...prev, message.data]);
          }
          break;
      }
    };

    // Subscribe to stream
    liveStreamWebSocket.subscribeToStream(currentStream.id, handleWebSocketMessage);
    
    return () => {
      liveStreamWebSocket.unsubscribeFromStream(currentStream.id, handleWebSocketMessage);
    };
  }, [currentStream.id, onClose]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendChatMessage = () => {
    if (!chatMessage.trim() || !address) return;
    
    const username = `${address.slice(0, 6)}...${address.slice(-4)}`;
    liveStreamWebSocket.sendChatMessage(
      currentStream.id,
      chatMessage.trim(),
      address,
      username
    );
    
    setChatMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const handleLike = () => {
    setHasLiked(!hasLiked);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const renderMessage = (msg: StreamMessage) => {
    if (msg.type === 'donation') {
      return (
        <div key={msg.id} className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg mb-2">
          <div className="flex items-center gap-2 mb-1">
            <FaGift className="text-yellow-400" />
            <span className="font-bold text-yellow-400">{msg.username}</span>
            <span className="text-yellow-300">donated {msg.amount} {msg.token}</span>
          </div>
          {msg.message && (
            <div className="text-gray-300 text-sm">{msg.message}</div>
          )}
        </div>
      );
    }

    return (
      <div key={msg.id} className="mb-2">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {msg.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white text-sm">{msg.username}</span>
              <span className="text-gray-400 text-xs">{formatTimeAgo(msg.timestamp)}</span>
            </div>
            <div className="text-gray-300 text-sm break-words">{msg.message}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-gradient-to-b from-gray-900 to-black border border-gray-700 rounded-xl overflow-hidden ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl max-h-[95vh]'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isLive ? (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              )}
              <span className="text-white font-semibold">
                {isLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            <div className="text-gray-300">
              👥 {viewerCount.toLocaleString()} viewers
            </div>
            <div className="text-gray-400">
              {currentStream.title}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnectedToWS ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-400">
              {isConnectedToWS ? 'Connected' : 'Disconnected'}
            </span>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-80px)]">
          
          {/* Video Area */}
          <div className="flex-1 relative bg-gray-900">
            {isLive ? (
              <div className="w-full h-full bg-gradient-to-br from-cyan-900/20 to-purple-900/20 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
                    <div className="w-12 h-12 bg-red-500 rounded-full"></div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{currentStream.streamerName}</h3>
                  <p className="text-gray-300">{currentStream.title}</p>
                  <div className="mt-4 text-sm text-gray-400">
                    {currentStream.category} • Started {new Date(currentStream.startedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">📺</div>
                  <h3 className="text-xl font-bold mb-2">Stream Ended</h3>
                  <p>This stream is no longer live</p>
                </div>
              </div>
            )}

            {/* Video Controls */}
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
                    <FaShare />
                    <span>Share</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-white"
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-white"
                  >
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaComment className="text-cyan-400" />
                <span className="font-medium text-white">Live Chat</span>
              </div>
              <button
                onClick={() => setIsChatVisible(!isChatVisible)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isChatVisible ? '−' : '+'}
              </button>
            </div>

            {isChatVisible && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-2">💬</div>
                      <div className="text-gray-400 text-sm">No messages yet</div>
                      <div className="text-gray-500 text-xs">Be the first to chat!</div>
                    </div>
                  ) : (
                    messages.map(renderMessage)
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                {isLive && (
                  <div className="p-4 border-t border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none text-sm"
                        disabled={!isConnected}
                      />
                      <button
                        onClick={sendChatMessage}
                        disabled={!chatMessage.trim() || !isConnected}
                        className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                    {!isConnected && (
                      <div className="text-xs text-gray-400 mt-2">
                        Connect wallet to chat
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
