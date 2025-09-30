import { useEffect, useMemo } from 'react';
import { useAppSelector } from '@/store';
import { selectSelectedChain } from '@/store/slices/chainSlice';

// Generic token interface that can work with different token types
interface BaseToken {
  id?: string;
  symbol?: string;
  name?: string;
  chain?: string;
  blockchain?: string;
  network?: string;
  contractAddress?: string;
  address?: string;
  mint?: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Hook to filter tokens based on the selected blockchain chain
 * @param tokens - Array of tokens to filter
 * @param options - Configuration options
 * @returns Filtered tokens array
 */
export const useChainFilter = <T extends BaseToken>(
  tokens: T[], 
  options: {
    chainField?: keyof T; // Which field contains the chain info
    includeUnknown?: boolean; // Whether to include tokens without chain info
    caseSensitive?: boolean; // Whether chain comparison is case sensitive
  } = {}
) => {
  const selectedChain = useAppSelector(selectSelectedChain);
  
  const {
    chainField = 'chain',
    includeUnknown = true,
    caseSensitive = false
  } = options;

  const filteredTokens = useMemo(() => {
    if (!selectedChain || !tokens || tokens.length === 0) {
      return tokens;
    }

    // If "All Networks" is selected, return all tokens without filtering
    if (selectedChain.id === 'all-networks') {
      return tokens;
    }

    const selectedChainId = caseSensitive ? selectedChain.id : selectedChain.id.toLowerCase();
    const selectedChainName = caseSensitive ? selectedChain.name : selectedChain.name.toLowerCase();

    return tokens.filter((token) => {
      // Get the chain value from the token
      const tokenChain = token[chainField] || token.chain || token.blockchain || token.network;
      
      // If token has no chain info, include based on includeUnknown setting
      if (!tokenChain) {
        return includeUnknown;
      }

      const tokenChainValue = caseSensitive ? String(tokenChain) : String(tokenChain).toLowerCase();

      // Check if token chain matches selected chain (by ID or name)
      return (
        tokenChainValue === selectedChainId ||
        tokenChainValue === selectedChainName ||
        tokenChainValue === selectedChain.symbol.toLowerCase() ||
        // Handle common chain name variations
        isChainMatch(tokenChainValue, selectedChainId, selectedChainName)
      );
    });
  }, [tokens, selectedChain, chainField, includeUnknown, caseSensitive]);

  // Log filtering results for debugging
  useEffect(() => {
    if (selectedChain && tokens.length > 0) {
      if (selectedChain.id === 'all-networks') {
        console.log(`🌐 Chain Filter: ${selectedChain.name} | Showing all ${tokens.length} tokens (no filtering)`);
      } else {
        console.log(`🔍 Chain Filter: ${selectedChain.name} | Total: ${tokens.length} → Filtered: ${filteredTokens.length}`);
      }
    }
  }, [selectedChain, tokens.length, filteredTokens.length]);

  return filteredTokens;
};

/**
 * Helper function to match chain names with common variations
 */
function isChainMatch(tokenChain: string, selectedChainId: string, selectedChainName: string): boolean {
  // Common chain name mappings
  const chainMappings: Record<string, string[]> = {
    'ethereum': ['eth', 'ethereum', 'mainnet', 'ethereum-mainnet'],
    'binance-smart-chain': ['bsc', 'binance', 'bnb', 'binance-smart-chain', 'bep20'],
    'polygon-pos': ['polygon', 'matic', 'polygon-pos', 'polygon-mainnet'],
    'arbitrum-one': ['arbitrum', 'arb', 'arbitrum-one', 'arbitrum-mainnet'],
    'optimistic-ethereum': ['optimism', 'op', 'optimistic-ethereum', 'optimism-mainnet'],
    'avalanche': ['avax', 'avalanche', 'avalanche-mainnet'],
    'fantom': ['ftm', 'fantom', 'fantom-mainnet'],
    'solana': ['sol', 'solana', 'solana-mainnet'],
    'base': ['base', 'base-mainnet'],
    'near-protocol': ['near', 'near-protocol', 'near-mainnet'],
    'cosmos': ['atom', 'cosmos', 'cosmos-hub'],
    'polkadot': ['dot', 'polkadot'],
    'cardano': ['ada', 'cardano'],
    'tron': ['trx', 'tron', 'tron-mainnet']
  };

  // Check if the token chain matches any of the variations for the selected chain
  const selectedChainVariations = chainMappings[selectedChainId] || [selectedChainId, selectedChainName];
  
  return selectedChainVariations.some(variation => 
    tokenChain === variation.toLowerCase()
  );
}

/**
 * Hook to get chain-specific filtering status
 */
export const useChainFilterStatus = () => {
  const selectedChain = useAppSelector(selectSelectedChain);
  
  return {
    isFiltering: !!selectedChain && selectedChain.id !== 'all-networks',
    selectedChain,
    chainName: selectedChain?.name || 'All Networks',
    chainId: selectedChain?.id || 'all-networks'
  };
};

export default useChainFilter;
