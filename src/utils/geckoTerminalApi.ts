interface GeckoTerminalTokenData {
  id: string;
  type: string;
  attributes: {
    address: string;
    name: string;
    symbol: string;
    image_url: string | null;
    coingecko_coin_id: string | null;
    decimals: number;
    total_supply: string;
    normalized_total_supply: string;
    price_usd: string;
    fdv_usd: string;
    market_cap_usd: string | null;
    total_reserve_in_usd: string;
    volume_usd: {
      h24: string;
    };
    price_change_percentage?: {
      h24?: string;
      h6?: string;
      h1?: string;
      m5?: string;
    };
  };
}

interface GeckoTerminalResponse {
  data: GeckoTerminalTokenData;
}

interface CachedTokenData {
  data: GeckoTerminalTokenData;
  timestamp: number;
  expiresAt: number;
}

interface RateLimitState {
  requests: number[];
  lastReset: number;
}

class GeckoTerminalAPI {
  private cache: Map<string, CachedTokenData> = new Map();
  private rateLimitState: RateLimitState = {
    requests: [],
    lastReset: Date.now()
  };
  
  // Rate limiting: 30 requests per minute
  private readonly MAX_REQUESTS_PER_MINUTE = 30;
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds cache
  private readonly BASE_URL = 'https://api.geckoterminal.com/api/v2';

  // Network mapping for GeckoTerminal
  private readonly NETWORK_MAPPING: { [key: string]: string } = {
    // Ethereum variants
    'ethereum': 'eth',
    'eth': 'eth',
    'mainnet': 'eth',
    '1': 'eth',
    
    // BSC variants
    'bsc': 'bsc',
    'binance': 'bsc',
    'binance smart chain': 'bsc',
    'bnb': 'bsc',
    '56': 'bsc',
    
    // Polygon variants
    'polygon': 'polygon_pos',
    'matic': 'polygon_pos',
    'polygon_pos': 'polygon_pos',
    '137': 'polygon_pos',
    
    // Arbitrum variants
    'arbitrum': 'arbitrum',
    'arbitrum one': 'arbitrum',
    'arb': 'arbitrum',
    '42161': 'arbitrum',
    
    // Optimism variants
    'optimism': 'optimism',
    'op': 'optimism',
    '10': 'optimism',
    
    // Base variants
    'base': 'base',
    '8453': 'base',
    
    // Avalanche variants
    'avalanche': 'avax',
    'avax': 'avax',
    'avalanche c-chain': 'avax',
    '43114': 'avax',
    
    // Fantom variants
    'fantom': 'fantom',
    'ftm': 'fantom',
    '250': 'fantom',
    
    // Solana variants
    'solana': 'solana',
    'sol': 'solana'
  };

  private isRateLimited(): boolean {
    const now = Date.now();
    
    // Reset rate limit window if needed
    if (now - this.rateLimitState.lastReset >= this.RATE_LIMIT_WINDOW) {
      this.rateLimitState.requests = [];
      this.rateLimitState.lastReset = now;
    }
    
    // Remove requests older than the window
    this.rateLimitState.requests = this.rateLimitState.requests.filter(
      timestamp => now - timestamp < this.RATE_LIMIT_WINDOW
    );
    
    return this.rateLimitState.requests.length >= this.MAX_REQUESTS_PER_MINUTE;
  }

  private recordRequest(): void {
    this.rateLimitState.requests.push(Date.now());
  }

  private getCacheKey(network: string, address: string): string {
    return `${network}:${address.toLowerCase()}`;
  }

