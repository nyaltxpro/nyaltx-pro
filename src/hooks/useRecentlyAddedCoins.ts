import { useEffect, useCallback, useState } from 'react';
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
  
  // Fallback state in case Redux has issues
  const [fallbackInitialized, setFallbackInitialized] = useState(false);

  console.log('🔍 useRecentlyAddedCoins - State:', {
    coinsCount: recentlyAddedCoins?.length || 0,
    loading,
    error,
    fallbackInitialized
  });

  const fetchRecentlyAddedCoins = useCallback(async (forceRefresh = false) => {
    try {
      // Clean expired cache first
      dispatch(cleanExpiredCache());

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
      throw err;
    }
  }, [dispatch]);

  const refreshRecentlyAddedCoins = useCallback(async () => {
    // Force refresh by clearing cache first
    dispatch(setRecentlyAddedCoins([]));
    return fetchRecentlyAddedCoins(true);
  }, [dispatch, fetchRecentlyAddedCoins]);

  // Auto-fetch on mount and set up refresh interval
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Prevent multiple initializations
        if (fallbackInitialized) return;
        
        // Only fetch if we don't have cached data
        if (!recentlyAddedCoins || recentlyAddedCoins.length === 0) {
          console.log('🚀 Initializing recently added coins data...');
          await fetchRecentlyAddedCoins();
        } else {
          console.log('📱 Using existing cached recently added coins data');
        }
        
        setFallbackInitialized(true);
      } catch (error) {
        console.error('❌ Error initializing recently added coins:', error);
        setFallbackInitialized(true);
      }
    };

    initializeData();

    // Refresh every 30 minutes
    const intervalId = setInterval(
      () => {
        console.log('⏰ Auto-refreshing recently added coins...');
        fetchRecentlyAddedCoins().catch(error => {
          console.error('❌ Error in auto-refresh:', error);
        });
      },
      30 * 60 * 1000
    );

    return () => clearInterval(intervalId);
  }, [fallbackInitialized]); // Add fallbackInitialized to prevent multiple runs

  return {
    recentlyAddedCoins: recentlyAddedCoins || [],
    loading,
    error,
    fetchRecentlyAddedCoins,
    refreshRecentlyAddedCoins,
    hasCachedData: !!recentlyAddedCoins && recentlyAddedCoins.length > 0,
  };
};
