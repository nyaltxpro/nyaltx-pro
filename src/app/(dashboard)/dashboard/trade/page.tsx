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
  FaSearch,
  FaFilter,
  FaEllipsisV,
  FaChartBar,
  FaWallet,
  FaGlobe,
  FaTelegram,
  FaTwitter,
  FaRegCopy,
  FaChevronDown,
  FaInfoCircle,
  FaYoutube,
  FaDiscord,
  FaGithub,
  FaSyncAlt
} from 'react-icons/fa';
import Faq from '@/components/Faq';
import { fetchTokenPairData, TokenPairData, formatCurrency, formatPercentage, getTokenId } from '@/api/coingecko/api';
import { getCryptoIconUrl, getCryptoIconUrlWithFallback } from '@/utils/cryptoIcons';
import { getCryptoName } from '@/utils/cryptoNames';
import { geckoTerminalAPI } from '@/utils/geckoTerminalApi';
import nyaxTokensData from '../../../../../nyax-tokens-data.json';
import SwapPage from '@/components/SwapCard';

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


// Move useSearchParams into a child and wrap with Suspense to satisfy Next.js requirements
function TradePageContent() {
  const searchParams = useSearchParams();
  const baseToken = (searchParams.get('base') || '').toUpperCase();
  const chainParam = searchParams.get('chain')?.toLowerCase() || '';
  const addressParam = searchParams.get('address')?.toLowerCase() || '';
  const quoteToken = searchParams.get('quote') || 'USDT';
  const videoId = searchParams.get('video') || 'VNTK2Bwyq7s';

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [baseToken, chainParam, addressParam]);

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
  const [favorited, setFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('trades');
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
  const [priceSource, setPriceSource] = useState<'dexscreener' | 'geckoterminal' | 'coingecko' | null>(null);
  const [isRefreshingPrice, setIsRefreshingPrice] = useState(false);
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // Token social links and admin settings state
  const [tokenSocialLinks, setTokenSocialLinks] = useState<{
    imageUri?: string;
    website?: string;
    telegram?: string;
    twitter?: string;
    youtube?: string;
    discord?: string;
    github?: string;
    tokenName?: string;
    tokenSymbol?: string;
    blockchain?: string;
    contractAddress?: string;
  } | null>(null);
  const [adminSocialLinksEnabled, setAdminSocialLinksEnabled] = useState<boolean>(false);
  const [isRegisteredToken, setIsRegisteredToken] = useState<boolean>(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);

  // Fetch token social links and admin settings
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        console.log("In fetch token")
        // Check if token is registered and fetch social links by contract address
        if (addressParam) {
          console.log('registered Token', addressParam)
          try {
            const tokenResponse = await fetch(`/api/tokens/by-address/${addressParam}`);
            console.log(tokenResponse)
            
              const tokenData = await tokenResponse.json();
              console.log(tokenData)
              setIsRegisteredToken(true);
              setTokenSocialLinks({
                imageUri: tokenData.imageUri,
                website: tokenData.website,
                telegram: tokenData.telegram,
                twitter: tokenData.twitter,
                youtube: tokenData.youtube,
                discord: tokenData.discord,
                github: tokenData.github,
                tokenName: tokenData.tokenName,
                tokenSymbol: tokenData.tokenSymbol,
                blockchain: tokenData.blockchain,
                contractAddress: tokenData.contractAddress
              });
              setCustomVideoUrl(tokenData.youtube);
              console.log(tokenSocialLinks)
          
          } catch (err) {
            console.log(err)
          }


        } else {
          // Fallback to symbol-based lookup if no address provided
          const tokenResponse = await fetch(`/api/tokens/by-symbol/${baseToken}`);
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            setIsRegisteredToken(true);
            setTokenSocialLinks({
              imageUri: tokenData.imageUri,
              website: tokenData.website,
              telegram: tokenData.telegram,
              twitter: tokenData.twitter,
              youtube: tokenData.youtube,
              discord: tokenData.discord,
              github: tokenData.github,
              tokenName: tokenData.tokenName,
              tokenSymbol: tokenData.tokenSymbol,
              blockchain: tokenData.blockchain,
              contractAddress: tokenData.contractAddress
            });
            setCustomVideoUrl(tokenData.youtube);
          } else {
            setIsRegisteredToken(false);
            setTokenSocialLinks(null);
          }
        }

        // Fetch admin settings for social links
        const adminResponse = await fetch('/api/admin/settings');
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          setAdminSocialLinksEnabled(adminData.socialLinksEnabled || false);
        }
      } catch (error) {
        console.error('Error fetching token data:', error);
        setIsRegisteredToken(false);
        setTokenSocialLinks(null);
      }
    };

    if (addressParam || baseToken) {
      fetchTokenData();
    }
  }, [addressParam, baseToken]);

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

  // Resolve NYAX image URL for the current token with GeckoTerminal fallback
  useEffect(() => {
    const fetchHeaderImage = async () => {
      try {
        const nyaxList = (nyaxTokensData as any).tokens as Array<{ symbol?: string; network?: string; contractAddress?: string; logo?: string }>;
        if (nyaxList && nyaxList.length > 0) {
          let found: any = null;
          if (addressParam) {
            const lower = addressParam.toLowerCase();
            found = nyaxList.find(t => (t.contractAddress || '').toLowerCase() === lower);
          }
          if (!found) {
            const desiredChain = chainParam;
            found = nyaxList.find(t => (t.symbol || '').toUpperCase() === baseToken.toUpperCase() && (!desiredChain || mapNetworkToChain(t.network) === desiredChain));
          }
          
          // If found in local data, use that
          if (found?.logo) {
            setHeaderImageUrl(found.logo);
            return;
          }
        }
        
        // Try GeckoTerminal fallback if we have chain and address
        if (chainParam && addressParam) {
          console.log(`🔍 Trade Page: Trying GeckoTerminal for token icon ${baseToken}`);
          try {
            const iconUrl = await getCryptoIconUrlWithFallback(baseToken, chainParam, addressParam);
            if (iconUrl && !iconUrl.includes('/crypto-icons/')) {
              console.log(`✅ Trade Page: Using GeckoTerminal icon for ${baseToken}:`, iconUrl);
              setHeaderImageUrl(iconUrl);
              return;
            }
          } catch (error) {
            console.warn('Failed to get icon from GeckoTerminal:', error);
          }
        }
        
        // Fallback to local crypto icons
        const fallbackIcon = getCryptoIconUrl(baseToken);
        setHeaderImageUrl(fallbackIcon);
        
      } catch (e) {
        console.warn('Error fetching header image:', e);
        // Final fallback
        setHeaderImageUrl(getCryptoIconUrl(baseToken));
      }
    };

    fetchHeaderImage();
  }, [baseToken, chainParam, addressParam]);

  // Extract price fetching logic into a reusable function
  const fetchPriceData = React.useCallback(async (isManualRefresh = false) => {
    let aborted = false;
    
    if (isManualRefresh) {
      setIsRefreshingPrice(true);
    }
    
    try {
      // Reset price data when starting new fetch
      setDexPriceUsd(null);
      setDexChange24h(null);
      setPriceSource(null);
      
      let chain = chainParam;
      let address = addressParam;
      if (!chain || !address) {
        const t = resolveToken();
        chain = chain || t?.chain;
        address = address || t?.address;
      }
      if (!chain || !address) return;

      console.log(`🔄 Fetching price for ${chain}:${address} ${isManualRefresh ? '(Manual Refresh)' : ''}`);

      // Method 2: Try GeckoTerminal as fallback
      try {
        console.log('🟩 Trying GeckoTerminal API...');
        console.log(`🔍 Trade Page: Calling GeckoTerminal with chain="${chain}", address="${address}"`);
        const geckoData = await geckoTerminalAPI.getTokenPrice(chain, address);
        if (geckoData && geckoData.price_usd && geckoData.price_usd !== '0') {
          if (aborted) return;
          console.log('✅ GeckoTerminal: Price found', geckoData.price_usd);
          setDexPriceUsd(geckoData.price_usd);
          setPriceSource('geckoterminal');
          const change24h = parseFloat(geckoData.price_change_24h);
          setDexChange24h(isNaN(change24h) ? null : change24h);
          return; // Success, exit early
        }
      } catch (e) {
        console.log('❌ GeckoTerminal failed:', e);
      }

      // Method 3: If both fail, the existing CoinGecko fallback in pairData will be used
      console.log('⚠️ All price APIs failed, falling back to CoinGecko pair data');

    } catch (e) {
      console.error('💥 Price fetching error:', e);
    } finally {
      if (isManualRefresh) {
        setIsRefreshingPrice(false);
      }
    }

    return () => { aborted = true; };
  }, [chainParam, addressParam, resolveToken]);

  // Manual refresh function
  const handleRefreshPrice = () => {
    fetchPriceData(true);
  };

  // Fetch price data with multiple fallbacks: DexScreener -> GeckoTerminal -> CoinGecko
  useEffect(() => {
    fetchPriceData();
  }, [fetchPriceData]);

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
          // Only set CoinGecko as source if no other price source is available
          if (!dexPriceUsd) {
            setPriceSource('coingecko');
          }
          setError(null);
        } else if (isMounted) {
          console.log(`CoinGecko data not available for ${baseToken}/${quoteToken}, will rely on other price sources`);
          setPairData(null);
          setError(null); // Don't show error, just rely on other price sources
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




  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="p-4 text-white min-h-screen">
      {/* Token Header */}
      {/* <Header /> */}
      {/* Main Content Grid */}
      <div className="grid grid-cols-4 mt-8 lg:grid-cols-4 gap-4">
        {/* Left Column - Stats and Order Panel */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f1923] rounded-xl overflow-hidden mb-4">
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
          <SwapPage />
          {/* <iframe
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
          /> */}

          {/* <iframe
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
          ></iframe> */}

        </div>

        {/* Right Column - Chart and Trades */}
        <div className="col-span-2 lg:col-span-2">
          {/* Chart */}
          <div className="bg-[#0f1923] rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              {/* Token Header Bar */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1a2932] flex items-center justify-center">
                  {/* Priority: API imageUri > headerImageUrl > fallback icon */}
                  {tokenSocialLinks?.imageUri ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tokenSocialLinks.imageUri} alt={baseToken} className="w-10 h-10 object-cover" />
                  ) : headerImageUrl ? (
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
                    <h3 className="text-lg font-semibold">
                      {tokenSocialLinks?.tokenName || getCryptoName(baseToken)}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-400">
                    {tokenSocialLinks?.tokenSymbol || baseToken} <span className="text-gray-500">/</span> {quoteToken}
                    {tokenSocialLinks?.blockchain && (
                      <span className="ml-2 text-xs bg-[#1a2932] px-2 py-1 rounded capitalize">
                        {tokenSocialLinks.blockchain}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className={`p-2 rounded-full transition-all duration-200 ${favorited
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
                    {/* {priceSource && (
                      <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                        priceSource === 'dexscreener' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : priceSource === 'geckoterminal'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {priceSource === 'dexscreener' ? 'DexScreener' : 
                         priceSource === 'geckoterminal' ? 'GeckoTerminal' : 'CoinGecko'}
                      </div>
                    )} */}
                    <button
                      onClick={handleRefreshPrice}
                      disabled={isRefreshingPrice}
                      className={`p-1 rounded-full transition-all duration-200 ${
                        isRefreshingPrice 
                          ? 'text-gray-500 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-[#00b8d8] hover:bg-[#00b8d8]/10'
                      }`}
                      title="Refresh price data"
                    >
                      <FaSyncAlt className={`text-sm ${isRefreshingPrice ? 'animate-spin' : ''}`} />
                    </button>
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

                // Show social links only if token is registered and admin has enabled them
                const showSocialLinks = isRegisteredToken && adminSocialLinksEnabled && tokenSocialLinks;

                return (
                  <>
                    {pairLink && (
                      <a href={pairLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]" title="View on Dexscreener">
                        <FaChartLine />
                      </a>
                    )}

                    {/* Website Link */}
                    {showSocialLinks && tokenSocialLinks.website ? (
                      <a href={tokenSocialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]" title="Visit Website">
                        <FaGlobe />
                      </a>
                    ) : (
                      <a className="p-2 bg-[#1a2932] rounded-full opacity-50 cursor-not-allowed" title="Website (not provided)">
                        <FaGlobe />
                      </a>
                    )}

                    {/* Telegram Link */}
                    {showSocialLinks && tokenSocialLinks.telegram ? (
                      <a href={tokenSocialLinks.telegram} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]" title="Join Telegram">
                        <FaTelegram />
                      </a>
                    ) : (
                      <a className="p-2 bg-[#1a2932] rounded-full opacity-50 cursor-not-allowed" title="Telegram (not provided)">
                        <FaTelegram />
                      </a>
                    )}

                    {/* Twitter Link */}
                    {showSocialLinks && tokenSocialLinks.twitter ? (
                      <a href={tokenSocialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]" title="Follow on Twitter">
                        <FaTwitter />
                      </a>
                    ) : (
                      <a className="p-2 bg-[#1a2932] rounded-full opacity-50 cursor-not-allowed" title="Twitter (not provided)">
                        <FaTwitter />
                      </a>
                    )}

                    {/* YouTube Link (if available) */}
                    {showSocialLinks && tokenSocialLinks.youtube && (
                      <a href={tokenSocialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]" title="Watch on YouTube">
                        <FaYoutube />
                      </a>
                    )}

                    {/* Discord Link (if available) */}
                    {showSocialLinks && tokenSocialLinks.discord && (
                      <a href={tokenSocialLinks.discord} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]" title="Join Discord">
                        <FaDiscord />
                      </a>
                    )}

                    {/* GitHub Link (if available) */}
                    {showSocialLinks && tokenSocialLinks.github && (
                      <a href={tokenSocialLinks.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1a2932] rounded-full hover:bg-[#253440]" title="View on GitHub">
                        <FaGithub />
                      </a>
                    )}

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
              {/* <button
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
              </button> */}
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

            {/* {activeTab === 'info' && (
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
            )} */}

            {/* {activeTab === 'analytics' && (
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
            )} */}
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
                {/* <button className="p-2 text-gray-400 hover:text-white">
                  <FaTimes size={18} />
                </button> */}
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
                {(() => {
                  // Extract video ID from YouTube URL if custom video is available
                  const getYouTubeVideoId = (url: string): string | null => {
                    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                    const match = url.match(regex);
                    return match ? match[1] : null;
                  };

                  // Determine which video to show
                  let videoId = 'z8uiTA1cdWA'; // Default video ID
                  let videoTitle = 'Default Video';

                  // If token is registered, admin allows social links, and custom video URL exists
                  if (isRegisteredToken && adminSocialLinksEnabled && customVideoUrl) {
                    const extractedId = getYouTubeVideoId(customVideoUrl);
                    if (extractedId) {
                      videoId = extractedId;
                      videoTitle = `${baseToken} Video`;
                    }
                  }

                  return (
                    <iframe
                      className="min-h-[500px] inset-0 w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                      title={videoTitle}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>


      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
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