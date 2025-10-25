
import {
  CandlestickSeriesPartialOptions,
  ColorType,
  createChart,
  HistogramSeriesPartialOptions,
  IChartApi,
  ISeriesApi
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import {
  FaChartBar,
  FaChartLine,
  FaClock,
  FaCog,
  FaCompress,
  FaCrosshairs,
  FaEraser,
  FaExpand,
  FaFont,
  FaHome,
  FaMinus,
  FaPencilAlt,
  FaPlus,
  FaRulerHorizontal,
  FaSearchMinus,
  FaSearchPlus,
  FaSmile,
  FaTh,
} from 'react-icons/fa';

const DexToolsChart = ({ chartDataSolana }: any) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  console.log('chartDataSolana', chartDataSolana);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
  const [showVolume, setShowVolume] = useState(true);
  const [showSMA, setShowSMA] = useState(false);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState('');


  // Generate realistic price data
  const generateChartData = () => {
    // Flatten nested arrays (if multiple chunks come)
    const flatData = chartDataSolana?.flat?.() || [];

    if (flatData.length === 0) {
      console.warn('⚠️ chartDataSolana is empty or malformed:', chartDataSolana);
      return { data: [], volumeData: [] };
    }

    // Map directly from your actual objects
    const data = flatData.map((d: any) => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    // Generate some mock volume data
    const volumeData = flatData.map((d: any) => ({
      time: d.time,
      value: 300 + Math.random() * 400,
      color: d.close >= d.open ? 'rgb(10, 153, 129,1)' : 'rgba(239,68,68,0.5)',
    }));

    return { data, volumeData };
  };


  useEffect(() => {
    const { data } = generateChartData();
    console.log("✅ Final Candlestick Data Sent to Chart:", data);
  }, [chartDataSolana]);



  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0B0F19' },
        textColor: '#787B86',
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: showCrosshair ? 1 : 0,
        vertLine: {
          color: '#758696',
          width: 1,
          style: 2,
          labelBackgroundColor: '#363C4E',
          visible: showCrosshair,
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: 2,
          labelBackgroundColor: '#363C4E',
          visible: showCrosshair,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.25 : 0.1,
        },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Generate initial data
    const { data, volumeData } = generateChartData();
    setChartData(data);

    // Add candlestick series
    const candleOptions: CandlestickSeriesPartialOptions = {
      upColor: '#0A9981',
      borderUpColor: '#0A9981',
      wickUpColor: '#0A9981',
      downColor: '#F23545',
      borderDownColor: '#F23545',
      wickDownColor: '#F23545',
      priceFormat: {
        type: 'price',
        precision: 8,   // number of decimals to show
        minMove: 0.00000001,
      },
    };

    const candleSeries = chart.addCandlestickSeries(candleOptions);
    candleSeriesRef.current = candleSeries;
    candleSeries.setData(data);

    // Add volume series
    if (showVolume) {
      const volumeOptions: HistogramSeriesPartialOptions = {
        color: '#26A69A',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      };

      const volumeSeries = chart.addHistogramSeries(volumeOptions);
      volumeSeriesRef.current = volumeSeries;
      volumeSeries.setData(volumeData);
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.75,
          bottom: 0,
        },
      });
    }

    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [showVolume, showCrosshair, chartType]);

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds} (UTC+5)`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const handleZoomIn = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().scrollToPosition(5, true);
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().scrollToPosition(-5, true);
    }
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  const timeframes = ['5y', '1y', '6m', '3m', '1m', '5d', '1d'];
  const intervals = ['1s', '1m', '5m', '15m', '1h', '4h', 'D'];

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0.00002150;
  const priceChange = -16.98;

  return (
    <div className=" w-[100%] h-[500px] bg-[#0B0F19] flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#131722] border-b border-gray-800 px-4 py-2 flex items-center justify-between">
        {/* Left - Timeframes */}
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400">
            <FaPlus size={14} />
          </button>
          {intervals.map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${selectedTimeframe === tf
                ? 'text-[#00D4AA]'
                : 'text-gray-400 hover:text-gray-300'
                }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Center - Chart Type */}
        <div className="flex items-center gap-2">
          <button
            className={`p-1.5 hover:bg-gray-700 rounded ${chartType === 'line' ? 'text-[#00D4AA]' : 'text-gray-400'
              }`}
            onClick={() => setChartType('line')}
            title="Line"
          >
            <FaChartLine size={16} />
          </button>
          <button
            className={`p-1.5 hover:bg-gray-700 rounded ${chartType === 'candlestick' ? 'text-[#00D4AA]' : 'text-gray-400'
              }`}
            onClick={() => setChartType('candlestick')}
            title="Candles"
          >
            <FaChartBar size={16} />
          </button>
          <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400">
            <FaTh size={14} />
          </button>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-1 rounded ${showSMA ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:text-gray-300'
                }`}
            >
              SMA
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-1 rounded ${showVolume ? 'bg-gray-700 text-green-400' : 'text-gray-400 hover:text-gray-300'
                }`}
            >
              VOL
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-gray-700 text-gray-400">
              <FaSearchPlus size={14} />
            </button>
            <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-gray-700 text-gray-400">
              <FaSearchMinus size={14} />
            </button>
            <button onClick={handleResetZoom} className="p-1.5 rounded hover:bg-gray-700 text-gray-400">
              <FaHome size={14} />
            </button>
            <button onClick={toggleFullscreen} className="p-1.5 rounded hover:bg-gray-700 text-gray-400">
              {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Token Info Bar */}
      <div className="bg-[#0B0F19] border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>

            {/* <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-400">O</span>
              <span className="text-red-500">{currentPrice.toFixed(8)}</span>
              <span className="text-gray-400">H</span>
              <span className="text-green-500">{(currentPrice * 1.02).toFixed(8)}</span>
              <span className="text-gray-400">L</span>
              <span className="text-red-500">{(currentPrice * 0.98).toFixed(8)}</span>
              <span className="text-gray-400">C</span>
              <span className="text-red-500">{currentPrice.toFixed(8)}</span>
              <span className={priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {priceChange.toFixed(4)} ({priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%)
              </span>
            </div> */}

          </div>
          <div className="text-right">
            <div className="text-lg text-red-500 font-medium">
              {currentPrice.toFixed(8)}
            </div>
            <div className="text-xs text-red-500">
              +1,165.60%
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex  min-h-0">
        {/* Left Sidebar - Tools */}
        <div className=" bg-[#131722] border-r border-gray-800 flex flex-col items-center py-4 gap-2">
          <button
            onClick={() => setShowCrosshair(!showCrosshair)}
            className={`p-2.5 rounded transition-colors hover:bg-gray-700 ${showCrosshair ? 'bg-gray-700 text-white' : 'text-gray-400'
              }`}
            title="Crosshair"
          >
            <FaCrosshairs size={18} />
          </button>

          <button
            onClick={() => setActiveTool(activeTool === 'trendline' ? null : 'trendline')}
            className={`p-2.5 rounded transition-colors hover:bg-gray-700 ${activeTool === 'trendline' ? 'bg-gray-700 text-white' : 'text-gray-400'
              }`}
            title="Trend Line"
          >
            <FaRulerHorizontal size={18} />
          </button>

          <button
            onClick={() => setActiveTool(activeTool === 'hline' ? null : 'hline')}
            className={`p-2.5 rounded transition-colors hover:bg-gray-700 ${activeTool === 'hline' ? 'bg-gray-700 text-white' : 'text-gray-400'
              }`}
            title="Horizontal Line"
          >
            <FaMinus size={18} />
          </button>

          <button
            className="p-2.5 rounded transition-colors hover:bg-gray-700 text-gray-400"
            title="Draw"
          >
            <FaPencilAlt size={18} />
          </button>

          <button
            className="p-2.5 rounded transition-colors hover:bg-gray-700 text-gray-400"
            title="Text"
          >
            <FaFont size={18} />
          </button>

          <button
            className="p-2.5 rounded transition-colors hover:bg-gray-700 text-gray-400"
            title="Emoji"
          >
            <FaSmile size={18} />
          </button>

          <button
            className="p-2.5 rounded transition-colors hover:bg-gray-700 text-gray-400"
            title="Eraser"
          >
            <FaEraser size={18} />
          </button>

          <button
            className="p-2.5 rounded transition-colors hover:bg-gray-700 text-gray-400"
            title="Add"
          >
            <FaPlus size={18} />
          </button>

          <div className="flex-1" />

          <button
            className="p-2.5 rounded transition-colors hover:bg-gray-700 text-gray-400"
            title="Settings"
          >
            <FaCog size={18} />
          </button>
        </div>

        {/* Chart */}
        <div ref={chartContainerRef} className="flex-1" />
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#131722] border-t border-gray-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {timeframes.map((period) => (
            <button
              key={period}
              className="px-2.5 py-1 text-xs rounded transition-colors text-gray-400 hover:text-gray-300 hover:bg-gray-700"
            >
              {period}
            </button>
          ))}
          <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400">
            <FaClock size={14} />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{currentTime}</span>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 rounded hover:bg-gray-700">%</button>
            <button className="px-2 py-1 rounded hover:bg-gray-700">log</button>
            <button className="px-2 py-1 rounded text-[#00D4AA]">auto</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DexToolsChart;