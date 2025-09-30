"use client";

import React, { useState, useEffect } from 'react';
import Banner from '@/components/Banner';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import BlockchainSelector from '@/components/BlockchainSelector';
import TokenSection from '@/components/TokenSection';
import MemeTokenDisplay from '@/components/MemeTokenDisplay';
import AllChainsDropdown from '@/components/AllChainsDropdown';
import BlockchainNetworksGrid from '@/components/BlockchainNetworksGrid';
import DailyGainers from '@/components/DailyGainers';
import TokenCreator from '@/components/TokenCreator';
import RecentSocials from '@/components/RecentSocials';
import { Blockchain, Token } from '@/lib/types/blockchain';
import { supportedBlockchains, getMemeTokens, getTronNewTokens, getTronPreLaunchedTokens } from '@/lib/blockchain/blockchainUtils';
import memeTokensData from '@/data/memetoken.json';
import Header from '@/components/Header';
import RecentlyAddedCoins from '@/components/RecentlyAddedCoins';
import TrendingCoins from '@/components/TrendingCoins';
import Ads from '@/components/Ads';
import PumpFunLive from '@/components/PumpFunLive';
import { useChainFilter } from '@/hooks/useChainFilter';
import ChainFilterIndicator from '@/components/ChainFilterIndicator';
// import DashboardBanners from '@/components/DashboardBanners';

// SortConfig type will be used when we reimplement the token sorting functionality
// type SortConfig = {
//   key: string;
//   direction: 'ascending' | 'descending';
// } | null;

// Get top 10 coins from memetoken.json sorted by market_cap_rank (fallback data)
const topTokens = [...memeTokensData]
  .sort((a, b) => (a.market_cap_rank || Infinity) - (b.market_cap_rank || Infinity))
  .slice(0, 10);

// Type for token race data
type TokenRaceItem = {
  id: string;
  symbol?: string;
  name?: string;
  price?: string;
  current_price?: number;
  rank?: number;
  image?: string;
  logoUrl?: string;
  points?: number;
  blockchain?: string;
  contractAddress?: string;
};

