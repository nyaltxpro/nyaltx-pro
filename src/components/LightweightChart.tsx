'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, UTCTimestamp, ColorType } from 'lightweight-charts';
import { FaChartLine, FaClock, FaExpand, FaCompress, FaChartBar } from 'react-icons/fa';
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

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: parseInt(height),
      layout: {
        background: { type: ColorType.Solid, color: '#0a0e13' },
        textColor: '#68738D',
      },
      grid: {
        vertLines: { color: '#1a2332' },
        horzLines: { color: '#1a2332' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#00b8d8',
          width: 1,
          style: 2,
          labelBackgroundColor: '#00b8d8',
        },
        horzLine: {
          color: '#00b8d8',
          width: 1,
          style: 2,
          labelBackgroundColor: '#00b8d8',
        },
      },
      rightPriceScale: {
        borderColor: '#1a2332',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.3 : 0.1,
        },
      },
      timeScale: {
        borderColor: '#1a2332',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    // @ts-ignore - Type definitions may be outdated
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    seriesRef.current = candlestickSeries;
    candlestickSeries.setData(candlestickData);

    // Add volume series if enabled
    if (showVolume) {
      // @ts-ignore - Type definitions may be outdated
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
      volumeSeriesRef.current = volumeSeries;
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
      // @ts-ignore - Type definitions may be outdated
      const smaSeries = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
      });
      smaSeriesRef.current = smaSeries;
      smaSeries.setData(smaData);
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
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

  return (
    <div className={`relative ${className}`}>
      {/* Chart Header */}
      <div className="bg-[#0a0e13] border border-gray-800 rounded-t-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-white">
                  ${currentPrice.toFixed(currentPrice < 0.01 ? 8 : 4)}
                </h3>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${
                  priceChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {tokenSymbol} / USD
              </div>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Timeframe Selector */}
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400" />
              {(['1D', '1W', '1M', '3M'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => handleTimeframeChange(tf)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    timeframe === tf
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Indicator Toggles */}
            <div className="flex items-center gap-2 border-l border-gray-700 pl-3">
              <button
                onClick={() => setShowVolume(!showVolume)}
                className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                  showVolume
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                title="Toggle Volume"
              >
                <FaChartBar />
                Volume
              </button>
              <button
                onClick={() => setShowSMA(!showSMA)}
                className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                  showSMA
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                title="Toggle SMA 20"
              >
                <FaChartLine />
                SMA
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div 
        ref={chartContainerRef}
        className="bg-[#0a0e13] border-x border-b border-gray-800 rounded-b-lg overflow-hidden"
        style={{ height }}
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

      {/* Chart Footer Info */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 px-2">
        <div className="flex items-center gap-4">
          <span>📊 Powered by Lightweight Charts</span>
          {!priceData && (
            <span className="text-yellow-500">⚠️ Demo data - Real-time data unavailable</span>
          )}
        </div>
        <div>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default LightweightChart;
