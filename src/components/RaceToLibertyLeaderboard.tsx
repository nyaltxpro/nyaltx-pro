'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaCrown, FaTrophy, FaFire, FaClock, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { LeaderboardEntry, WeeklyWinner } from '@/types/gamification';

interface RaceToLibertyLeaderboardProps {
  className?: string;
}

export default function RaceToLibertyLeaderboard({ className = '' }: RaceToLibertyLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weeklyWinners, setWeeklyWinners] = useState<WeeklyWinner[]>([]);
  const [timeframe, setTimeframe] = useState<'current' | 'weekly'>('current');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchLeaderboard();
    fetchWeeklyWinners();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/gamification/leaderboard?timeframe=${timeframe}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.leaderboard);
        setLastUpdated(data.lastUpdated);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyWinners = async () => {
    try {
      const response = await fetch('/api/gamification/weekly-winner?limit=5');
      const data = await response.json();
      
      if (data.success) {
        setWeeklyWinners(data.winners);
      }
    } catch (error) {
      console.error('Error fetching weekly winners:', error);
    }
  };

  const formatTimeRemaining = (lastBoostTime: Date, decayHours: number) => {
    const now = new Date();
    const expiresAt = new Date(lastBoostTime.getTime() + (decayHours * 60 * 60 * 1000));
    const remaining = expiresAt.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getPositionIcon = (position: number, previousPosition?: number) => {
    if (!previousPosition) return <FaMinus className="text-gray-400" />;
    
    if (position < previousPosition) {
      return <FaArrowUp className="text-green-400" />;
    } else if (position > previousPosition) {
      return <FaArrowDown className="text-red-400" />;
    }
    return <FaMinus className="text-gray-400" />;
  };

  const getPositionBadge = (position: number) => {
    switch (position) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
            <FaTrophy className="text-white text-sm" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-300 to-gray-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">2</span>
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 flex items-center justify-center">
            <span className="text-white font-bold text-sm">3</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-gray-300 font-bold text-sm">{position}</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/10 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
            <FaTrophy className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Race to Liberty</h3>
            <p className="text-sm text-gray-400">Live Leaderboard</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe('current')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeframe === 'current'
                ? 'bg-cyan-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Live
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeframe === 'weekly'
                ? 'bg-cyan-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Weekly Winners Hall of Fame */}
      {weeklyWinners.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
          <h4 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
            <FaCrown className="text-yellow-400" />
            Hall of Fame
          </h4>
          <div className="flex gap-3 overflow-x-auto">
            {weeklyWinners.slice(0, 5).map((winner) => (
              <div key={winner.id} className="flex-shrink-0 text-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2 relative">
                  <Image 
                    src={winner.tokenLogo} 
                    alt={winner.tokenName} 
                    width={32} 
                    height={32} 
                    className="rounded-full"
                  />
                  <FaCrown className="absolute -top-1 -right-1 text-yellow-400 text-xs" />
                </div>
                <div className="text-xs font-medium">{winner.tokenSymbol}</div>
                <div className="text-xs text-gray-400">
                  {new Date(winner.weekStartDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FaTrophy className="mx-auto text-4xl mb-4 opacity-50" />
            <p>No active races yet. Be the first to boost your token!</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <div
              key={entry.tokenId}
              className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                entry.isTopThree
                  ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Position */}
                <div className="flex items-center gap-2">
                  {getPositionBadge(entry.position)}
                  {getPositionIcon(entry.position, entry.previousPosition)}
                </div>

                {/* Token Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Image
                      src={entry.tokenLogo}
                      alt={entry.tokenName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    {entry.hasCrownBadge && (
                      <FaCrown className="absolute -top-1 -right-1 text-yellow-400 text-sm" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{entry.tokenSymbol}</h4>
                      {entry.isTopThree && (
                        <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                          TOP 3
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{entry.tokenName}</p>
                  </div>
                </div>

                {/* Points and Status */}
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <FaFire className="text-orange-400 text-sm" />
                    <span className="font-bold text-lg">
                      {timeframe === 'current' ? entry.currentPoints : entry.weeklyPoints}
                    </span>
                  </div>
                  
                  {entry.decayingPoints.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <FaClock className="text-xs" />
                      <span>
                        {formatTimeRemaining(
                          entry.lastBoostTime,
                          Math.max(...entry.decayingPoints.map(b => 
                            b.boostPackType === 'paddle' ? 24 : 
                            b.boostPackType === 'motor' ? 36 : 48
                          ))
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Decay Progress Bar */}
              {entry.decayingPoints.length > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Boost Decay</span>
                    <span>{entry.currentPoints} pts remaining</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(10, (entry.currentPoints / entry.decayingPoints.reduce((sum, b) => sum + b.originalPoints, 0)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-400">
        <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
        <span>Auto-refresh: 30s</span>
      </div>
    </div>
  );
}
