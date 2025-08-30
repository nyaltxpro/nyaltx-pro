/**
 * WebSocket implementation for real-time market data
 * Uses CoinGecko API with polling to simulate real-time updates
 */

import { getCoinsMarkets } from '../coingecko/client';

export interface MarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h: number;
  price_change_percentage_7d: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}

export interface WebSocketMessage {
  type: 'market_update' | 'error' | 'connection_status';
  data: any;
}

type SubscriberCallback = (message: WebSocketMessage) => void;

class MarketDataWebSocket {
  private subscribers: Map<string, SubscriberCallback[]> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isConnected: boolean = false;
  private defaultPollingInterval: number = 30000; // 30 seconds by default
  
  /**
   * Connect to the "websocket" (simulated with polling)
   */
  public connect(): void {
    if (this.isConnected) return;
    
    this.isConnected = true;
    this.notifyAll({
      type: 'connection_status',
      data: { status: 'connected' }
    });
    
    console.log('Market data websocket connected');
  }
  
  /**
   * Disconnect from the "websocket"
   */
  public disconnect(): void {
    if (!this.isConnected) return;
    
    // Clear all polling intervals
    this.pollingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.pollingIntervals.clear();
    
    this.isConnected = false;
    this.notifyAll({
      type: 'connection_status',
      data: { status: 'disconnected' }
    });
    
    console.log('Market data websocket disconnected');
  }
  
  /**
   * Subscribe to market data updates for specific coins
   */
  public subscribeToMarketData(
    channel: string,
    callback: SubscriberCallback,
    options: {
      coinIds?: string[];
      vsCurrency?: string;
      pollingInterval?: number;
    } = {}
  ): void {
    if (!this.isConnected) {
      this.connect();
    }
    
    // Add subscriber to the channel
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }
    this.subscribers.get(channel)?.push(callback);
    
    // Set up polling for this channel if not already set
    if (!this.pollingIntervals.has(channel)) {
      const {
        coinIds = [],
        vsCurrency = 'usd',
        pollingInterval = this.defaultPollingInterval
      } = options;
      
      // Initial fetch
      this.fetchAndBroadcastMarketData(channel, coinIds, vsCurrency);
      
      // Set up polling
      const intervalId = setInterval(() => {
        this.fetchAndBroadcastMarketData(channel, coinIds, vsCurrency);
      }, pollingInterval);
      
      this.pollingIntervals.set(channel, intervalId);
    }
  }
  
  /**
   * Unsubscribe from a channel
   */
  public unsubscribe(channel: string, callback?: SubscriberCallback): void {
    if (!this.subscribers.has(channel)) return;
    
    if (callback) {
      // Remove specific callback
      const callbacks = this.subscribers.get(channel) || [];
      const filteredCallbacks = callbacks.filter(cb => cb !== callback);
      
      if (filteredCallbacks.length === 0) {
        // No more subscribers, clear polling and remove channel
        this.clearChannelPolling(channel);
      } else {
        this.subscribers.set(channel, filteredCallbacks);
      }
    } else {
      // Remove all callbacks for this channel
      this.clearChannelPolling(channel);
    }
  }
  
  /**
   * Clear polling and subscribers for a channel
   */
  private clearChannelPolling(channel: string): void {
    // Clear interval
    const intervalId = this.pollingIntervals.get(channel);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(channel);
    }
    
    // Remove subscribers
    this.subscribers.delete(channel);
  }
  
  /**
   * Fetch market data and broadcast to subscribers
   */
  private async fetchAndBroadcastMarketData(
    channel: string,
    coinIds: string[],
    vsCurrency: string
  ): Promise<void> {
    try {
      const marketData = await getCoinsMarkets(
        vsCurrency,
        coinIds,
        '',
        'market_cap_desc',
        100,
        1,
        false,
        '1h,24h,7d'
      );
      
      this.notifyChannel(channel, {
        type: 'market_update',
        data: marketData
      });
    } catch (error) {
      console.error('Error fetching market data:', error);
      this.notifyChannel(channel, {
        type: 'error',
        data: { message: 'Failed to fetch market data', error }
      });
    }
  }
  
  /**
   * Notify all subscribers across all channels
   */
  private notifyAll(message: WebSocketMessage): void {
    this.subscribers.forEach((callbacks) => {
      callbacks.forEach((callback) => {
        callback(message);
      });
    });
  }
  
  /**
   * Notify subscribers of a specific channel
   */
  private notifyChannel(channel: string, message: WebSocketMessage): void {
    const callbacks = this.subscribers.get(channel) || [];
    callbacks.forEach((callback) => {
      callback(message);
    });
  }
}

// Create singleton instance
export const marketDataWebSocket = new MarketDataWebSocket();

// Helper hooks for React components
export const useMarketDataWebSocket = () => {
  return marketDataWebSocket;
};
