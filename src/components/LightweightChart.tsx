'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi, 
  CandlestickData, 
  Time, 
  UTCTimestamp, 
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries
} from 'lightweight-charts';
import { FaChartLine, FaClock, FaExpand, FaCompress, FaChartBar, FaRulerHorizontal, FaSearchPlus, FaSearchMinus, FaCrosshairs, FaArrowsAlt, FaDrawPolygon, FaMinus, FaPencilAlt, FaFont, FaSmile, FaEraser, FaPlus, FaCog, FaHome, FaTh } from 'react-icons/fa';
import { generateRealisticChartData, calculateSMA, getChartStats, ChartDataPoint } from '@/utils/chartDataGenerator';

interface LightweightChartProps {
  tokenSymbol?: string;
  width?: string;
  height?: string;
  className?: string;
  priceData?: CandlestickData<Time>[];
}

const LightweightChart: React.FC<LightweightChartProps> = ({
  tokenSymbol = 'TOKEN',
  width = '100%',
  height = '500px',
  className = '',
  priceData,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M'>('1M');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [showVolume, setShowVolume] = useState(true);
  const [showSMA, setShowSMA] = useState(true);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Generate or use provided data
  useEffect(() => {
    if (priceData && priceData.length > 0) {
      // Convert provided data to ChartDataPoint format
      const converted: ChartDataPoint[] = (priceData as CandlestickData<UTCTimestamp>[]).map(candle => ({
        candlestick: candle,
        volume: {
          time: candle.time,
          value: 1000000 + Math.random() * 5000000,
          color: candle.close >= candle.open ? '#22c55e66' : '#ef444466',
        },
      }));
      setChartData(converted);
    } else {
      // Generate dummy data based on timeframe
      const daysMap = { '1D': 1, '1W': 7, '1M': 30, '3M': 90 };
      const days = daysMap[timeframe];
      const data = generateRealisticChartData(days, 100, true);
      setChartData(data);
    }
  }, [timeframe, priceData]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    // Extract candlestick and volume data
    const candlestickData = chartData.map(d => d.candlestick);
    const volumeData = chartData.map(d => d.volume);

    // Create chart (account for sidebar width) - DexScreener colors
    const containerWidth = chartContainerRef.current.clientWidth;
    const containerHeight = chartContainerRef.current.clientHeight;
    const chart = createChart(chartContainerRef.current, {
      width: containerWidth,
      height: containerHeight,
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#787b86',
      },
      grid: {
        vertLines: { color: '#1e222d' },
        horzLines: { color: '#1e222d' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#758696',
          width: 1,
          style: 2,
          labelBackgroundColor: '#363c4e',
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: 2,
          labelBackgroundColor: '#363c4e',
        },
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.3 : 0.1,
        },
      },
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series using v5.x API - DexScreener colors
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    seriesRef.current = candlestickSeries as any;
    candlestickSeries.setData(candlestickData);

    // Add volume series if enabled
    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
      volumeSeriesRef.current = volumeSeries as any;
      volumeSeries.setData(volumeData);
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });
    }

    // Add SMA if enabled
    if (showSMA && candlestickData.length > 20) {
      const smaData = calculateSMA(candlestickData, 20);
      const smaSeries = chart.addSeries(LineSeries, {
        color: '#2196F3',
        lineWidth: 2,
      });
      smaSeriesRef.current = smaSeries as any;
      smaSeries.setData(smaData);
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize - autoSize will handle this automatically
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [chartData, height, showVolume, showSMA]);

  const toggleFullscreen = () => {
    if (!chartContainerRef.current) return;

    if (!isFullscreen) {
      chartContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleTimeframeChange = (newTimeframe: '1D' | '1W' | '1M' | '3M') => {
    setTimeframe(newTimeframe);
  };

  // Calculate price change
  const priceChange = chartData.length >= 2 
    ? ((chartData[chartData.length - 1].candlestick.close - chartData[0].candlestick.open) / chartData[0].candlestick.open) * 100
    : 0;

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].candlestick.close : 0;

  const handleZoomIn = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      timeScale.scrollToPosition(5, true);
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      timeScale.scrollToPosition(-5, true);
    }
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  return (
    <div className={`relative ${className} bg-[#131722] flex flex-col overflow-hidden`} style={{ height: height || '100%' }}>
      {/* Top Control Bar */}
      <div className="bg-[#1e222d] border-b border-[#2a2e39] px-3 py-2 flex items-center justify-between flex-shrink-0">
        {/* Left Section - Timeframes */}
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-[#2a2e39] rounded text-gray-400">
            <FaPlus size={14} />
          </button>
          {(['1s', '1m', '5m', '15m', '1h', '4h', 'D'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                if (tf === '1s' || tf === '1m') setTimeframe('1D');
                else if (tf === '5m' || tf === '15m') setTimeframe('1W');
                else if (tf === '1h') setTimeframe('1M');
                else setTimeframe('3M');
              }}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                (tf === '15m') ? 'text-[#2962ff]' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Center Section - Chart Type */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-[#2a2e39] rounded text-gray-400">
            <FaChartLine size={16} />
          </button>
          <button className="p-1.5 hover:bg-[#2a2e39] rounded text-[#2962ff]">
            <FaChartBar size={16} />
          </button>
          <button className="p-1.5 hover:bg-[#2a2e39] rounded text-gray-400">
            <FaTh size={14} />
          </button>
        </div>

        {/* Right Section - Price/MCap & Currency */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#2962ff] font-medium">Price</span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-400">MCap</span>
          </div>
          <span className="text-[#2962ff] text-sm font-medium">USD</span>
        </div>
      </div>

      {/* Token Info Banner */}
      <div className="bg-[#131722] border-b border-[#2a2e39] px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-base font-medium mb-1">
              {tokenSymbol}/WBNB on PancakeSwap · 15 · dexscreener.com
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-400">O</span>
              <span className={priceChange >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}>
                {currentPrice.toFixed(currentPrice < 0.01 ? 8 : 4)}
              </span>
              <span className="text-gray-400">H</span>
              <span className={priceChange >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}>
                {currentPrice.toFixed(currentPrice < 0.01 ? 8 : 4)}
              </span>
              <span className="text-gray-400">L</span>
              <span className={priceChange >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}>
                {(currentPrice * 0.98).toFixed(currentPrice < 0.01 ? 8 : 4)}
              </span>
              <span className="text-gray-400">C</span>
              <span className={priceChange >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}>
                {currentPrice.toFixed(currentPrice < 0.01 ? 8 : 4)}
              </span>
              <span className={priceChange >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(4)} ({priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%)
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Volume 2</div>
          </div>
          <div className="text-right">
            <div className="text-lg text-gray-400">
              {currentPrice.toFixed(currentPrice < 0.01 ? 8 : 4)}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container with Sidebar */}
      <div className="flex bg-[#131722] flex-1 min-h-0">
        {/* Chart Tools Sidebar */}
        <div className="w-14 bg-[#1e222d] border-r border-[#2a2e39] flex flex-col items-center py-4 gap-1.5 overflow-y-auto flex-shrink-0">
          {/* Crosshair */}
          <button
            onClick={() => setActiveTool(activeTool === 'crosshair' ? null : 'crosshair')}
            className={`p-2.5 rounded transition-colors hover:bg-[#2a2e39] ${
              activeTool === 'crosshair' ? 'bg-[#2a2e39] text-white' : 'text-gray-400'
            }`}
            title="Crosshair"
          >
            <FaCrosshairs size={18} />
          </button>
          
          {/* Trend Line */}
          <button
            onClick={() => setActiveTool(activeTool === 'trendline' ? null : 'trendline')}
            className={`p-2.5 rounded transition-colors hover:bg-[#2a2e39] ${
              activeTool === 'trendline' ? 'bg-[#2a2e39] text-white' : 'text-gray-400'
            }`}
            title="Trend Line"
          >
            <FaDrawPolygon size={18} />
          </button>
          
          {/* Horizontal Line */}
          <button
            onClick={() => setActiveTool(activeTool === 'hline' ? null : 'hline')}
            className={`p-2.5 rounded transition-colors hover:bg-[#2a2e39] ${
              activeTool === 'hline' ? 'bg-[#2a2e39] text-white' : 'text-gray-400'
            }`}
            title="Horizontal Line"
          >
            <FaMinus size={18} />
          </button>
          
          {/* Pattern Tool */}
          <button
            onClick={() => setActiveTool(activeTool === 'pattern' ? null : 'pattern')}
            className={`p-2.5 rounded transition-colors hover:bg-[#2a2e39] ${
              activeTool === 'pattern' ? 'bg-[#2a2e39] text-white' : 'text-gray-400'
            }`}
            title="Pattern Tool"
          >
            <FaRulerHorizontal size={18} />
          </button>
          
          {/* Drawing Tools */}
          <button
            onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')}
            className={`p-2.5 rounded transition-colors hover:bg-[#2a2e39] ${
              activeTool === 'draw' ? 'bg-[#2a2e39] text-white' : 'text-gray-400'
            }`}
            title="Draw"
          >
            <FaPencilAlt size={18} />
          </button>
          
          {/* Text Tool */}
          <button
            onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
            className={`p-2.5 rounded transition-colors hover:bg-[#2a2e39] ${
              activeTool === 'text' ? 'bg-[#2a2e39] text-white' : 'text-gray-400'
            }`}
            title="Text"
          >
            <FaFont size={18} />
          </button>
          
          {/* Emoji */}
          <button
            onClick={() => setActiveTool(activeTool === 'emoji' ? null : 'emoji')}
            className={`p-2.5 rounded transition-colors hover:bg-[#2a2e39] ${
              activeTool === 'emoji' ? 'bg-[#2a2e39] text-white' : 'text-gray-400'
            }`}
            title="Emoji"
          >
            <FaSmile size={18} />
          </button>
          
          {/* Eraser */}
          <button
            onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
            className={`p-2.5 rounded transition-colors hover:bg-[#2a2e39] ${
              activeTool === 'eraser' ? 'bg-[#2a2e39] text-white' : 'text-gray-400'
            }`}
            title="Eraser"
          >
            <FaEraser size={18} />
          </button>
          
          {/* Add */}
          <button
            className="p-2.5 rounded transition-colors hover:bg-[#2a2e39] text-gray-400"
            title="Add"
          >
            <FaPlus size={18} />
          </button>
          
          <div className="flex-1"></div>
          
          {/* Settings */}
          <button
            className="p-2.5 rounded transition-colors hover:bg-[#2a2e39] text-gray-400"
            title="Settings"
          >
            <FaCog size={18} />
          </button>
        </div>

        {/* Chart Area */}
        <div 
          ref={chartContainerRef}
          className="flex-1 relative overflow-hidden"
        >
          {chartData.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FaChartLine className="text-gray-600 text-5xl mx-auto mb-4" />
                <p className="text-gray-400">Loading chart data...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="bg-[#1e222d] border-t border-[#2a2e39] px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        {/* Time Period Options */}
        <div className="flex items-center gap-2">
          {(['5y', '1y', '6m', '3m', '1m', '5d', '1d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => {
                if (period === '1d' || period === '5d') setTimeframe('1D');
                else if (period === '1m') setTimeframe('1W');
                else if (period === '3m') setTimeframe('1M');
                else setTimeframe('3M');
              }}
              className="px-2.5 py-1 text-xs rounded transition-colors text-gray-400 hover:text-gray-300 hover:bg-[#2a2e39]"
            >
              {period}
            </button>
          ))}
          <button className="p-1.5 rounded hover:bg-[#2a2e39] text-gray-400">
            <FaClock size={14} />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>06:58:35 (UTC+5)</span>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 rounded hover:bg-[#2a2e39]">%</button>
            <button className="px-2 py-1 rounded hover:bg-[#2a2e39]">log</button>
            <button className="px-2 py-1 rounded text-[#2962ff]">auto</button>
          </div>
        </div>
      </div>

      {!priceData && (
        <div className="text-center py-2 text-xs text-yellow-500">
          ⚠️ Demo data - Real-time data unavailable
        </div>
      )}
    </div>
  );
};

export default LightweightChart;
