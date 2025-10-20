'use client';

import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import QuickStats from '@/components/admin/QuickStats';
import TrafficLineGraph from '@/components/admin/TrafficLineGraph';

export default function AdminStatisticsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <QuickStats />
        <TrafficLineGraph />
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
