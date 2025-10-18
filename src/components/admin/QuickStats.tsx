'use client';

import { useEffect, useState } from 'react';
import { FaUsers, FaChevronUp, FaChevronDown, FaSyncAlt } from 'react-icons/fa';

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
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-32"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-lg border border-red-700/20 rounded-xl shadow-xl p-6">
        <div className="text-red-400 mb-4">Error: {error}</div>
        <button 
          onClick={fetchStats} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate max value for chart scaling
  const maxValue = Math.max(
    ...stats.dailyHits.map(d => Math.max(d.visitors, d.visits)),
    1
  );

  return (
    <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <FaUsers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Quick Stats
            </h3>
            <p className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Real-time platform metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all duration-200"
            title="Refresh stats"
          >
            <FaSyncAlt className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all duration-200"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <FaChevronDown className="w-4 h-4" /> : <FaChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-6 space-y-6">
          {/* Online Users */}
          <div className="flex items-center justify-between py-3 border-b border-gray-700/20">
            <span className="text-gray-300 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Online Users:
            </span>
            <span className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {stats.onlineUsers.toLocaleString()}
            </span>
          </div>

          {/* Stats Table */}
          <div className="space-y-3">
            {/* Header Row */}
            <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-700/30">
              <div className="text-sm font-semibold text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Period
              </div>
              <div className="text-sm font-semibold text-gray-400 text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Visitors
              </div>
              <div className="text-sm font-semibold text-gray-400 text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Visits
              </div>
            </div>

            {/* Today */}
            <div className="grid grid-cols-3 gap-4 py-2 hover:bg-gray-700/20 rounded-lg px-3 transition-colors">
              <div className="text-gray-300 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Today:
              </div>
              <div className="text-cyan-400 font-bold text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stats.today.visitors.toLocaleString()}
              </div>
              <div className="text-cyan-400 font-bold text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stats.today.visits.toLocaleString()}
              </div>
            </div>

            {/* Yesterday */}
            <div className="grid grid-cols-3 gap-4 py-2 hover:bg-gray-700/20 rounded-lg px-3 transition-colors">
              <div className="text-gray-300 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Yesterday:
              </div>
              <div className="text-blue-400 font-bold text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stats.yesterday.visitors.toLocaleString()}
              </div>
              <div className="text-blue-400 font-bold text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stats.yesterday.visits.toLocaleString()}
              </div>
            </div>

            {/* Last 7 Days */}
            <div className="grid grid-cols-3 gap-4 py-2 hover:bg-gray-700/20 rounded-lg px-3 transition-colors">
              <div className="text-gray-300 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Last 7 Days (Week):
              </div>
              <div className="text-purple-400 font-bold text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stats.last7Days.visitors.toLocaleString()}
              </div>
              <div className="text-purple-400 font-bold text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stats.last7Days.visits.toLocaleString()}
              </div>
            </div>

            {/* Last 30 Days */}
            <div className="grid grid-cols-3 gap-4 py-2 hover:bg-gray-700/20 rounded-lg px-3 transition-colors">
              <div className="text-gray-300 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Last 30 Days (Month):
              </div>
              <div className="text-orange-400 font-bold text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stats.last30Days.visitors.toLocaleString()}
              </div>
              <div className="text-orange-400 font-bold text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stats.last30Days.visits.toLocaleString()}
              </div>
            </div>

            {/* Last 365 Days */}
            <div className="grid grid-cols-3 gap-4 py-2 hover:bg-gray-700/20 rounded-lg px-3 transition-colors">
              <div className="text-gray-300 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Last 365 Days (Year):
              </div>
              <div className="text-green-400 font-bold text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stats.last365Days.visitors.toLocaleString()}
              </div>
              <div className="text-green-400 font-bold text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stats.last365Days.visits.toLocaleString()}
              </div>
            </div>

            {/* Total */}
            <div className="grid grid-cols-3 gap-4 py-3 bg-gray-700/30 rounded-lg px-3 border-t border-gray-700/30 mt-2">
              <div className="text-white font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Total:
              </div>
              <div className="text-white font-bold text-right text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stats.total.visitors.toLocaleString()}
              </div>
              <div className="text-white font-bold text-right text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stats.total.visits.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Chart: Hits in the last 10 days */}
          <div className="mt-6 pt-6 border-t border-gray-700/20">
            <h4 className="text-sm font-semibold text-gray-300 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Hits in the last 10 days
            </h4>
            
            <div className="bg-gray-700/20 rounded-lg p-4">
              <div className="flex items-end justify-between gap-1 h-32">
                {stats.dailyHits.map((day, index) => {
                  const visitorHeight = (day.visitors / maxValue) * 100;
                  const visitHeight = (day.visits / maxValue) * 100;
                  const dayLabel = new Date(day.date).getDate();
                  
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center gap-1 flex-1 justify-end">
                        {/* Visits bar (blue) */}
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-400 hover:to-blue-300"
                          style={{ 
                            height: `${visitHeight}%`,
                            minHeight: day.visits > 0 ? '4px' : '0px'
                          }}
                          title={`${day.date}\nVisits: ${day.visits.toLocaleString()}`}
                        ></div>
                        {/* Visitors bar (red/pink) */}
                        <div 
                          className="w-full bg-gradient-to-t from-pink-500 to-pink-400 rounded-t transition-all duration-300 hover:from-pink-400 hover:to-pink-300"
                          style={{ 
                            height: `${visitorHeight}%`,
                            minHeight: day.visitors > 0 ? '4px' : '0px'
                          }}
                          title={`${day.date}\nVisitors: ${day.visitors.toLocaleString()}`}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {dayLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-700/30">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded"></div>
                  <span className="text-xs text-gray-300" style={{ fontFamily: 'Poppins, sans-serif' }}>Visits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-t from-pink-500 to-pink-400 rounded"></div>
                  <span className="text-xs text-gray-300" style={{ fontFamily: 'Poppins, sans-serif' }}>Visitors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
