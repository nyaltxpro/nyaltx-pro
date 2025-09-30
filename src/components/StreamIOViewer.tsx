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
import { streamIOService, StreamUser, LiveStream, ChatMessage } from '@/services/StreamIOService';
import { Channel } from 'stream-chat';
import EnhancedStreamChat from './EnhancedStreamChat';
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
  const [chatChannel, setChatChannel] = useState<Channel | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected2Stream, setIsConnected2Stream] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

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
        console.log('🎯 Attempting to join stream:', streamId);
        const { call: joinedCall, chatChannel: joinedChatChannel } = await streamIOService.joinLiveStream(streamId);
        
        setCall(joinedCall);
        setChatChannel(joinedChatChannel);
        setClient(streamIOService.getCurrentClient());
        setIsConnected2Stream(true);
        
        // Monitor participant count
        joinedCall.state.participants$.subscribe((participants: any) => {
          setViewerCount(participants.length - 1); // Exclude host
        });

        // Monitor call state
        joinedCall.state.callingState$.subscribe((state: any) => {
          // Use proper CallingState enum values
          if (state.toString() === 'left' || state.toString() === 'ended') {
            setIsConnected2Stream(false);
            if (onStreamEnd) {
              onStreamEnd();
            }
          }
        });

        // Load initial chat messages
        const initialMessages = await streamIOService.getChatMessages(50);
        setChatMessages(initialMessages);

        // Subscribe to new chat messages
        const unsubscribe = streamIOService.subscribeToChatEvents((message) => {
          setChatMessages(prev => [...prev, message]);
        });

        console.log('✅ Successfully joined stream:', streamId);
        toast.success('Connected to stream!');
      } catch (error: any) {
        console.error('❌ Failed to join stream:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to connect to stream. Stream may have ended.';
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.toString().includes('not found')) {
          errorMessage = 'Stream not found. It may have ended or the ID is incorrect.';
        } else if (error?.toString().includes('permission')) {
          errorMessage = 'Permission denied. You may not have access to this stream.';
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
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

  // Send chat message using Stream.io chat
  const sendChatMessage = async (message: string) => {
    if (!message.trim() || !chatChannel) return;

    try {
      await streamIOService.sendChatMessage(message.trim());
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

      {/* Enhanced Chat Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-gray-800 rounded-lg h-full">
          <EnhancedStreamChat
            messages={chatMessages}
            onSendMessage={sendChatMessage}
            isStreamer={false}
            isConnected={isConnected2Stream}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
