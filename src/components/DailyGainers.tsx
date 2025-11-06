'use client';

import { fetchCoinPlatforms } from '@/api/coingecko/api';
import tokens from '@/data/tokens.json';
import { useMarketMovers } from '@/hooks/useMarketMovers';
import { CachedMarketMoverCoin } from '@/store/slices/searchCacheSlice';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CryptocurrencyIcon from './CryptocurrencyIcon';

export default function DailyGainers() {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
  const router = useRouter();

  // Use our new market movers hook with Redux caching
  const {
    coins: displayData,
    loading: isLoadingCoinData,
    error,
    refreshMarketMovers,
    hasCachedData
  } = useMarketMovers(activeTab, 15);

  const formatPrice = (price: number | null | undefined) => {
    if (!price || price === 0) return '$0.00';

    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 10) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatVolume = (volume: number | null | undefined) => {
    if (!volume || volume === 0) return '$0.00';

    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    } else {
      return `$${volume.toFixed(2)}`;
    }
  };

  const handleNavigate = async (coin: CachedMarketMoverCoin) => {
    const base = coin.symbol?.toUpperCase() || coin.name?.toUpperCase();
    if (!base) return;

    // First try to use cached contract addresses from Redux
    let chain = coin.primaryChain;
    let address = coin.primaryAddress;

    // If no cached data, try local tokens list
    if (!chain || !address) {
      const list = tokens as Array<{ symbol: string; chain: string; address: string; name: string }>;
      const matches = list.filter(t => t.symbol.toUpperCase() === base);
      const selected = matches.find(t => t.chain && t.chain.toLowerCase() === 'ethereum') || matches[0];
      chain = selected?.chain;
      address = selected?.address;
    }

    // If still no data, try contract addresses from cache
    if (!chain || !address) {
      if (coin.contractAddresses && Object.keys(coin.contractAddresses).length > 0) {
        const chainPriority = ['ethereum', 'binance', 'polygon', 'arbitrum', 'base', 'optimism', 'avalanche', 'fantom', 'solana'];
        const availableChain = chainPriority.find(c => coin.contractAddresses![c]);
        if (availableChain) {
          chain = availableChain;
          address = coin.contractAddresses[availableChain];
        }
      }
    }

    // Fallback to API call only if absolutely necessary
    if (!chain || !address) {
      try {
        const platforms = await fetchCoinPlatforms(coin.id);
        if (platforms) {
          const platformToChain: Record<string, string> = {
            ethereum: 'ethereum',
            'binance-smart-chain': 'binance',
            'polygon-pos': 'polygon',
            avalanche: 'avalanche',
            fantom: 'fantom',
            base: 'base',
            'arbitrum-one': 'arbitrum',
            'optimistic-ethereum': 'optimism',
            solana: 'solana',
          };
          const preference = ['ethereum', 'arbitrum-one', 'optimistic-ethereum', 'base', 'polygon-pos', 'binance-smart-chain', 'avalanche', 'fantom', 'solana'];
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
    if (coin.id) params.set('coingecko_id', coin.id);

    router.push(`/dashboard/trade?${params.toString()}`);
  };

  return (
    <>
      <div className="section-header flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Market Movers</h2>
          {/* <div className="flex items-center gap-2 mt-1">
            {hasCachedData && !isLoadingCoinData && (
              <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
                📈 {activeTab} Cached
              </span>
            )}
            {isLoadingCoinData && (
              <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded animate-pulse">
                🔄 Loading {activeTab}...
              </span>
            )}
            {displayData.length > 0 && !isLoadingCoinData && (
              <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
                ✅ {displayData.length} {activeTab} Loaded
              </span>
            )}
          </div> */}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('gainers')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${activeTab === 'gainers' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              Gainers
            </button>
            <button
              onClick={() => setActiveTab('losers')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${activeTab === 'losers' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              Losers
            </button>
          </div>

          {/* <button
            onClick={refreshMarketMovers}
            disabled={isLoadingCoinData}
            className="flex items-center gap-1 px-2 py-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded-full transition-colors text-xs"
            title={`Refresh ${activeTab} data`}
          >
            <span className={isLoadingCoinData ? 'animate-spin' : ''}>🔄</span>
          </button> */}
        </div>
      </div>

      {isLoadingCoinData ? (
        <div className="animate-pulse space-y-3">
          {[...Array(15)].map((_, index) => (
            <div key={`skeleton-${index}`} className="flex justify-between items-center p-2">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-700/60 rounded-full mr-3"></div>
                <div>
                  <div className="h-4 bg-gray-700/60 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-700/60 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-700/60 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-700/60 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 max-w-sm mx-auto">
            <div className="text-red-400 mb-2">⚠️ Failed to load market data</div>
            <p className="text-gray-400 text-sm mb-3">{typeof error === 'string' ? error : 'An error occurred'}</p>
            <button
              onClick={refreshMarketMovers}
              className="px-4 py-2 bg-[#00b8d8] hover:bg-[#00a6c4] text-white rounded-full text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : displayData.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400">
            <div className="text-2xl mb-2">📊</div>
            <p>No {activeTab} data available</p>
          </div>
        </div>
      ) : (
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          {displayData.map((coin, index) => {
            const contractEntries = coin.contractAddresses
              ? Object.entries(coin.contractAddresses).filter(([, address]) => Boolean(address))
              : [];

            const fallbackEntry =
              (!contractEntries || contractEntries.length === 0) && coin.primaryChain && coin.primaryAddress
                ? [[coin.primaryChain, coin.primaryAddress]]
                : [];

            const entriesToShow = contractEntries.length > 0 ? contractEntries : fallbackEntry;

            if (entriesToShow.length === 0) {
              return null;
            }

            return (
              <div
                key={coin.id ?? coin.symbol}
                className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-800/40"
                onClick={() => handleNavigate(coin)}
              >
                <div className="flex items-center">
                  <div className="relative h-8 w-8 mr-3 shrink-0">
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
                    <div className="text-xs uppercase text-gray-500">{coin.symbol}</div>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-300">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      {entriesToShow.map(([chain, address], index) => (
                        <div
                          key={`${coin.id}-${chain}`}
                          className="flex flex-col items-center -ml-3 first:ml-0 relative z-[${50-index}]"
                        >
                          <CryptocurrencyIcon size={20} width={25} name={chain || 'solana' as any} />
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
