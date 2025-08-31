// WebSocket service for real-time price updates
// Note: CoinGecko's free API doesn't provide WebSocket. This implementation
// simulates WebSocket behavior by polling the API at regular intervals.

import { getTopTickers, CoinTicker } from '../coingecko';

type WebSocketCallback = (data: CoinTicker[]) => void;

class PriceWebSocketService {
  private callbacks: WebSocketCallback[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private pollingInterval: number = 10000; // 10 seconds
  private tickerLimit: number = 8;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  public connect(limit: number = 8): void {
    if (this.isConnected) return;
    
    this.tickerLimit = limit;
    this.isConnected = true;
    
    // Initial data fetch
    this.fetchAndBroadcast();
    
    // Set up polling interval
    this.intervalId = setInterval(() => {
      this.fetchAndBroadcast();
    }, this.pollingInterval);
    
    console.log('WebSocket connected');
  }

  public disconnect(): void {
    if (!this.isConnected) return;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isConnected = false;
    console.log('WebSocket disconnected');
  }

  public subscribe(callback: WebSocketCallback): void {
    this.callbacks.push(callback);
  }

  public unsubscribe(callback: WebSocketCallback): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  private async fetchAndBroadcast(): Promise<void> {
    try {
      const tickers = await getTopTickers(this.tickerLimit);
      this.broadcast(tickers);
    } catch (error) {
      console.error('Error fetching ticker data:', error);
    }
  }

  private broadcast(data: CoinTicker[]): void {
    this.callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in WebSocket callback:', error);
      }
    });
  }
}

// Singleton instance
const priceWebSocketService = new PriceWebSocketService();
export default priceWebSocketService;
