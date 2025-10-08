import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// CoinGecko coin interface
export interface CachedCoinGeckoCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
  api_symbol: string;
  contractAddresses: { [key: string]: string };
  primaryChain: string | null;
  primaryAddress: string | null;
}

// Trending coin interface
export interface CachedTrendingCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
  score: number;
  price_btc: number;
  contractAddresses?: { [key: string]: string };
  primaryChain?: string | null;
  primaryAddress?: string | null;
}

// Recently added coin interface
export interface CachedRecentlyAddedCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  contractAddresses?: { [key: string]: string };
  primaryChain?: string | null;
  primaryAddress?: string | null;
}

// Market mover coin interface
export interface CachedMarketMoverCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  contractAddresses?: { [key: string]: string };
  primaryChain?: string | null;
  primaryAddress?: string | null;
}

// Cache entry with timestamp
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface SearchCacheState {
  // CoinGecko search results cache
  coinGeckoSearchCache: Record<string, CacheEntry<CachedCoinGeckoCoin[]>>;

  // Trending coins cache
  trendingCoinsCache: CacheEntry<CachedTrendingCoin[]> | null;

  // Recently added coins cache
  recentlyAddedCoinsCache: CacheEntry<CachedRecentlyAddedCoin[]> | null;

  // Market movers cache (gainers/losers)
  marketMoversCache: {
    gainers: CacheEntry<CachedMarketMoverCoin[]> | null;
    losers: CacheEntry<CachedMarketMoverCoin[]> | null;
  };

  // Popular tokens cache
  popularTokensCache: CacheEntry<any[]> | null;

  // Loading states
  isSearching: boolean;
  isTrendingLoading: boolean;
  isRecentlyAddedLoading: boolean;

  // Error states
  searchError: string | null;
  trendingError: string | null;
  recentlyAddedError: string | null;

  // Cache settings
  searchCacheDuration: number; // 5 minutes in ms
  trendingCacheDuration: number; // 30 minutes in ms
  recentlyAddedCacheDuration: number; // 30 minutes in ms
}

const SEARCH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const TRENDING_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const RECENTLY_ADDED_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const initialState: SearchCacheState = {
  coinGeckoSearchCache: {},
  trendingCoinsCache: null,
  recentlyAddedCoinsCache: null,
  marketMoversCache: {
    gainers: null,
    losers: null,
  },
  popularTokensCache: null,
  isSearching: false,
  isTrendingLoading: false,
  isRecentlyAddedLoading: false,
  searchError: null,
  trendingError: null,
  recentlyAddedError: null,
  searchCacheDuration: SEARCH_CACHE_DURATION,
  trendingCacheDuration: TRENDING_CACHE_DURATION,
  recentlyAddedCacheDuration: RECENTLY_ADDED_CACHE_DURATION,
};

