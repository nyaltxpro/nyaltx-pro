"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const EXCLUDE_SYMBOLS = useMemo(() => new Set<string>([
    'RANTS', 'BDOGE', 'VAULT' ,'CLOT' ,'ONE' , 'TREKS', 'XPAY' , 'HACHIKO'
  ]), []);
  
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
    return () => { active = false; clearInterval(id); };
  }, []);

  // Ticker animation setup
  useEffect(() => {
    if (!tickerRef.current || filtered.length === 0) return;
    
    const ticker = tickerRef.current;
    let animationId: number;
    
    const animate = () => {
      if (!isHovering && ticker) {
        const currentTransform = ticker.style.transform;
        const currentX = currentTransform ? parseFloat(currentTransform.replace(/[^-\d.]/g, '')) || 0 : 0;
        
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

  // Apply filters and duplicate items for seamless scroll
  const filtered = useMemo(() => {
    return listings.filter((t) => {
      const sym = (t.tokenSymbol || '').toUpperCase();
      const name = (t.tokenName || '').toUpperCase();
      return !EXCLUDE_SYMBOLS.has(sym) && !EXCLUDE_SYMBOLS.has(name);
    });
  }, [listings, EXCLUDE_SYMBOLS]);

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
    <div className="w-full py-4 overflow-hidden">
      <div className="mx-auto">
        <div
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Ticker viewport */}
          <div className="overflow-hidden">
            <div
              ref={tickerRef}
              className="flex gap-4 whitespace-nowrap"
              style={{ 
                transform: 'translateX(0px)',
                width: 'max-content'
              }}
            >
              {tickerItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="rounded-lg overflow-hidden shadow-lg flex-shrink-0 w-80 flex flex-col hover:scale-[1.02] transition-transform duration-300 cursor-pointer bg-black/30 border border-gray-800"
                  onClick={() => handleClick(item)}
                >
                  <div className="h-44 w-full relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUri || '/crypto-icons/color/generic.svg'}
                      alt={item.tokenName || item.tokenSymbol || 'token'}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/crypto-icons/color/generic.svg'; }}
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {item.blockchain || 'token'}
                    </div>
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="text-base font-semibold text-white mb-1 whitespace-normal">{item.tokenSymbol || item.tokenName}</h3>
                    <p className="text-gray-400 text-sm mb-1 whitespace-normal">{item.tokenName || ''}</p>
                    <p className="text-gray-500 text-xs truncate">{item.contractAddress}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ads;
