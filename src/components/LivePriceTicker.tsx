"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { CoinTicker } from '../api/coingecko';
import priceWebSocketService from '../api/websocket/priceWebsocket';
import { getCryptoIconUrl, cryptoIconExists, commonCryptoSymbols } from '../app/utils/cryptoIcons';

const LivePriceTicker: React.FC = () => {
  const [tickers, setTickers] = useState<CoinTicker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    
    // WebSocket callback function
    const handleTickerUpdate = (data: CoinTicker[]) => {
      setTickers(data);
      setLoading(false);
    };
    
    // Subscribe to WebSocket updates
    priceWebSocketService.subscribe(handleTickerUpdate);
    
    // Connect to WebSocket
    priceWebSocketService.connect(8);
    
    // Cleanup on unmount
    return () => {
      priceWebSocketService.unsubscribe(handleTickerUpdate);
      priceWebSocketService.disconnect();
    };
  }, []);
  
  // Auto-scrolling effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || loading) return;

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
  }, [loading, tickers]);

  // Format price with appropriate precision
  const formatPrice = (price: number): string => {
    if (price < 0.001) return price.toFixed(8);
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 10) return price.toFixed(3);
    if (price < 1000) return price.toFixed(2);
    return price.toFixed(0);
  };

  // Calculate 24h price change percentage
  const getPriceChangeColor = (ticker: CoinTicker): string => {
    // Using trust_score as a proxy for price direction (green = positive, yellow = neutral, red = negative)
    if (ticker.trust_score === 'green') return 'text-green-500';
    if (ticker.trust_score === 'yellow') return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get coin symbol from coin ID
  const getCoinSymbol = (coinId: string): string => {
    // Map CoinGecko IDs to cryptocurrency symbols
    const coinIdToSymbol: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'tether': 'USDT',
      'binancecoin': 'BNB',
      'solana': 'SOL',
      'ripple': 'XRP',
      'usd-coin': 'USDC',
      'cardano': 'ADA',
      'avalanche-2': 'AVAX',
      'dogecoin': 'DOGE',
      'polkadot': 'DOT',
      'matic-network': 'MATIC',
      'polygon': 'MATIC',
      'shiba-inu': 'SHIB',
      'dai': 'DAI',
      'tron': 'TRX',
      'chainlink': 'LINK',
      'litecoin': 'LTC',
      'uniswap': 'UNI',
      'stellar': 'XLM',
      'cosmos': 'ATOM',
      'monero': 'XMR',
      'bitcoin-cash': 'BCH',
      'wrapped-bitcoin': 'WBTC',
      'near': 'NEAR',
      'filecoin': 'FIL',
      'vechain': 'VET',
      'cronos': 'CRO',
      'injective-protocol': 'INJ',
      'the-open-network': 'TON'
    };
    
    return coinIdToSymbol[coinId?.toLowerCase()] || coinId?.toUpperCase() || 'GENERIC';
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-900 border-y border-gray-800 py-2 flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 w-24 bg-gray-700 rounded"></div>
          <div className="h-4 w-16 bg-gray-700 rounded"></div>
          <div className="h-4 w-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center mr-4 pl-4">
          <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center mr-1">
            <span className="text-xs">🔥</span>
          </div>
          <span className="text-yellow-500 font-medium text-sm">LIVE PRICES</span>
        </div>
        
        {[...tickers, ...tickers].map((ticker, index) => (
          <div 
            key={`${ticker.coin_id}-${index}`} 
            className="flex items-center space-x-2 px-2 hover:bg-gray-800 rounded-md cursor-pointer transition-colors duration-200"
            onClick={() => window.open(ticker.trade_url, '_blank')}
          >
            <div className="flex items-center mr-2 space-x-1">
              <div className="flex items-center">
                {/* Base currency icon */}
                <div className="w-5 h-5 relative">
                  <Image 
                    src={getCryptoIconUrl(getCoinSymbol(ticker.base))}
                    alt={getCoinSymbol(ticker.base)}
                    width={20}
                    height={20}
                    className="rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getCryptoIconUrl('generic');
                    }}
                  />
                </div>
                
                {/* Target currency icon */}
                <div className="w-5 h-5 relative -ml-2">
                  <Image 
                    src={getCryptoIconUrl(getCoinSymbol(ticker.target))}
                    alt={getCoinSymbol(ticker.target)}
                    width={20}
                    height={20}
                    className="rounded-full border border-gray-900"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getCryptoIconUrl('generic');
                    }}
                  />
                </div>
                
                <span className="font-medium ml-1">
                  {getCoinSymbol(ticker.base)}/{getCoinSymbol(ticker.target)}
                </span>
              </div>
            </div>
            <span className="text-gray-400">${formatPrice(ticker.converted_last.usd)}</span>
            <span className={getPriceChangeColor(ticker)}>
              {ticker.trust_score === 'green' ? (
                <span className="inline mr-1">↑</span>
              ) : (
                <span className="inline mr-1">↓</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LivePriceTicker;