  private getCachedData(cacheKey: string): GeckoTerminalTokenData | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }

  private setCachedData(cacheKey: string, data: GeckoTerminalTokenData): void {
    const now = Date.now();
    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    });
  }

  private mapNetworkName(network: string): string | null {
    const normalizedNetwork = network.toLowerCase().trim();
    return this.NETWORK_MAPPING[normalizedNetwork] || null;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getTokenPrice(network: string, address: string, retries = 3): Promise<{
    price_usd: string;
    price_change_24h: string;
    volume_24h: string;
    market_cap: string;
  } | null> {
    try {
      console.log(`🔍 GeckoTerminal: Input network="${network}", address="${address}"`);
      
      // Map network name
      const geckoNetwork = this.mapNetworkName(network);
      console.log(`🔍 GeckoTerminal: Mapped "${network}" -> "${geckoNetwork}"`);
      
      if (!geckoNetwork) {
        console.warn(`❌ Unsupported network for GeckoTerminal: ${network}`);
        console.log('📋 Supported networks:', Object.keys(this.NETWORK_MAPPING));
        return null;
      }

      const cacheKey = this.getCacheKey(geckoNetwork, address);
      
      // Check cache first
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`GeckoTerminal: Using cached data for ${geckoNetwork}:${address}`);
        return {
          price_usd: cachedData.attributes.price_usd || '0',
          price_change_24h: cachedData.attributes.price_change_percentage?.h24 || '0',
          volume_24h: cachedData.attributes.volume_usd.h24 || '0',
          market_cap: cachedData.attributes.market_cap_usd || '0'
        };
      }

      // Check rate limiting
      if (this.isRateLimited()) {
        console.warn('GeckoTerminal: Rate limited, skipping request');
        return null;
      }

      // Record the request
      this.recordRequest();

      const url = `${this.BASE_URL}/networks/${geckoNetwork}/tokens/${address.toLowerCase()}`;
      console.log(`GeckoTerminal: Fetching ${url}`);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NYALTX-Trading-Platform/1.0'
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('GeckoTerminal: Rate limited by server');
          if (retries > 0) {
            await this.delay(2000); // Wait 2 seconds before retry
            return this.getTokenPrice(network, address, retries - 1);
          }
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GeckoTerminalResponse = await response.json();
      console.log('🔍 GeckoTerminal API Response:', JSON.stringify(data, null, 2));
      
      if (!data.data || !data.data.attributes) {
        console.warn('GeckoTerminal: Invalid response format');
        return null;
      }

      // Cache the data
      this.setCachedData(cacheKey, data.data);

      const result = {
        price_usd: data.data.attributes.price_usd || '0',
        price_change_24h: data.data.attributes.price_change_percentage?.h24 || '0',
        volume_24h: data.data.attributes.volume_usd.h24 || '0',
        market_cap: data.data.attributes.market_cap_usd || '0'
      };

      console.log('✅ GeckoTerminal: Processed result:', result);
      return result;

    } catch (error) {
      console.error('GeckoTerminal API error:', error);
      
      // Retry logic for network errors
      if (retries > 0 && (error instanceof TypeError || (error instanceof Error && error.message.includes('fetch')))) {
        console.log(`GeckoTerminal: Retrying... (${retries} attempts left)`);
        await this.delay(1000);
        return this.getTokenPrice(network, address, retries - 1);
      }
      
      return null;
    }
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats for debugging
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  // Get rate limit stats for debugging
  getRateLimitStats(): { requestsInWindow: number; maxRequests: number; windowResetIn: number } {
    const now = Date.now();
    const windowResetIn = this.RATE_LIMIT_WINDOW - (now - this.rateLimitState.lastReset);
    
    return {
      requestsInWindow: this.rateLimitState.requests.length,
      maxRequests: this.MAX_REQUESTS_PER_MINUTE,
      windowResetIn: Math.max(0, windowResetIn)
    };
  }

  // Test network mapping - for debugging
  testNetworkMapping(network: string): string | null {
    const result = this.mapNetworkName(network);
    console.log(`🧪 Network mapping test: "${network}" -> "${result}"`);
    return result;
  }

  // Get all supported networks - for debugging
  getSupportedNetworks(): string[] {
    return Object.keys(this.NETWORK_MAPPING);
  }
}

// Export singleton instance
export const geckoTerminalAPI = new GeckoTerminalAPI();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).geckoTerminalAPI = geckoTerminalAPI;
  
  // Clean up expired cache entries every 5 minutes
  setInterval(() => {
    geckoTerminalAPI.clearExpiredCache();
  }, 5 * 60 * 1000);
}
