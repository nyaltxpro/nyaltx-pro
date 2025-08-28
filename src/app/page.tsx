"use client";

import React, { useState, useEffect } from 'react';
import Banner from './components/Banner';
import ConnectWalletButton from './components/ConnectWalletButton';
import Header from './components/Header';

// SortConfig type will be used when we reimplement the token sorting functionality
// type SortConfig = {
//   key: string;
//   direction: 'ascending' | 'descending';
// } | null;

// Mock data for token race
const tokenRaceData = [
  { id: 1, symbol: "SLIPPY", price: "5000", rank: 1 },
  { id: 2, symbol: "ATH", price: "2200", rank: 2 },
  { id: 3, symbol: "FOMO", price: "2000", rank: 3 },
  { id: 4, symbol: "BabyWL", price: "1500", rank: 4 },
  { id: 5, symbol: "SHIK", price: "1000", rank: 5 },
  { id: 6, symbol: "NOBODY", price: "1000", rank: 6 },
  { id: 7, symbol: "Frug", price: "1000", rank: 7 },
];

// Mock data for banner items
const bannerItems = [
  { 
    id: 1, 
    title: "DEXTools x Nibiru Chain AMA", 
    subtitle: "Join Us Here!",
    date: "Wed August 27th",
    time: "7PM CEST / 5PM UTC"
  },
  { 
    id: 2, 
    title: "DEXTools API V2", 
    subtitle: "Powering The Future Of DeFi"
  },
  { 
    id: 3, 
    title: "DEXTools Meme Board", 
    subtitle: "Discover Hottest Meme Tokens"
  },
  { 
    id: 4, 
    title: "Follow Us On TikTok!", 
    subtitle: "Official DEXTools Account"
  },
];

// Mock data for daily gainers
const dailyGainers = [
  { id: 1, name: "Imagine", chain: "WETH", price: "$0.05544", change: "+73,889.14%" },
  { id: 2, name: "SCALR", chain: "WETH", price: "$0.00344", change: "+35,798.92%" },
];

// Mock data for daily losers - will be used in future implementation
// const dailyLosers = [
//   { id: 1, name: "PEPE", chain: "ETH", price: "$0.00000089", change: "-12.34%" },
//   { id: 2, name: "SHIB", chain: "ETH", price: "$0.00000178", change: "-8.76%" },
// ];

// Mock data for token creator
const tokenCreators = [
  { id: 1, name: "LADYMOO", time: "6 h ago", chain: "ETH" },
  { id: 2, name: "MSI", time: "1 d ago", chain: "ETH" },
];

// Mock data for recently updated socials
const recentSocials = [
  { id: 1, name: "TOTO", time: "1 hour ago", platforms: ["website", "telegram", "twitter", "discord"] },
  { id: 2, name: "ATH", time: "1 hour ago", platforms: ["website", "twitter", "discord"] },
];

// Mock data for tokens - will be used when we reimplement the token list
// const mockTokens = [
//   {
//     id: 1,
//     name: "BTC",
//     symbol: "BTC",
//     price: 29876.54,
//     change24h: 5.67,
//     marketCap: 1234567890,
//     volume24h: 45678901,
//     liquidity: 3456789,
//     chart: "up"
//   },
//   {
//     id: 2,
//     name: "DOGE",
//     symbol: "DOGE",
//     price: 0.12345,
//     change24h: -2.34,
//     marketCap: 9876543210,
//     volume24h: 876543210,
//     liquidity: 65432198,
//     chart: "down"
//   },
//   {
//     id: 3,
//     name: "SHIB",
//     symbol: "SHIB",
//     price: 0.00000987,
//     change24h: 12.45,
//     marketCap: 5678901234,
//     volume24h: 345678901,
//     liquidity: 23456789,
//     chart: "up"
//   },
//   {
//     id: 4,
//     name: "FLOKI",
//     symbol: "FLOKI",
//     price: 0.00012345,
//     change24h: -1.23,
//     marketCap: 3456789012,
//     volume24h: 234567890,
//     liquidity: 12345678,
//     chart: "down"
//   },
//   {
//     id: 5,
//     name: "WOJAK",
//     symbol: "WOJAK",
//     price: 0.00000456,
//     change24h: 8.90,
//     marketCap: 2345678901,
//     volume24h: 123456789,
//     liquidity: 9876543,
//     chart: "up"
//   },
//   {
//     id: 6,
//     name: "BONK",
//     symbol: "BONK",
//     price: 0.00000789,
//     change24h: -3.45,
//     marketCap: 1987654321,
//     volume24h: 98765432,
//     liquidity: 8765432,
//     chart: "down"
//   },
//   {
//     id: 7,
//     name: "MEME",
//     symbol: "MEME",
//     price: 0.03456,
//     change24h: 7.89,
//     marketCap: 4567890123,
//     volume24h: 456789012,
//     liquidity: 34567890,
//     chart: "up"
//   }
// ];

// Utility functions - commented out since not currently used but will be needed for future features
// Format numbers with commas
// function formatNumber(num: number): string {
//   return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// }

