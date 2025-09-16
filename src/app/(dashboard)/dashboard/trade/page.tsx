'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import toast, { Toaster } from 'react-hot-toast';
import tokens from '@/data/tokens.json';
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
  FaExclamationCircle,
  FaGlobe,
  FaTelegram,
  FaTwitter,
  FaRegCopy,
  FaChevronDown,
  FaInfoCircle,
  FaUsers,
  FaShieldAlt,
  FaCoins,
  FaExclamationTriangle,
  FaThumbsUp,
  FaThumbsDown,
  FaTimes
} from 'react-icons/fa';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import Header from '../../../../components/Header';
import Faq from '@/components/Faq';
import SwapPage from '@/components/SwapCard';
import { fetchTokenPairData, TokenPairData, formatCurrency, formatPercentage, getTokenId } from '@/api/coingecko/api';
import { getCryptoIconUrl } from '@/utils/cryptoIcons';
import { getCryptoName } from '@/utils/cryptoNames';
import nyaxTokensData from '../../../../../nyax-tokens-data.json';

// Chain name mapping utility
const getChainName = (chainId: number): string => {
  const chainNames: { [key: number]: string } = {
    1: 'ethereum',
    56: 'bsc',
    137: 'polygon',
    42161: 'arbitrum',
    10: 'optimism',
    8453: 'base',
    43114: 'avalanche',
    250: 'fantom',
    25: 'cronos',
    100: 'xdai',
    1284: 'moonbeam',
    1285: 'moonriver',
    42220: 'celo',
    1666600000: 'harmony',
    128: 'heco',
    66: 'okex',
    321: 'kcc',
    1313161554: 'aurora',
    2000: 'dogechain',
    199: 'bttc',
    1088: 'metis',
    1101: 'polygon-zkevm',
    324: 'zksync',
    59144: 'linea',
    534352: 'scroll',
    5000: 'mantle',
    7777777: 'zora',
    81457: 'blast'
  };
  return chainNames[chainId] || 'ethereum';
};

// Dynamic import for TradingView widget to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// TradingView Chart component is imported from react-ts-tradingview-widgets

