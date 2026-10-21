'use client';

import CryptocurrencyIcon from '@/components/CryptocurrencyIcon';
import TokenAvatar from '@/components/TokenAvatar';
import { ActivityLogIcon, ExternalLinkIcon, RocketIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

interface DexScreenerToken {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon: string;
  description?: string;
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

const MemecoinTicker: React.FC = () => {
  const router = useRouter();
  const [tokens, setTokens] = useState<DexScreenerToken[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchDexScreenerTokens = async () => {
    try {
      const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
      }

      const data: DexScreenerToken[] = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid DexScreener API response');
      }

      const latestTokens = data.slice(0, 20);
      const tokensWithInsights = await Promise.all(
        latestTokens.slice(0, 10).map(async token => {
          try {
            const insightsResponse = await fetch(
              `/api/dexscreener/token-insights?chain=${token.chainId}&address=${token.tokenAddress}`,
            );
            if (!insightsResponse.ok) return token;
            const insightsData = await insightsResponse.json();
            const mainPair = insightsData.mainPair;
            if (!mainPair) return token;
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
          } catch {
            return token;
          }
        }),
      );

      setTokens(tokensWithInsights);
    } catch (err) {
      console.error('Memecoin ticker error:', err);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDexScreenerTokens();
    const id = window.setInterval(fetchDexScreenerTokens, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || loading || tokens.length === 0) return;

    let animationId = 0;
    let position = 0;
    const speed = 0.8;

    const scroll = () => {
      position += speed;
      const half = scrollContainer.scrollWidth / 2;
      if (half > 0 && position >= half) position = 0;
      scrollContainer.scrollLeft = position;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [loading, tokens]);

  const handleClick = (token: DexScreenerToken) => {
    const params = new URLSearchParams();
    params.set('address', token.tokenAddress);
    params.set('chain', token.chainId);
    params.set('imageUri', token.icon);
    params.set('source', 'dexscreener');
    if (token.insights?.symbol) params.set('base', token.insights.symbol);
    if (token.insights?.name) params.set('name', token.insights.name);
    if (token.insights?.priceUsd) params.set('price', token.insights.priceUsd);
    if (token.insights?.priceChange24h !== undefined) {
      params.set('priceChange24h', String(token.insights.priceChange24h));
    }
    if (token.insights?.volume24h) params.set('volume24h', String(token.insights.volume24h));
    if (token.insights?.liquidity) params.set('liquidity', String(token.insights.liquidity));
    router.push(`/dashboard/trade?${params.toString()}`);
  };

  if (loading && tokens.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-lg border-b border-gray-800/50 py-2.5 overflow-hidden">
        <div className="flex items-center gap-3 px-6">
          <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center animate-pulse">
            <ActivityLogIcon className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm text-gray-400">Loading memecoins…</span>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) return null;

  const loop = [...tokens, ...tokens];

  return (
    <Tooltip.Provider>
      <div
        className="w-full bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-lg border-b border-gray-800/50 py-2.5 overflow-hidden relative"
        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
      >
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        <div
          ref={scrollRef}
          className="flex items-center space-x-8 overflow-x-auto scrollbar-hide"
          style={{ whiteSpace: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex items-center gap-3 pl-6 flex-shrink-0">
            <div className="w-7 h-7 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <RocketIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-cyan-400 font-semibold text-sm"
                style={{
                  fontFamily:
                    'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                MEMECOINS
              </span>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </div>
          </div>

          {loop.map((token, index) => (
            <Tooltip.Root key={`meme-${token.tokenAddress}-${index}`}>
              <Tooltip.Trigger asChild>
                <div
                  className="group flex items-center gap-3 px-4 py-2 bg-gray-800/30 hover:bg-gray-700/40 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 border border-gray-700/30 hover:border-cyan-400/40 flex-shrink-0"
                  onClick={() => handleClick(token)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <TokenAvatar
                        src={token.icon}
                        symbol={token.insights?.symbol || token.tokenAddress.slice(0, 6)}
                        name={token.insights?.name}
                        size={32}
                        className="ring-2 ring-gray-600/50"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 flex items-center justify-center">
                        <CryptocurrencyIcon name={(token.chainId || 'solana') as any} />
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-white text-sm truncate"
                          style={{
                            fontFamily:
                              'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                          }}
                        >
                          {token.insights?.symbol ||
                            `${token.tokenAddress.slice(0, 6)}…${token.tokenAddress.slice(-4)}`}
                        </span>
                        {token.insights?.priceChange24h !== undefined && (
                          <div
                            className={`px-1.5 py-0.5 rounded text-xs font-semibold bg-gray-800/50 ${
                              token.insights.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {token.insights.priceChange24h >= 0 ? '+' : ''}
                            {token.insights.priceChange24h.toFixed(2)}%
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {token.insights?.priceUsd ? (
                          <span
                            className="text-gray-300 text-xs font-mono"
                            style={{ fontFamily: 'SF Mono, Monaco, monospace' }}
                          >
                            $
                            {parseFloat(token.insights.priceUsd).toLocaleString(undefined, {
                              maximumFractionDigits: 6,
                            })}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs capitalize">{token.chainId}</span>
                        )}
                        {token.insights?.volume24h ? (
                          <span className="text-gray-500 text-xs">
                            · Vol ${(token.insights.volume24h / 1000).toFixed(1)}K
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ExternalLinkIcon className="w-3 h-3 text-cyan-400" />
                  </div>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm max-w-xs z-50">
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {token.insights?.name || 'Memecoin'} (
                      {token.insights?.symbol || token.tokenAddress.slice(0, 6)})
                    </div>
                    {token.description && (
                      <div className="text-xs text-gray-300">
                        {token.description.slice(0, 100)}
                        {token.description.length > 100 ? '…' : ''}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">Click to open trade page</div>
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

export default MemecoinTicker;
