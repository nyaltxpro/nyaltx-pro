import { useState, useEffect, useRef } from 'react';

interface OptimizedCoin {
  id: string;
  name: string;
  symbol: string;
  current_price?: number;
  market_cap?: number;
  market_cap_rank: number;
  price_change_percentage_24h?: number;
  total_volume?: number;
  image?: string;
  thumb?: string;
  large?: string;
  score?: number;
  price_btc?: number;
  market_cap_change_percentage_24h?: number;
  contractAddresses: { [key: string]: string };
  primaryChain: string | null;
  primaryAddress: string | null;
}

interface UseOptimizedCoinGeckoResult {
  data: OptimizedCoin[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Generic hook for fetching CoinGecko data with optimization
export const useOptimizedCoinGecko = (
  endpoint: string,
  params: Record<string, string> = {},
  options: {
    enabled?: boolean;
    refetchInterval?: number;
    retries?: number;
  } = {}
): UseOptimizedCoinGeckoResult => {
  const [data, setData] = useState<OptimizedCoin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { enabled = true, refetchInterval, retries = 2 } = options;

  const fetchData = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 10000); // 10 second timeout

        const url = new URL(`/api/coingecko/${endpoint}`, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });

        const response = await fetch(url.toString(), {
          signal: abortControllerRef.current.signal,
          headers: {
            'Accept': 'application/json',
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          setData(result.coins || []);
          setLoading(false);
          setError(null);
          return; // Success, exit retry loop
        } else if (response.status === 429) {
          // Rate limited, wait and retry
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log(`${endpoint} request timeout, attempt ${attempt + 1}`);
        } else {
          console.error(`Error fetching ${endpoint}, attempt ${attempt + 1}:`, err);
        }

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
          continue;
        } else {
          setError(err.message || 'Failed to fetch data');
          setData([]);
          break;
        }
      }
    }

    setLoading(false);
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();

    // Set up refetch interval if specified
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(fetchData, refetchInterval);
    }

    return () => {
      // Cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endpoint, JSON.stringify(params), enabled]);

  return { data, loading, error, refetch };
};

// Specific hooks for different data types
export const useTrendingCoins = (options?: { enabled?: boolean; refetchInterval?: number }) => {
  return useOptimizedCoinGecko('trending', {}, options);
};

export const useMarketMovers = (
  type: 'gainers' | 'losers' | 'volume' = 'gainers',
  limit: number = 10,
  options?: { enabled?: boolean; refetchInterval?: number }
) => {
  return useOptimizedCoinGecko('market-movers', { type, limit: limit.toString() }, options);
};

export const useRecentlyAddedCoins = (
  limit: number = 10,
  options?: { enabled?: boolean; refetchInterval?: number }
) => {
  return useOptimizedCoinGecko('recently-added', { limit: limit.toString() }, options);
};

// Helper function to navigate to trade page with full parameters
export const navigateToTrade = (coin: OptimizedCoin, router: any) => {
  const params = new URLSearchParams();
  params.set('base', coin.symbol.toUpperCase());
  
  if (coin.primaryChain) {
    params.set('chain', coin.primaryChain);
  }
  if (coin.primaryAddress) {
    params.set('address', coin.primaryAddress);
  }
  
  params.set('coingecko_id', coin.id);
  
  router.push(`/dashboard/trade?${params.toString()}`);
};
