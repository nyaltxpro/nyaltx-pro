'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { streamingService, ChatMessage } from '@/services/StreamingService';
import { FaComments, FaPaperPlane, FaUsers, FaSignal, FaExclamationTriangle, FaPlay } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface WebRTCViewerProps {
  broadcasterId: string;
  streamTitle: string;
  onStreamEnd?: () => void;
}

interface ConnectionStats {
  bitrate: number;
  packetsLost: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function WebRTCViewer({ broadcasterId, streamTitle, onStreamEnd }: WebRTCViewerProps) {
  const { address, isConnected } = useAccount();
  const [isConnected2Stream, setIsConnected2Stream] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    bitrate: 0,
    packetsLost: 0,
    quality: 'good'
  });
  const [connected, setConnected] = useState(false);

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const viewerId = useRef<string>(`viewer_${Math.random().toString(36).substring(2, 9)}`);
  const chatPollingRef = useRef<NodeJS.Timeout | null>(null);
  const streamPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize HTTP-based streaming service
  useEffect(() => {
    if (!isConnected || !address) {
      setError('Please connect your wallet to view the stream');
      setIsLoading(false);
      return;
    }

    console.log('🔌 Viewer connecting to HTTP streaming service...');
    
    const initializeViewer = async () => {
      try {
        // Join as viewer using HTTP service
        console.log('👀 Joining as viewer for broadcaster:', broadcasterId);
        await streamingService.joinAsViewer(viewerId.current, broadcasterId, address);
        
        setConnected(true);
        setError(null);
        setIsLoading(false);
        
        // Since this is HTTP-based, we'll simulate the stream connection
        // In a real WebRTC implementation, this would establish peer connections
        setIsConnected2Stream(true);
        toast.success('Connected to stream!');
        
        // Start polling for chat messages
        startChatPolling();
        
        // Start polling for stream updates
        startStreamPolling();
        
        console.log('✅ Successfully joined as viewer');
      } catch (error) {
        console.error('❌ Failed to join as viewer:', error);
        setError('Failed to connect to stream. Stream may have ended.');
        setIsLoading(false);
      }
    };

    initializeViewer();

    return () => {
      cleanup();
    };
  }, [isConnected, address, broadcasterId]);

  const startChatPolling = () => {
    let lastMessageTimestamp = 0;
    
    chatPollingRef.current = setInterval(async () => {
      try {
        const messages = await streamingService.getChatMessages(broadcasterId);
        
        // Check for new messages based on timestamp
        const newMessages = messages.filter(msg => msg.timestamp > lastMessageTimestamp);
        
        if (newMessages.length > 0) {
          // Update last timestamp
          lastMessageTimestamp = Math.max(...newMessages.map(msg => msg.timestamp));
          
          // Update all messages (for proper ordering)
          setChatMessages(messages);
          
          console.log(`📨 Received ${newMessages.length} new chat messages`);
        }
      } catch (error) {
        console.error('Chat polling error:', error);
      }
    }, 1000); // Poll every 1 second for better responsiveness
  };

  const startStreamPolling = () => {
    streamPollingRef.current = setInterval(async () => {
      try {
        const streams = await streamingService.getActiveStreams();
        const currentStream = streams.find(s => s.broadcasterId === broadcasterId);
        
        if (currentStream) {
          setViewerCount(currentStream.viewerCount);
          
          // Simulate connection stats
          setConnectionStats(prev => ({
            bitrate: Math.floor(Math.random() * 1000) + 500,
            packetsLost: Math.floor(Math.random() * 10),
            quality: Math.random() > 0.8 ? 'excellent' : Math.random() > 0.6 ? 'good' : 'fair'
          }));
        } else {
          // Stream not found, it may have ended
          setError('Stream has ended');
          setIsConnected2Stream(false);
          toast('Stream has ended');
          
          if (onStreamEnd) {
            onStreamEnd();
          }
        }
      } catch (error) {
        console.error('Stream polling error:', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  const cleanup = () => {
    if (chatPollingRef.current) {
      clearInterval(chatPollingRef.current);
      chatPollingRef.current = null;
    }
    
    if (streamPollingRef.current) {
      clearInterval(streamPollingRef.current);
      streamPollingRef.current = null;
    }
    
    streamingService.disconnect();
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !address) return;

    const messageToSend = chatInput;
    setChatInput(''); // Clear input immediately for better UX

    try {
      console.log('📤 Viewer sending chat message:', messageToSend);
      await streamingService.sendChatMessage(
        broadcasterId,
        messageToSend,
        address,
        'Viewer'
      );
      
      // Optimistically add message to local state
      const newMessage: ChatMessage = {
        message: messageToSend,
        senderAddress: address,
        senderName: 'Viewer',
        timestamp: Date.now()
      };
      
      setChatMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => 
          msg.message === newMessage.message && 
          msg.senderAddress === newMessage.senderAddress &&
          Math.abs(msg.timestamp - newMessage.timestamp) < 5000 // Within 5 seconds
        );
        return exists ? prev : [...prev, newMessage];
      });
      
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending chat message:', error);
      toast.error('Failed to send message. Please try again.');
      // Restore message to input on failure
      setChatInput(messageToSend);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-yellow-400';
      case 'fair': return 'text-orange-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="bg-[#0f1923] rounded-xl border border-gray-800 p-8 text-center">
        <FaExclamationTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Wallet Required</h3>
        <p className="text-gray-400">Please connect your wallet to view live streams</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1923] rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{streamTitle}</h2>
            <p className="text-gray-400">Stream ID: {broadcasterId}</p>
            <p className="text-sm text-gray-500">
              {connected ? '🟢 Connected via HTTP streaming' : '🔴 Disconnected'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              LIVE
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <FaUsers />
              <span>{viewerCount} viewers</span>
            </div>

            <div className={`flex items-center gap-2 ${getQualityColor(connectionStats.quality)}`}>
              <FaSignal />
              <span className="text-sm capitalize">{connectionStats.quality}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
        {/* Video Player */}
        <div className="lg:col-span-3 relative">
          <div className="aspect-video bg-gray-900 relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              controls
              className="w-full h-full object-cover"
            />
            
            {/* Demo Video Stream */}
            {isConnected2Stream && !error && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30">
                {/* Simulated video content */}
                <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 animate-pulse"></div>
                  
                  {/* Stream content */}
                  <div className="text-center z-10">
                    <div className="relative">
                      <FaPlay className="w-32 h-32 text-cyan-400/60 mx-auto mb-6 animate-bounce" />
                      <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">🎥 Live Stream Active</h3>
                    <p className="text-cyan-300 text-lg mb-2">Broadcasting: {streamTitle}</p>
                    <p className="text-gray-300 text-sm mb-4">
                      HTTP-based streaming with real-time chat
                    </p>
                    
                    {/* Fake stream stats */}
                    <div className="flex justify-center gap-6 text-sm">
                      <div className="text-green-400">
                        <span className="block font-semibold">Quality</span>
                        <span>1080p HD</span>
                      </div>
                      <div className="text-blue-400">
                        <span className="block font-semibold">Viewers</span>
                        <span>{viewerCount}</span>
                      </div>
                      <div className="text-purple-400">
                        <span className="block font-semibold">Status</span>
                        <span>Live</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating particles effect */}
                  <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                  <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-20 left-20 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-gray-400 text-lg">Connecting to stream...</p>
                  <p className="text-gray-500 text-sm mt-2">Using HTTP polling (Vercel compatible)</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <div className="text-center">
                  <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 text-lg">{error}</p>
                  <p className="text-gray-500 text-sm mt-2">Stream may have ended or is not available</p>
                </div>
              </div>
            )}

            {/* Connection Stats Overlay */}
            {isConnected2Stream && !error && (
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                <div className="space-y-1">
                  <div>Quality: <span className={getQualityColor(connectionStats.quality)}>{connectionStats.quality}</span></div>
                  <div>Bitrate: {connectionStats.bitrate} kbps</div>
                  <div>Packets Lost: {connectionStats.packetsLost}</div>
                  <div className="text-green-400">HTTP Streaming</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="lg:col-span-1 bg-gray-900 flex flex-col h-[500px] lg:h-auto">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaComments />
              Live Chat
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <p className="text-gray-500 text-center text-sm">No messages yet. Start the conversation!</p>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-cyan-400 font-medium">
                      {msg.senderName === 'Broadcaster' ? '🎥 Broadcaster' : 
                       msg.senderName || formatAddress(msg.senderAddress)}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{msg.message}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 text-sm"
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim()}
                className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
