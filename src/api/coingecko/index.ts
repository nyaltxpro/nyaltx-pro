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
    const response = await axios.get(`${BASE_URL}/exchanges/binance`);
    const data = response.data as ExchangeData;
    
    // Sort by volume and get the top tickers
    const sortedTickers = data.tickers
      .sort((a, b) => b.converted_volume.usd - a.converted_volume.usd)
      .slice(0, limit);
    
    return sortedTickers;
  } catch (error) {
    console.error('Error fetching top tickers:', error);
    return [];
  }
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

export default {
  getTopTickers,
  getCoinData,
  getCoinIcon
};
