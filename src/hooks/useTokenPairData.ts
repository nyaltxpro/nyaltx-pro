import { useState, useEffect } from 'react';
import { fetchTokenPairData, TokenPairData } from '../api/coingecko/api';

/**
 * Custom hook to fetch and manage token pair data
 * @param baseToken Base token symbol (e.g., 'BTC')
 * @param quoteToken Quote token symbol (e.g., 'USDT')
 * @param refreshInterval Refresh interval in milliseconds (default: 60000 - 1 minute)
 * @returns Object containing token pair data, loading state, and error
 */
export function useTokenPairData(
  baseToken: string,
  quoteToken: string,
  refreshInterval: number = 60000
) {
  const [data, setData] = useState<TokenPairData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const pairData = await fetchTokenPairData(baseToken, quoteToken);
        
        if (isMounted) {
          setData(pairData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch token pair data'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval for refreshing data
    if (refreshInterval > 0) {
      intervalId = setInterval(fetchData, refreshInterval);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [baseToken, quoteToken, refreshInterval]);

  return { data, isLoading, error };
}
