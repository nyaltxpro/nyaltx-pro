import { useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setCoinGeckoSearchResults,
  setSearchLoading,
  setSearchError,
  setTrendingCoins,
  setTrendingLoading,
  setTrendingError,
  selectCoinGeckoSearchResults,
  selectTrendingCoins,
  selectSearchLoading,
  selectTrendingLoading,
  selectSearchError,
  selectTrendingError,
  cleanExpiredCache,
  CachedCoinGeckoCoin,
  CachedTrendingCoin
} from '@/store/slices/searchCacheSlice';
import { getCryptoIconUrl } from '@/utils/cryptoIcons';
import { getTrendingCoins } from '@/api/coingecko/client';

export const useCoinGeckoSearch = () => {
  const dispatch = useAppDispatch();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Selectors
  const isSearching = useAppSelector(selectSearchLoading);
  const isTrendingLoading = useAppSelector(selectTrendingLoading);
  const searchError = useAppSelector(selectSearchError);
  const trendingError = useAppSelector(selectTrendingError);

  // Clean expired cache on hook initialization
  const cleanCache = useCallback(() => {
    dispatch(cleanExpiredCache());
  }, [dispatch]);

  // Search CoinGecko with caching
  const searchCoinGecko = useCallback(async (query: string, retries = 2) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    // Note: Cache check will be done in the component using the selector
    // This function focuses on the API call and caching logic

    // Clean expired cache before making new request
    dispatch(cleanExpiredCache());
    dispatch(setSearchLoading(true));

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this attempt
        abortControllerRef.current = new AbortController();
        const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 8000);

        const response = await fetch(
          `/api/crypto/hybrid-search?query=${encodeURIComponent(query)}`,
          {
            signal: abortControllerRef.current.signal,
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ CoinGecko API found ${data.coins?.length || 0} coins for "${query}"`);

          // Convert and cache results
          const convertedCoins: CachedCoinGeckoCoin[] = (data.coins || []).map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            market_cap_rank: coin.rank || 999999,
            thumb: getCryptoIconUrl(coin.symbol),
            large: getCryptoIconUrl(coin.symbol),
            api_symbol: coin.symbol,
            contractAddresses: coin.contractAddresses || {},
            primaryChain: coin.primaryChain,
            primaryAddress: coin.primaryAddress
          }));

          // Cache the results
          dispatch(setCoinGeckoSearchResults({ query: normalizedQuery, results: convertedCoins }));
          
          return convertedCoins;

        } else if (response.status === 429) {
          // Rate limited, wait and retry
          if (attempt < retries) {
            const delay = 1500 * Math.pow(2, attempt);
            console.log(`⏳ Rate limited, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        } else {
          console.error(`❌ CoinGecko API error: ${response.status} ${response.statusText}`);
          dispatch(setSearchError(`API Error: ${response.status}`));
          return [];
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log(`⏱️ CoinGecko search timeout, attempt ${attempt + 1}/${retries + 1}`);
        } else {
          console.error(`❌ Error searching CoinGecko, attempt ${attempt + 1}/${retries + 1}:`, error.message);
        }

        if (attempt < retries) {
          const delay = 750 * (attempt + 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          dispatch(setSearchError(error.message || 'Search failed'));
          return [];
        }
      }
    }

    dispatch(setSearchError('All search attempts failed'));
    return [];
  }, [dispatch]);

  // Get trending coins with caching
  const getTrendingCoinsWithCache = useCallback(async () => {
    // Note: Cache check will be done in the component using the selector
    // This function focuses on the API call and caching logic
    
    dispatch(setTrendingLoading(true));

    try {
      const trendingData = await getTrendingCoins();
      
      if (trendingData && trendingData.coins) {
        const convertedTrending: CachedTrendingCoin[] = trendingData.coins.map((coin: any) => ({
          id: coin.item.id,
          name: coin.item.name,
          symbol: coin.item.symbol,
          market_cap_rank: coin.item.market_cap_rank || 999999,
          thumb: coin.item.thumb,
          large: coin.item.large,
          score: coin.item.score || 0,
          price_btc: coin.item.price_btc || 0,
          contractAddresses: {},
          primaryChain: null,
          primaryAddress: null
        }));

        // Cache the results
        dispatch(setTrendingCoins(convertedTrending));
        return convertedTrending;
      } else {
        dispatch(setTrendingError('No trending data available'));
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error fetching trending coins:', error);
      dispatch(setTrendingError(error.message || 'Failed to fetch trending coins'));
      return [];
    }
  }, [dispatch]);

  // Utility functions for cache management
  const getCacheKey = useCallback((query: string) => {
    return query.toLowerCase().trim();
  }, []);

  // Cancel ongoing search
  const cancelSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    dispatch(setSearchLoading(false));
  }, [dispatch]);

  return {
    // Search functions
    searchCoinGecko,
    getTrendingCoinsWithCache,
    
    // Cache functions
    getCacheKey,
    cleanCache,
    cancelSearch,
    
    // State
    isSearching,
    isTrendingLoading,
    searchError,
    trendingError
  };
};

export default useCoinGeckoSearch;
