'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { 
  StreamVideo, 
  StreamVideoClient, 
  Call,
  StreamCall,
  SpeakerLayout,
  CallParticipantsList,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { streamIOService, StreamUser, LiveStream } from '@/services/StreamIOService';
import { FaUsers, FaExclamationTriangle, FaPlay, FaComments, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface StreamIOViewerProps {
  streamId: string;
  streamTitle: string;
  onStreamEnd?: () => void;
}

export default function StreamIOViewer({ streamId, streamTitle, onStreamEnd }: StreamIOViewerProps) {
  const { address, isConnected } = useAccount();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected2Stream, setIsConnected2Stream] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Initialize Stream.io service
  useEffect(() => {
    if (!isConnected || !address) {
      setError('Please connect your wallet to view the stream');
      return;
    }

    const initializeViewer = async () => {
      try {
        setIsConnecting(true);
        setError(null);
        
        const user: StreamUser = {
          id: address.toLowerCase(),
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          walletAddress: address,
          image: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
        };

        // Initialize service
        await streamIOService.initialize(user);
        
        // Join the live stream
        const joinedCall = await streamIOService.joinLiveStream(streamId);
        
        setCall(joinedCall);
        // Get client from service instead of call
        const currentClient = streamIOService.getCurrentCall();
        setClient(currentClient ? (currentClient as any).client : null);
        setIsConnected2Stream(true);
        
        // Monitor participant count
        joinedCall.state.participants$.subscribe((participants) => {
          setViewerCount(participants.length - 1); // Exclude host
        });

        // Monitor call state
        joinedCall.state.callingState$.subscribe((state) => {
          // Use proper CallingState enum values
          if (state.toString() === 'left' || state.toString() === 'ended') {
            setIsConnected2Stream(false);
            if (onStreamEnd) {
              onStreamEnd();
            }
          }
        });

        console.log('✅ Successfully joined stream:', streamId);
        toast.success('Connected to stream!');
      } catch (error) {
        console.error('❌ Failed to join stream:', error);
        setError('Failed to connect to stream. Stream may have ended.');
        toast.error('Failed to connect to stream');
      } finally {
        setIsConnecting(false);
      }
    };

    initializeViewer();

    return () => {
      if (call) {
        streamIOService.endStream();
      }
    };
  }, [isConnected, address, streamId]);

  // Send chat message (using Stream.io's built-in chat if available)
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !call) return;

    try {
      // Stream.io calls have built-in messaging capabilities
      // This would integrate with Stream Chat SDK for full chat functionality
      console.log('💬 Sending message:', chatInput);
      
      // For now, we'll use a simple local state
      const newMessage = {
        id: Date.now().toString(),
        text: chatInput,
        user: {
          id: address,
          name: `${address?.slice(0, 6)}...${address?.slice(-4)}`,
        },
        timestamp: new Date(),
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Please connect your wallet to view the stream</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Stream may have ended or is not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Video Area */}
      <div className="lg:col-span-3 relative">
        <div className="aspect-video bg-gray-900 relative rounded-lg overflow-hidden">
          {client && call && isConnected2Stream ? (
            <StreamVideo client={client}>
              <StreamCall call={call}>
                <SpeakerLayout />
              </StreamCall>
            </StreamVideo>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {isConnecting ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-gray-400 text-lg">Connecting to stream...</p>
                  <p className="text-gray-500 text-sm mt-2">Powered by Stream.io</p>
                </div>
              ) : (
                <div className="text-center">
                  <FaPlay className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg">Waiting for stream...</p>
                </div>
              )}
            </div>
          )}
          
          {/* Stream Info Overlay */}
          {isConnected2Stream && (
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium">LIVE</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FaUsers className="w-3 h-3" />
                  <span>{viewerCount} viewers</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stream Title */}
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-2">{streamTitle}</h2>
          <div className="flex items-center justify-between">
            <p className="text-gray-400">Stream ID: {streamId.slice(-8)}</p>
            <div className="flex items-center gap-2 text-gray-400">
              <FaUsers />
              <span>{viewerCount} watching</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-gray-800 rounded-lg h-full flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <FaComments className="text-cyan-400" />
              <h3 className="font-medium text-white">Live Chat</h3>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">
                <p>No messages yet</p>
                <p className="mt-1">Be the first to say something!</p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div key={message.id} className="break-words">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white font-medium">
                      {message.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-cyan-400 text-sm font-medium truncate">
                          {message.user.name}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm break-words">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm"
                disabled={!isConnected2Stream}
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || !isConnected2Stream}
                className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
