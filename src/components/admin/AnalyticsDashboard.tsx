'use client';

import { useEffect, useState } from 'react';
import { FaUsers, FaEye, FaGlobe, FaDesktop, FaClock, FaWallet, FaChartLine, FaMapMarkerAlt } from 'react-icons/fa';

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

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalytics(data.data);
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
  }, []);

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
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FaChartLine className="text-blue-400" />
          Analytics Dashboard
        </h2>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-800 p-4 bg-gradient-to-br from-green-900/20 to-green-800/10">
          <div className="flex items-center gap-3">
            <FaUsers className="text-green-400 text-xl" />
            <div>
              <div className="text-gray-400 text-sm">Online Users</div>
              <div className="text-2xl font-bold text-green-400">{analytics.onlineUsers}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/10">
          <div className="flex items-center gap-3">
            <FaEye className="text-blue-400 text-xl" />
            <div>
              <div className="text-gray-400 text-sm">Page Views Today</div>
              <div className="text-2xl font-bold text-blue-400">{analytics.pageViews.today}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/10">
          <div className="flex items-center gap-3">
            <FaGlobe className="text-purple-400 text-xl" />
            <div>
              <div className="text-gray-400 text-sm">Unique Visitors Today</div>
              <div className="text-2xl font-bold text-purple-400">{analytics.uniqueVisitors.today}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 p-4 bg-gradient-to-br from-orange-900/20 to-orange-800/10">
          <div className="flex items-center gap-3">
            <FaWallet className="text-orange-400 text-xl" />
            <div>
              <div className="text-gray-400 text-sm">Wallet Connections</div>
              <div className="text-2xl font-bold text-orange-400">{analytics.walletConnections}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Visitors */}
      <div className="rounded-xl border border-gray-800 p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FaClock className="text-blue-400" />
          Recent Visitors (Last 24 Hours)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2">Location</th>
                <th className="text-left py-2">IP Address</th>
                <th className="text-left py-2">First Visit</th>
                <th className="text-left py-2">Last Activity</th>
                <th className="text-left py-2">Wallet</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentVisitors.slice(0, 10).map((visitor, index) => (
                <tr key={visitor.sessionId} className="border-b border-gray-800/50">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCountryFlag(visitor.country === 'Unknown' ? 'UN' : visitor.country.slice(0, 2).toUpperCase())}</span>
                      <div>
                        <div className="font-medium">{visitor.city}, {visitor.region}</div>
                        <div className="text-xs text-gray-400">{visitor.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 font-mono text-xs">{visitor.ipAddress}</td>
                  <td className="py-2 text-xs">{formatTime(visitor.createdAt)}</td>
                  <td className="py-2 text-xs">{formatTime(visitor.lastActivity)}</td>
                  <td className="py-2">
                    {visitor.walletAddress ? (
                      <div className="flex flex-col">
                        <span className="text-xs font-mono bg-green-900/30 text-green-400 px-2 py-1 rounded">
                          {visitor.walletAddress.slice(0, 6)}...{visitor.walletAddress.slice(-4)}
                        </span>
                        {visitor.walletType && (
                          <span className="text-xs text-gray-400 mt-1">{visitor.walletType}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Not connected</span>
                    )}
                  </td>
                  <td className="py-2">
                    <div className="flex flex-col">
                      <span className={`text-xs px-2 py-1 rounded mb-1 ${
                        visitor.isActive 
                          ? 'bg-green-900/30 text-green-400' 
                          : 'bg-gray-700/30 text-gray-400'
                      }`}>
                        {visitor.isActive ? 'Online' : 'Offline'}
                      </span>
                      {visitor.deviceType && visitor.deviceType !== 'unknown' && (
                        <span className="text-xs text-gray-400 capitalize">
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic by Country */}
        <div className="rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-green-400" />
            Traffic by Country (Last 7 Days)
          </h3>
          <div className="space-y-3">
            {analytics.trafficByCountry.slice(0, 8).map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getCountryFlag(country.countryCode)}</span>
                  <div>
                    <div className="font-medium">{country.country}</div>
                    <div className="text-xs text-gray-400">{country.uniqueVisitors} unique visitors</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{country.visits}</div>
                  <div className="text-xs text-gray-400">visits</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browser Statistics */}
        <div className="rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FaDesktop className="text-purple-400" />
            Browser Statistics (Last 7 Days)
          </h3>
          <div className="space-y-3">
            {analytics.browserStats.map((browser, index) => (
              <div key={browser.browser} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold">
                    {browser.browser.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{browser.browser}</div>
                    <div className="text-xs text-gray-400">{browser.uniqueVisitors} unique users</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{browser.visits}</div>
                  <div className="text-xs text-gray-400">visits</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="rounded-xl border border-gray-800 p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-400" />
          Top Pages (Last 7 Days)
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {analytics.topPages.map((page, index) => (
            <div key={page.page} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div>
                <div className="font-medium font-mono text-sm">{page.page || '/'}</div>
                <div className="text-xs text-gray-400">{page.uniqueVisitors} unique visitors</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{page.visits}</div>
                <div className="text-xs text-gray-400">visits</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Wallet Connection Statistics */}
        <div className="rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FaWallet className="text-green-400" />
            Wallet Connections (Last 7 Days)
          </h3>
          <div className="space-y-3">
            {analytics.walletConnectionsStats?.map((wallet, index) => (
              <div key={wallet.walletType} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
                    <FaWallet className="text-green-400 text-sm" />
                  </div>
                  <div>
                    <div className="font-medium">{wallet.walletType}</div>
                    <div className="text-xs text-gray-400">
                      {wallet.uniqueUsers} unique users • {wallet.countries} countries
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">{wallet.connections}</div>
                  <div className="text-xs text-gray-400">connections</div>
                </div>
              </div>
            )) || <div className="text-gray-400 text-center py-4">No wallet connection data</div>}
          </div>
        </div>

        {/* Device Statistics */}
        <div className="rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FaDesktop className="text-blue-400" />
            Device Statistics (Last 7 Days)
          </h3>
          <div className="space-y-3">
            {analytics.deviceStats?.map((device, index) => {
              const deviceIcon = device.deviceType === 'mobile' ? '📱' : 
                               device.deviceType === 'tablet' ? '📱' : '💻';
              return (
                <div key={device.deviceType} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{deviceIcon}</div>
                    <div>
                      <div className="font-medium capitalize">{device.deviceType}</div>
                      <div className="text-xs text-gray-400">{device.uniqueUsers} unique users</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-400">{device.visits}</div>
                    <div className="text-xs text-gray-400">visits</div>
                  </div>
                </div>
              );
            }) || <div className="text-gray-400 text-center py-4">No device data</div>}
          </div>
        </div>
      </div>

      {/* Hourly Traffic Pattern */}
      <div className="rounded-xl border border-gray-800 p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FaClock className="text-orange-400" />
          Hourly Traffic Pattern (Last 24 Hours)
        </h3>
        <div className="flex items-end gap-1 h-32">
          {analytics.hourlyTraffic.map((hour, index) => {
            const maxVisits = Math.max(...analytics.hourlyTraffic.map(h => h.visits));
            const height = maxVisits > 0 ? (hour.visits / maxVisits) * 100 : 0;
            
            return (
              <div key={hour.hour} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-400"
                  style={{ height: `${height}%`, minHeight: hour.visits > 0 ? '4px' : '0px' }}
                  title={`${hour.hour}:00 - ${hour.visits} visits`}
                ></div>
                <div className="text-xs text-gray-400 mt-1">{hour.hour}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">This Week</div>
          <div className="text-xl font-bold">{analytics.pageViews.thisWeek.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Page Views</div>
        </div>
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">This Month</div>
          <div className="text-xl font-bold">{analytics.pageViews.thisMonth.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Page Views</div>
        </div>
        <div className="rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm">Monthly Unique</div>
          <div className="text-xl font-bold">{analytics.uniqueVisitors.thisMonth.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Visitors</div>
        </div>
      </div>
    </div>
  );
}
