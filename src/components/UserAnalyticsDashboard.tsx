'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
  FaChartLine,
  FaTrophy,
  FaCoins,
  FaDollarSign,
  FaFire,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface UserAnalytics {
  totalBoosts: number;
  totalSpent: number;
  totalPoints: number;
  averagePoints: number;
  packBreakdown: Record<string, { count: number; totalSpent: number; totalPoints: number }>;
  dailyBreakdown: Array<{ date: string; count: number; points: number; spent: number }>;
  activeBoosts: number;
  expiredBoosts: number;
  currentPosition?: number;
  bestPosition?: number;
  averagePosition?: number;
}

interface UserAnalyticsDashboardProps {
  className?: string;
}

export default function UserAnalyticsDashboard({ className = '' }: UserAnalyticsDashboardProps) {
  const { address, isConnected } = useAccount();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      fetchAnalytics();
    } else {
      setAnalytics(null);
    }
  }, [isConnected, address, timeframe]);

  const fetchAnalytics = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/analytics?timeframe=${timeframe}&wallet=${address}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        throw new Error(data.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getPackIcon = (packType: string) => {
    switch (packType) {
      case 'kayak': return '🛶';
      case 'starter': return '🚀';
      case 'growth': return '📈';
      case 'pro': return '👑';
      default: return '📦';
    }
  };

  const getPackName = (packType: string) => {
    switch (packType) {
      case 'kayak': return 'Kayak';
      case 'starter': return 'Starter';
      case 'growth': return 'Growth';
      case 'pro': return 'Pro';
      default: return packType;
    }
  };

  if (!isConnected) {
    return (
      <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 ${className}`}>
        <div className="text-center py-8">
          <FaChartLine className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
          <p className="text-gray-400">Connect your wallet to view your gamification analytics</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalBoosts === 0) {
    return (
      <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 ${className}`}>
        <div className="text-center py-8">
          <FaFire className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
          <p className="text-gray-400 mb-4">Purchase your first boost pack to see analytics</p>
          <button
            onClick={() => window.location.href = '/dashboard/race-to-liberty'}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <FaChartLine className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Your Analytics</h3>
            <p className="text-sm text-gray-400">Performance insights</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                timeframe === period
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FaFire className="text-orange-400" />
            <span className="text-sm text-gray-400">Total Boosts</span>
          </div>
          <p className="text-2xl font-bold">{analytics.totalBoosts}</p>
        </div>

        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FaDollarSign className="text-green-400" />
            <span className="text-sm text-gray-400">Total Spent</span>
          </div>
          <p className="text-2xl font-bold">${analytics.totalSpent}</p>
        </div>

        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FaCoins className="text-yellow-400" />
            <span className="text-sm text-gray-400">Total Points</span>
          </div>
          <p className="text-2xl font-bold">{analytics.totalPoints.toLocaleString()}</p>
        </div>

        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FaTrophy className="text-cyan-400" />
            <span className="text-sm text-gray-400">Position</span>
          </div>
          <p className="text-2xl font-bold">
            {analytics.currentPosition ? `#${analytics.currentPosition}` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Boost Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-green-400" />
            <span className="text-sm text-gray-400">Active Boosts</span>
          </div>
          <p className="text-xl font-bold text-green-400">{analytics.activeBoosts}</p>
        </div>

        <div className="p-4 bg-gradient-to-r from-gray-500/10 to-gray-600/10 border border-gray-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-gray-400" />
            <span className="text-sm text-gray-400">Expired Boosts</span>
          </div>
          <p className="text-xl font-bold text-gray-400">{analytics.expiredBoosts}</p>
        </div>
      </div>

      {/* Pack Breakdown */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4">Boost Pack Breakdown</h4>
        <div className="space-y-3">
          {Object.entries(analytics.packBreakdown).map(([packType, data]) => (
            <div key={packType} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getPackIcon(packType)}</span>
                <div>
                  <p className="font-semibold">{getPackName(packType)}</p>
                  <p className="text-sm text-gray-400">{data.count} purchase{data.count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${data.totalSpent}</p>
                <p className="text-sm text-gray-400">{data.totalPoints.toLocaleString()} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      {analytics.averagePoints > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
          <h4 className="font-semibold mb-2">Performance Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Average Points per Boost:</span>
              <span className="ml-2 font-semibold">{analytics.averagePoints}</span>
            </div>
            <div>
              <span className="text-gray-400">Cost per Point:</span>
              <span className="ml-2 font-semibold">
                ${(analytics.totalSpent / analytics.totalPoints).toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
