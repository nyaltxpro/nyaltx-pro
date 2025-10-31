'use client';
import CryptocurrencyIcon from '@/components/CryptocurrencyIcon';
import TokenAvatar from '@/components/TokenAvatar';
import { ActivityLogIcon, ExternalLinkIcon, RocketIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
// import NetworkWeb3Icon from '@/utils/networkIcon'
// Moralis Pump.fun Token Interface
interface PumpFunToken {
  tokenAddress: string;
  name: string;
  symbol: string;
  logo: string | null;
  decimals: string;
  priceNative: string;
  priceUsd: string;
  liquidity: string;
  fullyDilutedValuation: string;
  bondingCurveProgress: number;
}

// DexScreener Token Profile Interface
interface DexScreenerToken {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon: string;
  header?: string;
  openGraph?: string;
  description?: string;
  links?: Array<{ type?: string; label?: string; url: string }>;
  cto: boolean;
  // Enhanced insights data
  insights?: {
    priceUsd?: string;
    priceChange24h?: number;
    volume24h?: number;
    liquidity?: number;
    txns24h?: number;
    symbol?: string;
    name?: string;
  };
}

const LivePriceTicker: React.FC = () => {
  const router = useRouter();
  const [tokens, setTokens] = useState<PumpFunToken[]>([]);
  const [dexScreenerTokens, setDexScreenerTokens] = useState<DexScreenerToken[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dexScreenerLoading, setDexScreenerLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch DexScreener latest token profiles
  const fetchDexScreenerTokens = async () => {
    try {
      setDexScreenerLoading(true);

      const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
      }

      const data: DexScreenerToken[] = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        // Take top 20 latest token profiles
        const latestTokens = data.slice(0, 20);

        // Fetch insights for each token (limit to first 10 to avoid rate limits)
        const tokensWithInsights = await Promise.all(
          latestTokens.slice(0, 10).map(async (token) => {
            try {
              const insightsResponse = await fetch(
                `/api/dexscreener/token-insights?chain=${token.chainId}&address=${token.tokenAddress}`
              );

              if (insightsResponse.ok) {
                const insightsData = await insightsResponse.json();
                const mainPair = insightsData.mainPair;

                if (mainPair) {
                  return {
                    ...token,
                    insights: {
                      priceUsd: mainPair.priceUsd,
                      priceChange24h: mainPair.priceChange?.h24,
                      volume24h: mainPair.volume?.h24,
                      liquidity: mainPair.liquidity?.usd,
                      txns24h: (mainPair.txns?.h24?.buys || 0) + (mainPair.txns?.h24?.sells || 0),
                      symbol: mainPair.baseToken?.symbol,
                      name: mainPair.baseToken?.name,
                    },
                  };
                }
              }
            } catch (err) {
              console.error(`Failed to fetch insights for ${token.tokenAddress}:`, err);
            }
            return token;
          })
        );

        setDexScreenerTokens(tokensWithInsights);
        console.log(`✅ Loaded ${tokensWithInsights.length} DexScreener token profiles with insights`);
      } else {
        throw new Error('Invalid DexScreener API response structure');
      }
    } catch (err) {
      console.error('❌ Error fetching DexScreener tokens:', err);
      setDexScreenerTokens([]);
    } finally {
      setDexScreenerLoading(false);
      setLoading(false);
    }
  };

  // Fetch Pump.fun bonding tokens from Moralis API
  const fetchPumpFunTokens = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/moralis/pumpfun-bonding', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.result && Array.isArray(data.result)) {
        // Sort by bonding curve progress (highest first) and take top 20
        const sortedTokens = data.result
          .sort((a: PumpFunToken, b: PumpFunToken) => b.bondingCurveProgress - a.bondingCurveProgress)
          .slice(0, 20);

        setTokens(sortedTokens);
        console.log(`✅ Loaded ${sortedTokens.length} Pump.fun bonding tokens`);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      console.error('❌ Error fetching Pump.fun tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tokens');
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    // fetchPumpFunTokens();
    fetchDexScreenerTokens();

    // Set up auto-refresh every 30 seconds for Pump.fun tokens
    // const pumpFunInterval = setInterval(fetchPumpFunTokens, 30000);

    // Set up auto-refresh every 60 seconds for DexScreener tokens
    const dexScreenerInterval = setInterval(fetchDexScreenerTokens, 60000);

    return () => {
      // clearInterval(pumpFunInterval);
      clearInterval(dexScreenerInterval);
    };
  }, []);

  // Auto-scrolling effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || dexScreenerLoading || dexScreenerTokens.length === 0) return;

    let animationId: number;
    let position = 0;
    const speed = 0.8; // pixels per frame (slightly faster for more tokens)
    const totalWidth = scrollContainer.scrollWidth;

    const scroll = () => {
      position += speed;
      if (position >= totalWidth / 2) {
        position = 0;
      }
      scrollContainer.scrollLeft = position;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dexScreenerLoading, dexScreenerTokens]);

  // Format USD price with appropriate precision
  const formatUsdPrice = (priceStr: string): string => {
    const price = parseFloat(priceStr);
    if (price < 0.000001) return `$${price.toFixed(9)}`;
    if (price < 0.00001) return `$${price.toFixed(8)}`;
    if (price < 0.0001) return `$${price.toFixed(7)}`;
    if (price < 0.001) return `$${price.toFixed(6)}`;
    if (price < 0.01) return `$${price.toFixed(5)}`;
    if (price < 0.1) return `$${price.toFixed(4)}`;
    if (price < 1) return `$${price.toFixed(3)}`;
    return `$${price.toFixed(2)}`;
  };

  // Format SOL price
  const formatSolPrice = (priceStr: string): string => {
    const price = parseFloat(priceStr);
    if (price < 0.000001) return `${price.toFixed(9)} SOL`;
    if (price < 0.00001) return `${price.toFixed(8)} SOL`;
    if (price < 0.0001) return `${price.toFixed(7)} SOL`;
    return `${price.toFixed(6)} SOL`;
  };

  // Get bonding progress color
  const getBondingProgressColor = (progress: number): string => {
    if (progress >= 90) return 'text-red-400'; // Close to completion
    if (progress >= 70) return 'text-yellow-400'; // Getting close
    if (progress >= 50) return 'text-blue-400'; // Moderate progress
    return 'text-green-400'; // Early stage
  };

  // Format bonding progress
  const formatBondingProgress = (progress: number): string => {
    return `${progress.toFixed(1)}%`;
  };

  // Format price change percentage
  const formatPriceChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  // Get price change color
  const getPriceChangeColor = (change: number): string => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  // Format market cap
  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  };

  // Format USD price for market movers
  const formatMarketMoverPrice = (price: number): string => {
    if (price < 0.000001) return `$${price.toFixed(9)}`;
    if (price < 0.00001) return `$${price.toFixed(8)}`;
    if (price < 0.0001) return `$${price.toFixed(7)}`;
    if (price < 0.001) return `$${price.toFixed(6)}`;
    if (price < 0.01) return `$${price.toFixed(5)}`;
    if (price < 0.1) return `$${price.toFixed(4)}`;
    if (price < 1) return `$${price.toFixed(3)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString()}`;
  };

  // Navigate to trade page for DexScreener tokens
  const handleDexScreenerTokenClick = (token: DexScreenerToken) => {
    const params = new URLSearchParams();
    params.set('address', token.tokenAddress);
    params.set('chain', token.chainId);
    params.set('imageUri', token.icon);
    params.set('source', 'dexscreener');

    // Use insights data if available
    if (token.insights?.symbol) {
      params.set('base', token.insights.symbol);
    }
    if (token.insights?.name) {
      params.set('name', token.insights.name);
    } else if (token.description) {
      // Fallback to extracting from description
      const descWords = token.description.split(' ');
      if (descWords.length > 0) {
        params.set('name', descWords.slice(0, 3).join(' '));
      }
    }

    // Pass price data
    if (token.insights?.priceUsd) {
      params.set('price', token.insights.priceUsd);
    }
    if (token.insights?.priceChange24h !== undefined) {
      params.set('priceChange24h', token.insights.priceChange24h.toString());
    }
    if (token.insights?.volume24h) {
      params.set('volume24h', token.insights.volume24h.toString());
    }
    if (token.insights?.liquidity) {
      params.set('liquidity', token.insights.liquidity.toString());
    }

    router.push(`/dashboard/trade?${params.toString()}`);
  };

  // Navigate to trade page for Pump.fun tokens
  const handlePumpFunTokenClick = (token: PumpFunToken) => {
    const params = new URLSearchParams();
    params.set('base', token.symbol);
    params.set('name', token.name);
    params.set('chain', 'solana');
    params.set('address', token.tokenAddress);
    if (token.logo) params.set('imageUri', token.logo);
    params.set('source', 'pumpfun');
    router.push(`/dashboard/trade?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-lg border-y border-gray-800/50 py-3 flex items-center justify-center" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-lg flex items-center justify-center animate-pulse">
            <ActivityLogIcon className="w-3 h-3 text-white" />
          </div>
          <div className="animate-pulse flex space-x-4">
            <div className="h-4 w-24 bg-gray-700/50 rounded-lg"></div>
            <div className="h-4 w-16 bg-gray-700/50 rounded-lg"></div>
            <div className="h-4 w-12 bg-gray-700/50 rounded-lg"></div>
          </div>
          <span className="text-sm text-gray-400">Loading live prices...</span>
        </div>
      </div>
    );
  }

  // // Show fallback message if no tokens available
  // if (error || (!loading && (!tokens || tokens.length === 0))) {
  //   return (
  //     <div className="w-full bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-lg border-y border-gray-800/50 py-3 flex items-center justify-center" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
  //       <div className="flex items-center gap-3 text-gray-400">
  //         <div className="w-6 h-6 rounded-lg bg-gray-700/50 flex items-center justify-center">
  //           <ActivityLogIcon className="w-3 h-3" />
  //         </div>
  //         <span className="text-sm">Live prices temporarily unavailable</span>
  //         <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <Tooltip.Provider>
      <div className="w-full bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-lg border-y border-gray-800/50 py-3 overflow-hidden relative" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
        {/* Animated background accent */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00d4aa] to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent animate-pulse"></div>

        <div
          ref={scrollRef}
          className="flex items-center space-x-8 overflow-x-auto scrollbar-hide"
          style={{
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* DexScreener Latest Tokens Section Header */}
          <div className="flex items-center gap-3 pl-6 flex-shrink-0">
            <div className="w-7 h-7 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <RocketIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-semibold text-sm" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                LATEST TOKENS
              </span>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* DexScreener Tokens */}
          {dexScreenerTokens.length > 0 && [...dexScreenerTokens, ...dexScreenerTokens].map((token, index) => (
            <Tooltip.Root key={`dex-${token.tokenAddress}-${index}`}>
              <Tooltip.Trigger asChild>
                <div
                  className="group flex items-center gap-3 px-4 py-2 bg-gray-800/30 hover:bg-gray-700/40 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 border border-gray-700/30 hover:border-cyan-400/40 flex-shrink-0"
                  onClick={() => handleDexScreenerTokenClick(token)}
                >
                  <div className="flex items-center gap-3">
                    {/* Token Logo */}
                    <div className="relative">
                      <TokenAvatar
                        src={token.icon}
                        symbol={token.insights?.symbol || token.tokenAddress.slice(0, 6)}
                        name={token.insights?.name}
                        size={32}
                        className="ring-2 ring-gray-600/50"
                      />
                      {/* Chain badge */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 flex items-center justify-center">
                        <CryptocurrencyIcon name={token.chainId ? token.chainId : 'solana' as any} />
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          {token.insights?.symbol || token.tokenAddress.slice(0, 6)}...{!token.insights?.symbol && token.tokenAddress.slice(-4)}
                        </span>
                        {token.insights?.priceChange24h !== undefined && (
                          <div className={`px-1.5 py-0.5 rounded text-xs font-semibold ${token.insights.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                            } bg-gray-800/50`}>
                            {token.insights.priceChange24h >= 0 ? '+' : ''}{token.insights.priceChange24h.toFixed(2)}%
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {token.insights?.priceUsd ? (
                          <span className="text-gray-300 text-xs font-mono" style={{ fontFamily: 'SF Mono, Monaco, monospace' }}>
                            ${parseFloat(token.insights.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs capitalize" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {token.chainId}
                          </span>
                        )}
                        {token.insights?.volume24h && (
                          <span className="text-gray-500 text-xs">
                            • Vol ${(token.insights.volume24h / 1000).toFixed(1)}K
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ExternalLinkIcon className="w-3 h-3 text-cyan-400" />
                  </div>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm max-w-xs">
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {token.insights?.name || 'Latest Token'} ({token.insights?.symbol || token.tokenAddress.slice(0, 6)})
                    </div>
                    {token.description && (
                      <div className="text-xs text-gray-300">
                        {token.description.slice(0, 100)}{token.description.length > 100 ? '...' : ''}
                      </div>
                    )}
                    {token.insights && (
                      <div className="text-xs text-gray-300 space-y-0.5">
                        {token.insights.priceUsd && (
                          <div>Price: ${parseFloat(token.insights.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                        )}
                        {token.insights.priceChange24h !== undefined && (
                          <div className={token.insights.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                            24h: {token.insights.priceChange24h >= 0 ? '+' : ''}{token.insights.priceChange24h.toFixed(2)}%
                          </div>
                        )}
                        {token.insights.volume24h && (
                          <div>Volume: ${(token.insights.volume24h / 1000).toFixed(1)}K</div>
                        )}
                        {token.insights.liquidity && (
                          <div>Liquidity: ${(token.insights.liquidity / 1000).toFixed(1)}K</div>
                        )}
                        {token.insights.txns24h && (
                          <div>Txns 24h: {token.insights.txns24h.toLocaleString()}</div>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      {token.tokenAddress.slice(0, 10)}...{token.tokenAddress.slice(-10)}
                    </div>
                    <div className="text-xs text-gray-400">Click to view on Trade page</div>
                  </div>
                  <Tooltip.Arrow className="fill-black/90" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ))}

          {/* Pump.fun Section Header */}
          <div className="flex items-center gap-3 pl-6 flex-shrink-0">
            <div className="w-7 h-7 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-lg flex items-center justify-center">
              <RocketIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00d4aa] font-semibold text-sm" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                PUMP.FUN BONDING
              </span>
              <div className="w-2 h-2 bg-[#00d4aa] rounded-full animate-pulse"></div>
            </div>
          </div>

          {[...tokens, ...tokens].map((token, index) => (
            <Tooltip.Root key={`${token.tokenAddress}-${index}`}>
              <Tooltip.Trigger asChild>
                <div
                  className="group flex items-center gap-3 px-4 py-2 bg-gray-800/30 hover:bg-gray-700/40 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 border border-gray-700/30 hover:border-[#00d4aa]/40 flex-shrink-0"
                  onClick={() => handlePumpFunTokenClick(token)}
                >
                  <div className="flex items-center gap-3">
                    {/* Token Logo */}
                    <div className="relative">
                      <TokenAvatar
                        src={token.logo}
                        symbol={token.symbol}
                        name={token.name}
                        size={32}
                        className="ring-2 ring-gray-600/50"
                      />
                      {/* Pump.fun badge */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <RocketIcon className="w-2 h-2 text-white" />
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          {token.symbol}
                        </span>
                        <div className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getBondingProgressColor(token.bondingCurveProgress)} bg-gray-800/50`}>
                          {formatBondingProgress(token.bondingCurveProgress)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-300 text-xs font-mono" style={{ fontFamily: 'SF Mono, Monaco, monospace' }}>
                          {formatUsdPrice(token.priceUsd)}
                        </span>
                        <span className="text-gray-400 text-xs font-mono" style={{ fontFamily: 'SF Mono, Monaco, monospace' }}>
                          {formatSolPrice(token.priceNative)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ExternalLinkIcon className="w-3 h-3 text-[#00d4aa]" />
                  </div>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm max-w-xs">
                  <div className="space-y-1">
                    <div className="font-semibold">{token.name} ({token.symbol})</div>
                    <div className="text-xs text-gray-300">
                      Bonding: {formatBondingProgress(token.bondingCurveProgress)} •
                      FDV: ${parseFloat(token.fullyDilutedValuation).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Click to view on Trade page</div>
                  </div>
                  <Tooltip.Arrow className="fill-black/90" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ))}
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default LivePriceTicker;
