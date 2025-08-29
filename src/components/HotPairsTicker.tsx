"use client";

import React, { useEffect, useRef } from 'react';

type HotPair = {
  id: number;
  symbol: string;
  price: string;
  change: string;
};

interface HotPairsTickerProps {
  pairs: HotPair[];
}

export default function HotPairsTicker({ pairs }: HotPairsTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll animation
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let position = 0;
    const speed = 0.5; // pixels per frame
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
  }, []);

  return (
    <div className="w-full bg-gray-900 border-y border-gray-800 py-2 overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex items-center space-x-6 overflow-x-auto scrollbar-hide"
        style={{ 
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Duplicate the pairs to create a continuous scrolling effect */}
        {[...pairs, ...pairs].map((pair, index) => (
          <div key={`${pair.id}-${index}`} className="flex items-center space-x-2 px-2">
            <span className="text-white font-medium">{pair.symbol}</span>
            <span className="text-gray-400">{pair.price}</span>
            <span 
              className={`${
                pair.change.startsWith('+') 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}
            >
              {pair.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
