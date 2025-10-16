'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCryptoIconUrl, cryptoIconExists, commonCryptoSymbols } from '../utils/cryptoIcons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ActivityLogIcon, ExternalLinkIcon, RocketIcon, TriangleUpIcon, TriangleDownIcon } from '@radix-ui/react-icons';

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

// CoinGecko Market Mover Interface
interface MarketMover {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  market_cap: number;
}

const LivePriceTicker: React.FC = () => {
  const router = useRouter();
  const [tokens, setTokens] = useState<PumpFunToken[]>([]);
  const [marketMovers, setMarketMovers] = useState<MarketMover[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [marketMoversLoading, setMarketMoversLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch CoinGecko market movers (top gainers and losers)
  const fetchMarketMovers = async () => {
    try {
      setMarketMoversLoading(true);
      
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: MarketMover[] = await response.json();
      
      if (Array.isArray(data)) {
        // Filter out coins with null price change and sort by 24h change
        const validMovers = data.filter(coin => 
          coin.price_change_percentage_24h !== null && 
          coin.price_change_percentage_24h !== undefined &&
          coin.market_cap_rank <= 200 // Top 200 by market cap
        );

        // Get top 10 gainers and top 10 losers
        const gainers = validMovers
          .filter(coin => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
          .slice(0, 10);

        const losers = validMovers
          .filter(coin => coin.price_change_percentage_24h < 0)
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
          .slice(0, 10);

        // Combine gainers and losers
        const combinedMovers = [...gainers, ...losers];
        setMarketMovers(combinedMovers);
        console.log(`✅ Loaded ${combinedMovers.length} market movers (${gainers.length} gainers, ${losers.length} losers)`);
      } else {
        throw new Error('Invalid CoinGecko API response structure');
      }
    } catch (err) {
      console.error('❌ Error fetching market movers:', err);
      setMarketMovers([]);
    } finally {
      setMarketMoversLoading(false);
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
    fetchPumpFunTokens();
    fetchMarketMovers();

    // Set up auto-refresh every 30 seconds for Pump.fun tokens
    const pumpFunInterval = setInterval(fetchPumpFunTokens, 30000);
    
    // Set up auto-refresh every 2 minutes for market movers (less frequent to avoid rate limits)
    const marketMoversInterval = setInterval(fetchMarketMovers, 120000);

    return () => {
      clearInterval(pumpFunInterval);
      clearInterval(marketMoversInterval);
    };
  }, []);

  // Auto-scrolling effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || loading || tokens.length === 0) return;

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
  }, [loading, tokens]);

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

  // Navigate to trade page for market movers
  const handleMarketMoverClick = (mover: MarketMover) => {
    const params = new URLSearchParams();
    params.set('base', mover.symbol.toUpperCase());
    params.set('name', mover.name);
    params.set('imageUri', mover.image);
    params.set('source', 'coingecko');
    params.set('coingecko_id', mover.id);
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

  // Show fallback message if no tokens available
  if (error || (!loading && (!tokens || tokens.length === 0))) {
    return (
      <div className="w-full bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-lg border-y border-gray-800/50 py-3 flex items-center justify-center" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-6 h-6 rounded-lg bg-gray-700/50 flex items-center justify-center">
            <ActivityLogIcon className="w-3 h-3" />
          </div>
          <span className="text-sm">Live prices temporarily unavailable</span>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

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
          {/* Market Movers Section Header */}
          <div className="flex items-center gap-3 pl-6 flex-shrink-0">
            <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-red-500 rounded-lg flex items-center justify-center">
              <TriangleUpIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-semibold text-sm" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                MARKET MOVERS
              </span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Market Movers */}
          {marketMovers.length > 0 && [...marketMovers, ...marketMovers].map((mover, index) => (
            <Tooltip.Root key={`mover-${mover.id}-${index}`}>
              <Tooltip.Trigger asChild>
                <div
                  className="group flex items-center gap-3 px-4 py-2 bg-gray-800/30 hover:bg-gray-700/40 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 border border-gray-700/30 hover:border-green-400/40 flex-shrink-0"
                  onClick={() => handleMarketMoverClick(mover)}
                >
                  <div className="flex items-center gap-3">
                    {/* Token Logo */}
                    <div className="relative">
                      <div className="w-8 h-8 relative">
                        <Image
                          src={mover.image}
                          alt={mover.symbol}
                          width={32}
                          height={32}
                          className="rounded-full ring-2 ring-gray-600/50"
                          onError={e => {
                            (e.target as HTMLImageElement).src = '/crypto-icons/color/generic.svg';
                          }}
                        />
                      </div>
                      {/* Gain/Loss indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${mover.price_change_percentage_24h >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center`}>
                        {mover.price_change_percentage_24h >= 0 ? 
                          <TriangleUpIcon className="w-2 h-2 text-white" /> : 
                          <TriangleDownIcon className="w-2 h-2 text-white" />
                        }
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          {mover.symbol.toUpperCase()}
                        </span>
                        <div className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getPriceChangeColor(mover.price_change_percentage_24h)} bg-gray-800/50`}>
                          {formatPriceChange(mover.price_change_percentage_24h)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-300 text-xs font-mono" style={{ fontFamily: 'SF Mono, Monaco, monospace' }}>
                          {formatMarketMoverPrice(mover.current_price)}
                        </span>
                        <span className="text-gray-400 text-xs" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          #{mover.market_cap_rank}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ExternalLinkIcon className="w-3 h-3 text-green-400" />
                  </div>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm max-w-xs">
                  <div className="space-y-1">
                    <div className="font-semibold">{mover.name} ({mover.symbol.toUpperCase()})</div>
                    <div className="text-xs text-gray-300">
                      24h Change: <span className={getPriceChangeColor(mover.price_change_percentage_24h)}>
                        {formatPriceChange(mover.price_change_percentage_24h)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-300">
                      Market Cap: {formatMarketCap(mover.market_cap)} • Rank #{mover.market_cap_rank}
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
                      <div className="w-8 h-8 relative">
                        <Image
                          src={token.logo || '/crypto-icons/color/generic.svg'}
                          alt={token.symbol}
                          width={32}
                          height={32}
                          className="rounded-full ring-2 ring-gray-600/50"
                          onError={e => {
                            (e.target as HTMLImageElement).src = '/crypto-icons/color/generic.svg';
                          }}
                        />
                      </div>
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
