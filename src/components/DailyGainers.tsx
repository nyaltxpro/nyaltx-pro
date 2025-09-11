'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useMarketData } from '../api/websocket/useMarketData';
import { MarketData } from '../api/websocket/marketData';
import { useRouter } from 'next/navigation';
import tokens from '@/data/tokens.json';
import { fetchCoinPlatforms } from '@/api/coingecko/api';

export default function DailyGainers() {
    const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
    const router = useRouter();
    
    // Use our new websocket hook to get market data
    const { 
        isLoading: isLoadingCoinData, 
        error, 
        getTopGainers, 
        getTopLosers 
    } = useMarketData({
        // Top 100 coins by market cap
        pollingInterval: 30000, // Update every 30 seconds
    });
    
    // Get top 5 gainers and losers
    const gainers = getTopGainers(5);
    const losers = getTopLosers(5);
    
    // Select which data to display based on active tab
    const displayData = activeTab === 'gainers' ? gainers : losers;

    const formatPrice = (price: number) => {
        if (price < 0.01) return price.toFixed(6);
        if (price < 1) return price.toFixed(4);
        if (price < 10) return price.toFixed(2);
        return price.toFixed(2);
    };

    const formatVolume = (volume: number) => {
        if (volume >= 1000000) {
            return `$${(volume / 1000000).toFixed(2)}M`;
        } else if (volume >= 1000) {
            return `$${(volume / 1000).toFixed(2)}K`;
        } else {
            return `$${volume.toFixed(2)}`;
        }
    };

    const handleNavigate = async (coin: any) => {
        const base = coin.symbol?.toUpperCase() || coin.name?.toUpperCase();
        if (!base) return;
    
        const list = tokens as Array<{ symbol: string; chain: string; address: string; name: string }>;
        const matches = list.filter(t => t.symbol.toUpperCase() === base);
        let selected = matches.find(t => t.chain.toLowerCase() === 'ethereum') || matches[0];
        let chain = selected?.chain;
        let address = selected?.address;
    
        if (!chain || !address) {
          try {
            const platforms = await fetchCoinPlatforms(coin.id);
            if (platforms) {
              const platformToChain: Record<string, string> = {
                'ethereum': 'ethereum',
                'binance-smart-chain': 'binance',
                'polygon-pos': 'polygon',
                'avalanche': 'avalanche',
                'fantom': 'fantom',
                'base': 'base',
                'arbitrum-one': 'arbitrum',
                'optimistic-ethereum': 'optimism',
                'solana': 'solana',
              };
              const preference = [
                'ethereum',
                'arbitrum-one',
                'optimistic-ethereum',
                'base',
                'polygon-pos',
                'binance-smart-chain',
                'avalanche',
                'fantom',
                'solana',
              ];
              for (const key of preference) {
                const addr = (platforms as any)[key];
                if (addr) {
                  chain = platformToChain[key] || key;
                  address = addr;
                  break;
                }
              }
            }
          } catch (e) {
            console.error('Failed to fetch platforms for', coin.id, e);
          }
        }
    
        const params = new URLSearchParams({ base });
        if (chain) params.set('chain', chain);
        if (address) params.set('address', address);
    
        router.push(`/dashboard/trade?${params.toString()}`);
      };

    return (
        <>
            <div className="section-header flex justify-between items-center">
            <h2 className="text-xl font-semibold mb-4">Market Movers</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('gainers')}
                        className={`px-3 py-1 text-xs rounded ${activeTab === 'gainers' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        Gainers
                    </button>
                    <button
                        onClick={() => setActiveTab('losers')}
                        className={`px-3 py-1 text-xs rounded ${activeTab === 'losers' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        Losers
                    </button>
                </div>
            </div>

            {isLoadingCoinData ? (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : (
                <div>
                    {displayData.map((coin, index) => (
                        <div key={coin.id ?? coin.symbol} className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-800/40" onClick={() => handleNavigate(coin)}>
                            <div className="flex items-center">
                                <div className="relative h-8 w-8 mr-3 flex-shrink-0">
                                    <Image
                                        src={coin.image}
                                        alt={coin.name}
                                        fill
                                        className="rounded-full object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                    <div className="token-name font-medium">{coin.name}</div>
                                    <div className="token-chain text-sm text-gray-400">${formatPrice(coin.current_price)}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                                </p>
                                <p className="text-sm text-gray-400">
                                    Vol: {formatVolume(coin.total_volume)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
