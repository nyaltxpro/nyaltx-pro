/**
 * CoinGecko API functions for fetching trading pairs data
 */

import { fetchCoinGeckoAPI } from './client';

export interface TradingPair {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
}

/**
 * Get trading pairs with market data
 * @param vsCurrency Base currency (e.g., 'usd', 'btc', 'eth')
 * @param page Page number for pagination
 * @param perPage Number of results per page
 * @param sparkline Include sparkline 7-day data
 * @param order Order results by specified field
 * @param priceChangePercentage Include price change percentage for specified time periods
 * @returns Array of trading pairs with market data
 */
export const getTradingPairs = async (
  vsCurrency: string = 'usd',
  page: number = 1,
  perPage: number = 100,
  sparkline: boolean = false,
  order: string = 'market_cap_desc',
  priceChangePercentage: string = '1h,24h,7d'
): Promise<TradingPair[]> => {
  try {
    const params: Record<string, string> = {
      vs_currency: vsCurrency,
      page: page.toString(),
      per_page: perPage.toString(),
      sparkline: sparkline.toString(),
      order,
      price_change_percentage: priceChangePercentage,
    };

    const data = await fetchCoinGeckoAPI('/coins/markets', params);
    return data;
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    throw error;
  }
};

/**
 * Get trading pairs for specific tokens
 * @param vsCurrency Base currency (e.g., 'usd', 'btc', 'eth')
 * @param ids Array of coin IDs to include
 * @returns Array of trading pairs with market data
 */
export const getSpecificTradingPairs = async (
  vsCurrency: string = 'usd',
  ids: string[]
): Promise<TradingPair[]> => {
  if (!ids.length) return [];
  
  try {
    const params: Record<string, string> = {
      vs_currency: vsCurrency,
      ids: ids.join(','),
      order: 'market_cap_desc',
      per_page: '250',
      page: '1',
      sparkline: 'false',
      price_change_percentage: '1h,24h,7d'
    };

    const data = await fetchCoinGeckoAPI('/coins/markets', params);
    return data;
  } catch (error) {
    console.error('Error fetching specific trading pairs:', error);
    throw error;
  }
};

/**
 * Get trading volume data for pairs
 * @param id Coin ID
 * @param days Number of days of data to retrieve
 * @returns Market chart data including volumes
 */
export const getTradingVolumeData = async (
  id: string,
  days: number = 7
): Promise<any> => {
  try {
    const params: Record<string, string> = {
      vs_currency: 'usd',
      days: days.toString(),
    };

    const data = await fetchCoinGeckoAPI(`/coins/${id}/market_chart`, params);
    return data;
  } catch (error) {
    console.error(`Error fetching volume data for ${id}:`, error);
    throw error;
  }
};
