'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  FaChartLine, 
  FaStar, 
  FaExternalLinkAlt, 
  FaArrowUp, 
  FaArrowDown, 
  FaRegClock,
  FaSearch,
  FaFilter,
  FaEllipsisV
} from 'react-icons/fa';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Mock data for the trading view
const tokenData = {
  name: 'FEATURES',
  symbol: 'FEAT',
  price: 0.5716,
  priceChange: -0.01,
  priceChangePercent: -1.72,
  marketCap: '$10.5M',
  volume24h: '$170.8K',
  liquidity: '$120.6K',
  holders: 1842,
  transactions: 11744,
};

const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];

// Mock candlestick data for the chart
const candlestickData = [
  {
    x: new Date(2023, 7, 28, 10, 0).getTime(),
    y: [0.5716, 0.5820, 0.5650, 0.5790]
  },
  {
    x: new Date(2023, 7, 28, 10, 15).getTime(),
    y: [0.5790, 0.5850, 0.5760, 0.5810]
  },
  {
    x: new Date(2023, 7, 28, 10, 30).getTime(),
    y: [0.5810, 0.5890, 0.5780, 0.5845]
  },
  {
    x: new Date(2023, 7, 28, 10, 45).getTime(),
    y: [0.5845, 0.5910, 0.5800, 0.5870]
  },
  {
    x: new Date(2023, 7, 28, 11, 0).getTime(),
    y: [0.5870, 0.5950, 0.5830, 0.5880]
  },
  {
    x: new Date(2023, 7, 28, 11, 15).getTime(),
    y: [0.5880, 0.5920, 0.5800, 0.5830]
  },
  {
    x: new Date(2023, 7, 28, 11, 30).getTime(),
    y: [0.5830, 0.5870, 0.5770, 0.5810]
  },
  {
    x: new Date(2023, 7, 28, 11, 45).getTime(),
    y: [0.5810, 0.5850, 0.5760, 0.5840]
  },
  {
    x: new Date(2023, 7, 28, 12, 0).getTime(),
    y: [0.5840, 0.5900, 0.5820, 0.5890]
  },
  {
    x: new Date(2023, 7, 28, 12, 15).getTime(),
    y: [0.5890, 0.5950, 0.5850, 0.5920]
  },
  {
    x: new Date(2023, 7, 28, 12, 30).getTime(),
    y: [0.5920, 0.5980, 0.5870, 0.5950]
  },
  {
    x: new Date(2023, 7, 28, 12, 45).getTime(),
    y: [0.5950, 0.6000, 0.5900, 0.5980]
  },
  {
    x: new Date(2023, 7, 28, 13, 0).getTime(),
    y: [0.5980, 0.6050, 0.5930, 0.6000]
  },
  {
    x: new Date(2023, 7, 28, 13, 15).getTime(),
    y: [0.6000, 0.6080, 0.5950, 0.6030]
  },
  {
    x: new Date(2023, 7, 28, 13, 30).getTime(),
    y: [0.6030, 0.6100, 0.5980, 0.6050]
  },
  {
    x: new Date(2023, 7, 28, 13, 45).getTime(),
    y: [0.6050, 0.6120, 0.6000, 0.6080]
  },
  {
    x: new Date(2023, 7, 28, 14, 0).getTime(),
    y: [0.6080, 0.6150, 0.6020, 0.6100]
  },
  {
    x: new Date(2023, 7, 28, 14, 15).getTime(),
    y: [0.6100, 0.6170, 0.6040, 0.6120]
  },
  {
    x: new Date(2023, 7, 28, 14, 30).getTime(),
    y: [0.6120, 0.6180, 0.6050, 0.6090]
  },
  {
    x: new Date(2023, 7, 28, 14, 45).getTime(),
    y: [0.6090, 0.6140, 0.6020, 0.6050]
  },
  {
    x: new Date(2023, 7, 28, 15, 0).getTime(),
    y: [0.6050, 0.6100, 0.5980, 0.6020]
  },
  {
    x: new Date(2023, 7, 28, 15, 15).getTime(),
    y: [0.6020, 0.6070, 0.5950, 0.5980]
  },
  {
    x: new Date(2023, 7, 28, 15, 30).getTime(),
    y: [0.5980, 0.6030, 0.5920, 0.5950]
  },
  {
    x: new Date(2023, 7, 28, 15, 45).getTime(),
    y: [0.5950, 0.6000, 0.5890, 0.5920]
  },
  {
    x: new Date(2023, 7, 28, 16, 0).getTime(),
    y: [0.5920, 0.5970, 0.5860, 0.5890]
  },
  {
    x: new Date(2023, 7, 28, 16, 15).getTime(),
    y: [0.5890, 0.5940, 0.5830, 0.5860]
  },
  {
    x: new Date(2023, 7, 28, 16, 30).getTime(),
    y: [0.5860, 0.5910, 0.5800, 0.5830]
  },
  {
    x: new Date(2023, 7, 28, 16, 45).getTime(),
    y: [0.5830, 0.5880, 0.5770, 0.5800]
  },
  {
    x: new Date(2023, 7, 28, 17, 0).getTime(),
    y: [0.5800, 0.5850, 0.5740, 0.5770]
  },
  {
    x: new Date(2023, 7, 28, 17, 15).getTime(),
    y: [0.5770, 0.5820, 0.5710, 0.5740]
  },
  {
    x: new Date(2023, 7, 28, 17, 30).getTime(),
    y: [0.5740, 0.5790, 0.5680, 0.5716]
  }
];

