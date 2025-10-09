'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaGlobe, FaEye, FaSearch, FaChrome, FaWallet, FaMapMarkerAlt, FaMousePointer, FaClock, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface OnlineUser {
  id: string;
  walletAddress?: string;
  ipAddress: string;
  region: string;
  country: string;
  lastSeen: Date;
  userAgent: string;
}

interface RecentVisitor {
  id: string;
  ipAddress: string;
  region: string;
  country: string;
  timestamp: Date;
  page: string;
  referrer?: string;
  userAgent: string;
}

interface TrafficByCountry {
  country: string;
  countryCode: string;
  visitors: number;
  percentage: number;
}

interface SearchEngineData {
  engine: string;
  visits: number;
  percentage: number;
}

interface BrowserData {
  browser: string;
  version: string;
  visits: number;
  percentage: number;
}

interface WalletConnection {
  walletType: string;
  connections: number;
  uniqueUsers: number;
}

interface AnalyticsStats {
  onlineUsers: OnlineUser[];
  recentVisitors: RecentVisitor[];
  trafficByCountry: TrafficByCountry[];
  searchEngines: SearchEngineData[];
  browsers: BrowserData[];
  walletConnections: WalletConnection[];
  totalHits: number;
  todayHits: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/analytics/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching analytics stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getCountryFlag = (countryCode: string) => {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live Updates</span>
            </div>
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Online Users</p>
                <p className="text-2xl font-bold text-green-400">{stats?.onlineUsers?.length || 0}</p>
              </div>
              <FaUsers className="text-green-400 text-2xl" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Hits</p>
                <p className="text-2xl font-bold text-blue-400">{stats?.totalHits?.toLocaleString() || 0}</p>
              </div>
              <FaEye className="text-blue-400 text-2xl" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today's Hits</p>
                <p className="text-2xl font-bold text-purple-400">{stats?.todayHits?.toLocaleString() || 0}</p>
              </div>
              <FaMousePointer className="text-purple-400 text-2xl" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Unique Visitors</p>
                <p className="text-2xl font-bold text-yellow-400">{stats?.uniqueVisitors?.toLocaleString() || 0}</p>
              </div>
              <FaGlobe className="text-yellow-400 text-2xl" />
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Page Views</p>
                <p className="text-xl font-bold text-cyan-400">{stats?.pageViews?.toLocaleString() || 0}</p>
              </div>
              <FaEye className="text-cyan-400 text-xl" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Bounce Rate</p>
                <p className="text-xl font-bold text-red-400">{stats?.bounceRate?.toFixed(1) || 0}%</p>
              </div>
              <FaArrowUp className="text-red-400 text-xl" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Session</p>
                <p className="text-xl font-bold text-green-400">{formatDuration(stats?.avgSessionDuration || 0)}</p>
              </div>
              <FaClock className="text-green-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Online Users */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaUsers className="text-green-400" />
              Online Users ({stats?.onlineUsers?.length || 0})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats?.onlineUsers?.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">
                        {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'Anonymous'}
                      </p>
                      <p className="text-gray-400 text-xs">{user.region}, {user.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">{new Date(user.lastSeen).toLocaleTimeString()}</p>
                  </div>
                </div>
              )) || <p className="text-gray-400 text-center py-4">No online users</p>}
            </div>
          </div>

          {/* Recent Visitors */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaClock className="text-blue-400" />
              Recent Visitors
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats?.recentVisitors?.slice(0, 10).map((visitor) => (
                <div key={visitor.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img 
                      src={getCountryFlag(visitor.country)} 
                      alt={visitor.country}
                      className="w-6 h-4 rounded"
                    />
                    <div>
                      <p className="text-white text-sm">{visitor.ipAddress}</p>
                      <p className="text-gray-400 text-xs">{visitor.region}, {visitor.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">{new Date(visitor.timestamp).toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">{visitor.page}</p>
                  </div>
                </div>
              )) || <p className="text-gray-400 text-center py-4">No recent visitors</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Traffic by Country */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaGlobe className="text-purple-400" />
              Traffic by Country
            </h2>
            <div className="space-y-3">
              {stats?.trafficByCountry?.slice(0, 8).map((country) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={getCountryFlag(country.countryCode)} 
                      alt={country.country}
                      className="w-6 h-4 rounded"
                    />
                    <span className="text-white">{country.country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-400 h-2 rounded-full" 
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-400 text-sm w-12 text-right">{country.visitors}</span>
                  </div>
                </div>
              )) || <p className="text-gray-400 text-center py-4">No traffic data</p>}
            </div>
          </div>

          {/* Search Engines */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaSearch className="text-yellow-400" />
              Search Engine Summary
            </h2>
            <div className="space-y-3">
              {stats?.searchEngines?.map((engine) => (
                <div key={engine.engine} className="flex items-center justify-between">
                  <span className="text-white">{engine.engine}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${engine.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-400 text-sm w-12 text-right">{engine.visits}</span>
                  </div>
                </div>
              )) || <p className="text-gray-400 text-center py-4">No search engine data</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Browser Analytics */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaChrome className="text-cyan-400" />
              Browser Analytics
            </h2>
            <div className="space-y-3">
              {stats?.browsers?.map((browser) => (
                <div key={`${browser.browser}-${browser.version}`} className="flex items-center justify-between">
                  <div>
                    <span className="text-white">{browser.browser}</span>
                    <span className="text-gray-400 text-sm ml-2">{browser.version}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-cyan-400 h-2 rounded-full" 
                        style={{ width: `${browser.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-400 text-sm w-12 text-right">{browser.visits}</span>
                  </div>
                </div>
              )) || <p className="text-gray-400 text-center py-4">No browser data</p>}
            </div>
          </div>

          {/* Wallet Connections */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaWallet className="text-green-400" />
              Wallet Connections
            </h2>
            <div className="space-y-3">
              {stats?.walletConnections?.map((wallet) => (
                <div key={wallet.walletType} className="flex items-center justify-between">
                  <span className="text-white">{wallet.walletType}</span>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-green-400 text-sm">{wallet.connections} connections</p>
                      <p className="text-gray-400 text-xs">{wallet.uniqueUsers} unique users</p>
                    </div>
                  </div>
                </div>
              )) || <p className="text-gray-400 text-center py-4">No wallet connection data</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
