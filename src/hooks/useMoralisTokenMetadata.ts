'use client';

import { useState, useEffect } from 'react';

export interface TokenMetadata {
  mint: string;
  standard: string;
  name: string;
  symbol: string;
  logo: string;
  decimals: string;
  metaplex?: {
    metadataUri: string;
    masterEdition: boolean;
    isMutable: boolean;
    sellerFeeBasisPoints: number;
    updateAuthority: string;
    primarySaleHappened: number;
  };
  fullyDilutedValue?: string;
  totalSupply?: string;
  totalSupplyFormatted?: string;
  links?: any;
  description?: string;
}

export interface UseMoralisTokenMetadataResult {
  metadata: TokenMetadata | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY;

export const useMoralisTokenMetadata = (
  tokenAddress: string,
  chain: string = 'mainnet'
): UseMoralisTokenMetadataResult => {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async () => {
    if (!tokenAddress || !MORALIS_API_KEY) {
      setError(!tokenAddress ? 'Token address is required' : 'Moralis API key not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🟣 Fetching token metadata for ${tokenAddress} on ${chain}`);
      
      const response = await fetch(
        `https://solana-gateway.moralis.io/token/${chain}/${tokenAddress}/metadata`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'X-API-Key': MORALIS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Moralis API error:', response.status, errorText);
        
        if (response.status === 400) {
          throw new Error('Invalid token address or chain');
        } else if (response.status === 401) {
          throw new Error('Invalid API key');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      }

      const data: TokenMetadata = await response.json();
      console.log('✅ Token metadata fetched:', data);
      
      setMetadata(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch token metadata';
      console.error('❌ Error fetching token metadata:', errorMessage);
      setError(errorMessage);
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenAddress) {
      fetchMetadata();
    } else {
      setMetadata(null);
      setError(null);
      setLoading(false);
    }
  }, [tokenAddress, chain]);

  const refetch = () => {
    fetchMetadata();
  };

  return {
    metadata,
    loading,
    error,
    refetch,
  };
};

export default useMoralisTokenMetadata;
