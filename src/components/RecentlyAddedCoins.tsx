'use client';

import { fetchCoinPlatforms } from '@/api/coingecko/api';
import TokenAvatar from '@/components/TokenAvatar';
import tokens from '@/data/tokens.json';
import { useRecentlyAddedCoins } from '@/hooks/useRecentlyAddedCoins';
import { CachedRecentlyAddedCoin } from '@/store/slices/searchCacheSlice';
import { useRouter } from 'next/navigation';

export default function RecentlyAddedCoins() {
  const router = useRouter();

  // Wrap hook usage in try-catch for error boundary
  let hookResult;
  try {
    hookResult = useRecentlyAddedCoins();
  } catch (hookError) {
    console.error('❌ Error in useRecentlyAddedCoins hook:', hookError);
    hookResult = {
      recentlyAddedCoins: [],
      loading: false,
      error: 'Failed to initialize recently added coins',
      refreshRecentlyAddedCoins: async () => { },
      hasCachedData: false
    };
  }

  const {
    recentlyAddedCoins: coins,
    loading,
    error,
    refreshRecentlyAddedCoins,
    hasCachedData
  } = hookResult;


  // Format price with appropriate decimal places
  const formatPrice = (price: number | null | undefined) => {
    if (!price || price === 0) return '$0.00';

    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 10) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(2)}`;
  };

  // Format market cap and volume
  const formatNumber = (num: number | null | undefined) => {
    if (!num || num === 0) return '$0.00';

    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const handleNavigate = async (coin: CachedRecentlyAddedCoin) => {
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
    if (coin.image) params.set('imageUri', coin.image);

    router.push(`/dashboard/trade?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">🔥 Latest Token Profiles</h2>
          {/* <div className="flex items-center gap-2 mt-1">
            {hasCachedData && !loading && (
              <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
                📱 DexScreener Cached
              </span>
            )}
            {loading && (
              <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded animate-pulse">
                🔄 Loading DexScreener...
              </span>
            )}
            {coins.length > 0 && !loading && (
              <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
                ✅ {coins.length} Coins Loaded
              </span>
            )}
          </div> */}
        </div>

        {/* <button
          onClick={refreshRecentlyAddedCoins}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded-full transition-colors text-sm"
          title="Refresh recently added coins data"
        >
          <span className={loading ? 'animate-spin' : ''}>🔄</span>
          Refresh
        </button> */}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={`skeleton-${index}`} className="rounded-lg p-2 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-700/60 rounded-full mr-3"></div>
                <div>
                  <div className="h-4 bg-gray-700/60 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-700/60 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-700/60 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-700/60 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 max-w-sm mx-auto">
            <div className="text-red-400 mb-2">⚠️ Failed to load recently added coins</div>
            <p className="text-gray-400 text-sm mb-3">{error}</p>
            <button
              onClick={refreshRecentlyAddedCoins}
              className="px-4 py-2 bg-[#00b8d8] hover:bg-[#00a6c4] text-white rounded-full text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : coins.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400">
            <div className="text-2xl mb-2">🆕</div>
            <p>No recently added coins available</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {coins.slice(0, 5).map(coin => (
            <div
              key={coin.id}
              className="rounded-lg p-2 flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer hover:bg-gray-800/40"
              onClick={() => handleNavigate(coin)}
            >
              <div className="flex items-center">
                <div className="mr-3">
                  <TokenAvatar
                    src={coin.image}
                    symbol={coin.symbol}
                    name={coin.name}
                    size={32}
                    className="flex-shrink-0"
                  />
                </div>
                <div>
                  <div className="font-medium">{coin.name}</div>
                  <div className="text-gray-400 text-xs">{coin.symbol.toUpperCase()}</div>
                </div>
              </div>

              <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 flex justify-between sm:block">
                <div className="font-medium">{formatPrice(coin.current_price)}</div>
                <div
                  className={`text-xs ${(coin.price_change_percentage_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                  {(coin.price_change_percentage_24h || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
