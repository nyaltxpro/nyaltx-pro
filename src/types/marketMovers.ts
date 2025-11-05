export interface StoredMarketMoverCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  fully_diluted_valuation?: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  market_cap_change_24h?: number | null;
  market_cap_change_percentage_24h?: number | null;
  circulating_supply?: number | null;
  total_supply?: number | null;
  max_supply?: number | null;
  ath?: number | null;
  ath_change_percentage?: number | null;
  ath_date?: string | null;
  atl?: number | null;
  atl_change_percentage?: number | null;
  atl_date?: string | null;
  roi?: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string | null;
  price_change_percentage_24h_in_currency?: number | null;
  contractAddresses?: Record<string, string>;
  primaryChain?: string | null;
  primaryAddress?: string | null;
}

import { ObjectId } from 'mongodb';

export interface MarketMoversSnapshot {
  _id?: ObjectId;
  createdAt: Date;
  source: 'coingecko';
  coinsFetched: number;
  topGainers: StoredMarketMoverCoin[];
  topLosers: StoredMarketMoverCoin[];
  topVolume: StoredMarketMoverCoin[];
  rawCoins?: StoredMarketMoverCoin[];
}
