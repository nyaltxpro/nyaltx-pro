'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChainFilter } from '@/hooks/useChainFilter';
import ChainFilterIndicator from './ChainFilterIndicator';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Avatar from '@radix-ui/react-avatar';
import { ExternalLinkIcon, RocketIcon, UpdateIcon } from '@radix-ui/react-icons';

export interface BannerItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  fullDescription: string;
  category: string;
  date: string;
  link?: string;
  tags: string[];
}

type Listing = {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  contractAddress: string;
  imageUri?: string;
  website?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

const Ads = () => {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Exclusion list (by symbol or name). Add more symbols here as needed.
  const EXCLUDE_SYMBOLS = useMemo(
    () => new Set<string>(['RANTS', 'BDOGE', 'VAULT', 'CLOT', 'ONE', 'TREKS', 'XPAY', 'HACHIKO']),
    []
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch approved tokens only; paused tokens are excluded by API by default
        const res = await fetch('/api/tokens/list?status=approved&limit=1000');
        const d = await res.json();
        const data: Listing[] = d?.data || [];
        if (active) setListings(data);
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load listings');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Apply exclusion filters first
  const excludeFiltered = useMemo(() => {
    return listings.filter(t => {
      const sym = (t.tokenSymbol || '').toUpperCase();
      const name = (t.tokenName || '').toUpperCase();
      return !EXCLUDE_SYMBOLS.has(sym) && !EXCLUDE_SYMBOLS.has(name);
    });
  }, [listings, EXCLUDE_SYMBOLS]);

  // Apply chain filtering
  const filtered = useChainFilter(excludeFiltered, {
    chainField: 'blockchain',
    includeUnknown: true,
    caseSensitive: false,
  });

  // Ticker animation setup
  useEffect(() => {
    if (!tickerRef.current || filtered.length === 0) return;

    const ticker = tickerRef.current;
    let animationId: number;

    const animate = () => {
      if (!isHovering && ticker) {
        const currentTransform = ticker.style.transform;
        const currentX = currentTransform
          ? parseFloat(currentTransform.replace(/[^-\d.]/g, '')) || 0
          : 0;

        // Reset position when fully scrolled
        if (Math.abs(currentX) >= ticker.scrollWidth / 2) {
          ticker.style.transform = 'translateX(0px)';
        } else {
          ticker.style.transform = `translateX(${currentX - 1}px)`;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [filtered.length, isHovering]);

  // Duplicate items for seamless ticker effect
  const tickerItems = useMemo(() => {
    if (filtered.length === 0) return [];
    // Duplicate the array to create seamless loop
    return [...filtered, ...filtered];
  }, [filtered]);

  const handleClick = (t: Listing) => {
    const params = new URLSearchParams();
    params.set('base', (t.tokenSymbol || t.tokenName || '').toUpperCase());
    if (t.blockchain) params.set('chain', t.blockchain);
    if (t.contractAddress) params.set('address', t.contractAddress);
    router.push(`/dashboard/trade?${params.toString()}`);
  };

  // Empty state safeguard
  if (tickerItems.length === 0) {
    return null;
  }

  return (
    <Tooltip.Provider>
      <div className="w-full py-4 relative overflow-hidden" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa]/20 via-transparent to-[#3b82f6]/20 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00d4aa] to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent"></div>
        </div>

        <div className="relative z-10">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-3 px-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00d4aa] to-[#3b82f6] rounded-lg flex items-center justify-center">
                <RocketIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">Featured Tokens</span>
              <div className="px-2 py-1 bg-[#00d4aa]/20 text-[#00d4aa] text-xs rounded-full border border-[#00d4aa]/30">
                {filtered.length}
              </div>
            </div>
            <div className="text-xs text-gray-500">Auto-updating</div>
          </div>

          {/* Chain Filter - Compact */}
          <div className="mb-3 px-4">
            <ChainFilterIndicator />
          </div>

        <div
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Ticker viewport */}
          <div className="overflow-hidden">
            <div
              ref={tickerRef}
              className="flex gap-6 whitespace-nowrap"
              style={{
                transform: 'translateX(0px)',
                width: 'max-content',
              }}
            >
              {tickerItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="group flex-shrink-0 w-[480px]">
                  {/* Horizontal Card Layout */}
                  <div
                    className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-gray-800/60 rounded-2xl cursor-pointer transition-all duration-500 hover:border-[#00d4aa]/50 hover:shadow-2xl hover:shadow-[#00d4aa]/25 hover:scale-[1.02] h-32"
                    onClick={() => handleClick(item)}
                  >
                    {/* Animated Glow Background */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00d4aa]/20 via-[#3b82f6]/20 to-[#00d4aa]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
                    
                    {/* Horizontal Layout */}
                    <div className="flex items-center h-full px-4 py-3">
                      {/* Left Section - Enhanced Avatar */}
                      <div className="flex-shrink-0 mr-4">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden ring-2 ring-gray-700/50 group-hover:ring-[#00d4aa]/60 transition-all duration-300 group-hover:scale-105 shadow-lg">
                          <Avatar.Root className="w-full h-full">
                            <Avatar.Image
                              src={item.imageUri || '/crypto-icons/color/generic.svg'}
                              alt={item.tokenName || item.tokenSymbol || 'token'}
                              className="w-16 h-16 object-contain rounded-md"
                              style={{ 
                                width: '64px', 
                                height: '64px', 
                                objectFit: 'contain',
                                objectPosition: 'center'
                              }}
                              onError={e => {
                                (e.target as HTMLImageElement).src = '/crypto-icons/color/generic.svg';
                              }}
                            />
                            <Avatar.Fallback className="w-16 h-16 bg-gradient-to-br from-[#00d4aa] to-[#3b82f6] flex items-center justify-center text-white font-bold text-lg rounded-md shadow-inner">
                              {(item.tokenSymbol || item.tokenName || '??').slice(0, 2)}
                            </Avatar.Fallback>
                          </Avatar.Root>
                        </div>
                      </div>
                      
                      {/* Center Section - Token Info */}
                      <div className="flex-1 min-w-0 mr-4 flex flex-col justify-center">
                        <div className="mb-3">
                          <h3 className="text-xl font-bold text-white mb-1 truncate" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {item.tokenSymbol || item.tokenName}
                          </h3>
                          <p className="text-sm text-gray-400 font-medium truncate" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {item.tokenName || 'Token Name'}
                          </p>
                        </div>
                        
                        {/* Contract Address - Enhanced */}
                        <div className="bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700/30">
                          <div className="flex items-center justify-between">
                            <code className="text-sm text-gray-300 font-mono truncate mr-3" style={{ fontFamily: 'SF Mono, Monaco, monospace' }}>
                              {item.contractAddress?.slice(0, 8)}...{item.contractAddress?.slice(-6)}
                            </code>
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <button 
                                  className="px-2 py-1 bg-[#00d4aa]/20 hover:bg-[#00d4aa]/40 text-[#00d4aa] text-xs rounded-md transition-all duration-200 font-medium"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(item.contractAddress || '');
                                  }}
                                >
                                  Copy
                                </button>
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content className="bg-black/90 text-white px-2 py-1 rounded text-xs">
                                  Copy address
                                  <Tooltip.Arrow className="fill-black/90" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Section - Badges & Action */}
                      <div className="flex flex-col items-end justify-center gap-2">
                        {/* Status Badges */}
                        <div className="flex flex-col items-end gap-1">
                          <div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-xs rounded-full border border-green-500/30 font-semibold backdrop-blur-sm flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            LIVE
                          </div>
                          <div className="px-3 py-1 bg-gradient-to-r from-[#00d4aa]/25 to-[#3b82f6]/25 text-[#00d4aa] text-xs rounded-lg border border-[#00d4aa]/40 font-bold backdrop-blur-sm uppercase">
                            {item.blockchain || 'CHAIN'}
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] text-white font-bold text-sm rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#00d4aa]/30 hover:scale-105 opacity-0 group-hover:opacity-100">
                              <ExternalLinkIcon className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                              <span style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                Trade
                              </span>
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                              Trade {item.tokenSymbol}
                              <Tooltip.Arrow className="fill-black/90" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </div>
                    </div>
                    
                    {/* Featured Badge */}
                    <div className="absolute bottom-2 left-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs border border-gray-700/50">
                        <div className="w-1.5 h-1.5 bg-[#00d4aa] rounded-full animate-pulse"></div>
                        <span className="text-gray-300 font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                          Featured
                        </span>
                      </div>
                    </div>
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00d4aa]/10 via-transparent to-[#3b82f6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default Ads;
