/**
 * CoinGecko API service for fetching cryptocurrency data
 */

// Base URL for CoinGecko API
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Map of common token symbols to their CoinGecko IDs
export const tokenIdMap: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'USDC': 'usd-coin',
  'ADA': 'cardano',
  'AVAX': 'avalanche-2',
  'DOGE': 'dogecoin',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'SHIB': 'shiba-inu',
  'DAI': 'dai',
  'TRX': 'tron',
  'LINK': 'chainlink',
  'TON': 'the-open-network',
  'UNI': 'uniswap',
  'WBTC': 'wrapped-bitcoin',
  'LEO': 'leo-token',
  'ATOM': 'cosmos',
  'ETC': 'ethereum-classic',
  'OKB': 'okb',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'XLM': 'stellar',
  'XMR': 'monero',
  'FIL': 'filecoin',
  'NEAR': 'near',
  'CRO': 'crypto-com-chain',
  'INJ': 'injective-protocol',
  'VET': 'vechain',
  'ARB': 'arbitrum',
  'FTM': 'fantom',
  'OP': 'optimism',
  'SEI': 'sei-network',
  'SUI': 'sui',
  // Note: NYAX may not be available on CoinGecko, will be handled by fallback logic
};

// Interface for token price data
export interface TokenPriceData {
  price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}

// Interface for token pair data
export interface TokenPairData {
  baseToken: string;
  quoteToken: string;
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
}

/**
 * Get the CoinGecko ID for a token symbol
 * @param symbol Token symbol (e.g., 'BTC', 'ETH')
 * @returns CoinGecko ID or null if not found
 */
export function getTokenId(symbol: string): string | null {
  const upperSymbol = symbol.toUpperCase();
  return tokenIdMap[upperSymbol] || null;
}

/**
 * Fetch token price data from CoinGecko
 * @param tokenId CoinGecko token ID
 * @param vsCurrency Currency to get price in (default: 'usd')
 * @returns Promise with token price data
 */
export async function fetchTokenPrice(
  tokenId: string,
  vsCurrency: string = 'usd'
): Promise<TokenPriceData | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch token price: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      price: data.market_data.current_price[vsCurrency] || 0,
      price_change_24h: data.market_data.price_change_24h || 0,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h || 0,
      market_cap: data.market_data.market_cap[vsCurrency] || 0,
      total_volume: data.market_data.total_volume[vsCurrency] || 0,
      high_24h: data.market_data.high_24h[vsCurrency] || 0,
      low_24h: data.market_data.low_24h[vsCurrency] || 0,
      last_updated: data.market_data.last_updated || '',
    };
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
}

/**
 * Fetch token pair data from CoinGecko
 * @param baseToken Base token symbol (e.g., 'BTC')
 * @param quoteToken Quote token symbol (e.g., 'USDT')
 * @returns Promise with token pair data
 */
export async function fetchTokenPairData(
  baseToken: string,
  quoteToken: string
): Promise<TokenPairData | null> {
  try {
    const baseTokenId = getTokenId(baseToken);
    const quoteTokenId = getTokenId(quoteToken);
    
    if (!baseTokenId || !quoteTokenId) {
      console.warn(`Token mapping not found for: ${baseToken}/${quoteToken}. Available tokens:`, Object.keys(tokenIdMap));
      return null; // Return null instead of throwing error
    }
    
    // For most pairs, we'll use USD as the reference and calculate the pair price
    const baseData = await fetchTokenPrice(baseTokenId);
    
    if (!baseData) {
      throw new Error(`Failed to fetch data for ${baseToken}`);
    }
    
    // If quote token is a stablecoin (USDT, USDC, DAI), we can use the USD price directly
    if (['USDT', 'USDC', 'DAI'].includes(quoteToken.toUpperCase())) {
      return {
        baseToken,
        quoteToken,
        price: baseData.price,
        priceChange24h: baseData.price_change_24h,
        priceChangePercentage24h: baseData.price_change_percentage_24h,
        volume24h: baseData.total_volume,
        marketCap: baseData.market_cap,
        high24h: baseData.high_24h,
        low24h: baseData.low_24h,
        lastUpdated: baseData.last_updated,
      };
    }
    
    // For non-stablecoin quote tokens, fetch the quote token data and calculate the ratio
    const quoteData = await fetchTokenPrice(quoteTokenId);
    
    if (!quoteData || quoteData.price === 0) {
      throw new Error(`Failed to fetch data for ${quoteToken} or price is zero`);
    }
    
    // Calculate the price in terms of the quote token
    const pairPrice = baseData.price / quoteData.price;
    
    // Calculate the 24h change percentage for the pair
    // This is an approximation and doesn't account for the changing ratio over time
    const priceChangePercentage = 
      baseData.price_change_percentage_24h - quoteData.price_change_percentage_24h;
    
    return {
      baseToken,
      quoteToken,
      price: pairPrice,
      priceChange24h: 0, // We don't have exact price change for the pair
      priceChangePercentage24h: priceChangePercentage,
      volume24h: baseData.total_volume, // This is in USD, not in quote token
      marketCap: baseData.market_cap,
      high24h: baseData.high_24h / quoteData.price,
      low24h: baseData.low_24h / quoteData.price,
      lastUpdated: baseData.last_updated,
    };
  } catch (error) {
    console.error('Error fetching token pair data:', error);
    return null;
  }
}

/**
 * Format a number as a currency string
 * @param value Number to format
 * @param currency Currency code (default: 'USD')
 * @param maximumFractionDigits Maximum fraction digits (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  maximumFractionDigits: number = 2
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(value);
}

/**
 * Format a number as a percentage string
 * @param value Number to format (e.g., 0.05 for 5%)
 * @param maximumFractionDigits Maximum fraction digits (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  maximumFractionDigits: number = 2
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits,
  }).format(value / 100);
}

/**
 * Fetch a coin's platform contract addresses map from CoinGecko
 * Example response structure: { ethereum: "0x...", solana: "...", 'binance-smart-chain': "0x...", ... }
 */
export async function fetchCoinPlatforms(
  coinId: string
): Promise<Record<string, string> | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch coin platforms: ${response.statusText}`);
    }
    const data = await response.json();
    // Prefer detail_platforms if available, else fallback to platforms
    if (data?.detail_platforms && typeof data.detail_platforms === 'object') {
      const map: Record<string, string> = {};
      Object.entries<any>(data.detail_platforms).forEach(([platform, info]) => {
        if (info && typeof info === 'object' && info.contract_address !== undefined) {
          map[platform] = info.contract_address || '';
        }
      });
      return map;
    }
    return (data?.platforms as Record<string, string>) || {};
  } catch (err) {
    console.error('Error fetching coin platforms:', err);
    return null;
  }
}
