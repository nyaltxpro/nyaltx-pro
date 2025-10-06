import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectTrendingCoins,
  selectTrendingLoading,
  selectTrendingError,
  setTrendingCoins,
  setTrendingLoading,
  setTrendingError,
  cleanExpiredCache,
  CachedTrendingCoin
} from '@/store/slices/searchCacheSlice';

export const useTrendingCoins = () => {
  const dispatch = useAppDispatch();
  const trendingCoins = useAppSelector(selectTrendingCoins);
  const loading = useAppSelector(selectTrendingLoading);
  const error = useAppSelector(selectTrendingError);

  const fetchTrendingCoins = useCallback(async () => {
    // Clean expired cache first
    dispatch(cleanExpiredCache());
    
    // Check if we have valid cached data
    if (trendingCoins && trendingCoins.length > 0) {
      console.log('📱 Using cached trending coins data');
      return trendingCoins;
    }

    try {
      dispatch(setTrendingLoading(true));
      console.log('🔄 Fetching fresh trending coins data from API...');
      
      // Use the optimized API endpoint instead of direct CoinGecko calls
      const response = await fetch('/api/coingecko/trending', {
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
        const enhancedCoins: CachedTrendingCoin[] = data.coins.map((coin: any) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          market_cap_rank: coin.market_cap_rank,
          thumb: coin.thumb,
          large: coin.large,
          score: coin.score,
          price_btc: coin.price_btc,
          contractAddresses: coin.contractAddresses || {},
          primaryChain: coin.primaryChain || null,
          primaryAddress: coin.primaryAddress || null
        }));

        dispatch(setTrendingCoins(enhancedCoins));
        console.log(`✅ Cached ${enhancedCoins.length} trending coins with contract addresses from API`);
        return enhancedCoins;
      } else {
        throw new Error('Invalid trending coins data structure from API');
      }
    } catch (err) {
      console.error('❌ Error fetching trending coins:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trending coins';
      dispatch(setTrendingError(errorMessage));
      
      // Return cached data if available, even if expired
      if (trendingCoins) {
        console.log('📱 Using expired cached data due to API error');
        return trendingCoins;
      }
      
      throw err;
    }
  }, [dispatch, trendingCoins]);

  const refreshTrendingCoins = useCallback(async () => {
    // Force refresh by clearing cache first
    dispatch(setTrendingCoins([]));
    return fetchTrendingCoins();
  }, [dispatch, fetchTrendingCoins]);

  // Auto-fetch on mount and set up refresh interval
  useEffect(() => {
    fetchTrendingCoins();

    // Refresh every 30 minutes
    const intervalId = setInterval(() => {
      console.log('⏰ Auto-refreshing trending coins...');
      fetchTrendingCoins();
    }, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchTrendingCoins]);

  return {
    trendingCoins: trendingCoins || [],
    loading,
    error,
    fetchTrendingCoins,
    refreshTrendingCoins,
    hasCachedData: !!trendingCoins && trendingCoins.length > 0
  };
};
