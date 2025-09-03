// CoinGecko API service for trending cryptocurrencies
export interface CoinGeckoTrendingCoin {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
  data: {
    price: number;
    price_btc: string;
    price_change_percentage_24h: {
      usd: number;
    };
    market_cap: string;
    market_cap_btc: string;
    total_volume: string;
    total_volume_btc: string;
    sparkline: string;
    content: {
      title: string;
      description: string;
    };
  };
}

export interface CoinGeckoTrendingResponse {
  coins: {
    item: CoinGeckoTrendingCoin;
  }[];
  nfts: any[];
  categories: any[];
}

export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: any;
  last_updated: string;
  sparkline_in_7d: {
    price: number[];
  };
}

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export class CoinGeckoService {
  private static instance: CoinGeckoService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 300000; // 5 minutes cache
  private lastRequestTime: number = 0;
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests

  static getInstance(): CoinGeckoService {
    if (!CoinGeckoService.instance) {
      CoinGeckoService.instance = new CoinGeckoService();
    }
    return CoinGeckoService.instance;
  }

  private async fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    // Rate limiting: ensure minimum delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest));
    }

    try {
      this.lastRequestTime = Date.now();
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CryptoApp/1.0'
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited, wait and retry once
          await new Promise(resolve => setTimeout(resolve, 5000));
          const retryResponse = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'CryptoApp/1.0'
            }
          });
          if (!retryResponse.ok) {
            throw new Error(`HTTP error after retry! status: ${retryResponse.status}`);
          }
          const retryData = await retryResponse.json();
          this.cache.set(cacheKey, { data: retryData, timestamp: Date.now() });
          return retryData;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error fetching from CoinGecko API: ${url}`, error);
      
      // Return cached data if available, even if expired
      if (cached) {
        console.log(`Using cached data for ${cacheKey} due to API error`);
        return cached.data;
      }
      
      throw error;
    }
  }

  async getTrendingCoins(): Promise<CoinGeckoTrendingResponse> {
    const url = `${COINGECKO_API_BASE}/search/trending`;
    return this.fetchWithCache<CoinGeckoTrendingResponse>(url, 'trending');
  }

  async getMarketData(coinIds: string[], vsCurrency: string = 'usd'): Promise<CoinGeckoMarketData[]> {
    const ids = coinIds.join(',');
    const url = `${COINGECKO_API_BASE}/coins/markets?vs_currency=${vsCurrency}&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`;
    return this.fetchWithCache<CoinGeckoMarketData[]>(url, `market-${ids}-${vsCurrency}`);
  }

  async getTopCryptocurrencies(count: number = 20, vsCurrency: string = 'usd'): Promise<CoinGeckoMarketData[]> {
    const url = `${COINGECKO_API_BASE}/coins/markets?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=${count}&page=1&sparkline=true&price_change_percentage=24h`;
    return this.fetchWithCache<CoinGeckoMarketData[]>(url, `top-${count}-${vsCurrency}`);
  }

  async getGlobalMarketData(): Promise<{
    data: {
      total_market_cap: { [key: string]: number };
      total_volume: { [key: string]: number };
      market_cap_percentage: { [key: string]: number };
      market_cap_change_percentage_24h_usd: number;
    };
  }> {
    const url = `${COINGECKO_API_BASE}/global`;
    return this.fetchWithCache(url, 'global');
  }

  formatPrice(price: number): string {
    if (price < 0.01) {
      return price.toFixed(6);
    } else if (price < 1) {
      return price.toFixed(4);
    } else if (price < 100) {
      return price.toFixed(2);
    } else {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  }

  formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(2)}K`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
  }

  formatVolume(volume: number): string {
    return this.formatMarketCap(volume);
  }

  formatPercentageChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }
}

export const coinGeckoService = CoinGeckoService.getInstance();
