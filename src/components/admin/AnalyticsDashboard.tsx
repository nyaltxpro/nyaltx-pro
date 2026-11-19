'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Clock3, Eye, Globe2, MapPin, Monitor, Users, Wallet } from 'lucide-react';
import QuickStats from './QuickStats';
import TrafficLineGraph from './TrafficLineGraph';
import { Card } from '@/components/reui/card';
import { IconTile } from '@/components/reui/icon-tile';
import { Filters } from '@/components/reui/filters';
import { paginateItems, TablePagination } from '@/components/reui/table-pagination';
import { Alert } from '@/components/reui/alert';
import { Badge } from '@/components/reui/badge';
import { Button } from '@/components/reui/button';

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
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorSearch, setVisitorSearch] = useState('');

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

  const filteredVisitors = (analytics?.recentVisitors ?? []).filter(visitor => {
    const query = visitorSearch.trim().toLowerCase();
    return (
      !query ||
      [
        visitor.city,
        visitor.region,
        visitor.country,
        visitor.ipAddress,
        visitor.walletAddress ?? '',
        visitor.walletType ?? '',
        visitor.isActive ? 'active' : 'inactive',
      ].some(value => value.toLowerCase().includes(query))
    );
  });
  const paginatedVisitors = paginateItems(filteredVisitors, visitorPage, 10);

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-56 rounded bg-white/5"></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl border border-white/10 bg-white/[0.03]"></div>
            ))}
          </div>
          <div className="h-80 rounded-xl border border-white/10 bg-white/[0.03]"></div>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="text-center py-8">
        <Alert variant="destructive" className="mb-4">
          Error loading analytics: {error}
        </Alert>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="admin-panel-analytics space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
            <BarChart3 className="size-5 text-cyan-300" aria-hidden="true" />
            Platform Statistics
          </h1>
          <p className="mt-1 text-sm text-slate-400">Real-time analytics and user insights</p>
        </div>
        <Badge variant="outline" size="sm" className="text-slate-400">
          Updated {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          Analytics refresh failed: {error}. Showing the most recently loaded data.
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Online Users',
            value: analytics.onlineUsers,
            caption: 'Currently active',
            tone: 'emerald' as const,
            icon: Users,
          },
          {
            title: 'Page Views Today',
            value: analytics.pageViews.today,
            caption: 'Daily traffic',
            tone: 'cyan' as const,
            icon: Eye,
          },
          {
            title: 'Unique Visitors Today',
            value: analytics.uniqueVisitors.today,
            caption: 'Daily unique users',
            tone: 'violet' as const,
            icon: Globe2,
          },
          {
            title: 'Wallet Connections',
            value: analytics.walletConnections,
            caption: 'Total connections',
            tone: 'amber' as const,
            icon: Wallet,
          },
        ].map(metric => {
          const MetricIcon = metric.icon;
          return (
            <Card key={metric.title} className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-slate-400 text-sm font-medium">{metric.title}</h3>
                <IconTile tone={metric.tone} className="size-9">
                  <MetricIcon className="size-4" aria-hidden="true" />
                </IconTile>
              </div>
              <div className="mt-5 space-y-2.5">
                <div className="text-2xl font-medium tracking-tight tabular-nums text-white">
                  {metric.value}
                </div>
                <div className="h-px bg-white/10" />
                <div className="text-xs text-slate-500">{metric.caption}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Visitors */}
      <div className="admin-panel-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <IconTile tone="cyan" className="size-9">
              <Clock3 className="size-4" aria-hidden="true" />
            </IconTile>
            <div>
              <h2 className="font-semibold text-white">Recent Visitors</h2>
              <p className="text-xs text-slate-500">Visitor activity by selected period</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['1', '1 Day'],
                ['7', '7 Days'],
                ['30', '1 Month'],
              ] as const
            ).map(([range, label]) => (
              <Button
                key={range}
                size="sm"
                variant={visitorRange === range ? 'secondary' : 'outline'}
                onClick={() => setVisitorRange(range)}
                disabled={loading}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <Filters
          className="admin-panel-analytics-filters"
          activeFilters={
            visitorSearch.trim()
              ? [
                  {
                    id: 'visitor-search',
                    label: `Search: ${visitorSearch}`,
                    onRemove: () => setVisitorSearch(''),
                  },
                ]
              : []
          }
        >
          <input
            type="search"
            value={visitorSearch}
            onChange={event => setVisitorSearch(event.target.value)}
            placeholder="Search location, IP, or wallet..."
            aria-label="Search recent visitors"
            className="h-9 w-full max-w-md rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/10"
          />
        </Filters>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.03]">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-medium uppercase tracking-wide text-slate-500">
                  Location
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-medium uppercase tracking-wide text-slate-500">
                  IP Address
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-medium uppercase tracking-wide text-slate-500">
                  First Visit
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-medium uppercase tracking-wide text-slate-500">
                  Last Activity
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-medium uppercase tracking-wide text-slate-500">
                  Wallet
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-medium uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {paginatedVisitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    No recent visitors match the current search.
                  </td>
                </tr>
              ) : (
                paginatedVisitors.map(visitor => (
                  <tr key={visitor.sessionId} className="transition-colors hover:bg-white/[0.025]">
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {getCountryFlag(
                            visitor.country === 'Unknown'
                              ? 'UN'
                              : visitor.country.slice(0, 2).toUpperCase()
                          )}
                        </span>
                        <div>
                          <div className="font-medium text-white">
                            {visitor.city}, {visitor.region}
                          </div>
                          <div className="text-slate-500">{visitor.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <code className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-slate-300">
                        {visitor.ipAddress}
                      </code>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle text-slate-400">
                      <span>{formatTime(visitor.createdAt)}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle text-slate-400">
                      <span>{formatTime(visitor.lastActivity)}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {visitor.walletAddress ? (
                        <div className="flex flex-col gap-1">
                          <code className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-slate-300">
                            {visitor.walletAddress.slice(0, 6)}...{visitor.walletAddress.slice(-4)}
                          </code>
                          {visitor.walletType && (
                            <Badge variant="info-light" size="xs" className="w-fit">
                              {visitor.walletType}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary" size="xs">
                          Not connected
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={visitor.isActive ? 'success-light' : 'secondary'}
                          size="xs"
                          className="w-fit"
                        >
                          {visitor.isActive ? 'Online' : 'Offline'}
                        </Badge>
                        {visitor.deviceType && visitor.deviceType !== 'unknown' && (
                          <span className="flex items-center gap-1 text-[11px] capitalize text-slate-500">
                            {visitor.deviceType === 'mobile'
                              ? '📱'
                              : visitor.deviceType === 'tablet'
                                ? '📱'
                                : '💻'}{' '}
                            {visitor.deviceType}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={visitorPage}
          pageSize={10}
          total={filteredVisitors.length}
          onPageChange={setVisitorPage}
        />
      </div>
      <QuickStats />
      <TrafficLineGraph />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Traffic by Country */}
        <div className="admin-panel-card overflow-hidden">
          <div className="border-b border-white/10 px-4 py-4 sm:px-5">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <MapPin className="size-4 text-slate-400" aria-hidden="true" />
              Traffic by Country (Last 7 Days)
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            <div className="space-y-4">
              {analytics.trafficByCountry.slice(0, 8).map(country => (
                <div
                  key={country.country}
                  className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getCountryFlag(country.countryCode)}</span>
                    <div>
                      <div className="font-medium text-white">{country.country}</div>
                      <div className="text-xs text-gray-400">
                        {country.uniqueVisitors} unique visitors
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums text-white">{country.visits}</div>
                    <div className="text-xs text-gray-400">visits</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Browser Statistics */}
        <div className="admin-panel-card overflow-hidden">
          <div className="border-b border-white/10 px-4 py-4 sm:px-5">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <Monitor className="size-4 text-slate-400" aria-hidden="true" />
              Browser Statistics (Last 7 Days)
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            <div className="space-y-4">
              {analytics.browserStats.map(browser => (
                <div
                  key={browser.browser}
                  className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <IconTile tone="violet" className="size-9">
                      <span className="text-sm font-bold">{browser.browser.charAt(0)}</span>
                    </IconTile>
                    <div>
                      <div className="font-medium text-white">{browser.browser}</div>
                      <div className="text-xs text-gray-400">
                        {browser.uniqueVisitors} unique users
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums text-white">{browser.visits}</div>
                    <div className="text-xs text-gray-400">visits</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Cities */}
      <div className="admin-panel-card overflow-hidden">
        <div className="border-b border-white/10 px-4 py-4 sm:px-5">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <MapPin className="size-4 text-slate-400" aria-hidden="true" />
            Top Cities (Last 7 Days)
          </h3>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.topCities?.length ? (
              analytics.topCities.map((city, index) => (
                <div
                  key={`${city.city}-${city.country}`}
                  className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl">{getCountryFlag(city.countryCode)}</span>
                      <span className="text-xs text-gray-500 mt-1">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{city.city}</div>
                      <div className="text-xs text-gray-400">{city.country}</div>
                      <div className="text-xs text-gray-500">
                        {city.uniqueVisitors} unique visitors
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums text-white">{city.visits}</div>
                    <div className="text-xs text-gray-400">visits</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 font-medium">No city data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="admin-panel-card overflow-hidden">
        <div className="border-b border-white/10 px-4 py-4 sm:px-5">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <BarChart3 className="size-4 text-slate-400" aria-hidden="true" />
            Top Pages (Last 7 Days)
          </h3>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {analytics.topPages.map(page => (
              <div
                key={page.page}
                className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
              >
                <div>
                  <div className="font-mono text-sm text-slate-200">{page.page || '/'}</div>
                  <div className="text-xs text-gray-400">{page.uniqueVisitors} unique visitors</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums text-white">{page.visits}</div>
                  <div className="text-xs text-gray-400">visits</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Wallet Connection Statistics */}
        <div className="admin-panel-card overflow-hidden">
          <div className="border-b border-white/10 px-4 py-4 sm:px-5">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <Wallet className="size-4 text-slate-400" aria-hidden="true" />
              Wallet Connections (Last 7 Days)
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            <div className="space-y-4">
              {analytics.walletConnectionsStats?.length ? (
                analytics.walletConnectionsStats.map(wallet => (
                  <div
                    key={wallet.walletType}
                    className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <IconTile tone="emerald" className="size-10">
                        <Wallet className="size-4" aria-hidden="true" />
                      </IconTile>
                      <div>
                        <div className="font-medium text-white">{wallet.walletType}</div>
                        <div className="text-xs text-gray-400">
                          {wallet.uniqueUsers} unique users • {wallet.countries} countries
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold tabular-nums text-white">
                        {wallet.connections}
                      </div>
                      <div className="text-xs text-gray-400">connections</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 font-medium">No wallet connection data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Device Statistics */}
        <div className="admin-panel-card overflow-hidden">
          <div className="border-b border-white/10 px-4 py-4 sm:px-5">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <Monitor className="size-4 text-slate-400" aria-hidden="true" />
              Device Statistics (Last 7 Days)
            </h3>
          </div>
          <div className="p-4 sm:p-5">
            <div className="space-y-4">
              {analytics.deviceStats?.length ? (
                analytics.deviceStats.map(device => {
                  return (
                    <div
                      key={device.deviceType}
                      className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <IconTile tone="cyan" className="size-10">
                          <Monitor className="size-4" aria-hidden="true" />
                        </IconTile>
                        <div>
                          <div className="font-medium text-white capitalize">
                            {device.deviceType}
                          </div>
                          <div className="text-xs text-gray-400">
                            {device.uniqueUsers} unique users
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold tabular-nums text-white">{device.visits}</div>
                        <div className="text-xs text-gray-400">visits</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Monitor className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 font-medium">No device data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Traffic Pattern */}
      <div className="admin-panel-card overflow-hidden">
        <div className="border-b border-white/10 px-4 py-4 sm:px-5">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <Clock3 className="size-4 text-slate-400" aria-hidden="true" />
            Hourly Traffic Pattern (Last 24 Hours)
          </h3>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-end gap-1 h-32 bg-gray-700/20 rounded-lg p-4">
            {analytics.hourlyTraffic.map(hour => {
              const maxVisits = Math.max(0, ...analytics.hourlyTraffic.map(h => h.visits));
              const height = maxVisits > 0 ? (hour.visits / maxVisits) * 100 : 0;

              return (
                <div key={hour.hour} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t bg-cyan-400/80 transition-colors hover:bg-cyan-300"
                    style={{ height: `${height}%`, minHeight: hour.visits > 0 ? '4px' : '0px' }}
                    title={`${hour.hour}:00 - ${hour.visits} visits`}
                  ></div>
                  <div className="text-xs text-gray-400 mt-2">{hour.hour}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="admin-panel-card p-5">
          <div className="flex items-center justify-between mb-4">
            <IconTile tone="cyan" className="size-10">
              <Eye className="size-4" aria-hidden="true" />
            </IconTile>
            <div className="text-right">
              <div className="text-2xl font-semibold tabular-nums text-white">
                {analytics.pageViews.thisWeek.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300">This Week</div>
            <div className="text-xs text-gray-400">Page Views</div>
          </div>
        </div>

        <div className="admin-panel-card p-5">
          <div className="flex items-center justify-between mb-4">
            <IconTile tone="violet" className="size-10">
              <Eye className="size-4" aria-hidden="true" />
            </IconTile>
            <div className="text-right">
              <div className="text-2xl font-semibold tabular-nums text-white">
                {analytics.pageViews.thisMonth.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300">This Month</div>
            <div className="text-xs text-gray-400">Page Views</div>
          </div>
        </div>

        <div className="admin-panel-card p-5">
          <div className="flex items-center justify-between mb-4">
            <IconTile tone="emerald" className="size-10">
              <Users className="size-4" aria-hidden="true" />
            </IconTile>
            <div className="text-right">
              <div className="text-2xl font-semibold tabular-nums text-white">
                {analytics.uniqueVisitors.thisMonth.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-300">Monthly Unique</div>
            <div className="text-xs text-gray-400">Visitors</div>
          </div>
        </div>
      </div>
    </div>
  );
}
