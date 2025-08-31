/**
 * CoinGecko NFT API client
 */

import { fetchCoinGeckoAPI } from './client';

/**
 * Get trending NFT collections
 */
export const getTrendingNFTs = async (limit: number = 10): Promise<any> => {
  try {
    const data = await fetchCoinGeckoAPI('/nfts/list', {
      order: 'h24_volume_native_desc',
      per_page: limit.toString(),
      page: '1'
    });
    return data;
  } catch (error) {
    console.error('Error fetching trending NFTs:', error);
    throw error;
  }
};

/**
 * Get NFT collection details by id
 */
export const getNFTCollectionById = async (id: string): Promise<any> => {
  try {
    return await fetchCoinGeckoAPI(`/nfts/${id}`);
  } catch (error) {
    console.error(`Error fetching NFT collection ${id}:`, error);
    throw error;
  }
};

/**
 * Get NFT collections by platform (ethereum, solana, etc.)
 */
export const getNFTsByPlatform = async (
  assetPlatformId: string,
  limit: number = 10
): Promise<any> => {
  try {
    const data = await fetchCoinGeckoAPI('/nfts', {
      asset_platform_id: assetPlatformId,
      order: 'h24_volume_native_desc',
      per_page: limit.toString(),
      page: '1'
    });
    return data;
  } catch (error) {
    console.error(`Error fetching NFTs for platform ${assetPlatformId}:`, error);
    throw error;
  }
};

// Local storage key for caching
const NFT_STORAGE_KEY = 'nft_collections';
const NFT_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Load NFT data from cache
 */
export const loadNFTsFromCache = () => {
  try {
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem(NFT_STORAGE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        
        // Check if cache is still valid (not expired)
        if (now - timestamp < NFT_CACHE_EXPIRY) {
          console.log('Loading NFT collections from cache');
          return data;
        }
      }
    }
    return null;
  } catch (e) {
    console.error('Error loading NFTs from cache:', e);
    return null;
  }
};

/**
 * Save NFT data to cache
 */
export const saveNFTsToCache = (data: any) => {
  try {
    if (typeof window !== 'undefined') {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(NFT_STORAGE_KEY, JSON.stringify(cacheData));
    }
  } catch (e) {
    console.error('Error saving NFTs to cache:', e);
  }
};
