'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { FaTrophy, FaRocket, FaCrown, FaFire, FaTwitter, FaTelegram, FaMicrophone, FaChartLine, FaCalendarAlt, FaUsers, FaArrowRight } from 'react-icons/fa';

interface GameStats {
  totalPlayers: number;
  activeBoosts: number;
  weeklyWinner: any;
  topThree: any[];
  totalPointsAwarded: number;
  socialAnnouncements: number;
}

export default function GamificationOverviewPage() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [userTokens, setUserTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameStats();
    if (isConnected && address) {
      fetchUserTokens();
    }
  }, [isConnected, address]);

  const fetchGameStats = async () => {
    try {
      // Fetch leaderboard for stats
      const leaderboardResponse = await fetch('/api/gamification/leaderboard?limit=50');
      const leaderboardData = await leaderboardResponse.json();

      // Fetch weekly winners
      const winnersResponse = await fetch('/api/gamification/weekly-winner?limit=1');
      const winnersData = await winnersResponse.json();

      if (leaderboardData.success) {
        setStats({
          totalPlayers: leaderboardData.totalEntries || 0,
          activeBoosts: leaderboardData.leaderboard?.length || 0,
          weeklyWinner: winnersData.success ? winnersData.winners[0] : null,
          topThree: leaderboardData.leaderboard?.slice(0, 3) || [],
          totalPointsAwarded: leaderboardData.leaderboard?.reduce((sum: number, entry: any) => sum + entry.currentPoints, 0) || 0,
          socialAnnouncements: 0 // Would need separate API call
        });
      }
    } catch (error) {
      console.error('Error fetching game stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTokens = async () => {
    try {
      const response = await fetch(`/api/tokens/by-wallet?address=${address}`);
      const data = await response.json();
      
      if (data.success) {
        const approvedTokens = data.tokens.filter((token: any) => token.status === 'approved');
        setUserTokens(approvedTokens);
      }
    } catch (error) {
      console.error('Error fetching user tokens:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white/10 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <FaRocket className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gamification Hub</h1>
            <p className="text-gray-400">Your gateway to competitive crypto marketing</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <FaUsers className="text-blue-400 text-2xl" />
            <span className="text-2xl font-bold">{stats?.totalPlayers || 0}</span>
          </div>
          <h3 className="font-semibold">Total Players</h3>
          <p className="text-sm text-gray-400">Registered competitors</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <FaFire className="text-orange-400 text-2xl" />
            <span className="text-2xl font-bold">{stats?.activeBoosts || 0}</span>
          </div>
          <h3 className="font-semibold">Active Boosts</h3>
          <p className="text-sm text-gray-400">Currently competing</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <FaTrophy className="text-yellow-400 text-2xl" />
            <span className="text-2xl font-bold">{stats?.totalPointsAwarded || 0}</span>
          </div>
          <h3 className="font-semibold">Total Points</h3>
          <p className="text-sm text-gray-400">Points in circulation</p>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <FaTwitter className="text-green-400 text-2xl" />
            <span className="text-2xl font-bold">{stats?.socialAnnouncements || 0}</span>
          </div>
          <h3 className="font-semibold">Social Posts</h3>
          <p className="text-sm text-gray-400">Automated announcements</p>
        </div>
      </div>

      {/* Current Week Winner */}
      {stats?.weeklyWinner && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <FaCrown className="text-yellow-400 text-2xl" />
            <h2 className="text-xl font-bold">Current Week Champion</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <img 
              src={stats.weeklyWinner.tokenLogo} 
              alt={stats.weeklyWinner.tokenName}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h3 className="text-lg font-bold">{stats.weeklyWinner.tokenName}</h3>
              <p className="text-gray-400">${stats.weeklyWinner.tokenSymbol}</p>
              <p className="text-sm text-yellow-400">{stats.weeklyWinner.totalPoints} points</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Week of</p>
              <p className="font-semibold">{new Date(stats.weeklyWinner.weekStartDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Current Leaders */}
      {stats?.topThree && stats.topThree.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaChartLine className="text-cyan-400" />
              Current Top 3
            </h2>
            <Link 
              href="/dashboard/race-to-liberty"
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-sm"
            >
              View Full Leaderboard <FaArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.topThree.map((entry, index) => (
              <div 
                key={entry.tokenId}
                className={`p-4 rounded-xl border ${
                  index === 0 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-300/20 to-gray-500/20 border-gray-400/30'
                    : 'bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-600/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                  }`}>
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <img 
                    src={entry.tokenLogo} 
                    alt={entry.tokenName}
                    className="w-10 h-10 rounded-full"
                  />
                </div>
                <h4 className="font-bold">{entry.tokenSymbol}</h4>
                <p className="text-sm text-gray-400 truncate">{entry.tokenName}</p>
                <p className="text-lg font-bold text-orange-400 mt-2">{entry.currentPoints} pts</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/dashboard/race-to-liberty"
          className="group bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300"
        >
          <div className="flex items-center gap-4 mb-4">
            <FaTrophy className="text-cyan-400 text-2xl group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold">Race to Liberty</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Compete in the ultimate crypto marketing race. Boost your tokens and climb the leaderboard.
          </p>
          <div className="flex items-center gap-2 text-cyan-400 group-hover:gap-3 transition-all">
            <span>Join the Race</span>
            <FaArrowRight className="text-sm" />
          </div>
        </Link>

        <Link 
          href="/dashboard/register-token"
          className="group bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300"
        >
          <div className="flex items-center gap-4 mb-4">
            <FaRocket className="text-purple-400 text-2xl group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold">Register Token</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Register your token for admin approval to participate in gamification features.
          </p>
          <div className="flex items-center gap-2 text-purple-400 group-hover:gap-3 transition-all">
            <span>Register Now</span>
            <FaArrowRight className="text-sm" />
          </div>
        </Link>

        <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <FaCalendarAlt className="text-green-400 text-2xl" />
            <h3 className="text-lg font-bold">Your Status</h3>
          </div>
          {!isConnected ? (
            <p className="text-gray-400 mb-4">Connect your wallet to see your gamification status.</p>
          ) : userTokens.length === 0 ? (
            <p className="text-gray-400 mb-4">No approved tokens. Register tokens to participate.</p>
          ) : (
            <div>
              <p className="text-gray-400 mb-2">Approved Tokens: <span className="text-green-400 font-bold">{userTokens.length}</span></p>
              <p className="text-sm text-gray-500">Ready to compete!</p>
            </div>
          )}
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-6">Gamification Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <FaFire className="text-orange-400 text-3xl mx-auto mb-3" />
            <h4 className="font-bold mb-2">Point Decay</h4>
            <p className="text-sm text-gray-400">Points automatically decay over 24-48 hours, keeping competition active and fair.</p>
          </div>

          <div className="text-center">
            <FaCrown className="text-yellow-400 text-3xl mx-auto mb-3" />
            <h4 className="font-bold mb-2">Weekly Crown</h4>
            <p className="text-sm text-gray-400">Top weekly performer gets a permanent crown badge and recognition.</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center gap-2 mb-3">
              <FaTwitter className="text-blue-400 text-xl" />
              <FaTelegram className="text-blue-400 text-xl" />
            </div>
            <h4 className="font-bold mb-2">Social Push</h4>
            <p className="text-sm text-gray-400">Automatic social media announcements for winners and top performers.</p>
          </div>

          <div className="text-center">
            <FaMicrophone className="text-purple-400 text-3xl mx-auto mb-3" />
            <h4 className="font-bold mb-2">Podcast Ads</h4>
            <p className="text-sm text-gray-400">Top 3 weekly projects get featured in Off Road with Frank Ferraro podcast.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
