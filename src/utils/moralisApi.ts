/**
 * Moralis API utility for token price data with Solana support
 * Provides fallback pricing for tokens when other APIs fail
 */

interface MoralisTokenPrice {
  tokenAddress: string;
  pairAddress?: string;
  exchangeName?: string;
  exchangeAddress?: string;
  nativePrice?: {
    value: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  usdPrice: number;
  usdPrice24h?: number | null;
  usdPrice24hrUsdChange?: number | null;
  usdPrice24hrPercentChange?: number | null;
  logo?: string;
  name?: string;
  symbol?: string;
  isVerifiedContract?: boolean;
}

interface MoralisTokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  thumbnail?: string;
  possible_spam: boolean;
  verified_contract: boolean;
  total_supply?: string;
  total_supply_formatted?: string;
  percentage_relative_to_total_supply?: number;
}

interface MoralisTokenData {
  price?: MoralisTokenPrice;
  metadata?: MoralisTokenMetadata;
}

interface MoralisApiResponse {
  success: boolean;
  data?: MoralisTokenPrice;
  error?: string;
}

interface MoralisTokenResponse {
  success: boolean;
  data?: MoralisTokenData;
  error?: string;
}

// Moralis API configuration
const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjZkMmQyYjYyLTQ5YzctNGZlOS1hYTA0LTRmMGRmZDE3OTQ2MiIsIm9yZ0lkIjoiMzAyMjA1IiwidXNlcklkIjoiMzEwMDE1IiwidHlwZUlkIjoiM2IxZTI1MGYtNDQ0Yi00NzI3LTkwMGMtYTIxNjg1MzYwNjllIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTc4NTQzNzEsImV4cCI6NDkxMzYxNDM3MX0.dibqG2ww1F8eMjP8OZkCY9pVrOeIHPZ0iuBultjNGWA';

// Chain mapping for Moralis API
const CHAIN_MAPPING: Record<string, string> = {
  ethereum: 'mainnet',
  polygon: 'polygon',
  bsc: 'bsc',
  avalanche: 'avalanche',
  fantom: 'fantom',
  cronos: 'cronos',
  solana: 'mainnet', // Solana mainnet
  arbitrum: 'arbitrum',
  optimism: 'optimism',
  base: 'base',
};

// Get Moralis chain identifier
const getMoralisChain = (chain: string): string | null => {
  const normalizedChain = chain.toLowerCase();
  return CHAIN_MAPPING[normalizedChain] || null;
};

// Determine if chain is Solana
const isSolanaChain = (chain: string): boolean => {
  return chain.toLowerCase() === 'solana';
};

/**
 * Fetch token price from Moralis API
 * Supports both EVM chains and Solana
 */
export const fetchMoralisTokenPrice = async (
  chain: string,
  tokenAddress: string,
  retries = 2
): Promise<MoralisApiResponse> => {
  const moralisChain = getMoralisChain(chain);
  
  if (!moralisChain) {
    return {
      success: false,
      error: `Unsupported chain: ${chain}`,
    };
  }

  if (!tokenAddress) {
    return {
      success: false,
      error: 'Token address is required',
    };
  }

  // Build API URL based on chain type
  let apiUrl: string;
  if (isSolanaChain(chain)) {
    // Solana endpoint
    apiUrl = `https://solana-gateway.moralis.io/token/${moralisChain}/${tokenAddress}/price`;
  } else {
    // EVM chains endpoint
    apiUrl = `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/price?chain=${moralisChain}`;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🟣 Moralis API attempt ${attempt + 1}/${retries + 1} for ${chain}:${tokenAddress}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': MORALIS_API_KEY,
          'User-Agent': 'NYALTX-Trade/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        // Rate limit - wait and retry
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`⏳ Moralis rate limit, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats for Solana vs EVM
      let normalizedData: MoralisTokenPrice;
      
      if (isSolanaChain(chain)) {
        // Solana response format
        normalizedData = {
          tokenAddress: data.tokenAddress || tokenAddress,
          pairAddress: data.pairAddress,
          exchangeName: data.exchangeName,
          exchangeAddress: data.exchangeAddress,
          nativePrice: data.nativePrice,
          usdPrice: data.usdPrice || 0,
          usdPrice24h: data.usdPrice24h,
          usdPrice24hrUsdChange: data.usdPrice24hrUsdChange,
          usdPrice24hrPercentChange: data.usdPrice24hrPercentChange,
          logo: data.logo,
          name: data.name,
          symbol: data.symbol,
          isVerifiedContract: data.isVerifiedContract,
        };
      } else {
        // EVM response format
        normalizedData = {
          tokenAddress: tokenAddress,
          usdPrice: parseFloat(data.usdPrice || '0'),
          usdPrice24hrPercentChange: data.usdPrice24hrPercentChange,
          name: data.tokenName,
          symbol: data.tokenSymbol,
          logo: data.tokenLogo,
        };
      }

      if (normalizedData.usdPrice && normalizedData.usdPrice > 0) {
        console.log(`✅ Moralis API success: $${normalizedData.usdPrice} for ${chain}:${tokenAddress}`);
        return {
          success: true,
          data: normalizedData,
        };
      } else {
        throw new Error('No valid price data in response');
      }

    } catch (error: any) {
      console.log(`❌ Moralis API attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < retries) {
        const waitTime = 500 * (attempt + 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return {
        success: false,
        error: error.message || 'Failed to fetch price from Moralis',
      };
    }
  }

  return {
    success: false,
    error: 'All retry attempts failed',
  };
};