const searchCacheSlice = createSlice({
  name: 'searchCache',
  initialState,
  reducers: {
    // CoinGecko search cache actions
    setCoinGeckoSearchResults: (
      state,
      action: PayloadAction<{ query: string; results: CachedCoinGeckoCoin[] }>
    ) => {
      const { query, results } = action.payload;
      const now = Date.now();
      const normalizedQuery = query.toLowerCase().trim();

      state.coinGeckoSearchCache[normalizedQuery] = {
        data: results,
        timestamp: now,
        expiresAt: now + state.searchCacheDuration,
      };

      state.isSearching = false;
      state.searchError = null;

      console.log(`💾 Cached ${results.length} CoinGecko results for "${query}"`);
    },

    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
      if (action.payload) {
        state.searchError = null;
      }
    },

    setSearchError: (state, action: PayloadAction<string | null>) => {
      state.searchError = action.payload;
      state.isSearching = false;
    },

    // Trending coins cache actions
    setTrendingCoins: (state, action: PayloadAction<CachedTrendingCoin[]>) => {
      const now = Date.now();

      state.trendingCoinsCache = {
        data: action.payload,
        timestamp: now,
        expiresAt: now + state.trendingCacheDuration,
      };

      state.isTrendingLoading = false;
      state.trendingError = null;

      console.log(`💾 Cached ${action.payload.length} trending coins`);
    },

    setTrendingLoading: (state, action: PayloadAction<boolean>) => {
      state.isTrendingLoading = action.payload;
      if (action.payload) {
        state.trendingError = null;
      }
    },

    setTrendingError: (state, action: PayloadAction<string | null>) => {
      state.trendingError = action.payload;
      state.isTrendingLoading = false;
    },

    // Recently added coins cache actions
    setRecentlyAddedCoins: (state, action: PayloadAction<CachedRecentlyAddedCoin[]>) => {
      const now = Date.now();

      state.recentlyAddedCoinsCache = {
        data: action.payload,
        timestamp: now,
        expiresAt: now + state.recentlyAddedCacheDuration,
      };

      state.isRecentlyAddedLoading = false;
      state.recentlyAddedError = null;

      console.log(`💾 Cached ${action.payload.length} recently added coins`);
    },

    setRecentlyAddedLoading: (state, action: PayloadAction<boolean>) => {
      state.isRecentlyAddedLoading = action.payload;
      if (action.payload) {
        state.recentlyAddedError = null;
      }
    },

    setRecentlyAddedError: (state, action: PayloadAction<string | null>) => {
      state.recentlyAddedError = action.payload;
      state.isRecentlyAddedLoading = false;
    },

    // Cache management actions
    clearSearchCache: state => {
      state.coinGeckoSearchCache = {};
      console.log('🗑️ Cleared CoinGecko search cache');
    },

    clearTrendingCache: state => {
      state.trendingCoinsCache = null;
      console.log('🗑️ Cleared trending coins cache');
    },

    clearRecentlyAddedCache: state => {
      state.recentlyAddedCoinsCache = null;
      console.log('🗑️ Cleared recently added coins cache');
    },

    clearAllCache: state => {
      state.coinGeckoSearchCache = {};
      state.trendingCoinsCache = null;
      state.recentlyAddedCoinsCache = null;
      state.popularTokensCache = null;
      console.log('🗑️ Cleared all search cache');
    },

    // Clean expired cache entries
    cleanExpiredCache: state => {
      const now = Date.now();
      let cleanedCount = 0;

      // Clean expired search results
      Object.keys(state.coinGeckoSearchCache).forEach(query => {
        if (state.coinGeckoSearchCache[query].expiresAt < now) {
          delete state.coinGeckoSearchCache[query];
          cleanedCount++;
        }
      });

      // Clean expired trending coins
      if (state.trendingCoinsCache && state.trendingCoinsCache.expiresAt < now) {
        state.trendingCoinsCache = null;
        cleanedCount++;
      }

      // Clean expired recently added coins
      if (state.recentlyAddedCoinsCache && state.recentlyAddedCoinsCache.expiresAt < now) {
        state.recentlyAddedCoinsCache = null;
        cleanedCount++;
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned ${cleanedCount} expired cache entries`);
      }
    },

    // Update cache durations
    updateCacheDurations: (
      state,
      action: PayloadAction<{ search?: number; trending?: number; recentlyAdded?: number }>
    ) => {
      if (action.payload.search) {
        state.searchCacheDuration = action.payload.search;
      }
      if (action.payload.trending) {
        state.trendingCacheDuration = action.payload.trending;
      }
      if (action.payload.recentlyAdded) {
        state.recentlyAddedCacheDuration = action.payload.recentlyAdded;
      }
    },
  },
});

export const {
  setCoinGeckoSearchResults,
  setSearchLoading,
  setSearchError,
  setTrendingCoins,
  setTrendingLoading,
  setTrendingError,
  setRecentlyAddedCoins,
  setRecentlyAddedLoading,
  setRecentlyAddedError,
  clearSearchCache,
  clearTrendingCache,
  clearRecentlyAddedCache,
  clearAllCache,
  cleanExpiredCache,
  updateCacheDurations,
} = searchCacheSlice.actions;

// Selectors
export const selectCoinGeckoSearchResults =
  (query: string) => (state: { searchCache: SearchCacheState }) => {
    const normalizedQuery = query.toLowerCase().trim();
    const cacheEntry = state.searchCache.coinGeckoSearchCache[normalizedQuery];

    if (!cacheEntry) return null;

    // Check if cache is expired
    if (cacheEntry.expiresAt < Date.now()) {
      return null;
    }

    return cacheEntry.data;
  };

export const selectTrendingCoins = (state: { searchCache: SearchCacheState }) => {
  const cacheEntry = state.searchCache.trendingCoinsCache;

  if (!cacheEntry) return null;

  // Check if cache is expired
  if (cacheEntry.expiresAt < Date.now()) {
    return null;
  }

  return cacheEntry.data;
};

export const selectRecentlyAddedCoins = (state: { searchCache: SearchCacheState }) => {
  const cacheEntry = state.searchCache.recentlyAddedCoinsCache;

  if (!cacheEntry) return null;

  // Check if cache is expired
  if (cacheEntry.expiresAt < Date.now()) {
    return null;
  }

  return cacheEntry.data;
};

export const selectSearchLoading = (state: { searchCache: SearchCacheState }) =>
  state.searchCache.isSearching;

export const selectTrendingLoading = (state: { searchCache: SearchCacheState }) =>
  state.searchCache.isTrendingLoading;

export const selectRecentlyAddedLoading = (state: { searchCache: SearchCacheState }) =>
  state.searchCache.isRecentlyAddedLoading;

export const selectSearchError = (state: { searchCache: SearchCacheState }) =>
  state.searchCache.searchError;

export const selectTrendingError = (state: { searchCache: SearchCacheState }) =>
  state.searchCache.trendingError;

export const selectRecentlyAddedError = (state: { searchCache: SearchCacheState }) =>
  state.searchCache.recentlyAddedError;

export const selectCacheStats = (state: { searchCache: SearchCacheState }) => {
  const now = Date.now();
  const searchCacheCount = Object.keys(state.searchCache.coinGeckoSearchCache).length;
  const validSearchCacheCount = Object.values(state.searchCache.coinGeckoSearchCache).filter(
    entry => entry.expiresAt > now
  ).length;

  return {
    totalSearchQueries: searchCacheCount,
    validSearchQueries: validSearchCacheCount,
    expiredSearchQueries: searchCacheCount - validSearchCacheCount,
    hasTrendingCache: !!state.searchCache.trendingCoinsCache,
    trendingCacheValid: state.searchCache.trendingCoinsCache
      ? state.searchCache.trendingCoinsCache.expiresAt > now
      : false,
    hasRecentlyAddedCache: !!state.searchCache.recentlyAddedCoinsCache,
    recentlyAddedCacheValid: state.searchCache.recentlyAddedCoinsCache
      ? state.searchCache.recentlyAddedCoinsCache.expiresAt > now
      : false,
  };
};

export default searchCacheSlice.reducer;
