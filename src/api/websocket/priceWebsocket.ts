// WebSocket service for real-time price updates
// Note: CoinGecko's free API doesn't provide WebSocket. This implementation
// simulates WebSocket behavior by polling the API at regular intervals.

import { getTopTickers, CoinTicker } from '../coingecko';

type WebSocketCallback = (data: CoinTicker[]) => void;

class PriceWebSocketService {
  private callbacks: WebSocketCallback[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private pollingInterval: number = 30000; // 30 seconds to reduce API calls
  private tickerLimit: number = 8;
  private retryCount: number = 0;
  private maxRetries: number = 3;

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
      this.retryCount = 0; // Reset retry count on success
    } catch (error) {
      console.error('Error fetching ticker data:', error);
      
      this.retryCount++;
      if (this.retryCount >= this.maxRetries) {
        console.warn('Max retries reached, using fallback data');
        // Broadcast empty array or cached data as fallback
        this.broadcast([]);
        this.retryCount = 0; // Reset for next cycle
      } else {
        console.log(`Retrying in ${this.retryCount * 5} seconds... (${this.retryCount}/${this.maxRetries})`);
        // Retry with exponential backoff
        setTimeout(() => {
          this.fetchAndBroadcast();
        }, this.retryCount * 5000);
      }
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
