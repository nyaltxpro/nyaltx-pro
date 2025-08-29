"use client";

import React, { useState, useEffect } from 'react';
import Banner from '../components/Banner';
import ConnectWalletButton from '../components/ConnectWalletButton';
import Header from '../components/Header';
import BlockchainSelector from '../components/BlockchainSelector';
import MemeTokenDisplay from '../components/MemeTokenDisplay';
import AllChainsDropdown from '../components/AllChainsDropdown';
import BlockchainNetworksGrid from '../components/BlockchainNetworksGrid';
import DailyGainers from '../components/DailyGainers';
import TokenCreator from '../components/TokenCreator';
import RecentSocials from '../components/RecentSocials';
import { Blockchain, Token } from '../lib/types/blockchain';
import { supportedBlockchains, getMemeTokens, getTronNewTokens, getTronPreLaunchedTokens } from '../lib/blockchain/blockchainUtils';
import Image from 'next/image';
import memeTokensData from './data/memetoken.json';

// SortConfig type will be used when we reimplement the token sorting functionality
// type SortConfig = {
//   key: string;
//   direction: 'ascending' | 'descending';
// } | null;

// Get top 10 coins from memetoken.json sorted by market_cap_rank
const topTokens = [...memeTokensData]
  .sort((a, b) => (a.market_cap_rank || Infinity) - (b.market_cap_rank || Infinity))
  .slice(0, 10);

// Format tokens for token race display
const tokenRaceData = topTokens.map((token, index) => ({
  id: token.id,
  symbol: token.symbol.toUpperCase(),
  price: token.current_price.toString(),
  rank: index + 1,
  image: token.image
}));

// Mock data for token categories (NEW, PRE LAUNCHED, LAUNCHED)
const tokenCategories = {
  new: [
    { 
      id: 1, 
      name: "Memewear", 
      fullName: "Memewear", 
      symbol: "BRXL_pump", 
      mcap: "-", 
      vol: "-", 
      holders: "-", 
      time: "12 s", 
      percentage: "17.6%"
    },
    { 
      id: 2, 
      name: "Sparky", 
      fullName: "Sparky", 
      symbol: "BWGX_pump", 
      mcap: "-", 
      vol: "-", 
      holders: "-", 
      time: "16 s", 
      percentage: "7.2%"
    },
    { 
      id: 3, 
      name: "Garbage", 
      fullName: "Garbagecoin", 
      symbol: "GWXG_pump", 
      mcap: "-", 
      vol: "-", 
      holders: "-", 
      time: "", 
      percentage: ""
    }
  ],
  preLaunched: [
    { 
      id: 1, 
      name: "jotchua", 
      fullName: "jotchua", 
      symbol: "SimW_pump", 
      mcap: "$67.71K", 
      vol: "$352.75K", 
      holders: "226", 
      time: "48 m", 
      percentage: "96%"
    },
    { 
      id: 2, 
      name: "GDP", 
      fullName: "Gross Domestic Product", 
      symbol: "3Mmm_pump", 
      mcap: "$60.73K", 
      vol: "$14.99K", 
      holders: "714", 
      time: "2 h", 
      percentage: "93%"
    },
    { 
      id: 3, 
      name: "Cope", 
      fullName: "Cope", 
      symbol: "EhxJ_zSs", 
      mcap: "$60.95K", 
      vol: "", 
      holders: "", 
      time: "", 
      percentage: ""
    }
  ],
  launched: [
    { 
      id: 1, 
      name: "POT", 
      fullName: "Juppot", 
      symbol: "HjPsG_hyds", 
      mcap: "$467.25", 
      vol: "$514.94", 
      holders: "58", 
      time: "4 m", 
      percentage: "100%"
    },
    { 
      id: 2, 
      name: "Rule34", 
      fullName: "Rule 34", 
      symbol: "CyAu_pump", 
      mcap: "$114.02K", 
      vol: "$335.32K", 
      holders: "763", 
      time: "16 m", 
      percentage: "100%"
    },
    { 
      id: 3, 
      name: "VWH", 
      fullName: "Video Wifi Hat", 
      symbol: "HT.Zc_2RqW", 
      mcap: "$646.08", 
      vol: "", 
      holders: "", 
      time: "", 
      percentage: ""
    }
  ]
};

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

// Mock data for daily losers - will be used in future implementation
// const dailyLosers = [
//   { id: 1, name: "PEPE", chain: "ETH", price: "$0.00000089", change: "-12.34%" },
//   { id: 2, name: "SHIB", chain: "ETH", price: "$0.00000178", change: "-8.76%" },
// ];

