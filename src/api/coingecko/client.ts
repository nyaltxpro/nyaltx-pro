/**
 * CoinGecko API client with rate limiting
 */

// Rate limit configuration
const RATE_LIMIT = {
  maxRequests: 10, // Maximum requests per minute (CoinGecko free tier limit)
  timeWindow: 60 * 1000, // Time window in milliseconds (1 minute)
};

// Queue for tracking API requests
let requestQueue: number[] = [];

/**
 * Ensures the API call respects rate limits
 */
const respectRateLimit = async (): Promise<void> => {
  const now = Date.now();
  
  // Remove timestamps older than the time window
  requestQueue = requestQueue.filter(timestamp => now - timestamp < RATE_LIMIT.timeWindow);
  
  // If we've reached the rate limit, wait until we can make another request
  if (requestQueue.length >= RATE_LIMIT.maxRequests) {
    const oldestRequest = requestQueue[0];
    const timeToWait = RATE_LIMIT.timeWindow - (now - oldestRequest);
    
    if (timeToWait > 0) {
      console.log(`Rate limit reached. Waiting ${timeToWait}ms before next request.`);
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
  }
  
  // Add current timestamp to the queue
  requestQueue.push(Date.now());
};

/**
 * Make a rate-limited API call to CoinGecko
 */
export const fetchCoinGeckoAPI = async (endpoint: string, params: Record<string, string> = {}): Promise<any> => {
  await respectRateLimit();
  
  const baseUrl = 'https://api.coingecko.com/api/v3';
  const url = new URL(`${baseUrl}${endpoint}`);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error);
    throw error;
  }
};

/**
 * Get trending coins from CoinGecko
 */
export const getTrendingCoins = async (): Promise<any> => {
  return fetchCoinGeckoAPI('/search/trending');
};

/**
 * Get market data for specific coins
 */
export const getCoinsMarkets = async (
  vsCurrency: string = 'usd',
  ids: string[] = [],
  category: string = '',
  order: string = 'market_cap_desc',
  perPage: number = 100,
  page: number = 1,
  sparkline: boolean = false,
  priceChangePercentage: string = '24h'
): Promise<any> => {
  const params: Record<string, string> = {
    vs_currency: vsCurrency,
    order,
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: sparkline.toString(),
    price_change_percentage: priceChangePercentage,
  };
  
  if (ids.length > 0) {
    params.ids = ids.join(',');
  }
  
  if (category) {
    params.category = category;
  }
  
  return fetchCoinGeckoAPI('/coins/markets', params);
};

/**
 * Get detailed data for a specific coin
 */
export const getCoinData = async (id: string): Promise<any> => {
  return fetchCoinGeckoAPI(`/coins/${id}`, {
    localization: 'false',
    tickers: 'false',
    market_data: 'true',
    community_data: 'false',
    developer_data: 'false',
  });
};

/**
 * Get recently added coins from CoinGecko
 * 
 * This function uses a better approach to get truly new coins by:
 * 1. Getting the list of new coins from the /coins/list endpoint with include_platform=false
 * 2. Then fetching market data for those new coins
 */
export const getRecentlyAddedCoins = async (
  vsCurrency: string = 'usd',
  limit: number = 10
): Promise<any> => {
  try {
    // First get the complete list of coins
    const allCoins = await fetchCoinGeckoAPI('/coins/list', {
      include_platform: 'false'
    });
    
    // Sort by when they were added to CoinGecko (newest first)
    // We can use the coin ID as a rough proxy for recency
    // Higher IDs are generally newer additions
    const sortedCoins = [...allCoins].sort((a, b) => {
      // Try to extract numeric part if ID contains numbers
      const aNum = parseInt((a.id.match(/\d+/) || ['0'])[0]);
      const bNum = parseInt((b.id.match(/\d+/) || ['0'])[0]);
      
      if (aNum !== bNum) return bNum - aNum;
      
      // If numeric comparison doesn't work, use ID length as secondary sort
      // Newer coins often have longer, more specific IDs
      return b.id.length - a.id.length;
    });
    
    // Take the top N newest coins
    const newestCoins = sortedCoins.slice(0, limit * 3); // Get more than needed in case some don't have market data
    
    // Get market data for these coins
    const coinIds = newestCoins.map(coin => coin.id).join(',');
    const marketData = await fetchCoinGeckoAPI('/coins/markets', {
      vs_currency: vsCurrency,
      ids: coinIds,
      per_page: (limit * 3).toString(),
      page: '1',
      sparkline: 'false',
    });
    
    // Filter out any coins that don't have proper market data
    const validCoins = marketData.filter((coin: any) => 
      coin.current_price && 
      coin.market_cap && 
      coin.total_volume
    );
    
    // Return only the requested number of coins
    return validCoins.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recently added coins:', error);
    throw error;
  }
};