// Default token data (shown while loading)
const defaultTokenData = {
  name: 'Loading...',
  symbol: '...',
  price: 0,
  priceChange: 0,
  priceChangePercent: 0,
  marketCap: '$0',
  volume24h: '$0',
  liquidity: '$0',
  holders: 0,
  transactions: 0,
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

// Move useSearchParams into a child and wrap with Suspense to satisfy Next.js requirements
function TradePageContent() {
  const searchParams = useSearchParams();
  const baseToken = (searchParams.get('base') || searchParams.get('token') || 'BTC').toUpperCase();
  const chainParam = searchParams.get('chain')?.toLowerCase() || '';
  const addressParam = searchParams.get('address')?.toLowerCase() || '';
  const quoteToken = searchParams.get('quote') || 'USDT';
  const videoId = searchParams.get('video') || 'VNTK2Bwyq7s';

  return (
    <TradingViewWithParams
      baseToken={baseToken}
      quoteToken={quoteToken}
      chainParam={chainParam}
      addressParam={addressParam}
      videoId={videoId}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-white">Loading trade page…</div>}>
      <TradePageContent />
    </Suspense>
  );
}

// Main component that accepts params directly
function TradingViewWithParams({ baseToken, quoteToken, chainParam, addressParam, videoId }: { baseToken: string, quoteToken: string, chainParam?: string, addressParam?: string, videoId?: string }) {
  const { address, isConnected } = useAccount();

  const [activeTimeframe, setActiveTimeframe] = useState('15m');
  const [chartData, setChartData] = useState(candlestickData);
  const [chartVolume, setChartVolume] = useState(volumeData);
  const [chartMA, setChartMA] = useState(maData);
  const [favorited, setFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('trades');
  const [orderType, setOrderType] = useState('buy');
  const [selectedIndicators, setSelectedIndicators] = useState(['MA20']);
  const [showIndicatorModal, setShowIndicatorModal] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(null);
  const [activeChartType, setActiveChartType] = useState<'custom' | 'tradingview'>('custom');
  const [dexEmbedUrl, setDexEmbedUrl] = useState<string>("");

  const [transactionDexEmbedUrl, setTransactionDexEmbedUrl] = useState<string>("");
  const [infoDexEmbedUrl, setInfoDexEmbedUrl] = useState<string>("");
  // Token pair data state
  const [pairData, setPairData] = useState<TokenPairData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(null);
  const [dexPriceUsd, setDexPriceUsd] = useState<string | null>(null);
  const [dexChange24h, setDexChange24h] = useState<number | null>(null);
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // Fetch user favorites
  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (!isConnected || !address) {
        setUserFavorites([]);
        return;
      }
      
      setIsLoadingFavorites(true);
      try {
        const response = await fetch(`/api/favorites?wallet=${address}`);
        if (response.ok) {
          const { favorites } = await response.json();
          setUserFavorites(favorites.slice(0, 4)); // Limit to 4 items
        }
      } catch (error) {
        console.error('Error fetching user favorites:', error);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    fetchUserFavorites();
  }, [isConnected, address]);

  // Check if token is favorited on component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isConnected || !address || !addressParam) return;
      
      try {
        const response = await fetch(`/api/favorites?wallet=${address}`);
        if (response.ok) {
          const { favorites } = await response.json();
          const isFavorited = favorites.some((fav: any) => 
            fav.token_address.toLowerCase() === addressParam.toLowerCase()
          );
          setFavorited(isFavorited);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [isConnected, address, addressParam]);

  // Handle favorite toggle
  const handleFavorite = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet to add favorites');
      return;
    }

    if (!address || !addressParam) {
      toast.error('Missing wallet or token information');
      return;
    }

    setIsLoadingFavorite(true);

    try {
      const resolvedToken = resolveToken();
      const tokenName = resolvedToken?.name || getCryptoName(baseToken);
      const chainId = chainParam ? getChainId(chainParam) : 1;

      if (favorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?wallet=${address}&token=${addressParam}&chain=${chainId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setFavorited(false);
          toast.success('Removed from favorites');
          // Refresh favorites list
          const favResponse = await fetch(`/api/favorites?wallet=${address}`);
          if (favResponse.ok) {
            const { favorites } = await favResponse.json();
            setUserFavorites(favorites.slice(0, 4));
          }
        } else {
          const { error } = await response.json();
          toast.error(error || 'Failed to remove favorite');
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: address,
            tokenAddress: addressParam,
            tokenSymbol: baseToken,
            tokenName: tokenName,
            chainId: chainId,
          }),
        });

        if (response.ok) {
          setFavorited(true);
          toast.success('Added to favorites');
          // Refresh favorites list
          const favResponse = await fetch(`/api/favorites?wallet=${address}`);
          if (favResponse.ok) {
            const { favorites } = await favResponse.json();
            setUserFavorites(favorites.slice(0, 4));
          }
        } else {
          const { error } = await response.json();
          if (response.status === 409) {
            toast.error('Token already in favorites');
          } else {
            toast.error(error || 'Failed to add favorite');
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Helper function to get chain ID from chain parameter
  const getChainId = (chain: string): number => {
    const chainMap: { [key: string]: number } = {
      'ethereum': 1,
      'polygon': 137,
      'bsc': 56,
      'arbitrum': 42161,
      'optimism': 10,
      'avalanche': 43114,
      'solana': 101,
    };
    return chainMap[chain.toLowerCase()] || 1;
  };

  // Helper: pick token metadata from catalog
  const resolveToken = React.useCallback(() => {
    const list = tokens as Array<{ symbol: string; chain: string; address: string; name: string }>;

    // If explicit address is provided, resolve by address (and optional chain)
    if (addressParam) {
      const byAddress = list.filter(t => t.address.toLowerCase() === addressParam);
      if (byAddress.length) {
        if (chainParam) {
          const byChain = byAddress.find(t => t.chain.toLowerCase() === chainParam.toLowerCase());
          if (byChain) return byChain;
        }
        return byAddress[0];
      }
    }

    // Fallback: resolve by symbol (as before)
    const symbolMatches = list.filter(t => t.symbol.toUpperCase() === baseToken.toUpperCase());
    if (!symbolMatches.length) return null;
    if (chainParam) {
      const byChain = symbolMatches.find(t => t.chain.toLowerCase() === chainParam.toLowerCase());
      if (byChain) return byChain;
    }
    const eth = symbolMatches.find(t => t.chain === 'ethereum');
    return eth || symbolMatches[0];
  }, [baseToken, chainParam, addressParam]);

  // Map NYAX network labels to our chain slugs
  const mapNetworkToChain = (network: string | null | undefined): string | undefined => {
    if (!network) return undefined;
    const key = network.toLowerCase();
    const mapping: Record<string, string> = {
      'ethereum': 'ethereum',
      'eth': 'ethereum',
      'bsc': 'binance',
      'binance': 'binance',
      'binance smart chain': 'binance',
      'polygon': 'polygon',
      'matic': 'polygon',
      'avalanche': 'avalanche',
      'avax': 'avalanche',
      'arbitrum': 'arbitrum',
      'arbitrum one': 'arbitrum',
      'optimism': 'optimism',
      'base': 'base',
      'fantom': 'fantom',
      'solana': 'solana',
    };
    return mapping[key];
  };

  // Resolve NYAX image URL for the current token
  useEffect(() => {
    try {
      const nyaxList = (nyaxTokensData as any).tokens as Array<{ symbol?: string; network?: string; contractAddress?: string; logo?: string }>;
      if (!nyaxList || nyaxList.length === 0) return;
      let found: any = null;
      if (addressParam) {
        const lower = addressParam.toLowerCase();
        found = nyaxList.find(t => (t.contractAddress || '').toLowerCase() === lower);
      }
      if (!found) {
        const desiredChain = chainParam;
        found = nyaxList.find(t => (t.symbol || '').toUpperCase() === baseToken.toUpperCase() && (!desiredChain || mapNetworkToChain(t.network) === desiredChain));
      }
      setHeaderImageUrl(found?.logo || null);
    } catch (e) {
      // ignore
    }
  }, [baseToken, chainParam, addressParam]);

  // Fetch DexScreener price using chain/address (or resolved token)
  useEffect(() => {
    let aborted = false;
    const fetchDex = async () => {
      try {
        let chain = chainParam;
        let address = addressParam;
        if (!chain || !address) {
          const t = resolveToken();
          chain = chain || t?.chain;
          address = address || t?.address;
        }
        if (!chain || !address) return;
        const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${chain}/${address}`);
        if (!res.ok) return;
        const data = await res.json();
        const pair = data?.pairs?.[0];
        if (!pair) return;
        if (aborted) return;
        setDexPriceUsd(pair.priceUsd || null);
        const ch = pair?.priceChange?.h24;
        setDexChange24h(typeof ch === 'number' ? ch : (typeof ch === 'string' ? parseFloat(ch) : null));
      } catch (e) {
        // ignore
      }
    };
    fetchDex();
    return () => { aborted = true; };
  }, [chainParam, addressParam, resolveToken]);

  // Build dexscreener embed URL for token address
  const buildDexUrl = React.useCallback(() => {
    // If explicit chain/address provided, use them directly
    if (addressParam && chainParam) {
      return `https://dexscreener.com/${chainParam}/${addressParam}?embed=1&theme=dark&trades=0&info=0`;
    }
    const t = resolveToken();
    if (!t) return '';
    return `https://dexscreener.com/${t.chain}/${t.address}?embed=1&theme=dark&trades=0&info=0`;
  }, [resolveToken, addressParam, chainParam]);

  const buildTransactionDexUrl = React.useCallback(() => {
    if (addressParam && chainParam) {
      return `https://dexscreener.com/${chainParam}/${addressParam}?embed=1&theme=dark&chart=0&info=0`;
    }
    const t = resolveToken();
    if (!t) return '';
    return `https://dexscreener.com/${t.chain}/${t.address}?embed=1&theme=dark&chart=0&info=0`;
  }, [resolveToken, addressParam, chainParam]);

  const buildInfonDexUrl = React.useCallback(() => {
    if (addressParam && chainParam) {
      return `https://dexscreener.com/${chainParam}/${addressParam}?embed=1&theme=dark&chart=0&trades=0`;
    }
    const t = resolveToken();
    if (!t) return '';
    return `https://dexscreener.com/${t.chain}/${t.address}?embed=1&theme=dark&chart=0&trades=0`;
  }, [resolveToken, addressParam, chainParam]);

  // Fetch token pair data
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTokenPairData(baseToken, quoteToken);

        if (isMounted && data) {
          setPairData(data);
          setError(null);
        } else if (isMounted) {
          setError('Failed to fetch token data');
        }
      } catch (err) {
        if (isMounted) {
          setError('Error fetching token data');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    setDexEmbedUrl(buildDexUrl());
    setTransactionDexEmbedUrl(buildTransactionDexUrl());
    setInfoDexEmbedUrl(buildInfonDexUrl());

    // Set up interval to refresh data every minute
    const intervalId = setInterval(fetchData, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [baseToken, quoteToken, buildDexUrl, buildTransactionDexUrl, buildInfonDexUrl]);

  // Get TradingView symbol
  const getTradingViewSymbol = () => {
    // For stablecoins, use USD as the quote
    if (['USDT', 'USDC', 'DAI'].includes(quoteToken.toUpperCase())) {
      const baseId = getTokenId(baseToken);
      return baseId ? `COINBASE:${baseToken}USD` : 'COINBASE:BTCUSD';
    }

    // For crypto pairs
    return `COINBASE:${baseToken}${quoteToken}`;
  };

  const chartProps: any = {
    theme: "dark",
    symbol: getTradingViewSymbol(),
    interval: "15",
    timezone: "Etc/UTC",
    style: "1",
    locale: "en",
    toolbar_bg: "#0f1923",
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: false,
    withdateranges: true,
    save_image: false,
    studies: [
      "MASimple@tv-basicstudies",
      "RSI@tv-basicstudies"
    ],
    width: "100%",
    height: "100%",
    details: true,
    hotlist: true,
    calendar: true,
    overrides: {
      "paneProperties.background": "#0f1923",
      "paneProperties.vertGridProperties.color": "#1a2932",
      "paneProperties.horzGridProperties.color": "#1a2932",
      "symbolWatermarkProperties.transparency": 90,
      "scalesProperties.textColor": "#AAA",
      "mainSeriesProperties.candleStyle.wickUpColor": 'rgb(38,166,154)',
      "mainSeriesProperties.candleStyle.wickDownColor": 'rgb(239,83,80)',
      "studies.MA.color": "#E6E6FA",
      "studies.MA.linewidth": 2,
      "studies.RSI.color": "#F0E68C"
    }
  };

  return (
    <div className="p-4 text-white ">
      {/* Token Header */}
      {/* <Header /> */}


      {/* Main Content Grid */}
      <div className="grid grid-cols-4 mt-8 lg:grid-cols-4 gap-4">
        {/* Left Column - Stats and Order Panel */}
        <div className="lg:col-span-1">
          {/* Order Panel */}


          <div className="bg-[#0f1923] rounded-xl overflow-hidden mb-4">
            {/* <div className="p-4 pb-2">
              <div className="flex items-center justify-between mb-3">
              </div>
            </div> */}

            <iframe
              src={infoDexEmbedUrl}
              width="100%"
              height="600"
              style={{ border: 0 }}
            />
            <button className="w-full py-3 text-center text-gray-400 hover:text-white bg-[#1a2932] border-t border-gray-800">
              More info <FaChevronDown className="inline ml-1" />
            </button>
          </div>
          {/* <SwapPage /> */}
          <iframe
            src={`https://app.uniswap.org/#/swap?field=input&value=10&inputCurrency=${addressParam}`}
            height="660px"
            width="100%"
            style={{
              border: 0,
              margin: "0 auto",
              marginBottom: ".5rem",
              display: "block",
              borderRadius: "10px",
              maxWidth: "960px",
              minWidth: "300px",
            }}
            title="Uniswap Swap Widget"
          />

          <iframe
            src={`https://raydium.io/swap/?inputCurrency=${addressParam}&outputCurrency=USDC`}
            height="660px"
            width="100%"
            style={{
              border: 0,
              margin: " 0 auto",
              marginBottom: "0.5rem",
              display: "block",
              borderRadius: "10px",
              maxWidth: "960px",
            }}
          ></iframe>

        </div>

        {/* Right Column - Chart and Trades */}
        <div className="col-span-2 lg:col-span-2">
          {/* Chart */}
          <div className="bg-[#0f1923] rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              {/* Token Header Bar */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1a2932] flex items-center justify-center">
                  {headerImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={headerImageUrl} alt={baseToken} className="w-10 h-10 object-cover" />
                  ) : (
                    <Image
                      src={getCryptoIconUrl(baseToken)}
                      alt={baseToken}
                      width={40}
                      height={40}
                      unoptimized
                    />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{getCryptoName(baseToken)}</h3>
                  </div>
                  <div className="text-sm text-gray-400">{baseToken} <span className="text-gray-500">/</span> {quoteToken}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className={`p-2 rounded-full transition-all duration-200 ${
                    favorited 
                      ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' 
                      : 'text-gray-400 hover:text-white bg-[#1a2932] hover:bg-[#243540]'
                  } ${isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleFavorite}
                  disabled={isLoadingFavorite}
                  title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <FaStar className={isLoadingFavorite ? 'animate-pulse' : ''} />
                </button>
                <button
                  className="p-2 rounded-full text-gray-400 hover:text-white bg-[#1a2932]"
                  onClick={() => {
                    try {
                      const params = new URLSearchParams();
                      params.set('base', baseToken);
                      if (chainParam) params.set('chain', chainParam);
                      if (addressParam) params.set('address', addressParam);
                      if (typeof window !== 'undefined') {
                        const url = `${window.location.origin}/dashboard/trade?${params.toString()}`;
                        navigator.clipboard?.writeText(url);
                      }
                    } catch (e) {
                      console.error('Failed to copy link', e);
                    }
                  }}
                  title="Copy trade link"
                >
                  <FaRegCopy />
                </button>
                <div className="ml-4 text-right">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">
                      {dexPriceUsd
                        ? formatCurrency(parseFloat(dexPriceUsd), 'USD', parseFloat(dexPriceUsd) < 1 ? 6 : 2)
                        : pairData
                          ? formatCurrency(pairData.price, 'USD', pairData.price < 1 ? 6 : 2)
                          : '$0.00'}
                    </div>
                    <FaInfoCircle className="text-gray-500" />
                  </div>
                  <div className={`${(dexChange24h ?? pairData?.priceChangePercentage24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'} text-sm`}>
                    {dexChange24h !== null && dexChange24h !== undefined
                      ? `${dexChange24h >= 0 ? '+' : ''}${dexChange24h.toFixed(2)}% 24h`
                      : pairData?.priceChangePercentage24h !== undefined
                        ? `${pairData.priceChangePercentage24h >= 0 ? '+' : ''}${pairData.priceChangePercentage24h.toFixed(2)}% 24h`
                        : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Row */}
            <div className="flex items-center gap-3 mb-3 text-gray-300">
              {(() => {
                const t = resolveToken();
                const pairLink = (addressParam && chainParam)
                  ? `https://dexscreener.com/${chainParam}/${addressParam}`
                  : (t ? `https://dexscreener.com/${t.chain}/${t.address}` : '');
                return (
                  <>
                    {pairLink && (
                      <a href={pairLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]" title="View on Dexscreener">
                        <FaChartLine />
                      </a>
                    )}
                    <a className="p-2 bg-[#1a2932] rounded-full opacity-50 cursor-not-allowed" title="Website (not provided)">
                      <FaGlobe />
                    </a>
                    <a className="p-2 bg-[#1a2932] rounded-full opacity-50 cursor-not-allowed" title="Telegram (not provided)">
                      <FaTelegram />
                    </a>
                    <a className="p-2 bg-[#1a2932] rounded-full opacity-50 cursor-not-allowed" title="Twitter (not provided)">
                      <FaTwitter />
                    </a>
                    <button className="p-2 bg-[#1a2932] rounded-full opacity-50 cursor-not-allowed" title="More">
                      <FaEllipsisV />
                    </button>
                  </>
                );
              })()}
            </div>

            {/* Chart Container */}
            <div className="w-full h-[500px] rounded-lg relative">
              {/* <AdvancedRealTimeChart {...chartProps} /> */}
              <iframe
                src={dexEmbedUrl}
                width="100%"
                height="500"
                style={{ border: 0, backgroundColor: "transparent" }}
              />
            </div>

          </div>


          {/* Trades/Info Tabs */}
          <div className="bg-[#0f1923] rounded-xl overflow-hidden">
            <div className="flex border-b border-gray-800">
              <button
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'trades'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
                  }`}
                onClick={() => setActiveTab('trades')}
              >
                Trades
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'info'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
                  }`}
                onClick={() => setActiveTab('info')}
              >
                Info
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'analytics'
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
                  <div style={{ backgroundColor: "#0f1923", padding: "0px", borderRadius: "8px" }}>
                    <iframe
                      src={transactionDexEmbedUrl}
                      width="100%"
                      height="300"
                      style={{ border: 0, display: "block", width: "100%" }}
                    />
                  </div>

               
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3">Token Information</h3>
                <p className="text-gray-300 mb-4">
                  {baseToken === 'USDT' ?
                    `Tether USD (USDT) is a stablecoin pegged to the US Dollar. Each USDT token is backed by one US dollar, maintaining a 1:1 ratio with the USD. It enables users to transfer value globally without the volatility associated with cryptocurrencies.` :
                    baseToken === 'BTC' ?
                      `Bitcoin (BTC) is the first decentralized cryptocurrency, created in 2009 by an unknown person or group using the pseudonym Satoshi Nakamoto. It operates on a blockchain, a distributed ledger that records all transactions across a network of computers.` :
                      baseToken === 'ETH' ?
                        `Ethereum (ETH) is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform. It is the second-largest cryptocurrency by market capitalization, after Bitcoin.` :
                        `${getCryptoName(baseToken)} (${baseToken}) is a cryptocurrency traded against ${getCryptoName(quoteToken)} (${quoteToken}). View the chart for real-time price information.`
                  }
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

          <div className="mt-4">
            <Faq baseToken={baseToken} quoteToken={quoteToken} />
          </div>
        </div>

        <div className=" col-span-1 lg:col-span-1">
          <div className="bg-[#0f1923] rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold">FAVORITES</h2>
                <FaInfoCircle className="text-gray-400 ml-2" size={16} />
              </div>
              <div className="flex items-center">
                <button className="p-2 text-gray-400 hover:text-white">
                  <FaChartBar size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-white">
                  <FaTimes size={18} />
                </button>
              </div>
            </div>

            <div className="flex justify-between mb-4">
              <div className="bg-[#1a2932] rounded-md px-4 py-2 flex-grow mr-2">
                <div className="flex items-center">
                  <span className="text-gray-400">Last added</span>
                  <FaChevronDown className="ml-1 text-gray-400" size={12} />
                </div>
              </div>
              <div className="bg-[#1a2932] rounded-md px-4 py-2 w-24">
                <div className="flex items-center justify-between">
                  <span>All</span>
                  <FaChevronDown className="text-gray-400" size={12} />
                </div>
              </div>
            </div>

            {isLoadingFavorites ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading favorites...</p>
              </div>
            ) : userFavorites.length > 0 ? (
              <div className="space-y-3">
                {userFavorites.map((favorite, index) => (
                  <div 
                    key={favorite._id || index}
                    className="bg-[#1a2932] rounded-lg p-3 hover:bg-[#243540] transition-colors cursor-pointer"
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set('base', favorite.tokenSymbol);
                      params.set('address', favorite.tokenAddress);
                      if (favorite.chainId !== 1) {
                        const chainName = getChainName(favorite.chainId);
                        if (chainName) params.set('chain', chainName);
                      }
                      window.location.href = `/dashboard/trade?${params.toString()}`;
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 overflow-hidden bg-[#0f1923]">
                          <Image
                            src={getCryptoIconUrl(favorite.tokenSymbol)}
                            alt={favorite.tokenSymbol}
                            width={32}
                            height={32}
                            unoptimized
                          />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-white">{favorite.tokenSymbol}</span>
                            <span className="text-gray-400 ml-2 text-sm">/ {favorite.tokenName}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getChainName(favorite.chainId) || 'Ethereum'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
                {userFavorites.length >= 4 && (
                  <div className="text-center pt-2">
                    <button 
                      onClick={() => window.location.href = '/dashboard/favorites'}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                    >
                      View all favorites →
                    </button>
                  </div>
                )}
              </div>
            ) : !isConnected ? (
              <div className="text-center py-8">
                <FaWallet className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-xl mb-2">Connect your wallet</p>
                <p className="text-gray-400">Connect your wallet to view your favorite tokens</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaStar className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-xl mb-2">Your favorite list is empty!</p>
                <p className="text-gray-400">Start building your favorite list by adding tokens.</p>
              </div>
            )}
          </div>
          {/* YouTube Video (below favorites) */}
          {/* <div className="bg-[#0f1923] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Video</h2>
              <FaInfoCircle className="text-gray-400" size={16} />
            </div>
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute min-h-[500px] inset-0 w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/z8uiTA1cdWA?autoplay=1&mute=1"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div> */}
          <div>
            <div>
              <div className="w-full min-h-[500px] aspect-video">

                <iframe
                  className=" min-h-[500px] inset-0 w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/z8uiTA1cdWA?autoplay=1&mute=1"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>

          </div>
        </div>
      </div>
      <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1a2932',
          color: '#fff',
          border: '1px solid #374151',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
    </div >
    
 
 
    
  );
}

// Note: single default export defined above (Page). Removed legacy wrapper to avoid duplicate default export.