/**
 * Check if Moralis supports the given chain
 */
export const isMoralisSupportedChain = (chain: string): boolean => {
  return getMoralisChain(chain) !== null;
};

/**
 * Fetch token metadata from Moralis API
 * Supports both EVM chains and Solana
 */
export const fetchMoralisTokenMetadata = async (
  chain: string,
  tokenAddress: string,
  retries = 2
): Promise<MoralisTokenResponse> => {
  const moralisChain = getMoralisChain(chain);
  
  if (!moralisChain) {
    return {
      success: false,
      error: `Unsupported chain: ${chain}`,
    };
  }

  if (!tokenAddress) {
    return {
      success: false,
      error: 'Token address is required',
    };
  }

  // Build API URL based on chain type
  let metadataUrl: string;
  if (isSolanaChain(chain)) {
    // Solana token metadata endpoint
    metadataUrl = `https://solana-gateway.moralis.io/token/${moralisChain}/${tokenAddress}/metadata`;
  } else {
    // EVM chains metadata endpoint
    metadataUrl = `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/metadata?chain=${moralisChain}`;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🟣 Moralis Metadata API attempt ${attempt + 1}/${retries + 1} for ${chain}:${tokenAddress}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(metadataUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': MORALIS_API_KEY,
          'User-Agent': 'NYALTX-Trade/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`⏳ Moralis metadata rate limit, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats for Solana vs EVM
      let normalizedMetadata: MoralisTokenMetadata;
      
      if (isSolanaChain(chain)) {
        // Solana response format
        normalizedMetadata = {
          address: tokenAddress,
          name: data.name || '',
          symbol: data.symbol || '',
          decimals: data.decimals || 9,
          logo: data.logo,
          thumbnail: data.thumbnail,
          possible_spam: data.possible_spam || false,
          verified_contract: data.verified_contract || false,
          total_supply: data.total_supply,
          total_supply_formatted: data.total_supply_formatted,
        };
      } else {
        // EVM response format
        normalizedMetadata = {
          address: tokenAddress,
          name: data.name || '',
          symbol: data.symbol || '',
          decimals: parseInt(data.decimals) || 18,
          logo: data.logo,
          thumbnail: data.thumbnail,
          possible_spam: data.possible_spam || false,
          verified_contract: data.verified_contract || false,
          total_supply: data.total_supply,
          total_supply_formatted: data.total_supply_formatted,
        };
      }

      console.log(`✅ Moralis Metadata API success: ${normalizedMetadata.name} (${normalizedMetadata.symbol}) for ${chain}:${tokenAddress}`);
      return {
        success: true,
        data: {
          metadata: normalizedMetadata,
        },
      };

    } catch (error: any) {
      console.log(`❌ Moralis Metadata API attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < retries) {
        const waitTime = 500 * (attempt + 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return {
        success: false,
        error: error.message || 'Failed to fetch metadata from Moralis',
      };
    }
  }

  return {
    success: false,
    error: 'All retry attempts failed',
  };
};

/**
 * Fetch both price and metadata for a token from Moralis API
 */
export const fetchMoralisTokenData = async (
  chain: string,
  tokenAddress: string,
  retries = 2
): Promise<MoralisTokenResponse> => {
  try {
    console.log(`🟣 Fetching complete token data from Moralis for ${chain}:${tokenAddress}`);
    
    // Fetch both price and metadata in parallel
    const [priceResponse, metadataResponse] = await Promise.allSettled([
      fetchMoralisTokenPrice(chain, tokenAddress, retries),
      fetchMoralisTokenMetadata(chain, tokenAddress, retries)
    ]);

    const tokenData: MoralisTokenData = {};

    // Handle price data
    if (priceResponse.status === 'fulfilled' && priceResponse.value.success) {
      tokenData.price = priceResponse.value.data;
    } else {
      console.log('⚠️ Price data not available from Moralis');
    }

    // Handle metadata
    if (metadataResponse.status === 'fulfilled' && metadataResponse.value.success) {
      tokenData.metadata = metadataResponse.value.data?.metadata;
    } else {
      console.log('⚠️ Metadata not available from Moralis');
    }

    // Return success if we got at least one type of data
    if (tokenData.price || tokenData.metadata) {
      return {
        success: true,
        data: tokenData,
      };
    }

    return {
      success: false,
      error: 'No data available from Moralis API',
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch token data from Moralis',
    };
  }
};

/**
 * Get supported chains list
 */
export const getMoralisSupportedChains = (): string[] => {
  return Object.keys(CHAIN_MAPPING);
};

export default {
  fetchMoralisTokenPrice,
  fetchMoralisTokenMetadata,
  fetchMoralisTokenData,
  isMoralisSupportedChain,
  getMoralisSupportedChains,
};
