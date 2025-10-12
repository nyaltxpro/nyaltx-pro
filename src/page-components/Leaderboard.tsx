'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ExternalLinkIcon, UpdateIcon, StarIcon } from '@radix-ui/react-icons';
import { FaAward, FaMedal, FaTrophy } from 'react-icons/fa';

interface LeaderboardToken {
    id: string;
    tokenName: string;
    tokenSymbol: string;
    imageUri: string;
    points: number;
    blockchain: string;
    contractAddress: string;
    submittedByAddress: string;
    createdAt: string;
    pointsUpdatedAt?: string;
    rank: number;
}

interface LeaderboardResponse {
    success: boolean;
    data: LeaderboardToken[];
    totalTokens: number;
    error?: string;
}

export default function LeaderboardPage() {
    const [tokens, setTokens] = useState<LeaderboardToken[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLeaderboard = async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);

            const response = await fetch('/api/leaderboard');
            const data: LeaderboardResponse = await response.json();

            if (data.success) {
                setTokens(data.data);
                setError(null);
            } else {
                setError(data.error || 'Failed to fetch leaderboard');
            }
        } catch (err) {
            console.error('Leaderboard fetch error:', err);
            setError('Failed to load leaderboard data');
        } finally {
            setLoading(false);
            if (showRefreshing) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const handleRefresh = () => {
        fetchLeaderboard(true);
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <FaTrophy className="text-yellow-500 text-xl" />;
            case 2:
                return <FaMedal className="text-gray-400 text-xl" />;
            case 3:
                return <FaAward className="text-amber-600 text-xl" />;
            default:
                return <span className="text-gray-500 font-bold text-lg">#{rank}</span>;
        }
    };

    const getRankBadgeColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
            case 2:
                return 'bg-gradient-to-r from-gray-300 to-gray-500';
            case 3:
                return 'bg-gradient-to-r from-amber-400 to-amber-600';
            default:
                return 'bg-gradient-to-r from-gray-600 to-gray-700';
        }
    };

    const formatPoints = (points: number) => {
        if (points >= 1000000) {
            return `${(points / 1000000).toFixed(1)}M`;
        } else if (points >= 1000) {
            return `${(points / 1000).toFixed(1)}K`;
        }
        return points.toString();
    };

    const formatAddress = (address: string | null | undefined) => {
        if (!address || typeof address !== 'string') {
            return 'N/A';
        }
        if (address.length < 10) {
            return address; // Return as-is if too short to truncate
        }
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getBlockchainColor = (blockchain: string) => {
        const colors: { [key: string]: string } = {
            ethereum: 'bg-blue-500',
            bsc: 'bg-yellow-500',
            polygon: 'bg-purple-500',
            arbitrum: 'bg-blue-400',
            optimism: 'bg-red-500',
            solana: 'bg-green-500',
        };
        return colors[blockchain.toLowerCase()] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1923] to-[#1a2332] p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
                        <div className="bg-gray-800 rounded-lg p-6">
                            {[...Array(10)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center space-x-4 py-4 border-b border-gray-700 last:border-b-0"
                                >
                                    <div className="w-8 h-8 bg-gray-700 rounded"></div>
                                    <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                                        <div className="h-3 bg-gray-700 rounded w-20"></div>
                                    </div>
                                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1923] to-[#1a2332] p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Tooltip.Provider>
            <div className="min-h-screen p-6">
                <div className=" mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Token Leaderboard</h1>
                                <p className="text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Ranking of all registered tokens by points and performance</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="shadow-2xl px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-xs"
                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                >
                                    {refreshing ? (
                                        <>
                                            <UpdateIcon className="animate-spin w-4 h-4" />
                                            Refreshing...
                                        </>
                                    ) : (
                                        <>
                                            <UpdateIcon className="w-4 h-4" />
                                            Refresh
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-800/40 backdrop-blur-lg p-4 rounded-lg border border-gray-700/30">
                            <h3 className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Total Tokens</h3>
                            <div className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{tokens.length}</div>
                            <div className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Competing tokens</div>
                        </div>
                        <div className="bg-gray-800/40 backdrop-blur-lg p-4 rounded-lg border border-gray-700/30">
                            <h3 className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Top Score</h3>
                            <div className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                {tokens.length > 0 ? formatPoints(tokens[0].points) : '0'}
                            </div>
                            <div className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Highest points</div>
                        </div>
                        <div className="bg-gray-800/40 backdrop-blur-lg p-4 rounded-lg border border-gray-700/30">
                            <h3 className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Competition Status</h3>
                            <div className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Live</div>
                            <div className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Active leaderboard</div>
                        </div>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full overflow-hidden">
                                <thead className="bg-gray-700/30 border-b border-gray-600/20">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Rank
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Token
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Chain
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Points
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Owner
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800/20">
                                    {tokens.map((token, index) => (
                                        <tr key={token.id} className="hover:bg-gray-700/20 transition-all duration-150 border-b border-gray-700/15 last:border-b-0">
                                            <td className="px-4 py-3 border-r border-gray-700/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        {token.rank <= 3 ? (
                                                            <div className="flex items-center gap-2">
                                                                {getRankIcon(token.rank)}
                                                                <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getRankBadgeColor(token.rank)}`}>
                                                                    TOP {token.rank}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-white font-medium text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>#{token.rank}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-700/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar.Root className="w-8 h-8">
                                                            <Avatar.Image
                                                                src={token.imageUri}
                                                                alt={token.tokenName}
                                                                className="w-full h-full object-cover rounded-full"
                                                            />
                                                            <Avatar.Fallback className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs rounded-full">
                                                                {token.tokenSymbol?.slice(0, 2) || token.tokenName?.slice(0, 2) || '??'}
                                                            </Avatar.Fallback>
                                                        </Avatar.Root>
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium text-sm" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{token.tokenName || 'Unknown'}</div>
                                                        <div className="text-gray-400 text-xs" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{token.tokenSymbol || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-700/20">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getBlockchainColor(token.blockchain)}`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                    {token.blockchain.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-700/20">
                                                <div className="text-gray-300 font-mono text-sm" style={{ fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace' }}>
                                                    {formatPoints(token.points)} pts
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-700/20">
                                                <div className="text-gray-300 text-sm font-mono" style={{ fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace' }}>
                                                    {formatAddress(token.submittedByAddress)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Tooltip.Root>
                                                        <Tooltip.Trigger asChild>
                                                            <a
                                                                href={`https://${token.blockchain === 'ethereum' ? 'etherscan.io' : token.blockchain === 'bsc' ? 'bscscan.com' : token.blockchain === 'polygon' ? 'polygonscan.com' : token.blockchain === 'arbitrum' ? 'arbiscan.io' : token.blockchain === 'optimism' ? 'optimistic.etherscan.io' : 'solscan.io'}/token/${token.contractAddress}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-all duration-200"
                                                            >
                                                                <ExternalLinkIcon className="w-4 h-4 text-gray-300" />
                                                            </a>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Portal>
                                                            <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                                View on Explorer
                                                                <Tooltip.Arrow className="fill-black/90" />
                                                            </Tooltip.Content>
                                                        </Tooltip.Portal>
                                                    </Tooltip.Root>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {tokens.length === 0 && (
                        <div className="backdrop-blur-lg rounded-xl p-12 text-center border border-white/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            <div className="mb-6">
                                <FaTrophy className="text-blue-400 mx-auto mb-4 text-6xl" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-2">No Tokens in Competition</h3>
                            <p className="text-gray-300 text-lg mb-6">Tokens will appear here once they receive points from Race to Liberty</p>
                        </div>
                    )}
                </div>
            </div>
        </Tooltip.Provider>
    );
}
