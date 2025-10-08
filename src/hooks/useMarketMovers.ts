import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  CachedMarketMoverCoin,
} from '@/store/slices/searchCacheSlice';

// For now, we'll use a simple hook structure similar to useRecentlyAddedCoins
// This can be enhanced with Redux integration later
export const useMarketMovers = (type: 'gainers' | 'losers' = 'gainers', limit: number = 5) => {
  const [coins, setCoins] = useState<CachedMarketMoverCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  console.log('🔍 useMarketMovers - State:', {
    type,
    limit,
    coinsCount: coins.length,
    loading,
    error,
    initialized
  });

  const fetchMarketMovers = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 Fetching ${type} market movers from API...`);

      // Use the optimized API endpoint
      const response = await fetch(`/api/coingecko/market-movers?type=${type}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.coins) {
        // The API already returns enhanced coins with contract addresses
        const enhancedCoins: CachedMarketMoverCoin[] = data.coins.map((coin: any) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          image: coin.image,
          current_price: coin.current_price,
          market_cap: coin.market_cap,
          total_volume: coin.total_volume,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          market_cap_rank: coin.market_cap_rank,
          contractAddresses: coin.contractAddresses || {},
          primaryChain: coin.primaryChain || null,
          primaryAddress: coin.primaryAddress || null,
        }));

        setCoins(enhancedCoins);
        setError(null);
        console.log(
          `✅ Loaded ${enhancedCoins.length} ${type} with contract addresses from API`
        );
        return enhancedCoins;
      } else {
        throw new Error(`Invalid ${type} data structure from API`);
      }
    } catch (err) {
      console.error(`❌ Error fetching ${type}:`, err);
      const errorMessage = err instanceof Error ? err.message : `Failed to load ${type}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [type, limit]);

  const refreshMarketMovers = useCallback(async () => {
    // Force refresh by clearing cache first
    setCoins([]);
    return fetchMarketMovers(true);
  }, [fetchMarketMovers]);

  // Auto-fetch on mount and when type/limit changes
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Prevent multiple initializations for the same type/limit
        if (initialized) return;
        
        console.log(`🚀 Initializing ${type} market movers data...`);
        await fetchMarketMovers();
        
        setInitialized(true);
      } catch (error) {
        console.error(`❌ Error initializing ${type}:`, error);
        setInitialized(true);
      }
    };

    // Reset initialization when type or limit changes
    setInitialized(false);
    initializeData();
  }, [type, limit]); // Depend on type and limit to refetch when they change

  return {
    coins,
    loading,
    error,
    fetchMarketMovers,
    refreshMarketMovers,
    hasCachedData: coins.length > 0,
  };
};
