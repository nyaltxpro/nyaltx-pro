'use client';

import { streamingService } from '@/services/StreamingService';
import * as Avatar from '@radix-ui/react-avatar';
import {
    ActivityLogIcon,
    BarChartIcon,
    EyeOpenIcon,
    GlobeIcon,
    HeartIcon,
    PlayIcon,
    PlusIcon,
    RocketIcon,
    StarIcon,
    VideoIcon
} from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

const WebRTCBroadcaster = dynamic(() => import('@/components/WebRTCBroadcaster'), { ssr: false });
const WebRTCViewer = dynamic(() => import('@/components/WebRTCViewer'), { ssr: false });
const StreamIOBroadcaster = dynamic(() => import('@/components/StreamIOBroadcaster'), {
    ssr: false,
});
const StreamIOViewer = dynamic(() => import('@/components/StreamIOViewer'), { ssr: false });
const StreamIOLiveStreams = dynamic(() => import('@/components/StreamIOLiveStreams'), {
    ssr: false,
});

interface StreamStats {
    totalViewers: number;
    activeTokens: number;
    totalVolume: number;
    topGainers: Array<{
        symbol: string;
        change: number;
        volume: number;
    }>;
}

interface LiveStreamData {
    id: string;
    title: string;
    description: string;
    category: string;
    streamerAddress: string;
    streamerName: string;
    startTime: number;
    viewerCount: number;
    isLive: boolean;
    likes: number;
    thumbnail?: string;
}

