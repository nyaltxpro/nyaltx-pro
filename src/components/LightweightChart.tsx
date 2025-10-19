'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  LineSeries,
  PriceScaleMode,
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
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M'>('1M');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [showVolume, setShowVolume] = useState(true);
  const [showSMA, setShowSMA] = useState(true);
  const [smaPeriod, setSmaPeriod] = useState<number>(20);
  const [showEMA, setShowEMA] = useState(false);
  const [emaPeriod, setEmaPeriod] = useState<number>(50);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
  const [priceScaleMode, setPriceScaleMode] = useState<PriceScaleMode>(PriceScaleMode.Normal);
  const [autoScaleActive, setAutoScaleActive] = useState<boolean>(true);
  const [nowText, setNowText] = useState<string>('');

  type Drawing =
    | { id: string; type: 'hline'; price: number; color: string }
    | { id: string; type: 'trendline'; a: { time: UTCTimestamp; price: number }; b: { time: UTCTimestamp; price: number }; color: string }
    | { id: string; type: 'text'; anchor: { time: UTCTimestamp; price: number }; text: string; color: string }
    | { id: string; type: 'emoji'; anchor: { time: UTCTimestamp; price: number }; emoji: string };

  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const pendingPointRef = useRef<{ time: UTCTimestamp; price: number } | null>(null);
  const idCounterRef = useRef<number>(1);

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
          visible: showCrosshair,
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: 2,
          labelBackgroundColor: '#363c4e',
          visible: showCrosshair,
        },
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.3 : 0.1,
        },
        mode: priceScaleMode,
      },
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add primary price series based on chart type
    if (chartType === 'candlestick') {
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
    } else {
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#00bcd4',
        lineWidth: 2,
      });
      seriesRef.current = lineSeries as any;
      lineSeries.setData(candlestickData.map(c => ({ time: c.time as UTCTimestamp, value: c.close })));
    }

    // Add volume series if enabled
    if (showVolume && chartType === 'candlestick') {
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
    if (showSMA && candlestickData.length > smaPeriod) {
      const smaData = calculateSMA(candlestickData, smaPeriod);
      const smaSeries = chart.addSeries(LineSeries, {
        color: '#2196F3',
        lineWidth: 2,
      });
      smaSeriesRef.current = smaSeries as any;
      smaSeries.setData(smaData);
    }

    // Add EMA if enabled
    if (showEMA && candlestickData.length > emaPeriod) {
      // Lazy import EMA to avoid circular imports (already exported, but keep structure simple)
      // Reuse SMA calculation if EMA not desired; but since helper exists, we'll call it via dynamic import
      import('@/utils/chartDataGenerator').then(({ calculateEMA }) => {
        const emaData = calculateEMA(candlestickData, emaPeriod);
        const emaSeries = chart.addSeries(LineSeries, {
          color: '#FF9800',
          lineWidth: 2,
        });
        emaSeriesRef.current = emaSeries as any;
        emaSeries.setData(emaData);
      });
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
  }, [chartData, height, showVolume, showSMA, showEMA, smaPeriod, emaPeriod, chartType, showCrosshair, priceScaleMode]);

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

  // Update clock text
  useEffect(() => {
    const update = () => {
      const d = new Date();
      const hh = d.getHours().toString().padStart(2, '0');
      const mm = d.getMinutes().toString().padStart(2, '0');
      const ss = d.getSeconds().toString().padStart(2, '0');
      setNowText(`${hh}:${mm}:${ss}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // Drawing overlay click handler
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool || !chartRef.current || !seriesRef.current) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const time = chartRef.current.timeScale().coordinateToTime(x) as UTCTimestamp | null;
    const price = seriesRef.current.coordinateToPrice(y) as number | null;
    if (time == null || price == null) return;

    if (activeTool === 'hline') {
      const id = `h_${idCounterRef.current++}`;
      setDrawings(prev => [...prev, { id, type: 'hline', price, color: '#9aa0a6' }]);
      return;
    }

    if (activeTool === 'trendline') {
      if (!pendingPointRef.current) {
        pendingPointRef.current = { time, price };
      } else {
        const id = `t_${idCounterRef.current++}`;
        setDrawings(prev => [...prev, { id, type: 'trendline', a: pendingPointRef.current!, b: { time, price }, color: '#42a5f5' }]);
        pendingPointRef.current = null;
      }
      return;
    }

    if (activeTool === 'text') {
      const text = window.prompt('Text label:', 'Label');
      if (text && text.trim().length > 0) {
        const id = `tx_${idCounterRef.current++}`;
        setDrawings(prev => [...prev, { id, type: 'text', anchor: { time, price }, text, color: '#e0e0e0' }]);
      }
      return;
    }

    if (activeTool === 'emoji') {
      const id = `em_${idCounterRef.current++}`;
      setDrawings(prev => [...prev, { id, type: 'emoji', anchor: { time, price }, emoji: '🚀' }]);
      return;
    }
  }, [activeTool]);

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
          <button
            className={`p-1.5 hover:bg-[#2a2e39] rounded ${chartType === 'line' ? 'text-[#2962ff]' : 'text-gray-400'}`}
            onClick={() => setChartType('line')}
            title="Line"
          >
            <FaChartLine size={16} />
          </button>
          <button
            className={`p-1.5 hover:bg-[#2a2e39] rounded ${chartType === 'candlestick' ? 'text-[#2962ff]' : 'text-gray-400'}`}
            onClick={() => setChartType('candlestick')}
            title="Candles"
          >
            <FaChartBar size={16} />
          </button>
          <button className="p-1.5 hover:bg-[#2a2e39] rounded text-gray-400">
            <FaTh size={14} />
          </button>
        </div>

        {/* Right Section - Price/MCap & Currency */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowSMA(s => !s)}
              className={`px-2 py-1 rounded ${showSMA ? 'bg-[#2a2e39] text-[#2196F3]' : 'text-gray-400 hover:text-gray-300'}`}
              title={`SMA${showSMA ? ` (${smaPeriod})` : ''}`}
            >SMA</button>
            <button
              onClick={() => setShowEMA(e => !e)}
              className={`px-2 py-1 rounded ${showEMA ? 'bg-[#2a2e39] text-[#FF9800]' : 'text-gray-400 hover:text-gray-300'}`}
              title={`EMA${showEMA ? ` (${emaPeriod})` : ''}`}
            >EMA</button>
            <button
              onClick={() => setShowVolume(v => !v)}
              className={`px-2 py-1 rounded ${showVolume ? 'bg-[#2a2e39] text-[#26a69a]' : 'text-gray-400 hover:text-gray-300'}`}
              title="Toggle Volume"
            >VOL</button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-[#2a2e39] text-gray-400" title="Zoom In"><FaSearchPlus size={14} /></button>
            <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-[#2a2e39] text-gray-400" title="Zoom Out"><FaSearchMinus size={14} /></button>
            <button onClick={handleResetZoom} className="p-1.5 rounded hover:bg-[#2a2e39] text-gray-400" title="Reset View"><FaHome size={14} /></button>
            <button onClick={toggleFullscreen} className="p-1.5 rounded hover:bg-[#2a2e39] text-gray-400" title="Fullscreen">
              {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
            </button>
          </div>
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
            onClick={() => setShowCrosshair(v => !v)}
            className={`p-2.5 rounded transition-colors hover:bg-[#2a2e39] ${
              showCrosshair ? 'bg-[#2a2e39] text-white' : 'text-gray-400'
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
            onClick={() => { setDrawings([]); pendingPointRef.current = null; setActiveTool(null); }}
            className={`p-2.5 rounded transition-colors hover:bg-[#2a2e39] ${
              'text-gray-400'
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

          {/* Drawing overlay */}
          <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className={`absolute inset-0 ${activeTool ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            <svg className="w-full h-full">
              {drawings.map(d => {
                if (!chartRef.current || !seriesRef.current) return null;
                const ts = chartRef.current.timeScale();
                if (d.type === 'hline') {
                  const y = seriesRef.current.priceToCoordinate(d.price);
                  if (y == null) return null;
                  return (
                    <line key={d.id} x1={0} x2={'100%'} y1={y} y2={y} stroke={d.color} strokeWidth={1} opacity={0.8} />
                  );
                }
                if (d.type === 'trendline') {
                  const x1 = ts.timeToCoordinate(d.a.time as Time);
                  const y1 = seriesRef.current.priceToCoordinate(d.a.price);
                  const x2 = ts.timeToCoordinate(d.b.time as Time);
                  const y2 = seriesRef.current.priceToCoordinate(d.b.price);
                  if (x1 == null || x2 == null || y1 == null || y2 == null) return null;
                  return (
                    <line key={d.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke={d.color} strokeWidth={2} />
                  );
                }
                if (d.type === 'text') {
                  const x = ts.timeToCoordinate(d.anchor.time as Time);
                  const y = seriesRef.current.priceToCoordinate(d.anchor.price);
                  if (x == null || y == null) return null;
                  return (
                    <text key={d.id} x={x} y={y} fill={d.color} fontSize={12} textAnchor="start" dominantBaseline="central">{d.text}</text>
                  );
                }
                if (d.type === 'emoji') {
                  const x = ts.timeToCoordinate(d.anchor.time as Time);
                  const y = seriesRef.current.priceToCoordinate(d.anchor.price);
                  if (x == null || y == null) return null;
                  return (
                    <text key={d.id} x={x} y={y} fontSize={16} textAnchor="start" dominantBaseline="central">{d.emoji}</text>
                  );
                }
                return null;
              })}
            </svg>
          </div>
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
          <span>{nowText} (UTC)</span>
          <div className="flex items-center gap-2">
            <button
              className={`px-2 py-1 rounded ${priceScaleMode === PriceScaleMode.Percentage ? 'bg-[#2a2e39] text-white' : 'hover:bg-[#2a2e39]'}`}
              onClick={() => setPriceScaleMode(m => m === PriceScaleMode.Percentage ? PriceScaleMode.Normal : PriceScaleMode.Percentage)}
            >%</button>
            <button
              className={`px-2 py-1 rounded ${priceScaleMode === PriceScaleMode.Logarithmic ? 'bg-[#2a2e39] text-white' : 'hover:bg-[#2a2e39]'}`}
              onClick={() => setPriceScaleMode(m => m === PriceScaleMode.Logarithmic ? PriceScaleMode.Normal : PriceScaleMode.Logarithmic)}
            >log</button>
            <button
              className={`px-2 py-1 rounded ${autoScaleActive ? 'text-[#2962ff]' : 'hover:bg-[#2a2e39]'}`}
              onClick={() => { setAutoScaleActive(true); handleResetZoom(); }}
            >auto</button>
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
