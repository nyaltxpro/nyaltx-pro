'use client';

import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

export default function AdminStatisticsPage() {
  return (
    <div className="min-h-screen p-6 [font-family:var(--font-poppins),ui-sans-serif,system-ui,sans-serif]">
      <div className="max-w-7xl mx-auto space-y-6">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
