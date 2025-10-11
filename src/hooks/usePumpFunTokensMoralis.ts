import { useState, useEffect, useCallback } from 'react';
import { PumpFunToken } from '../types/token';

interface MoralisPumpFunToken {
  address: string;
  name: string;
  symbol: string;
  logo: string | null;
  decimals: number;
  priceNative: number;
  priceUsd: number;
  liquidity: number;
  marketCap: number;
  createdAt: string;
  chain: string;
  platform: string;
}

interface MoralisApiResponse {
  success: boolean;
  data?: {
    tokens: MoralisPumpFunToken[];
    cursor?: string;
    count: number;
  };
  error?: string;
}

// Transform Moralis token to PumpFunToken format
function transformMoralisToken(token: MoralisPumpFunToken): PumpFunToken {
  return {
    name: token.name,
    symbol: token.symbol,
    mint: token.address,
    creator: undefined, // Not provided by Moralis API
    ts: new Date(token.createdAt).getTime(),
    image: token.logo || undefined,
    uri: undefined, // Not provided by Moralis API
    // Additional fields from Moralis
    priceUsd: token.priceUsd,
    priceNative: token.priceNative,
    liquidity: token.liquidity,
    marketCap: token.marketCap,
    decimals: token.decimals
  };
}

export const usePumpFunTokensMoralis = (options: {
  limit?: number;
  refreshInterval?: number;
  autoRefresh?: boolean;
} = {}) => {
  const {
    limit = 20,
    refreshInterval = 30000, // 30 seconds
    autoRefresh = true
  } = options;

  const [tokens, setTokens] = useState<PumpFunToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();

  const fetchTokens = useCallback(async (useCursor?: string) => {
    try {
      setError(null);
      
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      
      if (useCursor) {
        params.set('cursor', useCursor);
      }

      console.log('🟣 Fetching new Pump.fun tokens from Moralis API...');
      
      const response = await fetch(`/api/moralis/pumpfun/new?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: MoralisApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tokens');
      }

      if (data.data?.tokens) {
        const transformedTokens = data.data.tokens.map(transformMoralisToken);
        
        if (useCursor) {
          // Append to existing tokens (pagination)
          setTokens(prev => [...prev, ...transformedTokens]);
        } else {
          // Replace tokens (refresh)
          setTokens(transformedTokens);
        }
        
        setCursor(data.data.cursor);
        setConnected(true);
        
        console.log(`✅ Fetched ${transformedTokens.length} new Pump.fun tokens`);
      }

    } catch (err: any) {
      console.error('❌ Error fetching Pump.fun tokens:', err);
      setError(err.message || 'Failed to fetch tokens');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Load more tokens (pagination)
  const loadMore = useCallback(() => {
    if (cursor && !loading) {
      setLoading(true);
      fetchTokens(cursor);
    }
  }, [cursor, loading, fetchTokens]);

  // Refresh tokens
  const refresh = useCallback(() => {
    setLoading(true);
    setCursor(undefined);
    fetchTokens();
  }, [fetchTokens]);

  // Initial fetch
  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading) {
        console.log('🔄 Auto-refreshing Pump.fun tokens...');
        refresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, refresh]);

  return {
    tokens,
    loading,
    error,
    connected,
    cursor,
    hasMore: !!cursor,
    loadMore,
    refresh
  };
};
