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
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const autoplayRef = useRef<number | null>(null);

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
        // Fetch all tokens regardless of status (API will include approved/pending/rejected as applicable)
        const res = await fetch('/api/tokens/list?all=1&limit=1000');
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

  // Responsive items per slide
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) setItemsPerSlide(1);
      else if (w < 1024) setItemsPerSlide(2);
      else setItemsPerSlide(3);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // Apply filters and duplicate items for seamless scroll
  const filtered = useMemo(() => {
    return listings.filter((t) => {
      const sym = (t.tokenSymbol || '').toUpperCase();
      const name = (t.tokenName || '').toUpperCase();
      return !EXCLUDE_SYMBOLS.has(sym) && !EXCLUDE_SYMBOLS.has(name);
    });
  }, [listings, EXCLUDE_SYMBOLS]);

  // Chunk into slides
  const slides = useMemo(() => {
    const chunks: Listing[][] = [];
    if (filtered.length === 0) return chunks;
    for (let i = 0; i < filtered.length; i += itemsPerSlide) {
      chunks.push(filtered.slice(i, i + itemsPerSlide));
    }
    // Ensure at least 1 slide
    return chunks.length ? chunks : [filtered.slice(0, itemsPerSlide)];
  }, [filtered, itemsPerSlide]);

  const total = slides.length;

  // Autoplay
  useEffect(() => {
    if (total <= 1) return; // nothing to autoplay
    if (isHovering) return; // paused
    if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    autoplayRef.current = window.setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, 4000);
    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    };
  }, [total, isHovering]);

  // Clamp current if total shrinks
  useEffect(() => {
    if (current > 0 && current >= total) {
      setCurrent(total - 1);
    }
  }, [total]);

  const handleClick = (t: Listing) => {
    const params = new URLSearchParams();
    params.set('base', (t.tokenSymbol || t.tokenName || '').toUpperCase());
    if (t.blockchain) params.set('chain', t.blockchain);
    if (t.contractAddress) params.set('address', t.contractAddress);
    router.push(`/dashboard/trade?${params.toString()}`);
  };

  // Empty state safeguard
  if (total === 0) {
    return null;
  }

  return (
    <div className="w-full py-4 overflow-hidden">
      <div className="mx-auto px-4">
        <div
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Slides viewport */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${(current * 100) / total}%)`, width: `${total * 100}%` }}
            >
              {slides.map((slide, i) => (
                <div key={i} className="w-full flex-shrink-0 px-1" style={{ width: `${100 / total}%` }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slide.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg overflow-hidden shadow-lg w-full flex flex-col hover:scale-[1.01] transition-transform duration-300 cursor-pointer bg-black/30 border border-gray-800"
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
                          <h3 className="text-base font-semibold text-white mb-1">{item.tokenSymbol || item.tokenName}</h3>
                          <p className="text-gray-400 text-sm mb-1">{item.tokenName || ''}</p>
                          <p className="text-gray-500 text-xs truncate">{item.contractAddress}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          {total > 1 && (
            <>
              <button
                aria-label="Previous"
                onClick={() => setCurrent((c) => (c - 1 + total) % total)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 hover:bg-black/80 text-white w-9 h-9 flex items-center justify-center border border-white/10"
              >
                ‹
              </button>
              <button
                aria-label="Next"
                onClick={() => setCurrent((c) => (c + 1) % total)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 hover:bg-black/80 text-white w-9 h-9 flex items-center justify-center border border-white/10"
              >
                ›
              </button>
            </>
          )}

          {/* Dots */}
          {total > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    current === i ? 'bg-cyan-500 w-6' : 'bg-gray-700 w-2.5 hover:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Ads;
