'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import io, { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { FaComments, FaPaperPlane, FaUsers, FaSignal, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface WebRTCViewerProps {
  broadcasterId: string;
  streamTitle: string;
  onStreamEnd?: () => void;
}

interface ChatMessage {
  message: string;
  senderAddress: string;
  senderName: string;
  timestamp: number;
}

interface ConnectionStats {
  bitrate: number;
  packetsLost: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function WebRTCViewer({ broadcasterId, streamTitle, onStreamEnd }: WebRTCViewerProps) {
  const { address, isConnected } = useAccount();
  const [socket, setSocket] = useState<Socket | null>(null);
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

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const viewerId = useRef<string>(`viewer_${Math.random().toString(36).substring(2, 9)}`);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!isConnected || !address) {
      setError('Please connect your wallet to view the stream');
      setIsLoading(false);
      return;
    }

    console.log('🔌 Viewer connecting to Socket.IO...');
    const newSocket = io({
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      timeout: 20000
    });

    newSocket.on('connect', () => {
      console.log('✅ Viewer socket connected:', newSocket.id);
      setSocket(newSocket);
      setError(null);
      
      // Join as viewer
      console.log('👀 Joining as viewer for broadcaster:', broadcasterId);
      newSocket.emit('viewer-join', {
        broadcasterId,
        viewerId: viewerId.current,
        walletAddress: address
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Viewer socket connection error:', error);
      setError('Failed to connect to streaming server');
      setIsLoading(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Viewer socket disconnected:', reason);
      setIsConnected2Stream(false);
    });

    newSocket.on('broadcaster-signal', ({ signal }) => {
      console.log('Received broadcaster signal');
      
      if (!peerRef.current) {
        // Create peer connection
        const peer = new SimplePeer({ 
          initiator: false,
          trickle: false,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        peer.on('signal', (signalData: any) => {
          newSocket.emit('viewer-signal', {
            broadcasterId,
            viewerId: viewerId.current,
            signal: signalData
          });
        });

        peer.on('stream', (stream: any) => {
          console.log('Received remote stream');
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          setIsConnected2Stream(true);
          setIsLoading(false);
          toast.success('Connected to stream!');
        });

        peer.on('error', (err: any) => {
          console.error('Peer error:', err);
          setError('Connection failed. Please try again.');
          setIsLoading(false);
        });

        peer.on('close', () => {
          console.log('Peer connection closed');
          setIsConnected2Stream(false);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
        });

        // Monitor connection stats
        peer.on('connect', () => {
          const interval = setInterval(() => {
            if (peer.destroyed) {
              clearInterval(interval);
              return;
            }

            try {
              // Get connection stats (simplified)
              setConnectionStats(prev => ({
                ...prev,
                bitrate: Math.floor(Math.random() * 1000) + 500, // Mock data
                packetsLost: Math.floor(Math.random() * 10),
                quality: prev.packetsLost < 5 ? 'excellent' : prev.packetsLost < 15 ? 'good' : 'fair'
              }));
            } catch (error) {
              console.warn('Error getting connection stats:', error);
            }
          }, 5000);
        });

        peerRef.current = peer;
      }

      // Signal the peer
      try {
        peerRef.current.signal(signal);
      } catch (error) {
        console.error('Error signaling peer:', error);
      }
    });

    newSocket.on('no-broadcaster', () => {
      setError('Stream not found or has ended');
      setIsLoading(false);
    });

    newSocket.on('stream-ended', ({ broadcasterId: endedStreamId }) => {
      if (endedStreamId === broadcasterId) {
        setIsConnected2Stream(false);
        setError('Stream has ended');
        toast('Stream has ended');
        
        if (onStreamEnd) {
          onStreamEnd();
        }
      }
    });

    newSocket.on('viewer-count-update', ({ broadcasterId: streamId, count }) => {
      if (streamId === broadcasterId) {
        setViewerCount(count);
      }
    });

    newSocket.on('chat-message', ({ message, senderAddress, senderName, timestamp }) => {
      setChatMessages(prev => [...prev, { message, senderAddress, senderName, timestamp }]);
    });

    newSocket.on('stream-stats', ({ stats }) => {
      // Update stream quality based on broadcaster stats
      console.log('Stream stats:', stats);
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      newSocket.disconnect();
    };
  }, [isConnected, address, broadcasterId, onStreamEnd]);

  const sendChatMessage = () => {
    if (!chatInput.trim() || !socket) return;

    socket.emit('chat-message', {
      broadcasterId,
      message: chatInput,
      senderAddress: address,
      senderName: 'Viewer'
    });

    setChatInput('');
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
            
            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-gray-400 text-lg">Connecting to stream...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <div className="text-center">
                  <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 text-lg">{error}</p>
                </div>
              </div>
            )}

            {/* Connection Stats Overlay */}
            {isConnected2Stream && (
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                <div className="space-y-1">
                  <div>Quality: <span className={getQualityColor(connectionStats.quality)}>{connectionStats.quality}</span></div>
                  <div>Bitrate: {connectionStats.bitrate} kbps</div>
                  <div>Packets Lost: {connectionStats.packetsLost}</div>
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
              Chat
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <p className="text-gray-500 text-center text-sm">No messages yet</p>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-cyan-400 font-medium">
                      {msg.senderName === 'Broadcaster' ? '🎥 Broadcaster' : formatAddress(msg.senderAddress)}
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
