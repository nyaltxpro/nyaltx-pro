'use client';

import { useState, useEffect, useMemo } from 'react';

export interface LocalCoin {
  index: number;
  id: string;
  symbol: string;
  name: string;
  web_slug: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  asset_platform_id: string | null;
  platforms: { [key: string]: string };
  detail_platforms: { [key: string]: any };
  is_native_token?: boolean;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  total_volume: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  description: string;
  categories: string[];
  links: {
    homepage: string[];
    whitepaper: string;
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
    repos_url: {
      github: string[];
      bitbucket: string[];
    };
  };
  block_time_in_minutes: number | null;
  hashing_algorithm: string | null;
  country_origin: string;
  genesis_date: string | null;
  last_updated: string;
}

export interface LocalSearchResult {
  coin: LocalCoin;
  relevanceScore: number;
  matchType: 'exact_symbol' | 'exact_name' | 'symbol_contains' | 'name_contains' | 'description_contains';
}

// Platform mapping for consistent chain names
const PLATFORM_MAPPING: { [key: string]: string } = {
  'ethereum': 'ethereum',
  'binance-smart-chain': 'binance',
  'polygon-pos': 'polygon',
  'arbitrum-one': 'arbitrum',
  'optimistic-ethereum': 'optimism',
  'base': 'base',
  'fantom': 'fantom',
  'avalanche': 'avalanche',
  'solana': 'solana',
  'xdai': 'gnosis',
  'harmony-shard-0': 'harmony',
  'moonbeam': 'moonbeam',
  'cronos': 'cronos'
};

