"use client";

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaCog, FaPlay, FaStop, FaTwitch } from 'react-icons/fa';
import { twitchApi, TwitchUser, TwitchStreamKey } from '@/services/twitchApi';

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
  
  // Twitch integration state
  const [twitchUser, setTwitchUser] = useState<TwitchUser | null>(null);
  const [streamKey, setStreamKey] = useState<TwitchStreamKey | null>(null);
  const [isTwitchConnected, setIsTwitchConnected] = useState(false);
  const [isConnectingTwitch, setIsConnectingTwitch] = useState(false);
  const [twitchCategories, setTwitchCategories] = useState<any[]>([]);
  const [selectedTwitchCategory, setSelectedTwitchCategory] = useState<string>('');

  const categories = [
    { id: 'trading', label: 'Trading & Analysis' },
    { id: 'education', label: 'Crypto Education' },
    { id: 'news', label: 'News & Updates' },
    { id: 'community', label: 'Community Chat' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'other', label: 'Other' }
  ];

  // Check Twitch authentication status on mount
  useEffect(() => {
    const checkTwitchAuth = async () => {
      if (twitchApi.isAuthenticated()) {
        try {
          const user = await twitchApi.getCurrentUser();
          setTwitchUser(user);
          setIsTwitchConnected(true);
          
          // Get stream key
          const key = await twitchApi.getStreamKey(user.id);
          setStreamKey(key);
          
          // Load Twitch categories
          const topCategories = await twitchApi.getTopCategories(10);
          setTwitchCategories(topCategories);
        } catch (error) {
          console.error('Failed to load Twitch data:', error);
          setIsTwitchConnected(false);
        }
      }
    };
    
    checkTwitchAuth();
  }, []);

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

  const handleConnectTwitch = () => {
    setIsConnectingTwitch(true);
    const authUrl = twitchApi.getAuthUrl();
    window.location.href = authUrl;
  };

  const handleStartStream = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!isTwitchConnected) {
      alert('Please connect your Twitch account first');
      return;
    }

    if (!streamTitle.trim()) {
      alert('Please enter a stream title');
      return;
    }

    try {
      setIsStreaming(true);
      
      // Update Twitch stream info
      if (twitchUser) {
        await twitchApi.updateStreamInfo(
          twitchUser.id, 
          streamTitle, 
          selectedTwitchCategory
        );
      }
      
      const streamData = {
        id: Date.now().toString(),
        title: streamTitle,
        description: streamDescription,
        category,
        twitchCategory: selectedTwitchCategory,
        streamer: address,
        twitchUser: twitchUser?.login,
        viewerCount: 0,
        isLive: true,
        startedAt: new Date().toISOString(),
        thumbnail: '/api/placeholder/320/180',
        streamKey: streamKey?.stream_key,
        streamUrl: streamKey?.stream_url
      };
      
      onStreamCreated(streamData);
      
    } catch (error) {
      console.error('Failed to start stream:', error);
      setIsStreaming(false);
      alert('Failed to start stream. Please try again.');
    }
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaTwitch className="text-purple-500" />
            Create Live Stream
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Twitch Connection Status */}
        <div className="mb-6 p-4 rounded-lg border border-purple-500/30 bg-purple-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaTwitch className="text-purple-500 text-xl" />
              <div>
                <div className="text-white font-semibold">
                  {isTwitchConnected ? `Connected as ${twitchUser?.display_name}` : 'Twitch Account'}
                </div>
                <div className="text-gray-400 text-sm">
                  {isTwitchConnected ? 'Ready to stream' : 'Connect to start streaming'}
                </div>
              </div>
            </div>
            {!isTwitchConnected ? (
              <button
                onClick={handleConnectTwitch}
                disabled={isConnectingTwitch}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isConnectingTwitch ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <FaTwitch />
                    Connect Twitch
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Connected
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
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

              {isTwitchConnected && streamKey && (
                <div className="absolute bottom-4 right-4 bg-purple-600/80 px-2 py-1 rounded text-xs text-white">
                  Twitch Ready
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

            {/* Twitch Category Selection */}
            {isTwitchConnected && twitchCategories.length > 0 && (
              <div>
                <label className="block text-white font-medium mb-2">Twitch Category</label>
                <select
                  value={selectedTwitchCategory}
                  onChange={(e) => setSelectedTwitchCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  disabled={isStreaming}
                >
                  <option value="">Select Twitch Category</option>
                  {twitchCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Stream Key Display */}
            {isTwitchConnected && streamKey && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="text-white font-medium mb-2">Stream Configuration</div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Stream URL:</span>
                    <div className="text-purple-400 font-mono break-all">{streamKey.stream_url}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Stream Key:</span>
                    <div className="text-purple-400 font-mono">
                      {streamKey.stream_key.slice(0, 8)}...{streamKey.stream_key.slice(-4)}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  disabled={!isConnected || !isTwitchConnected || !streamTitle.trim()}
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
  );
}
