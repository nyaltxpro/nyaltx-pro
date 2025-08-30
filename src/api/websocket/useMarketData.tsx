import { useState, useEffect } from 'react';
import { marketDataWebSocket, WebSocketMessage, MarketData } from './marketData';

interface UseMarketDataOptions {
  coinIds?: string[];
  vsCurrency?: string;
  pollingInterval?: number;
}

/**
 * React hook for using market data websocket
 */
export const useMarketData = (options: UseMarketDataOptions = {}) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const {
    coinIds = [],
    vsCurrency = 'usd',
    pollingInterval = 30000, // 30 seconds
  } = options;
  
  useEffect(() => {
    const channelId = `market-data-${coinIds.join('-')}-${vsCurrency}`;
    
    // Handle websocket messages
    const handleMessage = (message: WebSocketMessage) => {
      switch (message.type) {
        case 'market_update':
          setMarketData(message.data);
          setIsLoading(false);
          break;
        case 'error':
          setError(new Error(message.data.message));
          setIsLoading(false);
          break;
        case 'connection_status':
          setIsConnected(message.data.status === 'connected');
          break;
      }
    };
    
    // Subscribe to market data
    marketDataWebSocket.subscribeToMarketData(
      channelId,
      handleMessage,
      {
        coinIds,
        vsCurrency,
        pollingInterval,
      }
    );
    
    // Cleanup on unmount
    return () => {
      marketDataWebSocket.unsubscribe(channelId, handleMessage);
    };
  }, [coinIds.join(','), vsCurrency, pollingInterval]);
  
  // Get top gainers and losers
  const getTopGainers = (limit: number = 5): MarketData[] => {
    return [...marketData]
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, limit);
  };
  
  const getTopLosers = (limit: number = 5): MarketData[] => {
    return [...marketData]
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, limit);
  };
  
  return {
    marketData,
    isLoading,
    error,
    isConnected,
    getTopGainers,
    getTopLosers,
  };
};
