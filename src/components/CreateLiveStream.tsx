"use client";

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaCog, FaPlay, FaStop } from 'react-icons/fa';

interface CreateLiveStreamProps {
  onStreamCreated: (streamData: any) => void;
  onClose: () => void;
}

export default function CreateLiveStream({ onStreamCreated, onClose }: CreateLiveStreamProps) {
  const { address, isConnected } = useAccount();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [category, setCategory] = useState('trading');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const categories = [
    { id: 'trading', label: 'Trading & Analysis' },
    { id: 'education', label: 'Crypto Education' },
    { id: 'news', label: 'News & Updates' },
    { id: 'community', label: 'Community Chat' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'other', label: 'Other' }
  ];

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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

  const toggleVideo = async () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = async () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  const handleStartStream = async () => {
    if (!isConnected) {
      alert('Please connect your wallet to start streaming');
      return;
    }

    if (!streamTitle.trim()) {
      alert('Please enter a stream title');
      return;
    }

    if (!stream) {
      await startPreview();
    }

    const streamData = {
      id: Math.random().toString(36).substr(2, 9),
      title: streamTitle,
      description: streamDescription,
      category,
      streamerAddress: address,
      streamerName: `${address?.slice(0, 6)}...${address?.slice(-4)}`,
      startTime: Date.now(),
      viewerCount: 0,
      isLive: true,
      stream: stream
    };

    // In a real implementation, you would:
    // 1. Send stream data to your backend
    // 2. Set up WebRTC peer connections
    // 3. Start broadcasting to a media server

    setIsStreaming(true);
    onStreamCreated(streamData);
  };

  const handleStopStream = () => {
    setIsStreaming(false);
    stopPreview();
    onClose();
  };

  useEffect(() => {
    startPreview();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isStreaming ? 'Live Stream Active' : 'Create Live Stream'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Preview */}
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <FaVideoSlash className="text-gray-400 text-4xl" />
                  </div>
                )}

                {isStreaming && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">LIVE</span>
                  </div>
                )}
              </div>

              {/* Media Controls */}
              <div className="flex items-center justify-center gap-4">
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

                <button className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors">
                  <FaCog />
                </button>
              </div>
            </div>

            {/* Stream Settings */}
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Stream Title *</label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="Enter your stream title..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                  disabled={isStreaming}
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
                  disabled={isStreaming}
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  disabled={isStreaming}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Wallet Connection Status */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-white font-medium">
                    {isConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
                  </span>
                </div>
                {isConnected && (
                  <div className="text-gray-400 text-sm mt-1">
                    {address?.slice(0, 10)}...{address?.slice(-8)}
                  </div>
                )}
              </div>

              {/* Stream Actions */}
              <div className="space-y-3">
                {!isStreaming ? (
                  <button
                    onClick={handleStartStream}
                    disabled={!isConnected || !streamTitle.trim()}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <FaPlay />
                    Start Live Stream
                  </button>
                ) : (
                  <button
                    onClick={handleStopStream}
                    className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    <FaStop />
                    Stop Stream
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
