import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  CachedMarketMoverCoin,
  selectMarketMovers,
  setMarketMoversData,
} from '@/store/slices/searchCacheSlice';

interface MarketMoversHookResult {
  coins: CachedMarketMoverCoin[];
  loading: boolean;
  error: string | null;
  refreshMarketMovers: () => Promise<void>;
  hasCachedData: boolean;
}

const MARKET_MOVER_TYPES: Array<'gainers' | 'losers'> = ['gainers', 'losers'];

const fetchMarketMoversFromApi = async (type: 'gainers' | 'losers', limit: number) => {
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

  if (data && Array.isArray(data.coins)) {
    return data.coins.map((coin: any) => ({
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
    })) as CachedMarketMoverCoin[];
  }

  throw new Error(`Invalid ${type} data structure from API`);
};

export const useMarketMovers = (
  type: 'gainers' | 'losers' = 'gainers',
  limit: number = 5
): MarketMoversHookResult => {
  const dispatch = useAppDispatch();
  const selectCoins = useMemo(() => selectMarketMovers(type, limit), [type, limit]);
  const cachedCoins = useAppSelector(selectCoins);

  const [loading, setLoading] = useState(!cachedCoins);
  const [error, setError] = useState<string | null>(null);

  const hydrateCache = useCallback(
    async (requestedType: 'gainers' | 'losers', requestedLimit: number, force = false) => {
      if (!force) {
        const selector = selectMarketMovers(requestedType, requestedLimit);
        const state = (await import('@/store')).store.getState();
        const existing = selector(state as any);
        if (existing) {
          return existing;
        }
      }

      const coins = await fetchMarketMoversFromApi(requestedType, requestedLimit);
      dispatch(setMarketMoversData({ type: requestedType, coins, limit: requestedLimit }));
      return coins;
    },
    [dispatch]
  );

  const prefetchAll = useCallback(
    async (requestedLimit: number, force = false) => {
      await Promise.all(
        MARKET_MOVER_TYPES.map(requestedType => hydrateCache(requestedType, requestedLimit, force))
      );
    },
    [hydrateCache]
  );

  const initialize = useCallback(
    async (requestedType: 'gainers' | 'losers', requestedLimit: number) => {
      setLoading(true);
      setError(null);

      try {
        await prefetchAll(requestedLimit);
      } catch (err) {
        console.error(`❌ Error initializing ${requestedType}:`, err);
        const message = err instanceof Error ? err.message : `Failed to load ${requestedType}`;
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [prefetchAll]
  );

  useEffect(() => {
    if (!cachedCoins || cachedCoins.length < limit) {
      void initialize(type, limit);
    }
  }, [initialize, cachedCoins, type, limit]);

  const refreshMarketMovers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await prefetchAll(limit, true);
    } catch (err) {
      console.error('❌ Error refreshing market movers:', err);
      const message = err instanceof Error ? err.message : 'Failed to refresh market movers';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [prefetchAll, limit]);

  return {
    coins: cachedCoins ?? [],
    loading,
    error,
    refreshMarketMovers,
    hasCachedData: Boolean(cachedCoins && cachedCoins.length > 0),
  };
};