// Social updates are now dynamically loaded in the RecentSocials component

// Define types for Tron tokens
type TronNewToken = {
  id: string;
  name: string;
  logoUrl: string;
  time: string;
  price: string;
  percentage: string;
  chain: string;
};

type TronPreLaunchedToken = {
  id: string;
  name: string;
  logoUrl: string;
  launchDate: string;
  holders: string;
  chain: string;
};

export default function Home() {
  // Default to dark mode as shown in the image
  const [darkMode] = useState(true);
  const [selectedBlockchain, setSelectedBlockchain] = useState<Blockchain | null>(supportedBlockchains[0]);
  const [memeTokens, setMemeTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState<boolean>(false);
  const [selectedChain, setSelectedChain] = useState<string>('ethereum');
  
  // State for Tron tokens
  const [tronNewTokens, setTronNewTokens] = useState<TronNewToken[]>([]);
  const [tronPreLaunchedTokens, setTronPreLaunchedTokens] = useState<TronPreLaunchedToken[]>([]);
  const [isLoadingTronTokens, setIsLoadingTronTokens] = useState<boolean>(false);
  
  // State for token race slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const tokensPerSlide = 5;
  const totalSlides = Math.ceil(tokenRaceData.length / tokensPerSlide);
  
  // Minimum swipe distance in pixels
  const minSwipeDistance = 50;
  
  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true); // Pause auto-sliding during touch
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    }
    
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
    
    // Reset touch values
    setTouchEnd(null);
    setTouchStart(null);
    setIsPaused(false); // Resume auto-sliding after touch
  };
  
  // Group tokens for slider display
  const tokenSlides = [];
  for (let i = 0; i < tokenRaceData.length; i += tokensPerSlide) {
    tokenSlides.push(tokenRaceData.slice(i, i + tokensPerSlide));
  }
  
  // Auto slide functionality
  useEffect(() => {
    let slideInterval: NodeJS.Timeout;
    
    if (autoSlide && totalSlides > 1 && !isPaused) {
      slideInterval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides);
      }, 3000); // Change slide every 3 seconds
    }
    
    return () => {
      if (slideInterval) clearInterval(slideInterval);
    };
  }, [autoSlide, totalSlides, isPaused]);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Update selected blockchain when chain is selected from All Chains dropdown
  useEffect(() => {
    const blockchain = supportedBlockchains.find(bc => bc.id === selectedChain) || supportedBlockchains[0];
    setSelectedBlockchain(blockchain);
  }, [selectedChain]);

  // Load meme tokens when blockchain changes
  useEffect(() => {
    const loadMemeTokens = async () => {
      if (selectedBlockchain) {
        setIsLoadingTokens(true);
        try {
          const tokens = await getMemeTokens(selectedBlockchain.id);
          setMemeTokens(tokens);
        } catch (error) {
          console.error('Error loading meme tokens:', error);
          setMemeTokens([]);
        } finally {
          setIsLoadingTokens(false);
        }
      }
    };
    
    loadMemeTokens();
  }, [selectedBlockchain]);
  
  // Load Tron tokens on component mount
  useEffect(() => {
    const loadTronTokens = async () => {
      setIsLoadingTronTokens(true);
      try {
        // Load Tron tokens for NEW and PRE LAUNCHED categories
        const newTokens = await getTronNewTokens(5); // Get 5 tokens for NEW category
        const preLaunchedTokens = await getTronPreLaunchedTokens(5); // Get 5 tokens for PRE LAUNCHED category
        
        setTronNewTokens(newTokens);
        setTronPreLaunchedTokens(preLaunchedTokens);
      } catch (error) {
        console.error('Error loading Tron tokens:', error);
        setTronNewTokens([]);
        setTronPreLaunchedTokens([]);
      } finally {
        setIsLoadingTronTokens(false);
      }
    };
    
    loadTronTokens();
  }, []);

 

  return (
    <div className={`flex flex-col min-h-screen ${!darkMode ? 'light' : ''}`}>
      {/* Banner */}
     

      <Header/>
      
   
      
      {/* Banner Section */}
      <div 
        className="banner-section w-[95%] mx-auto my-6 px-8 relative py-12 rounded-xl overflow-hidden shadow-2xl" 
      
      >
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        {/* Content container */}
        <div className="relative flex z-10 text-white">
        {bannerItems.map((item,index) => (
          <div key={item.id} className="banner-item mx-5 "
          style={{
            backgroundImage: `url("/banner/${index}.png")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '120px',
            minWidth: '180px',
          }}
          >
            <div>
              {item.date && <div className="text-xs text-white/80">{item.date}</div>}
              {item.time && <div className="text-xs text-white/80">{item.time}</div>}
            </div>
            <div>
              <div className="banner-title text-xl font-bold text-white mb-2">{item.title}</div>
              <div className="banner-subtitle text-lg text-white/90">{item.subtitle}</div>
            </div>
          </div>
        ))}
        </div>
      </div>
      
      {/* Stats Bar */}
      <div className="stats-bar mx-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">NYALTX board</div>
        
        </div>
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
          <div className="flex space-x-2 items-center">
            <button className="py-1 px-3 bg-[#00c3ff] text-black font-bold rounded-md">NITRO</button>
            <button className="py-1 px-3 bg-gray-700 text-white font-bold rounded-md">RANKING</button>
            <button 
              onClick={() => setAutoSlide(prev => !prev)}
              className={`ml-2 py-1 px-3 font-bold rounded-md flex items-center ${autoSlide ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'}`}
            >
              <span className="mr-1">{autoSlide ? 'Auto' : 'Manual'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {autoSlide ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        <div 
          className={`token-race-slider relative ${isPaused ? 'paused' : ''}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="token-race-content" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {tokenSlides.map((slideTokens, slideIndex) => (
              <div 
                key={`slide-${slideIndex}`} 
                className="flex gap-2 w-full" 
                style={{ 
                  transform: `translateX(${slideIndex * 100}%)`,
                  position: 'absolute',
                  left: 0,
                  opacity: currentSlide === slideIndex ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              >
                {slideTokens.map((token) => (
                  <div key={token.id} className="token-race-item">
                    <div className={`token-race-rank rank-${token.rank}`}>{token.rank}{token.rank === 1 ? 'ST' : token.rank === 2 ? 'ND' : token.rank === 3 ? 'RD' : 'TH'}</div>
                    <div className="flex items-center gap-2">
                      {token.image && (
                        <div className="w-5 h-5 rounded-full overflow-hidden">
                          <Image 
                            src={token.image} 
                            alt={token.symbol} 
                            width={20} 
                            height={20} 
                            unoptimized 
                          />
                        </div>
                      )}
                      <div className="token-symbol">{token.symbol}</div>
                    </div>
                    <div className="token-price">{token.price} <span className="text-[#00c3ff]">NITRO</span></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Slider Navigation */}
          <button 
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 p-2 rounded-full z-10"
            disabled={currentSlide === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={() => setCurrentSlide(prev => Math.min(totalSlides - 1, prev + 1))}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 p-2 rounded-full z-10"
            disabled={currentSlide === totalSlides - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Slide Counter */}
          <div className="absolute bottom-0 right-0 bg-gray-800 bg-opacity-70 text-white text-xs px-2 py-1 rounded-tl-md">
            {currentSlide + 1}/{totalSlides}
          </div>
          
          {/* Slide Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-[#00c3ff]' : 'bg-gray-500'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Daily Gainers Section */}
        <div className="max-h-[400px] overflow-auto section-card">
          <DailyGainers />
        </div>
        
        {/* Token Creator Section */}
        <div className="max-h-[400px] overflow-auto section-card">
          <TokenCreator />
        </div>
        
        {/* Recently Updated Socials */}
        <div className="max-h-[400px] overflow-auto section-card">
          <RecentSocials />
        </div>
      </div>
      
      {/* Token Categories Section */}
      <div className="token-categories flex flex-col  mx-4 mt-6">
        <div className="flex items-center py-2 rounded-lg card-bg border-gray-700">
          <div className="flex space-x-4 text-sm font-medium">
            <button className="py-2 px-4   text-white">Hot Pairs</button>
            <button className="py-2 px-4 text-gray-400">Token Race</button>
            <button className="py-2 px-4 text-gray-400">Pairs</button>
            <button className="py-2 px-4 text-gray-400  bg-opacity-20 rounded-t-md">Meme Board</button>
            <button className="py-2 px-4 text-gray-400">Token Creator</button>
            <button className="py-2 px-4 text-gray-400">New Socials</button>
            <button className="py-2 px-4 text-gray-400">Exchanges</button>
            <button className="py-2 px-4 text-gray-400">Liquidity Unlocks</button>
            <button className="py-2 px-4 text-gray-400">Token Unlocks</button>
          </div>
          <div className="ml-auto">
         
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* NEW Category */}
          <div className="border border-[#23323c] rounded-lg overflow-hidden">
            <div className="flex items-center p-3 border-b border-gray-800">
              <div className="flex items-center">
                <span className="text-white font-bold mr-2">🆕 NEW</span>
                <span className="text-xs text-blue-400 ml-2">Tron</span>
              </div>
            </div>
            
            {isLoadingTronTokens ? (
              <div className="p-4 text-center text-gray-400">Loading Tron tokens...</div>
            ) : tronNewTokens.length > 0 ? (
              tronNewTokens.map((token) => (
                <div key={token.id} className="p-3 border-b border-gray-800 hover:bg-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-md mr-2 overflow-hidden">
                        <Image 
                          src={token.logoUrl} 
                          alt={token.name} 
                          width={32} 
                          height={32} 
                          unoptimized 
                        />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-white font-medium">{token.name}</span>
                          <span className="text-blue-400 text-xs ml-2 px-1 rounded bg-blue-900">TRX</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{token.id.substring(0, 8)}...</span>
                          <span className="ml-2">🔍</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-[#00b8d8] text-white text-xs font-bold rounded">TRADE</button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Price</div>
                      <div className="text-white">{token.price}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Chain</div>
                      <div className="text-white">{token.chain}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Time</div>
                      <div className="text-white">{token.time}</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-xs text-white">{token.time}</div>
                    <div className="text-xs text-green-500">{token.percentage}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">No Tron tokens found</div>
            )}
          </div>
          
          {/* PRE LAUNCHED Category */}
          <div className="border border-[#23323c] rounded-lg overflow-hidden">
            <div className="flex items-center p-3 border-b border-gray-800">
              <div className="flex items-center">
                <span className="text-white font-bold mr-2">🚀 PRE LAUNCHED</span>
                <span className="text-xs text-blue-400 ml-2">Tron</span>
              </div>
            </div>
            
            {isLoadingTronTokens ? (
              <div className="p-4 text-center text-gray-400">Loading Tron tokens...</div>
            ) : tronPreLaunchedTokens.length > 0 ? (
              tronPreLaunchedTokens.map((token) => (
                <div key={token.id} className="p-3 border-b border-gray-800 hover:bg-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-md mr-2 overflow-hidden">
                        <Image 
                          src={token.logoUrl} 
                          alt={token.name} 
                          width={32} 
                          height={32} 
                          unoptimized 
                        />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-white font-medium">{token.name}</span>
                          <span className="text-blue-400 text-xs ml-2 px-1 rounded bg-blue-900">TRX</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{token.id.substring(0, 8)}...</span>
                          <span className="ml-2">🔍</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-[#00b8d8] text-white text-xs font-bold rounded">TRADE</button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Launch</div>
                      <div className="text-white">{token.launchDate}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Chain</div>
                      <div className="text-white">{token.chain}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Holders</div>
                      <div className="text-white">{token.holders}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">No Tron tokens found</div>
            )}
          </div>
          
          {/* LAUNCHED Category */}
          <div className="border border-[#23323c] rounded-lg overflow-hidden">
            <div className="flex items-center p-3 border-b border-gray-800">
              <div className="flex items-center">
                <span className="text-white font-bold mr-2">🚀 LAUNCHED</span>
              </div>
            </div>
            
            {tronPreLaunchedTokens.map((token) => (
              <div key={token.id} className="p-3 border-b border-gray-800 hover:bg-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md mr-2 overflow-hidden">
                        <Image 
                          src={token.logoUrl} 
                          alt={token.name} 
                          width={32} 
                          height={32} 
                          unoptimized 
                        />
                      </div>
                    <div>
                      <div className="flex items-center">
                        <span className="text-white font-medium">{token.name}</span>
                       
                       
                        {/* <span className="text-gray-500 text-xs ml-2">{token.fullName}</span> */}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{token.chain}</span>
                      
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-[#00b8d8] text-white text-xs font-bold rounded">TRADE</button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {/* <div>
                    <div className="text-gray-500">MCap.</div>
                    <div className="text-white">{token.mcap}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Vol.</div>
                    <div className="text-white">{token.volume}</div>
                  </div> */}
                  <div>
                    <div className="text-gray-500">Holders</div>
                    <div className="text-white">{token.holders}</div>
                  </div>
                </div>
                
                {token.launchDate && (
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-xs text-white">{token.launchDate}</div>
                    {token.holders && (
                      <div className="text-xs text-green-500">{token.holders}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
    
      
    
      
    </div>
  );
}
