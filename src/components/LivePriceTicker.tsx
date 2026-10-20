'use client';

import TokenAvatar from '@/components/TokenAvatar';
import { ActivityLogIcon, ExternalLinkIcon, BarChartIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

type TickerSecurity = {
  id: string;
  name: string;
  symbol: string;
  underlyingSymbol: string;
  underlyingExchange: string;
  logo: string | null;
  isTradingHalted: boolean;
  openNow: boolean;
  tokenizedPrice: number | null;
  networks: string[];
};

const SYNC_MS = 2 * 60 * 1000;

const formatUsd = (price: number | null): string => {
  if (price === null || !Number.isFinite(price)) return '—';
  if (price < 0.01) return `$${price.toFixed(4)}`;
  if (price < 1) return `$${price.toFixed(3)}`;
  if (price < 1000) return `$${price.toFixed(2)}`;
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

const LivePriceTicker: React.FC = () => {
  const router = useRouter();
  const [securities, setSecurities] = useState<TickerSecurity[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchTicker = async () => {
    try {
      const res = await fetch('/api/tokenized-securities?mode=ticker&limit=24');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load ticker');
      }
      setSecurities(Array.isArray(data.securities) ? data.securities : []);
    } catch (err) {
      console.error('Tokenized securities ticker error:', err);
      setSecurities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicker();
    const id = window.setInterval(fetchTicker, SYNC_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || loading || securities.length === 0) return;

    let animationId = 0;
    let position = 0;
    const speed = 0.7;

    const scroll = () => {
      position += speed;
      const half = scrollContainer.scrollWidth / 2;
      if (half > 0 && position >= half) position = 0;
      scrollContainer.scrollLeft = position;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [loading, securities]);

  const openBoard = (security?: TickerSecurity) => {
    if (security?.underlyingSymbol) {
      router.push(
        `/dashboard/tokenized-securities?q=${encodeURIComponent(security.underlyingSymbol)}`,
      );
      return;
    }
    router.push('/dashboard/tokenized-securities');
  };

  if (loading && securities.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-lg border-y border-gray-800/50 py-3 overflow-hidden">
        <div className="flex items-center gap-3 px-6">
          <div className="w-6 h-6 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-lg flex items-center justify-center animate-pulse">
            <ActivityLogIcon className="w-3 h-3 text-white" />
          </div>
          <div className="animate-pulse flex space-x-4">
            <div className="h-4 w-24 bg-gray-700/50 rounded-lg" />
            <div className="h-4 w-16 bg-gray-700/50 rounded-lg" />
            <div className="h-4 w-12 bg-gray-700/50 rounded-lg" />
          </div>
          <span className="text-sm text-gray-400">Loading tokenized securities…</span>
        </div>
      </div>
    );
  }

  if (securities.length === 0) {
    return null;
  }

  const loop = [...securities, ...securities];

  return (
    <Tooltip.Provider>
      <div
        className="w-full bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-lg border-y border-gray-800/50 py-3 overflow-hidden relative"
        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00d4aa] to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent animate-pulse" />

        <div
          ref={scrollRef}
          className="flex items-center space-x-8 overflow-x-auto scrollbar-hide"
          style={{
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <button
            type="button"
            onClick={() => openBoard()}
            className="flex items-center gap-3 pl-6 flex-shrink-0 hover:opacity-90 transition"
          >
            <div className="w-7 h-7 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] rounded-lg flex items-center justify-center">
              <BarChartIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[#00d4aa] font-semibold text-sm"
                style={{
                  fontFamily:
                    'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                TOKENIZED SECURITIES
              </span>
              <div className="w-2 h-2 bg-[#00d4aa] rounded-full animate-pulse" />
            </div>
          </button>

          {loop.map((security, index) => (
            <Tooltip.Root key={`${security.id}-${index}`}>
              <Tooltip.Trigger asChild>
                <div
                  className="group flex items-center gap-3 px-4 py-2 bg-gray-800/30 hover:bg-gray-700/40 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 border border-gray-700/30 hover:border-[#00d4aa]/40 flex-shrink-0"
                  onClick={() => openBoard(security)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <TokenAvatar
                        src={security.logo}
                        symbol={security.underlyingSymbol || security.symbol}
                        name={security.name}
                        size={32}
                        className="ring-2 ring-gray-600/50"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-black ${
                          security.isTradingHalted
                            ? 'bg-red-400'
                            : security.openNow
                              ? 'bg-emerald-400'
                              : 'bg-gray-500'
                        }`}
                      />
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
                          {security.underlyingSymbol || security.symbol}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                          {security.underlyingExchange !== '—'
                            ? security.underlyingExchange
                            : 'xStock'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[#00d4aa] text-xs font-mono"
                          style={{ fontFamily: 'SF Mono, Monaco, monospace' }}
                        >
                          {formatUsd(security.tokenizedPrice)}
                        </span>
                        <span className="text-gray-500 text-xs">{security.symbol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ExternalLinkIcon className="w-3 h-3 text-[#00d4aa]" />
                  </div>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm max-w-xs z-50">
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {security.name.replace(/ xStock$/i, '')} (
                      {security.underlyingSymbol || security.symbol})
                    </div>
                    <div className="text-xs text-gray-300">
                      Tokenized: {formatUsd(security.tokenizedPrice)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {security.underlyingExchange} · {security.symbol}
                      {security.networks?.[0] ? ` · ${security.networks[0]}` : ''}
                    </div>
                    <div className="text-xs text-gray-500">Open tokenized securities board</div>
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
