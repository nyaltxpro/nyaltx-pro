import top400CoinsData from '../../scripts/top400coins-detailed.json';

export interface TokenLookupResult {
  contractAddress?: string;
  chain?: string;
  platforms?: Record<string, string>;
  image?: string;
  description?: string;
}

/**
 * Lookup token information from the top 400 coins database
 * Searches by symbol, name, or id
 */
export function lookupToken(searchTerm: string): TokenLookupResult | null {
  if (!searchTerm) return null;

  const normalizedSearch = searchTerm.toLowerCase().trim();

  // Search through all coins
  const coin = top400CoinsData.coins.find((c: any) => {
    return (
      c.symbol?.toLowerCase() === normalizedSearch ||
      c.name?.toLowerCase() === normalizedSearch ||
      c.id?.toLowerCase() === normalizedSearch
    );
  });

  if (!coin) return null;

  // Get the primary platform (first non-empty one)
  const platforms = coin.platforms || {};
  const platformEntries = Object.entries(platforms).filter(([key, value]) => key && value);

  let primaryChain = '';
  let primaryContractAddress = '';

  if (platformEntries.length > 0) {
    const [chain, address] = platformEntries[0];
    primaryChain = chain;
    primaryContractAddress = address as string;
  }

  return {
    contractAddress: primaryContractAddress,
    chain: primaryChain,
    platforms: platforms as Record<string, string>,
    image: coin.image?.large || coin.image?.small || coin.image?.thumb,
    description: coin.description,
  };
}

/**
 * Get contract address for a specific chain
 */
export function getContractForChain(searchTerm: string, chain: string): string | null {
  const tokenInfo = lookupToken(searchTerm);
  if (!tokenInfo || !tokenInfo.platforms) return null;

  const normalizedChain = chain.toLowerCase().trim();
  return tokenInfo.platforms[normalizedChain] || null;
}

/**
 * Get all available chains for a token
 */
export function getAvailableChains(searchTerm: string): string[] {
  const tokenInfo = lookupToken(searchTerm);
  if (!tokenInfo || !tokenInfo.platforms) return [];

  return Object.keys(tokenInfo.platforms).filter(
    (key) => key && tokenInfo.platforms![key]
  );
}

/**
 * Map common chain names to platform IDs used in the JSON
 */
const chainMapping: Record<string, string> = {
  ethereum: 'ethereum',
  eth: 'ethereum',
  bsc: 'binance-smart-chain',
  'binance smart chain': 'binance-smart-chain',
  polygon: 'polygon-pos',
  matic: 'polygon-pos',
  avalanche: 'avalanche',
  avax: 'avalanche',
  arbitrum: 'arbitrum-one',
  optimism: 'optimistic-ethereum',
  fantom: 'fantom',
  ftm: 'fantom',
  solana: 'solana',
  sol: 'solana',
  tron: 'tron',
  trx: 'tron',
};

/**
 * Normalize chain name to match the platform IDs in the JSON
 */
export function normalizeChainName(chain: string): string {
  const normalized = chain.toLowerCase().trim();
  return chainMapping[normalized] || normalized;
}

/**
 * Enhanced lookup that tries to match with normalized chain names
 */
export function lookupTokenWithChain(
  searchTerm: string,
  preferredChain?: string
): TokenLookupResult | null {
  const tokenInfo = lookupToken(searchTerm);
  if (!tokenInfo) return null;

  // If no preferred chain, return primary
  if (!preferredChain) return tokenInfo;

  // Try to find contract for the preferred chain
  const normalizedChain = normalizeChainName(preferredChain);
  const contractAddress = getContractForChain(searchTerm, normalizedChain);

  if (contractAddress) {
    return {
      ...tokenInfo,
      contractAddress,
      chain: normalizedChain,
    };
  }

  // Fall back to primary
  return tokenInfo;
}