// Volume data with colors based on price movement (green for up, red for down)
const volumeData = candlestickData.map((candle, index) => {
  const isUp = index > 0 ? candle.y[3] > candlestickData[index - 1].y[3] : true;
  return {
    x: candle.x,
    y: Math.floor(Math.random() * 10000) + 5000, // Random volume between 5000 and 15000
    fillColor: isUp ? '#26a69a80' : '#ef535080' // Semi-transparent green/red
  };
});

// Moving Average data (20-period)
interface MADataPoint {
  x: number;
  y: number | null;
}

const maData: MADataPoint[] = [];
for (let i = 0; i < candlestickData.length; i++) {
  if (i >= 19) {
    let sum = 0;
    for (let j = i; j > i - 20; j--) {
      sum += candlestickData[j].y[3]; // Close price
    }
    maData.push({
      x: candlestickData[i].x,
      y: sum / 20
    });
  } else {
    maData.push({
      x: candlestickData[i].x,
      y: null
    });
  }
};

const tradingHistory = [
  { id: 1, time: '2023/08/28', type: 'Buy', price: '$0.0718', amount: '$1,000.00', amountToken: '13,927.57', txHash: '0x123...abc' },
  { id: 2, time: '2023/08/28', type: 'Sell', price: '$0.0724', amount: '$500.00', amountToken: '6,906.08', txHash: '0x456...def' },
  { id: 3, time: '2023/08/28', type: 'Buy', price: '$0.0715', amount: '$2,000.00', amountToken: '27,972.02', txHash: '0x789...ghi' },
  { id: 4, time: '2023/08/27', type: 'Sell', price: '$0.0730', amount: '$1,500.00', amountToken: '20,547.94', txHash: '0xabc...123' },
  { id: 5, time: '2023/08/27', type: 'Buy', price: '$0.0710', amount: '$3,000.00', amountToken: '42,253.52', txHash: '0xdef...456' },
];

