'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { 
  StreamVideo, 
  StreamVideoClient, 
  Call,
  StreamCall,
  CallControls,
  SpeakerLayout,
  CallParticipantsList,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { streamIOService, StreamUser, ChatMessage } from '@/services/StreamIOService';
import { Channel } from 'stream-chat';
import EnhancedStreamChat from './EnhancedStreamChat';
import { FaDesktop, FaStop, FaUsers, FaComments, FaPaperPlane, FaCamera, FaMicrophone, FaMicrophoneSlash, FaVideoSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface StreamIOBroadcasterProps {
  onStreamEnd?: () => void;
  streamTitle: string;
}

export default function StreamIOBroadcaster({ onStreamEnd, streamTitle }: StreamIOBroadcasterProps) {
  const { address, isConnected } = useAccount();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [chatChannel, setChatChannel] = useState<Channel | null>(null);
  const [callId, setCallId] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Initialize Stream.io service
  useEffect(() => {
    if (!isConnected || !address) {
      console.log('❌ Cannot initialize streaming - wallet not connected');
      return;
    }

    const initializeService = async () => {
      try {
        setIsInitializing(true);
        
        const user: StreamUser = {
          id: address.toLowerCase(),
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          walletAddress: address,
          image: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
        };

        await streamIOService.initialize(user);
        setClient(streamIOService.getCurrentClient());
        
        console.log('✅ Stream.io service initialized');
        toast.success('Streaming service ready!');
      } catch (error) {
        console.error('❌ Failed to initialize streaming service:', error);
        toast.error('Failed to initialize streaming service');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeService();

    return () => {
      streamIOService.cleanup();
    };
  }, [isConnected, address]);

  // Update stream duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isStreaming && startTime) {
      interval = setInterval(() => {
        setStreamDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming, startTime]);

  // Start streaming
  const startStream = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      console.log('🎥 Starting Stream.io live stream...');
      toast.loading('Starting stream...', { id: 'start-stream' });

      const { callId: newCallId, call: newCall, chatChannel: newChatChannel } = await streamIOService.startLiveStream(streamTitle);
      
      setCall(newCall);
      setChatChannel(newChatChannel);
      setCallId(newCallId);
      setIsStreaming(true);
      setStartTime(Date.now());

      // Load initial chat messages and subscribe to new ones
      const initialMessages = await streamIOService.getChatMessages(50);
      setChatMessages(initialMessages);

      const unsubscribe = streamIOService.subscribeToChatEvents((message) => {
        setChatMessages(prev => [...prev, message]);
      });
      
      // Monitor participant count
      newCall.state.participants$.subscribe((participants) => {
        setViewerCount(participants.length - 1); // Exclude host
      });

      toast.success('🎉 Stream started successfully!', { id: 'start-stream' });
      console.log('✅ Stream started with ID:', newCallId);
    } catch (error) {
      console.error('❌ Failed to start stream:', error);
      toast.error('Failed to start stream', { id: 'start-stream' });
    }
  };

  // Stop streaming
  const stopStream = async () => {
    try {
      console.log('🛑 Stopping stream...');
      toast.loading('Ending stream...', { id: 'stop-stream' });

      await streamIOService.endStream();
      
      setCall(null);
      setChatChannel(null);
      setCallId('');
      setIsStreaming(false);
      setViewerCount(0);
      setStreamDuration(0);
      setStartTime(0);
      setChatMessages([]);

      toast.success('Stream ended', { id: 'stop-stream' });
      
      if (onStreamEnd) {
        onStreamEnd();
      }
    } catch (error) {
      console.error('❌ Failed to stop stream:', error);
      toast.error('Failed to end stream', { id: 'stop-stream' });
    }
  };

  // Enable screen sharing
  const startScreenShare = async () => {
    try {
      await streamIOService.enableScreenShare();
      toast.success('Screen sharing enabled');
    } catch (error) {
      console.error('❌ Failed to start screen share:', error);
      toast.error('Failed to start screen sharing');
    }
  };

  // Toggle camera
  const toggleCamera = async () => {
    try {
      const isEnabled = await streamIOService.toggleCamera();
      toast.success(isEnabled ? 'Camera enabled' : 'Camera disabled');
    } catch (error) {
      console.error('❌ Failed to toggle camera:', error);
      toast.error('Failed to toggle camera');
    }
  };

  // Send chat message
  const sendChatMessage = async (message: string) => {
    if (!message.trim() || !chatChannel) return;

    try {
      await streamIOService.sendChatMessage(message.trim());
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  // Send streamer announcement
  const sendStreamerAnnouncement = async (message: string, priority: 'low' | 'medium' | 'high') => {
    if (!message.trim() || !chatChannel) return;

    try {
      await streamIOService.sendStreamerAnnouncement(message.trim(), priority);
      toast.success('Announcement sent!');
    } catch (error) {
      console.error('❌ Failed to send announcement:', error);
      toast.error('Failed to send announcement');
    }
  };

  // Toggle microphone
  const toggleMicrophone = async () => {
    try {
      const isEnabled = await streamIOService.toggleMicrophone();
      toast.success(isEnabled ? 'Microphone enabled' : 'Microphone disabled');
    } catch (error) {
      console.error('❌ Failed to toggle microphone:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Initializing Stream.io...</p>
        </div>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaDesktop className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Please connect your wallet to start streaming</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stream Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
        <div>
          <h2 className="text-xl font-bold text-white">{streamTitle}</h2>
          <p className="text-gray-400">Broadcaster: {address.slice(0, 6)}...{address.slice(-4)}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {isStreaming && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full text-white text-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-400">
            <FaUsers />
            <span>{viewerCount} viewers</span>
          </div>
        </div>
      </div>

      {/* Stream Video Area */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <div className="w-full h-full">
                <SpeakerLayout />
                
                {/* Stream Stats Overlay */}
                {isStreaming && (
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                    <div className="space-y-1">
                      <div>Duration: {formatDuration(streamDuration)}</div>
                      <div>Viewers: {viewerCount}</div>
                      <div>Stream ID: {callId.slice(-8)}</div>
                    </div>
                  </div>
                )}
              </div>
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center">
              <FaDesktop className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Click "Start Stream" to begin broadcasting</p>
              <p className="text-gray-500 text-sm mt-2">Powered by Stream.io</p>
            </div>
          </div>
        )}
      </div>

      {/* Stream Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          {!isStreaming ? (
            <button
              onClick={startStream}
              disabled={!isConnected || isInitializing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDesktop />
              Start Stream
            </button>
          ) : (
            <>
              <button
                onClick={stopStream}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all"
              >
                <FaStop />
                End Stream
              </button>
              
              <button
                onClick={startScreenShare}
                className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                title="Share Screen"
              >
                <FaDesktop />
              </button>
              
              <button
                onClick={toggleCamera}
                className="p-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                title="Toggle Camera"
              >
                <FaCamera />
              </button>
              
              <button
                onClick={toggleMicrophone}
                className="p-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                title="Toggle Microphone"
              >
                <FaMicrophone />
              </button>
            </>
          )}
        </div>

        {/* Stream Info */}
        {isStreaming && (
          <div className="text-right">
            <p className="text-white font-medium">Stream Active</p>
            <p className="text-gray-400 text-sm">Duration: {formatDuration(streamDuration)}</p>
          </div>
        )}
      </div>

      {/* Stream.io Call Controls (when streaming) */}
      {client && call && isStreaming && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Controls */}
          <div className="bg-gray-800 rounded-lg p-4">
            <StreamVideo client={client}>
              <StreamCall call={call}>
                <CallControls />
                <div className="mt-4">
                  <h3 className="text-white font-medium mb-2">Participants ({viewerCount + 1})</h3>
                  <CallParticipantsList onClose={() => {}} />
                </div>
              </StreamCall>
            </StreamVideo>
          </div>

          {/* Enhanced Chat Interface */}
          <div className="bg-gray-800 rounded-lg h-96">
            <EnhancedStreamChat
              messages={chatMessages}
              onSendMessage={sendChatMessage}
              onSendAnnouncement={sendStreamerAnnouncement}
              isStreamer={true}
              isConnected={isStreaming}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
