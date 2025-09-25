'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { FaTrophy, FaFire, FaCrown, FaArrowRight, FaRocket } from 'react-icons/fa';

interface QuickStats {
  userPosition?: number;
  userPoints?: number;
  totalCompetitors: number;
  currentLeader?: {
    tokenName: string;
    tokenSymbol: string;
    tokenLogo: string;
    points: number;
  };
  weeklyWinner?: {
    tokenName: string;
    tokenSymbol: string;
    tokenLogo: string;
  };
}

export default function GamificationStats() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickStats();
  }, [address, isConnected]);

  const fetchQuickStats = async () => {
    try {
      // Fetch leaderboard
      const leaderboardResponse = await fetch('/api/gamification/leaderboard?limit=50');
      const leaderboardData = await leaderboardResponse.json();

      // Fetch weekly winners
      const winnersResponse = await fetch('/api/gamification/weekly-winner?limit=1');
      const winnersData = await winnersResponse.json();

      if (leaderboardData.success) {
        const leaderboard = leaderboardData.leaderboard || [];
        const currentLeader = leaderboard[0];
        const weeklyWinner = winnersData.success ? winnersData.winners[0] : null;

        // Find user position if connected
        let userPosition;
        let userPoints;
        if (isConnected && address) {
          // Get user tokens to find their position
          try {
            const userTokensResponse = await fetch(`/api/tokens/by-wallet?address=${address}`);
            const userTokensData = await userTokensResponse.json();
            
            if (userTokensData.success) {
              const userTokenIds = userTokensData.tokens.map((token: any) => token.id);
              const userEntry = leaderboard.find((entry: any) => 
                userTokenIds.includes(entry.tokenId)
              );
              
              if (userEntry) {
                userPosition = userEntry.position;
                userPoints = userEntry.currentPoints;
              }
            }
          } catch (error) {
            console.error('Error fetching user position:', error);
          }
        }

        setStats({
          userPosition,
          userPoints,
          totalCompetitors: leaderboardData.totalEntries || 0,
          currentLeader: currentLeader ? {
            tokenName: currentLeader.tokenName,
            tokenSymbol: currentLeader.tokenSymbol,
            tokenLogo: currentLeader.tokenLogo,
            points: currentLeader.currentPoints
          } : undefined,
          weeklyWinner: weeklyWinner ? {
            tokenName: weeklyWinner.tokenName,
            tokenSymbol: weeklyWinner.tokenSymbol,
            tokenLogo: weeklyWinner.tokenLogo
          } : undefined
        });
      }
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <FaRocket className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Gamification</h3>
            <p className="text-sm text-gray-400">Competitive crypto marketing</p>
          </div>
        </div>
        
        <Link 
          href="/dashboard/gamification"
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-sm"
        >
          View All <FaArrowRight />
        </Link>
      </div>

      <div className="space-y-4">
        {/* User Status */}
        {isConnected ? (
          stats?.userPosition ? (
            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Your Position</p>
                  <p className="text-xl font-bold text-cyan-400">#{stats.userPosition}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Points</p>
                  <p className="text-lg font-bold">{stats.userPoints}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-400">Not Competing</p>
                  <p className="text-xs text-gray-400">Register tokens to join</p>
                </div>
                <Link 
                  href="/dashboard/race-to-liberty"
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Join Race
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="p-4 bg-gradient-to-r from-gray-500/10 to-gray-600/10 border border-gray-500/20 rounded-xl">
            <p className="text-sm text-gray-400">Connect wallet to see your status</p>
          </div>
        )}

        {/* Current Leader */}
        {stats?.currentLeader && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <FaTrophy className="text-yellow-400" />
            <img 
              src={stats.currentLeader.tokenLogo} 
              alt={stats.currentLeader.tokenName}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">{stats.currentLeader.tokenSymbol}</p>
              <p className="text-xs text-gray-400">Current Leader</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-orange-400">{stats.currentLeader.points}</p>
              <p className="text-xs text-gray-400">points</p>
            </div>
          </div>
        )}

        {/* Weekly Winner */}
        {stats?.weeklyWinner && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <FaCrown className="text-yellow-400" />
            <img 
              src={stats.weeklyWinner.tokenLogo} 
              alt={stats.weeklyWinner.tokenName}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">{stats.weeklyWinner.tokenSymbol}</p>
              <p className="text-xs text-gray-400">Weekly Champion</p>
            </div>
            <FaCrown className="text-yellow-400 text-sm" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <FaFire className="text-orange-400 mx-auto mb-2" />
            <p className="text-lg font-bold">{stats?.totalCompetitors || 0}</p>
            <p className="text-xs text-gray-400">Active Players</p>
          </div>
          
          <Link 
            href="/dashboard/race-to-liberty"
            className="text-center p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl hover:from-cyan-500/20 hover:to-blue-500/20 transition-all group"
          >
            <FaTrophy className="text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-cyan-400">Join Race</p>
            <p className="text-xs text-gray-400">Compete Now</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
