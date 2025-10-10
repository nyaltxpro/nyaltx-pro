// CoinGecko API service
import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Rate limit handling
const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests to avoid rate limiting

// Types
export interface CoinTicker {
  base: string;
  target: string;
  last: number;
  volume: number;
  coin_id: string;
  target_coin_id: string;
  is_anomaly: boolean;
  is_stale: boolean;
  trade_url: string;
  token_info_url: string | null;
  market: {
    name: string;
    identifier: string;
  };
  converted_last: {
    btc: number;
    eth: number;
    usd: number;
  };
  converted_volume: {
    btc: number;
    eth: number;
    usd: number;
  };
  trust_score: string;
  bid_ask_spread_percentage: number;
  timestamp: string;
  last_traded_at: string;
  last_fetch_at: string;
}

export interface ExchangeData {
  name: string;
  year_established: number;
  country: string;
  description: string;
  url: string;
  image: string;
  tickers: CoinTicker[];
}

// Get top tickers from Binance exchange
export const getTopTickers = async (limit = 10): Promise<CoinTicker[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/exchanges/binance`, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NYALTX-App/1.0'
      }
    });
    const data = response.data as ExchangeData;

    // Sort by volume and get the top tickers
    const sortedTickers = data.tickers
      .filter(ticker => ticker && ticker.converted_volume && ticker.converted_volume.usd > 0)
      .sort((a, b) => b.converted_volume.usd - a.converted_volume.usd)
      .slice(0, limit);

    return sortedTickers;
  } catch (error) {
    console.error('Error fetching top tickers:', error);
    
    // Return mock data as fallback to prevent app crashes
    return getMockTickers(limit);
  }
};

// Mock data fallback for when API is unavailable
const getMockTickers = (limit: number): CoinTicker[] => {
  const mockTickers: CoinTicker[] = [
    {
      base: 'BTC',
      target: 'USDT',
      last: 43250.50,
      volume: 1234567.89,
      coin_id: 'bitcoin',
      target_coin_id: 'tether',
      is_anomaly: false,
      is_stale: false,
      trade_url: 'https://www.binance.com/en/trade/BTC_USDT',
      token_info_url: null,
      market: { name: 'Binance', identifier: 'binance' },
      converted_last: { btc: 1, eth: 16.5, usd: 43250.50 },
      converted_volume: { btc: 28.5, eth: 470.25, usd: 1234567.89 },
      trust_score: 'green',
      bid_ask_spread_percentage: 0.01,
      timestamp: new Date().toISOString(),
      last_traded_at: new Date().toISOString(),
      last_fetch_at: new Date().toISOString()
    },
    {
      base: 'ETH',
      target: 'USDT',
      last: 2620.75,
      volume: 987654.32,
      coin_id: 'ethereum',
      target_coin_id: 'tether',
      is_anomaly: false,
      is_stale: false,
      trade_url: 'https://www.binance.com/en/trade/ETH_USDT',
      token_info_url: null,
      market: { name: 'Binance', identifier: 'binance' },
      converted_last: { btc: 0.0606, eth: 1, usd: 2620.75 },
      converted_volume: { btc: 22.8, eth: 376.9, usd: 987654.32 },
      trust_score: 'green',
      bid_ask_spread_percentage: 0.02,
      timestamp: new Date().toISOString(),
      last_traded_at: new Date().toISOString(),
      last_fetch_at: new Date().toISOString()
    }
  ];
  
  return mockTickers.slice(0, limit);
};

// Get coin data by ID
export const getCoinData = async (coinId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/${coinId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching coin data for ${coinId}:`, error);
    return null;
  }
};

// Get coin icon by ID
export const getCoinIcon = (coinId: string): string => {
  return `https://assets.coingecko.com/coins/images/1/small/${coinId}.png`;
};

// Export pairs functions
export * from './pairs';

export default {
  getTopTickers,
  getCoinData,
  getCoinIcon,
};
