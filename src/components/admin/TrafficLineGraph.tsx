'use client';

import { useEffect, useState, useRef } from 'react';
import { FaChartLine, FaCalendarAlt, FaSyncAlt } from 'react-icons/fa';

interface TrendData {
  date: string;
  displayDate: string;
  visits: number;
  visitors: number;
}

interface TrafficTrendsData {
  trends: TrendData[];
  summary: {
    totalVisits: number;
    totalVisitors: number;
    avgVisitsPerDay: number;
    avgVisitorsPerDay: number;
  };
}

export default function TrafficLineGraph() {
  const [data, setData] = useState<TrafficTrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  useEffect(() => {
    fetchData();
  }, [days]);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.trends.length === 0) return;

    // Find max values
    const maxVisits = Math.max(...data.trends.map(d => d.visits), 1);
    const maxVisitors = Math.max(...data.trends.map(d => d.visitors), 1);
    const maxValue = Math.max(maxVisits, maxVisitors);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const value = Math.round(maxValue - (maxValue / gridLines) * i);
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '12px Poppins, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value.toString(), padding.left - 10, y + 4);
    }

    // Helper function to get point coordinates
    const getPoint = (index: number, value: number) => {
      const x = padding.left + (chartWidth / (data.trends.length - 1)) * index;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      return { x, y };
    };

    // Draw area gradient for visits (blue)
    const visitsGradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    visitsGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    visitsGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');

    ctx.fillStyle = visitsGradient;
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    data.trends.forEach((trend, index) => {
      const point = getPoint(index, trend.visits);
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.closePath();
    ctx.fill();

    // Draw area gradient for visitors (pink)
    const visitorsGradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    visitorsGradient.addColorStop(0, 'rgba(236, 72, 153, 0.3)');
    visitorsGradient.addColorStop(1, 'rgba(236, 72, 153, 0.05)');

    ctx.fillStyle = visitorsGradient;
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    data.trends.forEach((trend, index) => {
      const point = getPoint(index, trend.visitors);
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.closePath();
    ctx.fill();

    // Draw visits line
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.trends.forEach((trend, index) => {
      const point = getPoint(index, trend.visits);
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // Draw visitors line
    ctx.strokeStyle = '#EC4899';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.trends.forEach((trend, index) => {
      const point = getPoint(index, trend.visitors);
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // Draw points on hover
    if (hoveredIndex !== null && hoveredIndex < data.trends.length) {
      const trend = data.trends[hoveredIndex];
      
      // Visits point
      const visitsPoint = getPoint(hoveredIndex, trend.visits);
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(visitsPoint.x, visitsPoint.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Visitors point
      const visitorsPoint = getPoint(hoveredIndex, trend.visitors);
      ctx.fillStyle = '#EC4899';
      ctx.beginPath();
      ctx.arc(visitorsPoint.x, visitorsPoint.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vertical line
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(visitsPoint.x, padding.top);
      ctx.lineTo(visitsPoint.x, height - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // X-axis labels (show every few labels to avoid crowding)
    const labelInterval = Math.ceil(data.trends.length / 8);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px Poppins, sans-serif';
    ctx.textAlign = 'center';
    data.trends.forEach((trend, index) => {
      if (index % labelInterval === 0 || index === data.trends.length - 1) {
        const point = getPoint(index, 0);
        ctx.fillText(trend.displayDate, point.x, height - padding.bottom + 20);
      }
    });
  }, [data, hoveredIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!data || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 60, right: 20 };
    const chartWidth = rect.width - padding.left - padding.right;
    
    if (x < padding.left || x > rect.width - padding.right) {
      setHoveredIndex(null);
      return;
    }

    const relativeX = x - padding.left;
    const index = Math.round((relativeX / chartWidth) * (data.trends.length - 1));
    setHoveredIndex(Math.max(0, Math.min(index, data.trends.length - 1)));
  };

  if (loading && !data) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-48"></div>
          <div className="h-80 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-lg border border-red-700/20 rounded-xl shadow-xl p-6">
        <div className="text-red-400 mb-4">Error: {error}</div>
        <button 
          onClick={fetchData} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const hoveredData = hoveredIndex !== null && hoveredIndex < data.trends.length 
    ? data.trends[hoveredIndex] 
    : null;

  return (
    <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FaChartLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Traffic Trends
              </h3>
              <p className="text-xs text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Historical visitor and visit data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all duration-200"
              title="Refresh data"
            >
              <FaSyncAlt className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Time period selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {[7, 14, 30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                days === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-700/20">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {data.summary.totalVisits.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Total Visits
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {data.summary.totalVisitors.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Total Visitors
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {data.summary.avgVisitsPerDay.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Avg Visits/Day
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {data.summary.avgVisitorsPerDay.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Avg Visitors/Day
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="p-6">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-80 cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
          />
          
          {/* Tooltip */}
          {hoveredData && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/95 border border-gray-700 rounded-lg px-4 py-3 shadow-xl pointer-events-none">
              <div className="text-xs text-gray-400 mb-2 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <FaCalendarAlt className="w-3 h-3" />
                {hoveredData.date}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm text-white font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Visits: {hoveredData.visits.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-500 rounded"></div>
                  <span className="text-sm text-white font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Visitors: {hoveredData.visitors.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-700/30">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-300" style={{ fontFamily: 'Poppins, sans-serif' }}>Visits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500 rounded"></div>
            <span className="text-sm text-gray-300" style={{ fontFamily: 'Poppins, sans-serif' }}>Visitors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
