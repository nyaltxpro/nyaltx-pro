"use client";

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPlay, FaStop, FaUsers, FaComments, FaPaperPlane, FaTimes, FaGift } from 'react-icons/fa';
import { liveStreamWebSocket, LiveStreamData, StreamMessage, WebSocketStreamMessage } from '@/services/LiveStreamWebSocket';

interface PumpFunLiveStreamProps {
  onClose: () => void;
}

export default function PumpFunLiveStream({ onClose }: PumpFunLiveStreamProps) {
  const { address, isConnected } = useAccount();
  
  // Stream creation state
  const [isCreating, setIsCreating] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [category, setCategory] = useState('trading');
  
  // Stream state
  const [currentStream, setCurrentStream] = useState<LiveStreamData | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  
  // Media state
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Chat state
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Connection state
  const [isConnectedToWS, setIsConnectedToWS] = useState(false);
  
  const categories = [
    { id: 'trading', label: '📈 Trading & Analysis' },
    { id: 'education', label: '🎓 Crypto Education' },
    { id: 'news', label: '📰 News & Updates' },
    { id: 'community', label: '💬 Community Chat' },
    { id: 'gaming', label: '🎮 Gaming' },
    { id: 'other', label: '🔥 Other' }
  ];

  // Initialize WebSocket connection
  useEffect(() => {
    const handleWebSocketMessage = (message: WebSocketStreamMessage) => {
      switch (message.type) {
        case 'connection_status':
          setIsConnectedToWS(message.data.status === 'connected');
          break;
        case 'stream_created':
          if (message.data.streamerId === address) {
            setCurrentStream(message.data);
            setIsStreaming(true);
          }
          break;
        case 'stream_ended':
          if (message.streamId === currentStream?.id) {
            setIsStreaming(false);
            setCurrentStream(null);
            stopPreview();
          }
          break;
        case 'stream_updated':
          if (message.streamId === currentStream?.id) {
            setCurrentStream(message.data);
            setViewerCount(message.data.viewerCount);
          }
          break;
        case 'chat_message':
          if (message.streamId === currentStream?.id) {
            setMessages(prev => [...prev, message.data]);
          }
          break;
        case 'viewer_joined':
        case 'viewer_left':
          if (message.streamId === currentStream?.id) {
            setViewerCount(message.data.viewerCount);
          }
          break;
        case 'donation':
          if (message.streamId === currentStream?.id) {
            setMessages(prev => [...prev, message.data]);
          }
          break;
      }
    };

    liveStreamWebSocket.subscribeToGlobal(handleWebSocketMessage);
    
    return () => {
      liveStreamWebSocket.unsubscribeFromGlobal(handleWebSocketMessage);
    };
  }, [address, currentStream?.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (currentStream && isStreaming) {
        liveStreamWebSocket.endStream(currentStream.id);
      }
    };
  }, [stream, currentStream, isStreaming]);

  const startPreview = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const stopPreview = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  const handleCreateStream = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!streamTitle.trim()) {
      alert('Please enter a stream title');
      return;
    }

    if (!isConnectedToWS) {
      alert('WebSocket not connected. Please try again.');
      return;
    }

    setIsCreating(true);
    
    try {
      await startPreview();
      
      const streamData = {
        title: streamTitle,
        description: streamDescription,
        streamerId: address!,
        streamerName: `${address!.slice(0, 6)}...${address!.slice(-4)}`,
        category,
        tags: [category, 'crypto', 'live'],
        chatEnabled: true,
        donationsEnabled: true,
        thumbnail: '/api/placeholder/320/180'
      };
      
      liveStreamWebSocket.createStream(streamData);
      
    } catch (error) {
      console.error('Failed to create stream:', error);
      alert('Failed to create stream. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEndStream = () => {
    if (currentStream) {
      liveStreamWebSocket.endStream(currentStream.id);
    }
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim() || !currentStream || !address) return;
    
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

  // Start preview when component mounts
  useEffect(() => {
    if (!isStreaming) {
      startPreview();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-700 rounded-xl w-full max-w-6xl mx-4 max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isStreaming && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
              <h2 className="text-xl font-bold text-white">
                {isStreaming ? 'Live Stream' : 'Create Live Stream'}
              </h2>
            </div>
            {isStreaming && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <FaUsers />
                  <span>{viewerCount} viewers</span>
                </div>
                <div className="text-gray-400">
                  {currentStream?.title}
                </div>
              </div>
            )}
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
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            
            {/* Video Preview */}
            <div className="relative flex-1 bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <FaVideoSlash className="text-gray-400 text-6xl" />
                </div>
              )}

              {isStreaming && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">LIVE</span>
                </div>
              )}

              {/* Stream Info Overlay */}
              {!isStreaming && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-4">🎥</div>
                    <h3 className="text-xl font-bold mb-2">Ready to Go Live?</h3>
                    <p className="text-gray-300">Set up your stream and start broadcasting</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center justify-between">
                
                {/* Media Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full transition-colors ${
                      isVideoEnabled 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
                  </button>

                  <button
                    onClick={toggleAudio}
                    className={`p-3 rounded-full transition-colors ${
                      isAudioEnabled 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                  </button>
                </div>

                {/* Stream Actions */}
                <div className="flex items-center gap-3">
                  {!isStreaming ? (
                    <button
                      onClick={handleCreateStream}
                      disabled={!isConnected || !isConnectedToWS || isCreating}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <FaPlay />
                      {isCreating ? 'Creating...' : 'Go Live'}
                    </button>
                  ) : (
                    <button
                      onClick={handleEndStream}
                      className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all flex items-center gap-2"
                    >
                      <FaStop />
                      End Stream
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaComments className="text-cyan-400" />
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
                {isStreaming && (
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

        {/* Stream Setup Form (when not streaming) */}
        {!isStreaming && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Stream Setup</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Stream Title *</label>
                  <input
                    type="text"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    placeholder="Enter your stream title..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Description</label>
                  <textarea
                    value={streamDescription}
                    onChange={(e) => setStreamDescription(e.target.value)}
                    placeholder="Tell viewers what your stream is about..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateStream}
                    disabled={!isConnected || !isConnectedToWS || !streamTitle.trim() || isCreating}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isCreating ? 'Creating...' : 'Create Stream'}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
