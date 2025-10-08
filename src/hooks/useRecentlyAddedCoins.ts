import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectRecentlyAddedCoins,
  selectRecentlyAddedLoading,
  selectRecentlyAddedError,
  setRecentlyAddedCoins,
  setRecentlyAddedLoading,
  setRecentlyAddedError,
  cleanExpiredCache,
  CachedRecentlyAddedCoin,
} from '@/store/slices/searchCacheSlice';

export const useRecentlyAddedCoins = () => {
  const dispatch = useAppDispatch();
  const recentlyAddedCoins = useAppSelector(selectRecentlyAddedCoins);
  const loading = useAppSelector(selectRecentlyAddedLoading);
  const error = useAppSelector(selectRecentlyAddedError);

  const fetchRecentlyAddedCoins = useCallback(async () => {
    // Clean expired cache first
    dispatch(cleanExpiredCache());

    // Check if we have valid cached data
    if (recentlyAddedCoins && recentlyAddedCoins.length > 0) {
      console.log('📱 Using cached recently added coins data');
      return recentlyAddedCoins;
    }

    try {
      dispatch(setRecentlyAddedLoading(true));
      console.log('🔄 Fetching fresh recently added coins data from API...');

      // Use the optimized API endpoint
      const response = await fetch('/api/coingecko/recently-added', {
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
        const enhancedCoins: CachedRecentlyAddedCoin[] = data.coins.map((coin: any) => ({
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

        dispatch(setRecentlyAddedCoins(enhancedCoins));
        console.log(
          `✅ Cached ${enhancedCoins.length} recently added coins with contract addresses from API`
        );
        return enhancedCoins;
      } else {
        throw new Error('Invalid recently added coins data structure from API');
      }
    } catch (err) {
      console.error('❌ Error fetching recently added coins:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recently added coins';
      dispatch(setRecentlyAddedError(errorMessage));

      // Return cached data if available, even if expired
      if (recentlyAddedCoins) {
        console.log('📱 Using expired cached data due to API error');
        return recentlyAddedCoins;
      }

      throw err;
    }
  }, [dispatch, recentlyAddedCoins]);

  const refreshRecentlyAddedCoins = useCallback(async () => {
    // Force refresh by clearing cache first
    dispatch(setRecentlyAddedCoins([]));
    return fetchRecentlyAddedCoins();
  }, [dispatch, fetchRecentlyAddedCoins]);

  // Auto-fetch on mount and set up refresh interval
  useEffect(() => {
    fetchRecentlyAddedCoins();

    // Refresh every 30 minutes
    const intervalId = setInterval(
      () => {
        console.log('⏰ Auto-refreshing recently added coins...');
        fetchRecentlyAddedCoins();
      },
      30 * 60 * 1000
    );

    return () => clearInterval(intervalId);
  }, [fetchRecentlyAddedCoins]);

  return {
    recentlyAddedCoins: recentlyAddedCoins || [],
    loading,
    error,
    fetchRecentlyAddedCoins,
    refreshRecentlyAddedCoins,
    hasCachedData: !!recentlyAddedCoins && recentlyAddedCoins.length > 0,
  };
};
