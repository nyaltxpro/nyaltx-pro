'use client';

import { useEffect, useState } from 'react';
import { FaChartLine, FaClock, FaDesktop, FaEye, FaGlobe, FaMapMarkerAlt, FaUsers, FaWallet } from 'react-icons/fa';
import QuickStats from './QuickStats';
import TrafficLineGraph from './TrafficLineGraph';

interface AnalyticsData {
  onlineUsers: number;
  recentVisitors: Array<{
    sessionId: string;
    ipAddress: string;
    country: string;
    region: string;
    city: string;
    createdAt: string;
    lastActivity: string;
    walletAddress?: string;
    walletType?: string;
    isActive: boolean;
    deviceType?: string;
    browser?: string;
    browserVersion?: string;
    pageViews?: number;
    firstPage?: string;
    language?: string;
  }>;
  trafficByCountry: Array<{
    country: string;
    countryCode: string;
    visits: number;
    uniqueVisitors: number;
  }>;
  topCities: Array<{
    city: string;
    country: string;
    countryCode: string;
    visits: number;
    uniqueVisitors: number;
  }>;
  browserStats: Array<{
    browser: string;
    visits: number;
    uniqueVisitors: number;
  }>;
  pageViews: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  uniqueVisitors: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  topPages: Array<{
    page: string;
    visits: number;
    uniqueVisitors: number;
  }>;
  walletConnections: number;
  walletConnectionsStats: Array<{
    walletType: string;
    connections: number;
    uniqueUsers: number;
    countries: number;
    devices: string[];
  }>;
  deviceStats: Array<{
    deviceType: string;
    visits: number;
    uniqueUsers: number;
  }>;
  hourlyTraffic: Array<{
    hour: number;
    visits: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitorRange, setVisitorRange] = useState<'1' | '7' | '30'>('7');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/analytics?visitorRange=${visitorRange}`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalytics(data.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [visitorRange]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getCountryFlag = (countryCode: string) => {
    if (countryCode === 'LC') return '🏠'; // Local
    if (countryCode === 'UN') return '❓'; // Unknown
    return String.fromCodePoint(
      ...[...countryCode.toUpperCase()].map(x => 0x1f1a5 + x.charCodeAt(0))
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">Error loading analytics: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            <FaChartLine className="text-blue-400" />
            Analytics Dashboard
          </h2>
          <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            Real-time platform analytics and user insights
          </p>
        </div>
        <div className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
              <FaUsers className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {analytics.onlineUsers}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Online Users
            </div>
            <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Currently active
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
              <FaEye className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {analytics.pageViews.today}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Page Views Today
            </div>
            <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Daily traffic
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
              <FaGlobe className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {analytics.uniqueVisitors.today}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Unique Visitors Today
            </div>
            <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Daily unique users
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-500/30">
              <FaWallet className="w-6 h-6 text-orange-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {analytics.walletConnections}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Wallet Connections
            </div>
            <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Total connections
            </div>
          </div>
        </div>
      </div>

      {/* Recent Visitors */}
      <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-700/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              <FaClock className="text-blue-400" />
              Recent Visitors
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setVisitorRange('1')}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  visitorRange === '1'
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/30'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
              >
                {loading && visitorRange === '1' && (
                  <span className="animate-spin">⟳</span>
                )}
                1 Day
              </button>
              <button
                onClick={() => setVisitorRange('7')}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  visitorRange === '7'
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/30'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
              >
                {loading && visitorRange === '7' && (
                  <span className="animate-spin">⟳</span>
                )}
                7 Days
              </button>
              <button
                onClick={() => setVisitorRange('30')}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  visitorRange === '30'
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/30'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
              >
                {loading && visitorRange === '30' && (
                  <span className="animate-spin">⟳</span>
                )}
                1 Month
              </button>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full overflow-hidden">
              <thead className="bg-gray-700/30 border-b border-gray-600/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    First Visit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Last Activity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-700/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Wallet
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/20">
                {analytics.recentVisitors.slice(0, 20).map((visitor, index) => (
                  <tr key={visitor.sessionId} className="hover:bg-gray-700/20 transition-colors duration-200">
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getCountryFlag(visitor.country === 'Unknown' ? 'UN' : visitor.country.slice(0, 2).toUpperCase())}</span>
                        <div>
                          <div className="font-medium text-white text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {visitor.city}, {visitor.region}
                          </div>
                          <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {visitor.country}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <code className="text-gray-300 bg-gray-700/30 px-2 py-1 rounded border border-gray-600/30 text-xs">
                        {visitor.ipAddress}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <span className="text-gray-300 text-xs" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {formatTime(visitor.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      <span className="text-gray-300 text-xs" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {formatTime(visitor.lastActivity)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-gray-700/20">
                      {visitor.walletAddress ? (
                        <div className="flex flex-col gap-1">
                          <code className="text-green-300 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 text-xs">
                            {visitor.walletAddress.slice(0, 6)}...{visitor.walletAddress.slice(-4)}
                          </code>
                          {visitor.walletType && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                              {visitor.walletType}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          Not connected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${visitor.isActive
                            ? 'bg-green-500/10 text-green-300 border-green-500/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          }`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          {visitor.isActive ? 'Online' : 'Offline'}
                        </span>
                        {visitor.deviceType && visitor.deviceType !== 'unknown' && (
                          <span className="text-xs text-gray-400 capitalize flex items-center gap-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {visitor.deviceType === 'mobile' ? '📱' : visitor.deviceType === 'tablet' ? '📱' : '💻'} {visitor.deviceType}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <QuickStats />
      <TrafficLineGraph />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic by Country */}
        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl">
          <div className="p-6 border-b border-gray-700/20">
            <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              <FaMapMarkerAlt className="text-green-400" />
              Traffic by Country (Last 7 Days)
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.trafficByCountry.slice(0, 8).map((country, index) => (
                <div key={country.country} className="flex items-center justify-between p-3 bg-gray-700/30 border border-gray-600/30 rounded-lg hover:bg-gray-700/40 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getCountryFlag(country.countryCode)}</span>
                    <div>
                      <div className="font-medium text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {country.country}
                      </div>
                      <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {country.uniqueVisitors} unique visitors
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      {country.visits}
                    </div>
                    <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      visits
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Browser Statistics */}
        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl">
          <div className="p-6 border-b border-gray-700/20">
            <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              <FaDesktop className="text-purple-400" />
              Browser Statistics (Last 7 Days)
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.browserStats.map((browser, index) => (
                <div key={browser.browser} className="flex items-center justify-between p-3 bg-gray-700/30 border border-gray-600/30 rounded-lg hover:bg-gray-700/40 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                      <span className="text-sm font-bold text-purple-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {browser.browser.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {browser.browser}
                      </div>
                      <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {browser.uniqueVisitors} unique users
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      {browser.visits}
                    </div>
                    <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      visits
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Cities */}
      <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-700/20">
          <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            <FaMapMarkerAlt className="text-cyan-400" />
            Top Cities (Last 7 Days)
          </h3>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.topCities?.map((city, index) => (
              <div key={`${city.city}-${city.country}`} className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg hover:bg-gray-700/40 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">{getCountryFlag(city.countryCode)}</span>
                    <span className="text-xs text-gray-500 mt-1">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      {city.city}
                    </div>
                    <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      {city.country}
                    </div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      {city.uniqueVisitors} unique visitors
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cyan-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    {city.visits}
                  </div>
                  <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    visits
                  </div>
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center py-8">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaMapMarkerAlt className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  No city data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-700/20">
          <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            <FaChartLine className="text-blue-400" />
            Top Pages (Last 7 Days)
          </h3>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {analytics.topPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg hover:bg-gray-700/40 transition-all duration-200">
                <div>
                  <div className="font-medium text-white text-sm" style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}>
                    {page.page || '/'}
                  </div>
                  <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    {page.uniqueVisitors} unique visitors
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    {page.visits}
                  </div>
                  <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    visits
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Wallet Connection Statistics */}
        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl">
          <div className="p-6 border-b border-gray-700/20">
            <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              <FaWallet className="text-green-400" />
              Wallet Connections (Last 7 Days)
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.walletConnectionsStats?.map((wallet, index) => (
                <div key={wallet.walletType} className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg hover:bg-gray-700/40 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                      <FaWallet className="text-green-400 w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {wallet.walletType}
                      </div>
                      <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {wallet.uniqueUsers} unique users • {wallet.countries} countries
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      {wallet.connections}
                    </div>
                    <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      connections
                    </div>
                  </div>
                </div>
              )) || (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaWallet className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      No wallet connection data
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Device Statistics */}
        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl">
          <div className="p-6 border-b border-gray-700/20">
            <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              <FaDesktop className="text-blue-400" />
              Device Statistics (Last 7 Days)
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.deviceStats?.map((device, index) => {
                const deviceIcon = device.deviceType === 'mobile' ? '📱' :
                  device.deviceType === 'tablet' ? '📱' : '💻';
                return (
                  <div key={device.deviceType} className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg hover:bg-gray-700/40 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                        <span className="text-2xl">{deviceIcon}</span>
                      </div>
                      <div>
                        <div className="font-medium text-white capitalize" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          {device.deviceType}
                        </div>
                        <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          {device.uniqueUsers} unique users
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {device.visits}
                      </div>
                      <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        visits
                      </div>
                    </div>
                  </div>
                );
              }) || (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaDesktop className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      No device data
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Traffic Pattern */}
      <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-700/20">
          <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            <FaClock className="text-orange-400" />
            Hourly Traffic Pattern (Last 24 Hours)
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-1 h-32 bg-gray-700/20 rounded-lg p-4">
            {analytics.hourlyTraffic.map((hour, index) => {
              const maxVisits = Math.max(...analytics.hourlyTraffic.map(h => h.visits));
              const height = maxVisits > 0 ? (hour.visits / maxVisits) * 100 : 0;

              return (
                <div key={hour.hour} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition-all duration-300 hover:from-orange-400 hover:to-orange-300 shadow-lg"
                    style={{ height: `${height}%`, minHeight: hour.visits > 0 ? '4px' : '0px' }}
                    title={`${hour.hour}:00 - ${hour.visits} visits`}
                  ></div>
                  <div className="text-xs text-gray-400 mt-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    {hour.hour}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
              <FaEye className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {analytics.pageViews.thisWeek.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              This Week
            </div>
            <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Page Views
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
              <FaEye className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {analytics.pageViews.thisMonth.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              This Month
            </div>
            <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Page Views
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl p-6 shadow-xl hover:bg-gray-800/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
              <FaUsers className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {analytics.uniqueVisitors.thisMonth.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Monthly Unique
            </div>
            <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Visitors
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
