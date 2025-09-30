/**
 * Utility functions for handling contract addresses and chain mappings
 * Provides consistent contract address retrieval and fallback mechanisms
 */

export interface ContractAddressResult {
  contractAddresses: { [key: string]: string };
  primaryChain: string | null;
  primaryAddress: string | null;
}

/**
 * Platform mapping from CoinGecko platform names to our chain identifiers
 */
export const PLATFORM_MAPPING: { [key: string]: string } = {
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

/**
 * Chain priority order for selecting primary chain
 */
export const CHAIN_PRIORITY = [
  'ethereum', 
  'binance', 
  'polygon', 
  'arbitrum', 
  'optimism', 
  'base', 
  'avalanche', 
  'fantom', 
  'solana'
];

/**
 * Validates if a contract address is valid (not zero address)
 */
export const isValidContractAddress = (address: string | null | undefined): boolean => {
  if (!address || address === '' || address === '0x0000000000000000000000000000000000000000') {
    return false;
  }
  return true;
};

/**
 * Processes CoinGecko platforms data into contract addresses
 */
export const processContractAddresses = (platforms: any): ContractAddressResult => {
  const contractAddresses: { [key: string]: string } = {};
  
  if (!platforms) {
    return {
      contractAddresses: {},
      primaryChain: null,
      primaryAddress: null
    };
  }

  // Extract valid contract addresses
  Object.entries(platforms).forEach(([platform, address]) => {
    const chainName = PLATFORM_MAPPING[platform];
    if (chainName && isValidContractAddress(address as string)) {
      contractAddresses[chainName] = address as string;
    }
  });

  // Determine primary chain
  const primaryChain = CHAIN_PRIORITY.find(chain => contractAddresses[chain]) || 
                      Object.keys(contractAddresses)[0] || null;

  return {
    contractAddresses,
    primaryChain,
    primaryAddress: primaryChain ? contractAddresses[primaryChain] : null
  };
};

/**
 * Fetches contract addresses for a coin from CoinGecko with retry logic
 */
export const fetchContractAddresses = async (
  coinId: string, 
  retries = 3
): Promise<ContractAddressResult> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
        {
          signal: controller.signal,
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'NYALTX-Search/1.0'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return processContractAddresses(data.platforms);
      } else if (response.status === 429) {
        // Rate limited, wait and retry
        if (attempt < retries) {
          const delay = 2000 * Math.pow(2, attempt);
          console.log(`⏳ Rate limited fetching ${coinId}, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else {
        console.log(`❌ HTTP ${response.status} fetching ${coinId} contract addresses`);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log(`⏱️ Timeout fetching ${coinId} contract addresses, attempt ${attempt + 1}`);
      } else {
        console.log(`❌ Error fetching ${coinId} contract addresses, attempt ${attempt + 1}:`, error.message);
      }
      
      if (attempt < retries) {
        const delay = 1000 * (attempt + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  // Return empty result if all attempts fail
  return {
    contractAddresses: {},
    primaryChain: null,
    primaryAddress: null
  };
};

/**
 * Generates trade page URL with contract address parameters
 */
export const generateTradeUrl = (
  symbol: string,
  contractResult: ContractAddressResult,
  coinGeckoId?: string
): string => {
  const params = new URLSearchParams();
  params.set('base', symbol.toUpperCase());
  
  if (contractResult.primaryChain) {
    params.set('chain', contractResult.primaryChain);
  }
  
  if (contractResult.primaryAddress) {
    params.set('address', contractResult.primaryAddress);
  }
  
  if (coinGeckoId) {
    params.set('coingecko_id', coinGeckoId);
  }
  
  return `/dashboard/trade?${params.toString()}`;
};

/**
 * Updates current URL with contract address parameters without page reload
 */
export const updateUrlWithContractAddress = (
  contractResult: ContractAddressResult,
  coinGeckoId?: string
): void => {
  if (typeof window === 'undefined') return;
  
  const currentUrl = new URL(window.location.href);
  
  if (contractResult.primaryChain) {
    currentUrl.searchParams.set('chain', contractResult.primaryChain);
  }
  
  if (contractResult.primaryAddress) {
    currentUrl.searchParams.set('address', contractResult.primaryAddress);
  }
  
  if (coinGeckoId) {
    currentUrl.searchParams.set('coingecko_id', coinGeckoId);
  }
  
  window.history.replaceState({}, '', currentUrl.toString());
  console.log(`🔄 Updated URL with contract address: ${currentUrl.toString()}`);
};

/**
 * Logs contract address information for debugging
 */
export const logContractAddressInfo = (
  symbol: string,
  contractResult: ContractAddressResult
): void => {
  if (Object.keys(contractResult.contractAddresses).length > 0) {
    console.log(`✅ ${symbol} contract addresses:`, contractResult.contractAddresses);
    if (contractResult.primaryChain && contractResult.primaryAddress) {
      console.log(`🎯 Primary: ${contractResult.primaryChain} - ${contractResult.primaryAddress}`);
    }
  } else {
    console.log(`⚠️ ${symbol} has no contract addresses available`);
  }
};