// Format currency with appropriate decimals
// function formatCurrency(num: number): string {
//   if (num < 0.0001) {
//     return num.toFixed(8);
//   } else if (num < 0.01) {
//     return num.toFixed(6);
//   } else if (num < 1) {
//     return num.toFixed(4);
//   } else {
//     return num.toFixed(2);
//   }
// }

export default function Home() {
  // Default to dark mode as shown in the image
  const [darkMode] = useState(true);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sorting functionality will be reimplemented when we add the token list back

  // Filter tokens by search term - will be used when we reimplement the token list
  // const filteredTokens = tokens.filter(token => 
  //   token.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
  //   token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div className={`flex flex-col min-h-screen ${!darkMode ? 'light' : ''}`}>
      {/* Banner */}
     

      <Header/>
      
   
      
      {/* Banner Section */}
      <div className="banner-section px-4">
        {bannerItems.map((item) => (
          <div key={item.id} className="banner-item">
            <div>
              {item.date && <div className="text-xs text-secondary">{item.date}</div>}
              {item.time && <div className="text-xs text-secondary">{item.time}</div>}
            </div>
            <div>
              <div className="banner-title">{item.title}</div>
              <div className="banner-subtitle">{item.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Stats Bar */}
      <div className="stats-bar mx-4">
        <div className="text-xl font-bold">DEXTboard</div>
        <div className="flex space-x-4">
          <div className="stats-item">
            <span className="stats-label">Networks:</span>
            <span className="stats-value">132</span>
          </div>
          <div className="stats-item">
            <span className="stats-label">Dexes:</span>
            <span className="stats-value">21,586</span>
          </div>
          <div className="stats-item">
            <span className="stats-label">Pools:</span>
            <span className="stats-value">19,440,364</span>
          </div>
          <div className="stats-item">
            <span className="stats-label">Tokens:</span>
            <span className="stats-value">29,055,602</span>
          </div>
          <div className="stats-item">
            <span className="stats-label">Next token burn:</span>
            <span className="stats-value text-primary">1,897,863 DXT</span>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-sm mr-2">Today&apos;s trending tokens</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={true} readOnly />
            <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
        </div>
      </div>
      
      {/* Token Race Section */}
      <div className="token-race mx-4">
        <div className="token-race-header">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">🏁 TOKEN RACE</span>
          </div>
          <div className="flex space-x-2">
            <button className="py-1 px-3 bg-[#00c3ff] text-black font-bold rounded-md">NITRO</button>
            <button className="py-1 px-3 bg-gray-700 text-white font-bold rounded-md">RANKING</button>
          </div>
        </div>
        
        <div className="token-race-content">
          {tokenRaceData.map((token) => (
            <div key={token.id} className="token-race-item">
              <div className={`token-race-rank rank-${token.rank}`}>{token.rank}{token.rank === 1 ? 'ST' : token.rank === 2 ? 'ND' : token.rank === 3 ? 'RD' : 'TH'}</div>
              <div className="token-symbol">{token.symbol}</div>
              <div className="token-price">{token.price} <span className="text-[#00c3ff]">NITRO</span></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Daily Gainers Section */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">Daily gainers</div>
            <div className="view-more">More ›</div>
          </div>
          
          <div>
            {dailyGainers.map((token, index) => (
              <div key={token.id} className="gainer-item">
                <div className="token-info">
                  <div className="token-icon">{index + 1}</div>
                  <div>
                    <div className="token-name">{token.name}</div>
                    <div className="token-chain">{token.chain}</div>
                  </div>
                </div>
                <div>
                  <div className="text-right">{token.price}</div>
                  <div className="token-percentage percentage-positive">{token.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Token Creator Section */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <span className="mr-2">🔵</span>
              Token Creator <span className="text-xs text-secondary">by DEXTools</span>
            </div>
            <div className="view-more">More ›</div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-secondary mb-2">
              <div>Safety for traders.</div>
              <div>Visibility for your projects.</div>
            </div>
          </div>
          
          <div>
            {tokenCreators.map((creator) => (
              <div key={creator.id} className="gainer-item">
                <div className="token-info">
                  <div className="token-icon">👤</div>
                  <div>
                    <div className="token-name">{creator.name}</div>
                    <div className="token-chain">{creator.time}</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">E</div>
                    <div className="text-xs ml-1">{creator.chain}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recently Updated Socials */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">Recently updated socials</div>
            <div className="view-more">More ›</div>
          </div>
          
          <div>
            {recentSocials.map((social) => (
              <div key={social.id} className="gainer-item">
                <div className="token-info">
                  <div className="token-icon">🔄</div>
                  <div>
                    <div className="token-name">{social.name}</div>
                    <div className="token-chain">{social.time}</div>
                  </div>
                </div>
                <div>
                  <div className="flex space-x-1">
                    {social.platforms.includes('website') && <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center">🌐</div>}
                    {social.platforms.includes('telegram') && <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center">📱</div>}
                    {social.platforms.includes('twitter') && <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center">🐦</div>}
                    {social.platforms.includes('discord') && <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center">💬</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
