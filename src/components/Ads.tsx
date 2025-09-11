"use client";

import React, { useEffect, useMemo, useState } from 'react';
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
  const [speedMs, setSpeedMs] = useState<number>(30);

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

  // Apply filters and duplicate items for seamless scroll
  const filtered = useMemo(() => {
    return listings.filter((t) => {
      const sym = (t.tokenSymbol || '').toUpperCase();
      const name = (t.tokenName || '').toUpperCase();
      return !EXCLUDE_SYMBOLS.has(sym) && !EXCLUDE_SYMBOLS.has(name);
    });
  }, [listings, EXCLUDE_SYMBOLS]);

  const infiniteItems = useMemo(() => {
    return [...filtered, ...filtered, ...filtered];
  }, [filtered]);

  const handleClick = (t: Listing) => {
    const params = new URLSearchParams();
    params.set('base', (t.tokenSymbol || t.tokenName || '').toUpperCase());
    if (t.blockchain) params.set('chain', t.blockchain);
    if (t.contractAddress) params.set('address', t.contractAddress);
    router.push(`/dashboard/trade?${params.toString()}`);
  };

  return (
    <div className="w-full py-4 overflow-hidden">
      <div className="mx-auto px-4">
        <div className="relative">
          <div className="flex animate-scroll gap-4">
            {infiniteItems.map((item, index) => (
              <div 
                key={`${item.id}-${index}`} 
                className="rounded-lg overflow-hidden shadow-lg flex-shrink-0 w-80 flex flex-col hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => handleClick(item as unknown as Listing)}
              >
                <div className="h-48 w-full relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(item as any).imageUri || '/crypto-icons/color/generic.svg'}
                    alt={(item as any).tokenName || (item as any).tokenSymbol || 'token'}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/crypto-icons/color/generic.svg'; }}
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {(item as any).blockchain || 'token'}
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-semibold text-white mb-1">{(item as any).tokenSymbol || (item as any).tokenName}</h3>
                  <p className="text-gray-400 text-sm mb-1">{(item as any).tokenName || ''}</p>
                  <p className="text-gray-500 text-xs truncate">{(item as any).contractAddress}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-320px * ${listings.length} - ${listings.length * 16}px));
          }
        }
        
        .animate-scroll {
          animation: scroll ${speedMs}s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default Ads;
