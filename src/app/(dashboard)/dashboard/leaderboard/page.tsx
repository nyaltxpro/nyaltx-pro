'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTrophy, FaMedal, FaAward, FaCoins, FaExternalLinkAlt, FaSyncAlt } from 'react-icons/fa';

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

  const formatAddress = (address: string) => {
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
                <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-700 last:border-b-0">
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f1923] to-[#1a2332] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <FaTrophy className="text-yellow-500 text-3xl" />
            <div>
              <h1 className="text-3xl font-bold text-white">Token Leaderboard</h1>
              <p className="text-gray-400">Ranking of all tokens by points</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-[#00b8d8] hover:bg-[#0095b3] disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaSyncAlt className={`${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <FaCoins className="text-[#00b8d8] text-2xl" />
              <div>
                <p className="text-gray-400 text-sm">Total Tokens</p>
                <p className="text-white text-2xl font-bold">{tokens.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <FaTrophy className="text-yellow-500 text-2xl" />
              <div>
                <p className="text-gray-400 text-sm">Top Score</p>
                <p className="text-white text-2xl font-bold">
                  {tokens.length > 0 ? formatPoints(tokens[0].points) : '0'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <FaAward className="text-purple-500 text-2xl" />
              <div>
                <p className="text-gray-400 text-sm">Active Competition</p>
                <p className="text-white text-2xl font-bold">Live</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Chain
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {tokens.map((token, index) => (
                  <tr 
                    key={token.id} 
                    className={`hover:bg-gray-700/30 transition-colors ${
                      index < 3 ? 'bg-gradient-to-r from-gray-800/30 to-transparent' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {getRankIcon(token.rank)}
                        {token.rank <= 3 && (
                          <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getRankBadgeColor(token.rank)}`}>
                            TOP {token.rank}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10">
                          <Image
                            src={token.imageUri || '/generic.svg'}
                            alt={token.tokenName}
                            width={40}
                            height={40}
                            className="rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/generic.svg';
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-white font-medium">{token.tokenName}</p>
                          <p className="text-gray-400 text-sm">{token.tokenSymbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getBlockchainColor(token.blockchain)}`}>
                        {token.blockchain.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <FaCoins className="text-[#00b8d8] text-sm" />
                        <span className="text-white font-bold text-lg">
                          {formatPoints(token.points)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-400 font-mono text-sm">
                        {formatAddress(token.submittedByAddress)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-[#00b8d8] hover:text-[#0095b3] transition-colors">
                        <FaExternalLinkAlt className="text-sm" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {tokens.length === 0 && (
          <div className="text-center py-12">
            <FaTrophy className="text-gray-600 text-6xl mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No tokens found in the leaderboard</p>
            <p className="text-gray-500 text-sm">Tokens will appear here once they receive points</p>
          </div>
        )}
      </div>
    </div>
  );
}
