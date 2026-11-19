'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/reui/card';
import { Button } from '@/components/reui/button';
import { Alert } from '@/components/reui/alert';

interface TrafficTrendsData {
  trends: Array<{ date: string; displayDate: string; visits: number; visitors: number }>;
  summary: { totalVisits: number; totalVisitors: number; avgVisitsPerDay: number; avgVisitorsPerDay: number };
}

export default function TrafficLineGraph() {
  const [data, setData] = useState<TrafficTrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/traffic-trends?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch traffic trends');
      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [days]);

  if (loading && !data) return <Card className="h-96 animate-pulse" />;
  if (error) {
    return (
      <Card className="p-6">
        <Alert variant="destructive" className="mb-4">Error: {error}</Alert>
        <Button onClick={fetchData}>Retry</Button>
      </Card>
    );
  }
  if (!data) return null;

  return (
    <Card className="p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
            <TrendingUp className="size-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Traffic Trends</h3>
            <p className="text-xs text-slate-400">Historical visitor and visit data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30, 60, 90].map(d => (
            <Button key={d} size="sm" variant={days === d ? 'default' : 'outline'} onClick={() => setDays(d)}>
              {d} Days
            </Button>
          ))}
          <Button size="icon" variant="ghost" onClick={fetchData} disabled={loading} title="Refresh data">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 border-b border-white/10 pb-5 md:grid-cols-4">
        {[
          ['Total Visits', data.summary.totalVisits],
          ['Total Visitors', data.summary.totalVisitors],
          ['Avg Visits/Day', data.summary.avgVisitsPerDay],
          ['Avg Visitors/Day', data.summary.avgVisitorsPerDay],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <div className="text-xl font-semibold text-white">{Number(value).toLocaleString()}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.trends}>
            <defs>
              <linearGradient id="trafficVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="trafficVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="displayDate" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 10 }} />
            <Area type="monotone" dataKey="visits" stroke="#22d3ee" fill="url(#trafficVisits)" strokeWidth={2} />
            <Area type="monotone" dataKey="visitors" stroke="#818cf8" fill="url(#trafficVisitors)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
