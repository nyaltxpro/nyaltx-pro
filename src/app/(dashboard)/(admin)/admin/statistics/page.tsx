'use client';

import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import QuickStats from '@/components/admin/QuickStats';

export default function AdminStatisticsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <QuickStats />
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