// Fallback token race data
const fallbackTokenRaceData: TokenRaceItem[] = topTokens.map((token, index) => ({
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
  {
    id: 5,
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
  const router = useRouter();
  const [selectedBlockchain, setSelectedBlockchain] = useState<Blockchain | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'new' | 'pre-launched' | 'launched'>('new');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenRaceData, setTokenRaceData] = useState<TokenRaceItem[]>(fallbackTokenRaceData);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedChain, setSelectedChain] = useState<string>('ethereum');
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  // State for Tron tokens
  const [tronNewTokens, setTronNewTokens] = useState<TronNewToken[]>([]);
  const [tronPreLaunchedTokens, setTronPreLaunchedTokens] = useState<TronPreLaunchedToken[]>([]);
  const [isLoadingTronTokens, setIsLoadingTronTokens] = useState<boolean>(false);

  // State for Ethereum tokens
  const [ethTokens, setEthTokens] = useState<any[]>([]);
  const [isLoadingEthTokens, setIsLoadingEthTokens] = useState<boolean>(false);

  // State for BSC tokens
  const [bscTokens, setBscTokens] = useState<any[]>([]);
  const [isLoadingBscTokens, setIsLoadingBscTokens] = useState<boolean>(false);

  // State for meme tokens and loading
  const [memeTokens, setMemeTokens] = useState<any[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const handleClick = (t: any) => {
    const params = new URLSearchParams();
    params.set('base', (t.tokenSymbol || t.tokenName || '').toUpperCase());
    if (t.blockchain) params.set('chain', t.blockchain);
    if (t.contractAddress) params.set('address', t.contractAddress);
    router.push(`/dashboard/trade?${params.toString()}`);
  };

  // Fetch race tokens with points from admin panel
  useEffect(() => {
    const fetchRaceTokens = async () => {
      try {
        const response = await fetch('/api/tokens/race');
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          // Sort by points (highest first)
          const sortedTokens = result.data.sort((a: TokenRaceItem, b: TokenRaceItem) =>
            (b.points || 0) - (a.points || 0)
          );
          setTokenRaceData(sortedTokens);
        }
      } catch (error) {
        console.error('Failed to fetch race tokens:', error);
        // Keep fallback data if API fails
      }
    };

    fetchRaceTokens();
  }, []);

  // Apply chain filtering to token race data
  const filteredTokenRaceData = useChainFilter(tokenRaceData, {
    chainField: 'blockchain',
    includeUnknown: true,
    caseSensitive: false
  });

  // Removed auto-slider - now manual navigation only

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
          // Use the getMemeTokens function with a limit parameter (10) instead of blockchain ID
          // This matches our updated implementation in blockchainUtils.ts
          const tokens = await getMemeTokens(10);
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

  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);



  return (
    <div className={`flex flex-col min-h-screen ${!darkMode ? 'light' : ''}`}>
      {/* <Header /> */}

      {isPageLoading ? (
        // Skeleton Loading State
        <div className="flex flex-col min-h-screen">
          {/* Skeleton Ads */}
          <div className="h-16 bg-gray-700 rounded animate-pulse mx-4 mt-4"></div>

          {/* Skeleton Stats Bar */}
          <div className="stats-bar mx-4 flex flex-col w-[90%] md:w-full md:flex-row md:justify-between md:items-center gap-4 mt-4">
            <div className="h-6 bg-gray-700 rounded animate-pulse w-32"></div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-700 rounded animate-pulse w-24"></div>
              ))}
            </div>

            {/* Pump.fun Live Section */}
            {/* <div className="p-4">
        <PumpFunLive />
      </div> */}
            <div className="h-5 bg-gray-700 rounded animate-pulse w-40"></div>
          </div>

          {/* Skeleton Token Race */}
          <div className="token-race mx-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-700 rounded animate-pulse w-32"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-700 rounded animate-pulse w-16"></div>
                <div className="h-8 bg-gray-700 rounded animate-pulse w-20"></div>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex-shrink-0  rounded-lg p-3 w-32">
                  <div className="h-4 bg-gray-700 rounded animate-pulse mb-2 w-8"></div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-16"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="max-h-[400px] section-card">
                <div className="h-6 bg-gray-700 rounded animate-pulse mb-4 w-32"></div>
                <div className="space-y-3">
                  {[...Array(8)].map((_, j) => (
                    <div key={j} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded animate-pulse mb-1 w-20"></div>
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Token Categories */}
          <div className="token-categories flex flex-col mx-4 mt-6">
            <div className="flex items-center py-2 rounded-lg card-bg border-gray-700 overflow-x-auto mb-4">
              <div className="flex space-x-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-700 rounded animate-pulse w-20"></div>
                ))}
              </div>
            </div>
            <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      ) : (
        <>
          <Ads />

          {/* Dashboard Banners */}
          {/* <div className="mx-4 mt-4">
            <DashboardBanners />
          </div> */}

          {/* Stats Bar */}
          {/* <div className="stats-bar mx-4 flex flex-col w-[90%] md:w-full  md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex justify-between items-center mb-2 md:mb-0">
              <div className="text-xl font-bold">NYALTX board</div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
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
            <div className="flex items-center mt-2 md:mt-0">
              <span className="text-xs mr-2">Today&apos;s trending tokens</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={true} readOnly />
                <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
          </div> */}

          {/* Token Race Section */}
          <div className="token-race mx-4 mt-4">
            <div className="token-race-header flex-col md:flex-row">
              <div className="flex items-center gap-2 mb-2 md:mb-0">
                <span className="text-xl font-bold">TOKEN RACE</span>
              </div>
              <div className="flex space-x-2 items-center">
                <button className="py-1 px-3 bg-gray-700 text-white font-bold rounded-md">RANKING</button>
              </div>
            </div>

            {/* Chain Filter Indicator for Token Race */}
            <div className="mb-4">
              <ChainFilterIndicator />
            </div>

            <div className="relative overflow-hidden  rounded-lg p-4">
              <div className="relative  h-36 overflow-hidden">
                <div
                  className="flex gap-4 animate-pulse"
                  style={{
                    display: 'flex',
                    width: `${filteredTokenRaceData.length * 200}px`,
                    animation: 'ticker 60s linear infinite',
                    animationFillMode: 'forwards'
                  }}
                >

                  {/* Duplicate the array for seamless loop */}
                  {[...filteredTokenRaceData, ...filteredTokenRaceData].map((token, index) => (
                    <div
                      key={`${token.id || `token-${index}`}-${Math.floor(index / filteredTokenRaceData.length)}`}
                      className="flex-shrink-0 min-w-[280px] px-1"
                    >
                      <div
                        onClick={() => handleClick(token)}
                        className="relative flex flex-row justify-between items-center mt-3 p-3 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg border border-gray-600 h-32 transform hover:scale-105 transition-transform duration-300 cursor-pointer hover:border-[#00c3ff]"
                      >
                        {/* Position tag on top right based on points ranking */}
                        <div className={`absolute -top-1 -right-1 px-2 py-1 rounded-full text-xs font-bold ${(index % filteredTokenRaceData.length) === 0 ? 'bg-yellow-500 text-black' :
                            (index % filteredTokenRaceData.length) === 1 ? 'bg-gray-400 text-black' :
                              (index % filteredTokenRaceData.length) === 2 ? 'bg-orange-500 text-black' :
                                'bg-blue-500 text-white'
                          }`}>
                          {(index % filteredTokenRaceData.length) === 0 ? '1st' :
                            (index % filteredTokenRaceData.length) === 1 ? '2nd' :
                              (index % filteredTokenRaceData.length) === 2 ? '3rd' :
                                `${(index % filteredTokenRaceData.length) + 1}th`}
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                          {(token.image || token.logoUrl) && (
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-500">
                              <Image
                                src={token.image || token.logoUrl || '/placeholder-token.png'}
                                alt={token.symbol || token.name || 'Token'}
                                width={32}
                                height={32}
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="token-symbol flex flex-col text-sm font-bold text-white truncate">
                            {token.symbol || token.name || 'Unknown'}
                            <span className="text-green-400">
                            ${token.price || (token.current_price ? token.current_price.toFixed(4) : 'N/A')}
                          </span>
                          </div>
                        </div>

                        <div className='flex flex-col items-center'>

                        {/* Points display */}
                        <div className="text-center mb-1">
                          <div className="text-lg font-bold text-[#00c3ff]">
                            {token.points || 0} pts
                          </div>
                        </div>

                        <div className="token-price text-xs font-semibold text-center">
                       
                        </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add inline keyframes */}
              <style jsx>{`
            @keyframes ticker {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
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
              <RecentlyAddedCoins />
            </div>

            {/* Recently Updated Socials */}
            <div className="max-h-[400px] overflow-auto section-card">
              <TrendingCoins />
            </div>
          </div>

          {/* Token Categories Section */}
          <div className="token-categories flex flex-col mx-4 mt-6">
            {/* <div className="flex items-center py-2 rounded-lg card-bg border-gray-700 overflow-x-auto">
          <div className="flex space-x-4 text-sm font-medium whitespace-nowrap">
            <button className="py-2 px-4 text-white">Hot Pairs</button>
            <button className="py-2 px-4 text-gray-400">Token Race</button>
            <button className="py-2 px-4 text-gray-400">Pairs</button>
            <button className="py-2 px-4 text-gray-400 bg-opacity-20 rounded-t-md">Meme Board</button>
            <button className="py-2 px-4 text-gray-400">Token Creator</button>
            <button className="py-2 px-4 text-gray-400">New Socials</button>
            <button className="py-2 px-4 text-gray-400">Exchanges</button>
            <button className="py-2 px-4 text-gray-400">Liquidity Unlocks</button>
            <button className="py-2 px-4 text-gray-400">Token Unlocks</button>
          </div>
          <div className="ml-auto">

          </div>
        </div> */}

            {/* Token section  */}
            <TokenSection

            />
          </div>
        </>
      )}
    </div>
  );
}
