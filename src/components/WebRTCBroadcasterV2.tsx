'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { streamingService, ChatMessage } from '@/services/StreamingService';
import { v4 as uuidv4 } from 'uuid';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaDesktop, FaStop, FaUsers, FaComments, FaPaperPlane, FaCamera, FaCameraRetro } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface WebRTCBroadcasterProps {
  onStreamEnd?: () => void;
  streamTitle: string;
}

interface StreamStats {
  bitrate: number;
  fps: number;
  resolution: string;
  duration: number;
}

export default function WebRTCBroadcasterV2({ onStreamEnd, streamTitle }: WebRTCBroadcasterProps) {
  const { address, isConnected } = useAccount();
  const [broadcasterId] = useState(() => uuidv4());
  const [isStreaming, setIsStreaming] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [streamStats, setStreamStats] = useState<StreamStats>({
    bitrate: 0,
    fps: 0,
    resolution: '1920x1080',
    duration: 0
  });
  const [connected, setConnected] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize streaming service
  useEffect(() => {
    if (!isConnected || !address) {
      console.log('❌ Cannot initialize streaming - wallet not connected');
      return;
    }

    console.log('🔌 Initializing HTTP-based streaming service...');

    // Set up event listeners
    const handleError = (error: any) => {
      console.error('❌ Streaming service error:', error);
      toast.error('Streaming service error');
    };

    const handleChatMessage = (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    };

    streamingService.on('error', handleError);
    streamingService.on('chat-message', handleChatMessage);
    streamingService.on('broadcaster-joined', () => {
      setConnected(true);
      console.log('✅ Successfully joined as broadcaster');
    });

    setConnected(true); // HTTP service is always "connected"

    return () => {
      streamingService.off('error', handleError);
      streamingService.off('chat-message', handleChatMessage);
      streamingService.disconnect();
    };
  }, [isConnected, address]);

  // Update stream duration
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setStreamStats(prev => ({ ...prev, duration }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const startStream = async () => {
    if (!connected || !isConnected || !address) {
      toast.error('Please connect your wallet and wait for service connection');
      return;
    }

    console.log('🎥 Starting stream...');

    try {
      // Check if browser supports required APIs
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing not supported in this browser');
      }

      console.log('📺 Requesting screen share...');
      // Get screen share with better options
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('📹 Screen share obtained');
      
      // Get camera stream if webcam is enabled
      let cameraStream: MediaStream | null = null;
      if (isWebcamEnabled) {
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640, max: 1280 },
              height: { ideal: 480, max: 720 },
              frameRate: { ideal: 30 }
            },
            audio: false // Use screen audio instead
          });
          setWebcamStream(cameraStream);
          
          // Display webcam in separate video element
          if (webcamVideoRef.current) {
            webcamVideoRef.current.srcObject = cameraStream;
          }
          
          console.log('📷 Webcam obtained and enabled');
          toast.success('Webcam enabled!');
        } catch (err) {
          console.warn('⚠️ Webcam not available:', err);
          toast.error('Webcam not available');
          setIsWebcamEnabled(false);
        }
      }

      // Combine streams
      const combinedStream = new MediaStream();
      
      // Add screen tracks
      screenStream.getTracks().forEach(track => {
        console.log('➕ Adding screen track:', track.kind);
        combinedStream.addTrack(track);
      });

      // Add camera tracks if available
      if (cameraStream) {
        cameraStream.getVideoTracks().forEach(track => {
          console.log('➕ Adding camera track:', track.kind);
          combinedStream.addTrack(track);
        });
      }

      streamRef.current = combinedStream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = combinedStream;
        console.log('📺 Video element updated');
      }

      // Join as broadcaster using HTTP service
      console.log('📡 Joining as broadcaster...');
      await streamingService.joinAsBroadcaster(broadcasterId, address, streamTitle);

      setIsStreaming(true);
      startTimeRef.current = Date.now();
      toast.success('🎉 Stream started successfully!');

      // Handle stream end when user stops screen sharing
      screenStream.getVideoTracks()[0].onended = () => {
        console.log('📺 Screen sharing ended by user');
        stopStream();
      };

      // Log stream info
      console.log('🎯 Stream info:', {
        broadcasterId,
        tracks: combinedStream.getTracks().length,
        videoTracks: combinedStream.getVideoTracks().length,
        audioTracks: combinedStream.getAudioTracks().length
      });

      // Start polling for viewer count updates
      const pollViewers = async () => {
        try {
          const streams = await streamingService.getActiveStreams();
          const myStream = streams.find(s => s.broadcasterId === broadcasterId);
          if (myStream) {
            setViewerCount(myStream.viewerCount);
          }
        } catch (error) {
          console.error('Error polling viewer count:', error);
        }
      };

      // Poll every 5 seconds
      const viewerInterval = setInterval(pollViewers, 5000);
      
      // Store cleanup function
      const cleanup = () => {
        clearInterval(viewerInterval);
      };

      // Store cleanup for later use
      (window as any).streamCleanup = cleanup;

    } catch (error) {
      console.error('❌ Error starting stream:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Permission denied')) {
        toast.error('Screen sharing permission denied. Please allow screen sharing and try again.');
      } else if (errorMessage.includes('not supported')) {
        toast.error('Screen sharing not supported in this browser. Please use Chrome, Firefox, or Safari.');
      } else {
        toast.error(`Failed to start stream: ${errorMessage}`);
      }
    }
  };

  const stopStream = async () => {
    console.log('🛑 Stopping stream...');
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped track:', track.kind);
      });
      streamRef.current = null;
    }

    // Stop webcam stream
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped webcam track:', track.kind);
      });
      setWebcamStream(null);
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
    }

    // End stream on server
    try {
      await streamingService.endStream(broadcasterId);
    } catch (error) {
      console.error('Error ending stream on server:', error);
    }

    // Cleanup polling
    if ((window as any).streamCleanup) {
      (window as any).streamCleanup();
      delete (window as any).streamCleanup;
    }

    setIsStreaming(false);
    setViewerCount(0);
    setChatMessages([]);
    toast.success('Stream ended');
    
    if (onStreamEnd) {
      onStreamEnd();
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleWebcam = async () => {
    if (!isWebcamEnabled) {
      // Enable webcam
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 30 }
          },
          audio: false
        });
        
        setWebcamStream(cameraStream);
        setIsWebcamEnabled(true);
        
        // Display webcam in video element
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = cameraStream;
        }
        
        console.log('📷 Webcam enabled');
        toast.success('Webcam enabled!');
      } catch (error) {
        console.error('Error enabling webcam:', error);
        toast.error('Failed to enable webcam');
      }
    } else {
      // Disable webcam
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }
      
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = null;
      }
      
      setIsWebcamEnabled(false);
      console.log('📷 Webcam disabled');
      toast('Webcam disabled');
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !address) return;

    try {
      await streamingService.sendChatMessage(
        broadcasterId,
        chatInput,
        address,
        'Broadcaster'
      );
      setChatInput('');
    } catch (error) {
      console.error('Error sending chat message:', error);
      toast.error('Failed to send message');
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

  return (
    <div className="bg-[#0f1923] rounded-xl border border-gray-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Live Stream Broadcaster</h2>
          <p className="text-gray-400">Stream ID: {broadcasterId}</p>
          <p className="text-sm text-gray-500">
            {connected ? '🟢 Connected to HTTP streaming service' : '🔴 Disconnected'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {isStreaming && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              LIVE
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-400">
            <FaUsers />
            <span>{viewerCount} viewers</span>
          </div>
        </div>
      </div>

      {/* Video Preview */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Webcam Overlay */}
        {isWebcamEnabled && webcamStream && (
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-cyan-500">
            <video
              ref={webcamVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
              Webcam
            </div>
          </div>
        )}
        
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center">
              <FaDesktop className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Click "Start Stream" to begin broadcasting</p>
              <p className="text-gray-500 text-sm mt-2">Uses HTTP polling (Vercel compatible)</p>
            </div>
          </div>
        )}

        {/* Stream Stats Overlay */}
        {isStreaming && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
            <div className="space-y-1">
              <div>Duration: {formatDuration(streamStats.duration)}</div>
              <div>Resolution: {streamStats.resolution}</div>
              <div>Viewers: {viewerCount}</div>
              <div className="text-green-400">HTTP Streaming</div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isStreaming ? (
            <button
              onClick={startStream}
              disabled={!isConnected || !connected}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDesktop />
              Start Stream
            </button>
          ) : (
            <>
              <button
                onClick={stopStream}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaStop />
                Stop Stream
              </button>
              
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-lg transition-colors ${
                  isVideoEnabled 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
              </button>
              
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-lg transition-colors ${
                  isAudioEnabled 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </button>
              
              <button
                onClick={toggleWebcam}
                className={`p-3 rounded-lg transition-colors ${
                  isWebcamEnabled 
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {isWebcamEnabled ? <FaCamera /> : <FaCameraRetro />}
              </button>
            </>
          )}
        </div>

        {!isConnected && (
          <p className="text-yellow-400 text-sm">Connect your wallet to start streaming</p>
        )}
      </div>

      {/* Chat Section */}
      {isStreaming && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FaComments />
              Stream Chat
            </h3>
            
            <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto space-y-2">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-cyan-400 font-medium">
                      {msg.senderName || `${msg.senderAddress.slice(0, 6)}...${msg.senderAddress.slice(-4)}`}:
                    </span>
                    <span className="text-gray-300 ml-2">{msg.message}</span>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim()}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