export default function TradingView() {
  const [activeTimeframe, setActiveTimeframe] = useState('15m');
  const [chartData, setChartData] = useState(candlestickData);
  const [chartVolume, setChartVolume] = useState(volumeData);
  const [chartMA, setChartMA] = useState(maData);
  const [favorited, setFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('trades');

  return (
    <div className="p-4 text-white">
      {/* Token Header */}
      <div className="bg-[#0f1923] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="font-bold text-white">F</span>
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-xl font-bold">{tokenData.name}</h1>
                <span className="ml-2 text-gray-400">{tokenData.symbol}</span>
                <button 
                  className="ml-3 text-gray-400 hover:text-yellow-400"
                  onClick={() => setFavorited(!favorited)}
                >
                  <FaStar className={favorited ? 'text-yellow-400' : ''} />
                </button>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-400">Ethereum</span>
                <a href="#" className="ml-2 text-blue-400 flex items-center">
                  <span className="mr-1">0x5716...</span>
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div>
              <div className="text-2xl font-bold">${tokenData.price}</div>
              <div className={`flex items-center text-sm ${tokenData.priceChange < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {tokenData.priceChange < 0 ? <FaArrowDown className="mr-1" /> : <FaArrowUp className="mr-1" />}
                {tokenData.priceChangePercent}%
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium">
              Trade
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column - Stats */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f1923] rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold mb-3">Token Info</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Price</span>
                <span>${tokenData.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap</span>
                <span>{tokenData.marketCap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">24h Volume</span>
                <span>{tokenData.volume24h}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Liquidity</span>
                <span>{tokenData.liquidity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Holders</span>
                <span>{tokenData.holders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transactions</span>
                <span>{tokenData.transactions}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f1923] rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Price Stats</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">All Time High</span>
                <div className="text-right">
                  <div>$0.8942</div>
                  <div className="text-xs text-gray-500">Aug 15, 2023</div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">All Time Low</span>
                <div className="text-right">
                  <div>$0.0124</div>
                  <div className="text-xs text-gray-500">Jan 03, 2023</div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">24h High</span>
                <span>$0.6104</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">24h Low</span>
                <span>$0.5512</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price Change (24h)</span>
                <span className={tokenData.priceChange < 0 ? 'text-red-500' : 'text-green-500'}>
                  {tokenData.priceChangePercent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Chart and Trades */}
        <div className="lg:col-span-3">
          {/* Chart */}
          <div className="bg-[#0f1923] rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                {timeframes.map((timeframe) => (
                <button
                  key={timeframe}
                  className={`px-3 py-1 text-xs rounded ${activeTimeframe === timeframe ? 'bg-blue-600 text-white' : 'bg-[#1a2932] text-gray-400 hover:bg-[#253440]'}`}
                  onClick={() => {
                    setActiveTimeframe(timeframe);
                    
                    // In a real app, this would fetch data for the selected timeframe
                    // For now, we'll just simulate different data by adjusting the existing data
                    const multiplier = timeframes.indexOf(timeframe) + 1;
                    const adjustedData = candlestickData.map(candle => ({
                      x: candle.x,
                      y: candle.y.map(price => price * (1 + (multiplier - 3) * 0.01))
                    }));
                    
                    // Update chart data
                    setChartData(adjustedData);
                    
                    // Update volume data
                    const newVolumeData = adjustedData.map((candle, index) => {
                      const isUp = index > 0 ? candle.y[3] > adjustedData[index - 1].y[3] : true;
                      return {
                        x: candle.x,
                        y: Math.floor(Math.random() * 10000 * multiplier) + 5000,
                        fillColor: isUp ? '#26a69a80' : '#ef535080'
                      };
                    });
                    setChartVolume(newVolumeData);
                    
                    // Update MA data
                    const newMA = [];
                    for (let i = 0; i < adjustedData.length; i++) {
                      if (i >= 19) {
                        let sum = 0;
                        for (let j = i; j > i - 20; j--) {
                          sum += adjustedData[j].y[3]; // Close price
                        }
                        newMA.push({
                          x: adjustedData[i].x,
                          y: sum / 20
                        });
                      } else {
                        newMA.push({
                          x: adjustedData[i].x,
                          y: null
                        });
                      }
                    }
                    setChartMA(newMA);
                  }}
                >
                  {timeframe}
                </button>
              ))}
              </div>
              <div className="flex space-x-2">
                <button className="p-2 bg-[#1a2932] rounded hover:bg-[#253440]">
                  <FaChartLine className="text-gray-400" />
                </button>
                <button className="p-2 bg-[#1a2932] rounded hover:bg-[#253440]">
                  <FaEllipsisV className="text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Candlestick Chart */}
            <div className="w-full h-96 bg-[#1a2932] rounded-lg">
              {typeof window !== 'undefined' && (
                <Chart
                  type="candlestick"
                  height={380}
                  series={[
                    {
                      name: 'candles',
                      data: chartData
                    },
                    {
                      name: 'volume',
                      data: chartVolume,
                      type: 'bar'
                    },
                    {
                      name: 'MA20',
                      data: chartMA,
                      type: 'line',
                      color: '#7C83FD'
                    }
                  ]}
                  options={{
                    chart: {
                      type: 'candlestick',
                      height: 380,
                      toolbar: {
                        show: true,
                        tools: {
                          download: true,
                          selection: true,
                          zoom: true,
                          zoomin: true,
                          zoomout: true,
                          pan: true,
                          reset: true
                        },
                        autoSelected: 'zoom'
                      },
                      background: '#1a2932',
                      animations: {
                        enabled: true,
                      },
                      stacked: false,
                    },
                    stroke: {
                      width: [1, 0, 2],
                      curve: 'smooth'
                    },
                    dataLabels: {
                      enabled: false
                    },
                    markers: {
                      size: 0
                    },
                    legend: {
                      show: true,
                      position: 'top',
                      horizontalAlign: 'right',
                      labels: {
                        colors: '#9ca3af'
                      }
                    },
                    plotOptions: {
                      candlestick: {
                        colors: {
                          upward: '#26a69a',
                          downward: '#ef5350'
                        },
                        wick: {
                          useFillColor: true,
                        }
                      }
                    },
                    xaxis: {
                      type: 'datetime',
                      labels: {
                        style: {
                          colors: '#9ca3af'
                        },
                        datetimeFormatter: {
                          year: 'yyyy',
                          month: "MMM 'yy",
                          day: 'dd MMM',
                          hour: 'HH:mm'
                        }
                      },
                      axisBorder: {
                        show: false
                      },
                      axisTicks: {
                        show: false
                      }
                    },
                    yaxis: {
                      tooltip: {
                        enabled: true
                      },
                      labels: {
                        style: {
                          colors: '#9ca3af'
                        },
                        formatter: function(val) {
                          return '$' + val.toFixed(4);
                        }
                      }
                    },
                    grid: {
                      borderColor: '#2d3748',
                      strokeDashArray: 2,
                      xaxis: {
                        lines: {
                          show: false
                        }
                      },
                      yaxis: {
                        lines: {
                          show: true
                        }
                      },
                      padding: {
                        top: 0,
                        right: 10,
                        bottom: 0,
                        left: 10
                      },
                    },
                    tooltip: {
                      theme: 'dark',
                      x: {
                        format: 'dd MMM HH:mm'
                      },
                      y: {
                        formatter: function(val) {
                          return '$' + val.toFixed(4);
                        }
                      }
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Trades/Info Tabs */}
          <div className="bg-[#0f1923] rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-800">
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'trades' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('trades')}
              >
                Trades
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'info' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Info
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'analytics' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
            </div>

            {activeTab === 'trades' && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      className="pl-9 pr-4 py-2 bg-[#1a2932] rounded-md text-white w-64 focus:outline-none"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <button className="p-2 bg-[#1a2932] rounded hover:bg-[#253440]">
                    <FaFilter className="text-gray-400" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-gray-400 text-sm">
                        <th className="pb-3 font-medium">Time</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Price</th>
                        <th className="pb-3 font-medium">Amount ($)</th>
                        <th className="pb-3 font-medium">Amount (Token)</th>
                        <th className="pb-3 font-medium">Tx Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradingHistory.map((trade) => (
                        <tr key={trade.id} className="border-t border-gray-800">
                          <td className="py-3 flex items-center">
                            <FaRegClock className="text-gray-500 mr-2" />
                            {trade.time}
                          </td>
                          <td className={`py-3 ${trade.type === 'Buy' ? 'text-green-500' : 'text-red-500'}`}>
                            {trade.type}
                          </td>
                          <td className="py-3">{trade.price}</td>
                          <td className="py-3">{trade.amount}</td>
                          <td className="py-3">{trade.amountToken}</td>
                          <td className="py-3">
                            <a href="#" className="text-blue-400 hover:underline">
                              {trade.txHash}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3">Token Information</h3>
                <p className="text-gray-300 mb-4">
                  FEATURES (FEAT) is a utility token designed for the DeFi ecosystem. It provides governance rights, 
                  staking rewards, and access to premium features within the platform.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contract Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Network</span>
                        <span>Ethereum</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contract</span>
                        <a href="#" className="text-blue-400 hover:underline">0x5716...8F1b</a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Decimals</span>
                        <span>18</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Social Links</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Website</span>
                        <a href="#" className="text-blue-400 hover:underline">features.io</a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Twitter</span>
                        <a href="#" className="text-blue-400 hover:underline">@FeaturesToken</a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Telegram</span>
                        <a href="#" className="text-blue-400 hover:underline">t.me/FeaturesToken</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3">Token Analytics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium mb-3">Price Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">1h Change</span>
                        <span className="text-red-500">-0.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">24h Change</span>
                        <span className="text-red-500">-1.72%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">7d Change</span>
                        <span className="text-green-500">+12.4%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">30d Change</span>
                        <span className="text-green-500">+45.2%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Trading Volume</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">24h Volume</span>
                        <span>$170,800</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">7d Volume</span>
                        <span>$1,245,600</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Market Cap Rank</span>
                        <span>#342</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volume/Market Cap</span>
                        <span>0.0163</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-medium mb-3">Holder Distribution</h4>
                <div className="w-full bg-[#1a2932] rounded-lg p-4 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400">Holder Distribution Chart</div>
                    <div className="text-xs text-gray-500 mt-1">
                      (In a real app, this would be a pie or bar chart showing token distribution)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
