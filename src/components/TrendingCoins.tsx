'use client';

import tokens from '@/data/tokens.json';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface DexScreenerBoost {
  url: string;
  chainId: string;
  tokenAddress: string;
  description: string;
  icon: string;
  header: string;
  openGraph: string;
  links: Array<{
    url: string;
    type?: string;
  }>;
  totalAmount: number;
}

export default function TrendingCoins() {
  const router = useRouter();
  
  // DexScreener boosted tokens state (now the only data source)
  const [boostedTokens, setBoostedTokens] = useState<DexScreenerBoost[]>([]);
  const [boostedLoading, setBoostedLoading] = useState(false);
  const [boostedError, setBoostedError] = useState<string | null>(null);

  // Format BTC price with appropriate decimal places
  const formatBtcPrice = (price: number) => {
    if (price < 0.00001) return price.toFixed(8);
    if (price < 0.0001) return price.toFixed(7);
    if (price < 0.001) return price.toFixed(6);
    return price.toFixed(6);
  };

  // Format USD price with appropriate decimal places
  const formatUsdPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (numPrice < 0.000001) return `$${numPrice.toFixed(8)}`;
    if (numPrice < 0.0001) return `$${numPrice.toFixed(6)}`;
    if (numPrice < 0.01) return `$${numPrice.toFixed(4)}`;
    if (numPrice < 1) return `$${numPrice.toFixed(3)}`;
    return `$${numPrice.toFixed(2)}`;
  };

  // Format volume with K/M/B suffixes
  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  // Fetch DexScreener boosted tokens
  const fetchBoostedTokens = async () => {
    try {
      setBoostedLoading(true);
      setBoostedError(null);
      
      console.log('Fetching DexScreener boosted tokens...');
      const response = await fetch('https://api.dexscreener.com/token-boosts/top/v1', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('DexScreener API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('DexScreener API error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('DexScreener API response:', data);
      
      // Validate the response structure
      if (!Array.isArray(data)) {
        console.error('Expected array from DexScreener API, got:', typeof data);
        setBoostedError('Invalid response format from DexScreener API');
        return;
      }
      
      // Filter out invalid tokens and log any issues
      const validTokens = data.filter(token => {
        if (!token?.baseToken?.symbol || !token?.baseToken?.name) {
          console.warn('Filtering out invalid token:', token);
          return false;
        }
        return true;
      });
      
      console.log(`Filtered ${validTokens.length} valid tokens from ${data.length} total`);
      setBoostedTokens(validTokens.slice(0, 5)); // Show top 5 valid boosted tokens
    } catch (err) {
      console.error('Error fetching boosted tokens:', err);
      setBoostedError('Failed to load boosted tokens');
    } finally {
      setBoostedLoading(false);
    }
  };

  // Load boosted tokens on component mount
  useEffect(() => {
    fetchBoostedTokens();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchBoostedTokens, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to extract token symbol from DexScreener URL
  const extractTokenSymbol = (token: DexScreenerBoost) => {
    // Try to extract symbol from URL or use a fallback
    const urlParts = token.url.split('/');
    return urlParts[urlParts.length - 1]?.substring(0, 6).toUpperCase() || 'UNKNOWN';
  };

  // Helper function to get token name from description
  const extractTokenName = (token: DexScreenerBoost) => {
    // Extract the first sentence or first few words from description
    const firstSentence = token.description.split('.')[0];
    const words = firstSentence.split(' ');
    return words.length > 3 ? words.slice(0, 3).join(' ') : firstSentence;
  };

  const handleNavigate = (token: DexScreenerBoost) => {
    const symbol = extractTokenSymbol(token);
    const name = extractTokenName(token);
    
    // Map chainId to our internal chain names
    const chainMapping: { [key: string]: string } = {
      'ethereum': 'ethereum',
      'solana': 'solana',
      'bsc': 'binance',
      'polygon': 'polygon',
      'arbitrum': 'arbitrum',
      'optimism': 'optimism',
      'base': 'base',
      'avalanche': 'avalanche',
    };
    
    const chain = chainMapping[token.chainId] || token.chainId;
    const address = token.tokenAddress;
    
    // Create trade page parameters
    const params = new URLSearchParams({ base: symbol });
    if (name) params.set('name', name);
    if (chain) params.set('chain', chain);
    if (address) params.set('address', address);
    if (token.icon) params.set('imageUri', `https://cdn.dexscreener.com/token-images/${token.icon}`);
    params.set('dexscreener_url', token.url);
    
    router.push(`/dashboard/trade?${params.toString()}`);
  };


  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">🚀 Boosted Tokens</h2>
          <button
            onClick={fetchBoostedTokens}
            disabled={boostedLoading}
            className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 rounded transition-colors"
            title="Refresh boosted tokens"
          >
            {boostedLoading ? '🔄' : '↻'}
          </button>
        </div>
      </div>

      {boostedLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-gray-400">Loading boosted tokens...</span>
        </div>
      ) : boostedError ? (
        <div className="text-red-500 p-4 bg-red-900 bg-opacity-20 rounded">
          <div className="flex justify-between items-center">
            <span>{boostedError}</span>
            <button
              onClick={fetchBoostedTokens}
              className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {boostedTokens.map((token, index) => (
            <div
              key={`${token.chainId}-${token.tokenAddress}`}
              className="rounded-lg p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer hover:bg-gray-800/40 border border-orange-500/20 bg-orange-900/10"
              onClick={() => handleNavigate(token)}
            >
              <div className="flex items-center">
                <div className="relative h-8 w-8 mr-3">
                  {token.icon ? (
                    <Image
                      src={`https://cdn.dexscreener.com/token-images/${token.icon}`}
                      alt={extractTokenName(token)}
                      fill
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-500/20 rounded-full flex items-center justify-center">
                      <span className="text-orange-400 font-bold text-sm">
                        {extractTokenSymbol(token).charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {extractTokenName(token)}
                    <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                      🚀 BOOSTED
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs flex items-center gap-2">
                    <span>{extractTokenSymbol(token)}</span>
                    <span className="bg-gray-700 text-gray-300 px-1 rounded text-xs">
                      {token.chainId.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right w-full sm:w-auto mt-2 sm:mt-0">
                <div className="font-medium text-sm text-green-400">
                  Boost: ${token.totalAmount}
                </div>
                <div className="text-xs text-gray-400">
                  {token.description.length > 50 
                    ? `${token.description.substring(0, 50)}...` 
                    : token.description
                  }
                </div>
              </div>
            </div>
          ))}

          {boostedTokens.length === 0 && (
            <div className="text-center text-gray-400 py-4">No boosted tokens found</div>
          )}
        </div>
      )}
    </div>
  );
}