export default function LiveStreamPage() {
    const { address, isConnected } = useAccount();
    const [stats, setStats] = useState<StreamStats>({
        totalViewers: 1247,
        activeTokens: 156,
        totalVolume: 2840000,
        topGainers: [
            { symbol: 'PEPE', change: 45.2, volume: 890000 },
            { symbol: 'DOGE', change: 23.1, volume: 650000 },
            { symbol: 'SHIB', change: 18.7, volume: 420000 },
        ],
    });

    const [selectedFilter, setSelectedFilter] = useState<'all' | 'trending' | 'new' | 'volume'>(
        'all'
    );
    const [showCreateStream, setShowCreateStream] = useState(false);
    const [selectedStream, setSelectedStream] = useState<LiveStreamData | null>(null);
    const [streamTitle, setStreamTitle] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [activeStreams, setActiveStreams] = useState<any[]>([]);

    // Stream.io state
    const [streamingPlatform, setStreamingPlatform] = useState<'webrtc' | 'streamio'>('streamio');
    const [isStreamIOStreaming, setIsStreamIOStreaming] = useState(false);
    const [selectedStreamIOStream, setSelectedStreamIOStream] = useState<{
        id: string;
        title: string;
    } | null>(null);
    const [liveStreams, setLiveStreams] = useState<LiveStreamData[]>([
        {
            id: '1',
            title: 'Trading Bitcoin Live - Market Analysis & Predictions',
            description:
                "Join me for live Bitcoin trading and market analysis. We'll look at charts, discuss strategies, and take live trades!",
            category: 'trading',
            streamerAddress: '0x1234567890123456789012345678901234567890',
            streamerName: 'CryptoTraderPro',
            startTime: Date.now() - 3600000, // 1 hour ago
            viewerCount: 234,
            isLive: true,
            likes: 89,
            thumbnail: '/stream-thumbnails/bitcoin-trading.jpg',
        },
        {
            id: '3',
            title: 'Meme Coin Hunting - Finding the Next 100x',
            description:
                "Searching for the next big meme coin! Come join the hunt and let's find some gems together.",
            category: 'trading',
            streamerAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            streamerName: 'MemeHunter',
            startTime: Date.now() - 900000, // 15 minutes ago
            viewerCount: 89,
            isLive: true,
            likes: 45,
            thumbnail: '/stream-thumbnails/meme-hunting.jpg',
        },
    ]);

    useEffect(() => {
        // Use HTTP-based streaming service instead of Socket.IO
        console.log('🔌 Connecting to HTTP streaming service...');

        // Start polling for active streams
        const stopPolling = streamingService.startStreamPolling(streams => {
            console.log('📡 Received active streams:', streams);
            setActiveStreams(streams);
        });

        // Simulate real-time stats updates
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                totalViewers: prev.totalViewers + Math.floor(Math.random() * 20) - 10,
                totalVolume: prev.totalVolume + Math.floor(Math.random() * 10000),
                topGainers: prev.topGainers.map(token => ({
                    ...token,
                    change: token.change + (Math.random() * 2 - 1),
                    volume: token.volume + Math.floor(Math.random() * 5000),
                })),
            }));

            // Update live stream viewer counts for demo streams
            setLiveStreams(prev =>
                prev.map(stream => ({
                    ...stream,
                    viewerCount: stream.viewerCount + Math.floor(Math.random() * 10) - 5,
                }))
            );
        }, 10000);

        return () => {
            stopPolling();
            clearInterval(interval);
        };
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    };

    const formatDuration = (startTime: number) => {
        const duration = Date.now() - startTime;
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:00`;
        return `${minutes}:${Math.floor((duration % (1000 * 60)) / 1000)
            .toString()
            .padStart(2, '0')}`;
    };

    const handleStartStream = () => {
        if (!streamTitle.trim()) {
            alert('Please enter a stream title');
            return;
        }

        if (streamingPlatform === 'webrtc') {
            setIsStreaming(true);
        } else {
            setIsStreamIOStreaming(true);
        }
        setShowCreateStream(false);
    };

    const handleStreamEnd = () => {
        setIsStreaming(false);
        setIsStreamIOStreaming(false);
        setStreamTitle('');
    };

    // Stream.io handlers
    const handleStreamIOStreamSelect = (streamId: string, streamTitle: string) => {
        setSelectedStreamIOStream({ id: streamId, title: streamTitle });
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'trading':
                return 'bg-green-500/20 text-green-400';
            case 'education':
                return 'bg-blue-500/20 text-blue-400';
            case 'news':
                return 'bg-purple-500/20 text-purple-400';
            case 'community':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'gaming':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <Tooltip.Provider>
            <div className="min-h-screen  bg-[#01010101] text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {/* Modern Background Pattern */}


                <div className="relative z-10 p-6 space-y-8">
                    {/* Enhanced Header */}
                    <div className="bg-black/60 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-2xl flex items-center justify-center">
                                    <VideoIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        Live Streams
                                    </h1>
                                    <p className="text-gray-400">
                                        Watch live crypto streams and create your own
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">


                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <button
                                            onClick={() => setShowCreateStream(true)}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105 shadow-lg shadow-red-600/25"
                                        >
                                            <PlusIcon className="w-5 h-5" />
                                            Go Live
                                        </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                            Start your live stream
                                            <Tooltip.Arrow className="fill-black/90" />
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}

                    {/* Enhanced Filter Tabs */}
                    <div className="bg-black/60 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-4 hover:border-gray-700/50 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-4">
                            <ActivityLogIcon className="w-5 h-5 text-[#00d4aa]" />
                            <h3 className="font-semibold text-white" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                Stream Categories
                            </h3>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {[
                                { id: 'all', label: 'All Activity', icon: GlobeIcon },
                                { id: 'trending', label: 'Trending', icon: RocketIcon },
                                { id: 'new', label: 'New Tokens', icon: StarIcon },
                                { id: 'volume', label: 'High Volume', icon: BarChartIcon },
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setSelectedFilter(id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 ${selectedFilter === id
                                        ? 'bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] text-white shadow-lg shadow-[#00d4aa]/20'
                                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-transparent hover:border-white/20'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Live Streams Grid */}
                    <div className="space-y-6">
                        {streamingPlatform === 'streamio' ? (
                            // Stream.io Live Streams
                            <StreamIOLiveStreams onStreamSelect={handleStreamIOStreamSelect} />
                        ) : (
                            // WebRTC Streams
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">Active Live Streams</h2>
                                    <div className="text-sm text-gray-400">
                                        {activeStreams.length} WebRTC streams • {liveStreams.length} demo streams
                                    </div>
                                </div>

                                {/* Enhanced Live Streams Grid */}
                                <div className="bg-black/60 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                                <VideoIcon className="w-4 h-4 text-white" />
                                            </div>
                                            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                Live Streams
                                            </h2>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-medium">{activeStreams.length + liveStreams.length} LIVE</span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {activeStreams.length} WebRTC • {liveStreams.length} Demo
                                        </div>
                                    </div>

                                    {/* Modern Stream Grid - 3x2 Layout like your image */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Real WebRTC Streams */}
                                        {activeStreams.map(stream => (
                                            <div
                                                key={stream.broadcasterId}
                                                className="group relative bg-black/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-[#00d4aa]/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                                onClick={() =>
                                                    setSelectedStream({
                                                        id: stream.broadcasterId,
                                                        title: stream.streamTitle || 'Live Stream',
                                                        description: 'Real-time WebRTC stream',
                                                        category: 'live',
                                                        streamerAddress: stream.walletAddress || '',
                                                        streamerName:
                                                            `${stream.walletAddress?.slice(0, 6)}...${stream.walletAddress?.slice(-4)}` ||
                                                            'Anonymous',
                                                        startTime: Date.now(),
                                                        viewerCount: stream.viewerCount || 0,
                                                        isLive: true,
                                                        likes: 0,
                                                    })
                                                }
                                            >
                                                {/* Stream Thumbnail */}
                                                <div className="relative aspect-video  flex items-center justify-center">
                                                    <PlayIcon className="w-12 h-12 text-white/60 group-hover:text-white/80 transition-colors" />

                                                    {/* Live Badge */}
                                                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 px-2 py-1 rounded-lg">
                                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                        <span className="text-white text-xs font-bold">LIVE</span>
                                                    </div>

                                                    {/* Market Cap Badge */}
                                                    <div className="absolute top-3 right-3 bg-[#00d4aa]/20 backdrop-blur-sm border border-[#00d4aa]/30 px-2 py-1 rounded-lg text-[#00d4aa] text-xs font-semibold">
                                                        mcap $12.4K
                                                    </div>

                                                    {/* Viewer Count */}
                                                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs">
                                                        <EyeOpenIcon className="w-3 h-3" />
                                                        <span className="font-medium">{stream.viewerCount || 0}</span>
                                                    </div>

                                                    {/* ATH Badge */}
                                                    <div className="absolute bottom-3 left-3 bg-green-500/20 backdrop-blur-sm border border-green-500/30 px-2 py-1 rounded-lg text-green-400 text-xs font-semibold">
                                                        ATH $25.5K
                                                    </div>
                                                </div>

                                                {/* Stream Info */}
                                                <div className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Avatar.Root className="w-8 h-8">
                                                            <Avatar.Image
                                                                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${stream.walletAddress}`}
                                                                alt="Streamer"
                                                                className="w-full h-full object-cover rounded-full"
                                                            />
                                                            <Avatar.Fallback className="w-full h-full bg-gradient-to-br from-[#00d4aa] to-[#3b82f6] flex items-center justify-center text-white font-bold text-sm rounded-full">
                                                                {stream.walletAddress?.[0] || 'A'}
                                                            </Avatar.Fallback>
                                                        </Avatar.Root>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-white font-bold text-sm truncate" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                                {stream.streamTitle || 'Live Stream'}
                                                            </h3>
                                                            <p className="text-gray-400 text-xs truncate">
                                                                {stream.walletAddress
                                                                    ? `${stream.walletAddress.slice(0, 6)}...${stream.walletAddress.slice(-4)}`
                                                                    : 'Anonymous'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <HeartIcon className="w-4 h-4 text-gray-400" />
                                                            <span className="text-xs text-gray-400">0</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Demo Streams with same styling */}
                                        {liveStreams.map(stream => (
                                            <div
                                                key={stream.id}
                                                className="group relative bg-black/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-[#00d4aa]/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                                onClick={() => setSelectedStream(stream)}
                                            >
                                                {/* Stream Thumbnail */}
                                                <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                                                    <PlayIcon className="w-12 h-12 text-white/60 group-hover:text-white/80 transition-colors" />

                                                    {/* Live Badge */}
                                                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 px-2 py-1 rounded-lg">
                                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                        <span className="text-white text-xs font-bold">LIVE</span>
                                                    </div>

                                                    {/* Market Cap Badge */}
                                                    <div className="absolute top-3 right-3 bg-[#00d4aa]/20 backdrop-blur-sm border border-[#00d4aa]/30 px-2 py-1 rounded-lg text-[#00d4aa] text-xs font-semibold">
                                                        mcap ${Math.floor(Math.random() * 100)}K
                                                    </div>

                                                    {/* Viewer Count */}
                                                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs">
                                                        <EyeOpenIcon className="w-3 h-3" />
                                                        <span className="font-medium">{stream.viewerCount}</span>
                                                    </div>

                                                    {/* ATH Badge */}
                                                    <div className="absolute bottom-3 left-3 bg-green-500/20 backdrop-blur-sm border border-green-500/30 px-2 py-1 rounded-lg text-green-400 text-xs font-semibold">
                                                        ATH ${Math.floor(Math.random() * 50)}K
                                                    </div>
                                                </div>

                                                {/* Stream Info */}
                                                <div className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Avatar.Root className="w-8 h-8">
                                                            <Avatar.Image
                                                                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${stream.streamerName}`}
                                                                alt="Streamer"
                                                                className="w-full h-full object-cover rounded-full"
                                                            />
                                                            <Avatar.Fallback className="w-full h-full bg-gradient-to-br from-[#00d4aa] to-[#3b82f6] flex items-center justify-center text-white font-bold text-sm rounded-full">
                                                                {stream.streamerName[0]}
                                                            </Avatar.Fallback>
                                                        </Avatar.Root>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-white font-bold text-sm truncate" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                                {stream.title}
                                                            </h3>
                                                            <p className="text-gray-400 text-xs truncate">
                                                                {stream.streamerName}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <HeartIcon className="w-4 h-4 text-gray-400" />
                                                            <span className="text-xs text-gray-400">{stream.likes}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {liveStreams.length === 0 && activeStreams.length === 0 && (
                                        <div className="text-center py-12">
                                            <PlayIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Live Streams</h3>
                                            <p className="text-gray-500 mb-4">
                                                Be the first to go live and share your content!
                                            </p>
                                            <button
                                                onClick={() => setShowCreateStream(true)}
                                                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
                                            >
                                                Start Streaming
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}

                    {/* Create Stream Modal */}
                    {showCreateStream && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-[#0f1923] rounded-xl border border-gray-800 p-6 w-full max-w-md">
                                <h3 className="text-xl font-bold text-white mb-4">
                                    Start Live Stream - {streamingPlatform === 'streamio' ? 'Stream.io Pro' : 'WebRTC'}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Stream Title</label>
                                        <input
                                            type="text"
                                            value={streamTitle}
                                            onChange={e => setStreamTitle(e.target.value)}
                                            placeholder="Enter your stream title..."
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>

                                    {streamingPlatform === 'streamio' && (
                                        <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-1">
                                                <StarIcon className="w-4 h-4" />
                                                Stream.io Professional
                                            </div>
                                            <p className="text-gray-300 text-xs">
                                                Enterprise-grade streaming with HD quality, global CDN, and built-in chat
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleStartStream}
                                            disabled={!streamTitle.trim()}
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Start Stream
                                        </button>
                                        <button
                                            onClick={() => setShowCreateStream(false)}
                                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stream.io Broadcaster */}
                    {isStreamIOStreaming && (
                        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 p-4 overflow-y-auto">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Broadcasting: {streamTitle}</h2>
                                        <p className="text-cyan-400 text-sm">Powered by Stream.io Professional</p>
                                    </div>
                                    <button
                                        onClick={handleStreamEnd}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        End Stream
                                    </button>
                                </div>
                                <StreamIOBroadcaster streamTitle={streamTitle} onStreamEnd={handleStreamEnd} />
                            </div>
                        </div>
                    )}

                    {/* WebRTC Broadcaster */}
                    {isStreaming && (
                        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 p-4 overflow-y-auto">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Broadcasting: {streamTitle}</h2>
                                        <p className="text-gray-400 text-sm">WebRTC P2P Streaming</p>
                                    </div>
                                    <button
                                        onClick={handleStreamEnd}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        End Stream
                                    </button>
                                </div>
                                <WebRTCBroadcaster streamTitle={streamTitle} onStreamEnd={handleStreamEnd} />
                            </div>
                        </div>
                    )}

                    {/* Stream.io Viewer */}
                    {selectedStreamIOStream && (
                        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 p-4 overflow-y-auto">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            Watching: {selectedStreamIOStream.title}
                                        </h2>
                                        <p className="text-cyan-400 text-sm">Stream.io Professional Quality</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedStreamIOStream(null)}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                                <StreamIOViewer
                                    streamId={selectedStreamIOStream.id}
                                    streamTitle={selectedStreamIOStream.title}
                                    onStreamEnd={() => setSelectedStreamIOStream(null)}
                                />
                            </div>
                        </div>
                    )}

                    {/* WebRTC Viewer */}
                    {selectedStream && (
                        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 p-4 overflow-y-auto">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Watching: {selectedStream.title}</h2>
                                        <p className="text-gray-400 text-sm">WebRTC P2P Connection</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedStream(null)}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                                <WebRTCViewer
                                    broadcasterId={selectedStream.id}
                                    streamTitle={selectedStream.title}
                                    onStreamEnd={() => setSelectedStream(null)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Tooltip.Provider>
    );
}
