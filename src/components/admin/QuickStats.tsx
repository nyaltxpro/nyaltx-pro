'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Users } from 'lucide-react';
import { Card } from '@/components/reui/card';
import { IconTile } from '@/components/reui/icon-tile';
import { Button } from '@/components/reui/button';
import { Alert } from '@/components/reui/alert';

interface QuickStatsData {
  onlineUsers: number;
  today: { visitors: number; visits: number };
  yesterday: { visitors: number; visits: number };
  last7Days: { visitors: number; visits: number };
  last30Days: { visitors: number; visits: number };
  last365Days: { visitors: number; visits: number };
  total: { visitors: number; visits: number };
  dailyHits: Array<{ date: string; visitors: number; visits: number }>;
}

export default function QuickStats() {
  const [stats, setStats] = useState<QuickStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics/quick-stats');
      if (!response.ok) throw new Error('Failed to fetch quick stats');
      const data = await response.json();
      setStats(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) return <Card className="h-40 animate-pulse" />;
  if (error) {
    return (
      <Card className="p-6">
        <Alert variant="destructive" className="mb-4">
          Error: {error}
        </Alert>
        <Button onClick={fetchStats}>Retry</Button>
      </Card>
    );
  }
  if (!stats) return null;

  const rows: Array<[string, { visitors: number; visits: number }]> = [
    ['Today', stats.today],
    ['Yesterday', stats.yesterday],
    ['Last 7 Days', stats.last7Days],
    ['Last 30 Days', stats.last30Days],
    ['Last 365 Days', stats.last365Days],
  ];

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <IconTile tone="cyan" className="size-10">
            <Users className="size-4" aria-hidden="true" />
          </IconTile>
          <div>
            <h3 className="font-semibold text-white">Quick Stats</h3>
            <p className="text-xs text-slate-400">Real-time platform metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchStats}
            disabled={loading}
            title="Refresh stats"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </Button>
        </div>
      </div>
      {!isCollapsed && (
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-sm text-slate-300">Online users</span>
            <span className="text-2xl font-semibold tabular-nums text-white">
              {stats.onlineUsers.toLocaleString()}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 text-left font-medium">Period</th>
                  <th className="py-2 text-right font-medium">Visitors</th>
                  <th className="py-2 text-right font-medium">Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {rows.map(([label, values]) => (
                  <tr key={String(label)} className="transition-colors hover:bg-white/[0.025]">
                    <td className="py-3 text-slate-300">{label}</td>
                    <td className="text-right font-medium text-white">
                      {values.visitors.toLocaleString()}
                    </td>
                    <td className="text-right font-medium text-cyan-300">
                      {values.visits.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-white/10">
                  <td className="py-3 font-semibold text-white">Total</td>
                  <td className="text-right font-semibold text-white">
                    {stats.total.visitors.toLocaleString()}
                  </td>
                  <td className="text-right font-semibold text-cyan-300">
                    {stats.total.visits.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