const CHAIN_PRIORITY = ['ethereum', 'binance', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche', 'fantom', 'solana'];

export const useLocalCoinsSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [coins, setCoins] = useState<LocalCoin[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Get primary chain from platforms
  const getPrimaryChain = (platforms: { [key: string]: string }): string | null => {
    const mappedPlatforms: { [key: string]: string } = {};
    
    Object.entries(platforms).forEach(([platform, address]) => {
      const chainName = PLATFORM_MAPPING[platform];
      if (chainName && address && address !== '' && address !== '0x0000000000000000000000000000000000000000') {
        mappedPlatforms[chainName] = address;
      }
    });

    return CHAIN_PRIORITY.find(chain => mappedPlatforms[chain]) || 
           Object.keys(mappedPlatforms)[0] || null;
  };

  // Get primary address from platforms
  const getPrimaryAddress = (platforms: { [key: string]: string }): string | null => {
    const primaryChain = getPrimaryChain(platforms);
    if (!primaryChain) return null;

    // Find the original platform key that maps to our primary chain
    const originalPlatform = Object.keys(PLATFORM_MAPPING).find(
      key => PLATFORM_MAPPING[key] === primaryChain
    );

    return originalPlatform ? platforms[originalPlatform] : null;
  };

  // Load coins data dynamically
  useEffect(() => {
    const loadCoinsData = async () => {
      try {
        const response = await fetch('/api/coins/local-data');
        if (response.ok) {
          const data = await response.json();
          setCoins(data.coins || []);
        } else {
          console.error('Failed to fetch local coins data');
        }
      } catch (err) {
        console.error('Failed to load local coins data:', err);
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadCoinsData();
  }, []);

  // Get trending coins (top 10 by market cap) - excluding XRP, Dogecoin, and TRX
  const getTrendingCoins = useMemo(() => {
    const excludedCoins = ['ripple', 'dogecoin', 'tron']; // XRP, DOGE, TRX
    
    return coins
      .filter(coin => 
        coin.market_cap_rank && 
        coin.market_cap_rank <= 50 && 
        !excludedCoins.includes(coin.id.toLowerCase())
      )
      .sort((a, b) => (a.market_cap_rank || 999) - (b.market_cap_rank || 999))
      .slice(0, 10)
      .map(coin => ({
        ...coin,
        // Convert to format expected by existing components
        thumb: coin.image?.thumb || coin.image?.small || '',
        large: coin.image?.large || coin.image?.thumb || '',
        score: 100 - (coin.market_cap_rank || 100),
        price_btc: coin.current_price ? coin.current_price / 100000 : 0, // Rough BTC price estimate
        contractAddresses: coin.platforms || {},
        primaryChain: getPrimaryChain(coin.platforms || {}),
        primaryAddress: getPrimaryAddress(coin.platforms || {})
      }));
  }, [coins, getPrimaryChain, getPrimaryAddress]);

  // Search function
  const searchCoins = async (query: string, limit: number = 10): Promise<LocalSearchResult[]> => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchTerm = query.toLowerCase().trim();
      const results: LocalSearchResult[] = [];

      for (const coin of coins) {
        let relevanceScore = 0;
        let matchType: LocalSearchResult['matchType'] = 'description_contains';

        // Exact symbol match (highest priority)
        if (coin.symbol.toLowerCase() === searchTerm) {
          relevanceScore = 100;
          matchType = 'exact_symbol';
        }
        // Exact name match
        else if (coin.name.toLowerCase() === searchTerm) {
          relevanceScore = 90;
          matchType = 'exact_name';
        }
        // Symbol contains search term
        else if (coin.symbol.toLowerCase().includes(searchTerm)) {
          relevanceScore = 80;
          matchType = 'symbol_contains';
        }
        // Name contains search term
        else if (coin.name.toLowerCase().includes(searchTerm)) {
          relevanceScore = 70;
          matchType = 'name_contains';
        }
        // Description contains search term
        else if (coin.description && coin.description.toLowerCase().includes(searchTerm)) {
          relevanceScore = 30;
          matchType = 'description_contains';
        }
        // Contract address match
        else if (Object.values(coin.platforms || {}).some(address => 
          address && address.toLowerCase().includes(searchTerm)
        )) {
          relevanceScore = 85;
          matchType = 'symbol_contains'; // Treat as high priority
        }

        // Boost score based on market cap rank (higher rank = lower number = higher boost)
        if (relevanceScore > 0) {
          const rankBoost = coin.market_cap_rank ? Math.max(0, 100 - coin.market_cap_rank) / 10 : 0;
          relevanceScore += rankBoost;

          results.push({
            coin: {
              ...coin,
              // Add computed fields for compatibility
              contractAddresses: coin.platforms || {},
              primaryChain: getPrimaryChain(coin.platforms || {}),
              primaryAddress: getPrimaryAddress(coin.platforms || {}),
              // Convert image format
              thumb: coin.image?.thumb || coin.image?.small || '',
              large: coin.image?.large || coin.image?.thumb || ''
            } as any,
            relevanceScore,
            matchType
          });
        }
      }

      // Sort by relevance score (descending) and limit results
      const sortedResults = results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      setIsLoading(false);
      return sortedResults;

    } catch (err) {
      console.error('Local search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setIsLoading(false);
      return [];
    }
  };

  // Get coin by ID
  const getCoinById = (id: string): LocalCoin | null => {
    return coins.find(coin => coin.id === id) || null;
  };

  // Get coins by category
  const getCoinsByCategory = (category: string, limit: number = 10): LocalCoin[] => {
    return coins
      .filter(coin => coin.categories && coin.categories.some(cat => 
        cat.toLowerCase().includes(category.toLowerCase())
      ))
      .slice(0, limit);
  };

  // Get market movers (gainers/losers)
  const getMarketMovers = (type: 'gainers' | 'losers', limit: number = 10): LocalCoin[] => {
    return coins
      .filter(coin => coin.price_change_percentage_24h !== null)
      .sort((a, b) => {
        const aChange = a.price_change_percentage_24h || 0;
        const bChange = b.price_change_percentage_24h || 0;
        return type === 'gainers' ? bChange - aChange : aChange - bChange;
      })
      .slice(0, limit);
  };

  return {
    coins,
    searchCoins,
    getCoinById,
    getCoinsByCategory,
    getMarketMovers,
    getTrendingCoins,
    isLoading: isLoading || !isDataLoaded,
    error,
    totalCoins: coins.length,
    isDataLoaded
  };
};
