'use client';

import { fetchCoinPlatforms } from '@/api/coingecko/api';
import tokens from '@/data/tokens.json';
import { useTrendingCoins } from '@/hooks/useTrendingCoins';
import { CachedTrendingCoin } from '@/store/slices/searchCacheSlice';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TrendingCoins() {
  const { trendingCoins, loading, error, refreshTrendingCoins, hasCachedData } = useTrendingCoins();
  const router = useRouter();

  // Format BTC price with appropriate decimal places
  const formatBtcPrice = (price: number) => {
    if (price < 0.00001) return price.toFixed(8);
    if (price < 0.0001) return price.toFixed(7);
    if (price < 0.001) return price.toFixed(6);
    return price.toFixed(6);
  };

  // Helper function to check if coin has chain information
  const hasChainInfo = (coin: CachedTrendingCoin) => {
    // Check if coin has contract addresses from API or local token data
    if (coin.contractAddresses && Object.keys(coin.contractAddresses).length > 0) {
      return true;
    }

    if (coin.primaryChain && coin.primaryAddress) {
      return true;
    }

    // Fallback to local token data check
    const list = tokens as Array<{ symbol: string; chain: string; address: string; name: string }>;
    const matches = list.filter(t => t.symbol.toUpperCase() === coin.symbol.toUpperCase());
    return matches.length > 0 && matches.some(t => t.chain && t.chain.trim() !== '');
  };

  const handleNavigate = async (coin: CachedTrendingCoin) => {
    const base = coin.symbol?.toUpperCase() || coin.name?.toUpperCase();
    if (!base) return;

    // First check local tokens data
    const list = tokens as Array<{ symbol: string; chain: string; address: string; name: string }>;
    const matches = list.filter(t => t.symbol.toUpperCase() === base);
    let selected = matches.find(t => t.chain && t.chain.toLowerCase() === 'ethereum') || matches[0];
    let chain = selected?.chain;
    let address = selected?.address;

    // If not found in local data, use cached contract addresses from Redux
    if (!chain || !address) {
      if (coin.primaryChain && coin.primaryAddress) {
        chain = coin.primaryChain;
        address = coin.primaryAddress;
        console.log(`🔗 Using cached contract address for ${coin.symbol}: ${chain}/${address}`);
      } else if (coin.contractAddresses && Object.keys(coin.contractAddresses).length > 0) {
        // Use the first available contract address
        const availableChains = Object.keys(coin.contractAddresses);
        const chainPreference = ['ethereum', 'arbitrum', 'optimism', 'base', 'polygon', 'binance'];

        for (const preferredChain of chainPreference) {
          if (coin.contractAddresses[preferredChain]) {
            chain = preferredChain;
            address = coin.contractAddresses[preferredChain];
            break;
          }
        }

        // If no preferred chain found, use the first available
        if (!chain && availableChains.length > 0) {
          chain = availableChains[0];
          address = coin.contractAddresses[chain];
        }

        console.log(`🔗 Using cached contract address for ${coin.symbol}: ${chain}/${address}`);
      }
    }

    // Fallback: fetch fresh contract addresses if still not found
    if (!chain || !address) {
      try {
        console.log(`🔍 Fetching fresh contract addresses for ${coin.symbol}...`);
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
            if (addr && addr !== '0x0000000000000000000000000000000000000000') {
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
    params.set('coingecko_id', coin.id);

    router.push(`/dashboard/trade?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Trending Search List</h2>
        <div className="flex items-center gap-2">
          {/* {hasCachedData && (
            <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
              📱 Cached
            </span>
          )}
          <button
            onClick={refreshTrendingCoins}
            disabled={loading}
            className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors"
            title="Refresh trending coins"
          >
            {loading ? '🔄' : '↻'} Refresh
          </button> */}
        </div>
      </div>

      {loading && !hasCachedData ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-400">Loading trending coins...</span>
        </div>
      ) : error && !hasCachedData ? (
        <div className="text-red-500 p-4 bg-red-900 bg-opacity-20 rounded">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={refreshTrendingCoins}
              className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {(() => {
            console.log('📊 Total trending coins received:', trendingCoins.length);
            console.log('📊 Trending coins data:', trendingCoins.map(c => ({
              symbol: c.symbol,
              hasContract: !!c.contractAddresses && Object.keys(c.contractAddresses).length > 0,
              primaryChain: c.primaryChain,
              contractAddresses: c.contractAddresses
            })));
            return null;
          })()}
          {trendingCoins
            .filter(coin => {
              const hasChain = hasChainInfo(coin);
              if (!hasChain) {
                console.log(`🔍 Filtering out ${coin.symbol} - no chain info:`, {
                  contractAddresses: coin.contractAddresses,
                  primaryChain: coin.primaryChain,
                  primaryAddress: coin.primaryAddress
                });
              }
              return hasChain;
            })
            .slice(0, 5)
            .map(coin => (
              <div
                key={coin.id}
                className="rounded-lg p-2 flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer hover:bg-gray-800/40"
                onClick={() => handleNavigate(coin)}
              >
                <div className="flex items-center">
                  <div className="relative h-8 w-8 mr-3">
                    <Image
                      src={coin.thumb}
                      alt={coin.name}
                      fill
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="font-medium">{coin.name}</div>
                    <div className="text-gray-400 text-xs flex items-center gap-2">
                      <span>{coin.symbol.toUpperCase()}</span>
                      {coin.primaryChain && (
                        <span className="bg-blue-900/30 text-blue-300 px-1 rounded text-xs">
                          {coin.primaryChain}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 flex justify-between sm:block">
                  <div className="font-medium text-sm flex items-center">
                    {coin.price_btc && (
                      <span className="text-orange-400">{formatBtcPrice(coin.price_btc)}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>Rank #{coin.market_cap_rank || 'N/A'}</span>
                    {coin.contractAddresses && Object.keys(coin.contractAddresses).length > 0 && (
                      <span className="text-green-400" title="Contract addresses cached">
                        🔗
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {trendingCoins.filter(coin => hasChainInfo(coin)).length === 0 && (
            <div className="text-center text-gray-400 py-4">
              {trendingCoins.length === 0
                ? "No trending coins found"
                : "No trending tokens with chain information found"
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}
