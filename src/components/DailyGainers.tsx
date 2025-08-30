'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useMarketData } from '../api/websocket/useMarketData';
import { MarketData } from '../api/websocket/marketData';

export default function DailyGainers() {
    const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
    
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

    return (
        <>
            <div className="section-header flex justify-between items-center">
                <div className="section-title">Market Movers</div>
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
                        <div key={coin.id} className="gainer-item">
                            <div className="token-info my-2">
                                <div className='flex items-center'>
                                    <Image
                                        src={coin.image}
                                        alt={coin.name}
                                        width={22}
                                        height={22}
                                        className="object-contain bg-white mr-2 rounded-full"
                                        unoptimized
                                    />
                                    <div className="token-name">{coin.name}</div>
                                    <div className="token-chain">${formatPrice(coin.current_price)}</div>
                                </div>
                            </div>
                            <div>
                                <div className="token-percentage percentage-positive">
                                    <p className={`font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Vol: {formatVolume(coin.total_volume)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
