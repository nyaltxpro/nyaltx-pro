'use client';

import React, { useState, useEffect } from 'react';
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
  FaEllipsisV,
  FaPencilAlt,
  FaRulerHorizontal,
  FaChartBar,
  FaChartArea,
  FaWallet,
  FaExchangeAlt,
  FaExclamationCircle
} from 'react-icons/fa';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import Header from '../../components/Header';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// TradingView Chart component is imported from react-ts-tradingview-widgets

// USDT token data
const tokenData = {
  name: 'Tether USD',
  symbol: 'USDT',
  price: 1.0002,
  priceChange: 0.0001,
  priceChangePercent: 0.01,
  marketCap: '$103.4B',
  volume24h: '$42.7B',
  liquidity: '$5.2B',
  holders: 4820156,
  transactions: 1245789,
};

const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];

// USDT candlestick data - realistic stablecoin price movements
const candlestickData = [
  {
    x: new Date(2023, 7, 28, 10, 0).getTime(),
    y: [1.0002, 1.0008, 0.9998, 1.0005]
  },
  {
    x: new Date(2023, 7, 28, 10, 15).getTime(),
    y: [1.0005, 1.0009, 1.0001, 1.0003]
  },
  {
    x: new Date(2023, 7, 28, 10, 30).getTime(),
    y: [1.0003, 1.0007, 0.9999, 1.0001]
  },
  {
    x: new Date(2023, 7, 28, 10, 45).getTime(),
    y: [1.0001, 1.0006, 0.9997, 1.0004]
  },
  {
    x: new Date(2023, 7, 28, 11, 0).getTime(),
    y: [1.0004, 1.0010, 1.0000, 1.0008]
  },
  {
    x: new Date(2023, 7, 28, 11, 15).getTime(),
    y: [1.0008, 1.0012, 1.0003, 1.0005]
  },
  {
    x: new Date(2023, 7, 28, 11, 30).getTime(),
    y: [1.0005, 1.0009, 1.0001, 1.0002]
  },
  {
    x: new Date(2023, 7, 28, 11, 45).getTime(),
    y: [1.0002, 1.0007, 0.9998, 1.0000]
  },
  {
    x: new Date(2023, 7, 28, 12, 0).getTime(),
    y: [1.0000, 1.0005, 0.9996, 0.9999]
  },
  {
    x: new Date(2023, 7, 28, 12, 15).getTime(),
    y: [0.9999, 1.0004, 0.9995, 1.0002]
  },
  {
    x: new Date(2023, 7, 28, 12, 30).getTime(),
    y: [1.0002, 1.0008, 0.9999, 1.0006]
  },
  {
    x: new Date(2023, 7, 28, 12, 45).getTime(),
    y: [1.0006, 1.0011, 1.0002, 1.0009]
  },
  {
    x: new Date(2023, 7, 28, 13, 0).getTime(),
    y: [1.0009, 1.0014, 1.0005, 1.0011]
  },
  {
    x: new Date(2023, 7, 28, 13, 15).getTime(),
    y: [1.0011, 1.0016, 1.0007, 1.0013]
  },
  {
    x: new Date(2023, 7, 28, 13, 30).getTime(),
    y: [1.0013, 1.0018, 1.0009, 1.0015]
  },
  {
    x: new Date(2023, 7, 28, 13, 45).getTime(),
    y: [1.0015, 1.0019, 1.0010, 1.0012]
  },
  {
    x: new Date(2023, 7, 28, 14, 0).getTime(),
    y: [1.0012, 1.0017, 1.0008, 1.0010]
  },
  {
    x: new Date(2023, 7, 28, 14, 15).getTime(),
    y: [1.0010, 1.0015, 1.0006, 1.0008]
  },
  {
    x: new Date(2023, 7, 28, 14, 30).getTime(),
    y: [1.0008, 1.0013, 1.0004, 1.0006]
  },
  {
    x: new Date(2023, 7, 28, 14, 45).getTime(),
    y: [1.0006, 1.0011, 1.0002, 1.0004]
  },
  {
    x: new Date(2023, 7, 28, 15, 0).getTime(),
    y: [1.0004, 1.0009, 1.0000, 1.0002]
  },
  {
    x: new Date(2023, 7, 28, 15, 15).getTime(),
    y: [1.0002, 1.0007, 0.9998, 1.0000]
  },
  {
    x: new Date(2023, 7, 28, 15, 30).getTime(),
    y: [1.0000, 1.0005, 0.9996, 0.9998]
  },
  {
    x: new Date(2023, 7, 28, 15, 45).getTime(),
    y: [0.9998, 1.0003, 0.9994, 0.9996]
  },
  {
    x: new Date(2023, 7, 28, 16, 0).getTime(),
    y: [0.9996, 1.0001, 0.9992, 0.9999]
  },
  {
    x: new Date(2023, 7, 28, 16, 15).getTime(),
    y: [0.9999, 1.0004, 0.9995, 1.0001]
  },
  {
    x: new Date(2023, 7, 28, 16, 30).getTime(),
    y: [1.0001, 1.0006, 0.9997, 1.0003]
  },
  {
    x: new Date(2023, 7, 28, 16, 45).getTime(),
    y: [1.0003, 1.0008, 0.9999, 1.0005]
  },
  {
    x: new Date(2023, 7, 28, 17, 0).getTime(),
    y: [1.0005, 1.0010, 1.0001, 1.0007]
  },
  {
    x: new Date(2023, 7, 28, 17, 15).getTime(),
    y: [1.0007, 1.0012, 1.0003, 1.0004]
  },
  {
    x: new Date(2023, 7, 28, 17, 30).getTime(),
    y: [1.0004, 1.0009, 1.0000, 1.0002]
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
  { id: 1, time: '2023/08/28', type: 'Buy', price: '$1.0002', amount: '$5,000.00', amountToken: '4,999.00', txHash: '0x123...abc' },
  { id: 2, time: '2023/08/28', type: 'Sell', price: '$1.0004', amount: '$2,500.00', amountToken: '2,499.00', txHash: '0x456...def' },
  { id: 3, time: '2023/08/28', type: 'Buy', price: '$0.9998', amount: '$10,000.00', amountToken: '10,002.00', txHash: '0x789...ghi' },
  { id: 4, time: '2023/08/27', type: 'Sell', price: '$1.0001', amount: '$7,500.00', amountToken: '7,499.25', txHash: '0xabc...123' },
  { id: 5, time: '2023/08/27', type: 'Buy', price: '$0.9997', amount: '$15,000.00', amountToken: '15,004.50', txHash: '0xdef...456' },
];

export default function TradingView() {
  const [activeTimeframe, setActiveTimeframe] = useState('15m');
  const [chartData, setChartData] = useState(candlestickData);
  const [chartVolume, setChartVolume] = useState(volumeData);
  const [chartMA, setChartMA] = useState(maData);
  const [favorited, setFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('trades');
  const [orderType, setOrderType] = useState('buy');
  const [selectedIndicators, setSelectedIndicators] = useState(['MA20']);
  const [showIndicatorModal, setShowIndicatorModal] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(null);
  const [activeChartType, setActiveChartType] = useState<'custom' | 'tradingview'>('custom');

  return (
    <div className="p-4 text-white">
      {/* Token Header */}
      <Header />
    

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 mt-8 lg:grid-cols-4 gap-4">
        {/* Left Column - Stats and Order Panel */}
        <div className="lg:col-span-1">
          {/* Order Panel */}
        
          
          <div className="bg-[#0f1923] rounded-xl p-4 mb-4">
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

          <div className="bg-[#0f1923] rounded-xl p-4">
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
        <div className="lg:col-span-2">
          {/* Chart */}
          <div className="bg-[#0f1923] rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
        
            
            {/* Chart Tabs */}
         
            
            {/* Chart Container */}
            <div className="w-full h-96 bg-[#1a2932] rounded-lg">
           
         
            
                  <AdvancedRealTimeChart 
                    theme="dark"
                    backgroundColor="#0f1923"
                    symbol="COINBASE:USDTUSD"
                    interval="15"
                    timezone="Etc/UTC"
                    style="2"
                  
                    locale="en"
                    toolbar_bg="#0f1923"
                    enable_publishing={false}
                    hide_top_toolbar={false}
                    hide_legend={false}
                    save_image={false}
                    studies={[
                      "MASimple@tv-basicstudies",
                      "RSI@tv-basicstudies"
                    ]}
                    width="100%"
                    height="380"
                    autosize
                  />
                </div>
              
            </div>
          </div>

          {/* Trades/Info Tabs */}
          <div className="bg-[#0f1923] rounded-xl overflow-hidden">
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
                  Tether USD (USDT) is a stablecoin pegged to the US Dollar. Each USDT token is backed by one US dollar, 
                  maintaining a 1:1 ratio with the USD. It enables users to transfer value globally without the volatility 
                  associated with cryptocurrencies.
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
                        <a href="#" className="text-blue-400 hover:underline">0xdAC17...4DD0</a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Decimals</span>
                        <span>6</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Issuer</span>
                        <span>Tether Limited</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Social Links</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Website</span>
                        <a href="#" className="text-blue-400 hover:underline">tether.to</a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Twitter</span>
                        <a href="#" className="text-blue-400 hover:underline">@Tether_to</a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Support</span>
                        <a href="#" className="text-blue-400 hover:underline">support@tether.to</a>
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
                        <span className="text-green-500">+0.01%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">24h Change</span>
                        <span className="text-green-500">+0.01%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">7d Change</span>
                        <span className="text-red-500">-0.02%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">30d Change</span>
                        <span className="text-green-500">+0.05%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Trading Volume</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">24h Volume</span>
                        <span>$42.7B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">7d Volume</span>
                        <span>$298.4B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Market Cap Rank</span>
                        <span>#3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volume/Market Cap</span>
                        <span>0.413</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-medium mb-3">Holder Distribution</h4>
                <div className="w-full bg-[#1a2932] rounded-lg p-4 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400">USDT Holder Distribution</div>
                    <div className="mt-2 flex justify-center space-x-4">
                      <div className="text-center">
                        <div className="text-xl font-bold">65%</div>
                        <div className="text-xs text-gray-500">Exchanges</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold">20%</div>
                        <div className="text-xs text-gray-500">Institutions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold">15%</div>
                        <div className="text-xs text-gray-500">Retail</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-[#0f1923] rounded-xl p-4 mb-4">
            <h2 className="text-lg font-semibold mb-3">Favorites</h2>
            
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

        </div>
      </div>
    </div>
  );
}
