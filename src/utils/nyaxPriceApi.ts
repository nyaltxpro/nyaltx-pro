// NYAX Price API Utility
// Provides fallback price fetching for NYAX token using GeckoTerminal API

export interface NYAXPriceData {
  symbol: string;
  contract_address: string;
  pool_address: string;
  price_usd: string;
  price_change_24h: string;
  volume_24h_usd: string;
  market_cap_usd: string | null;
  fdv_usd: string;
  last_updated: string;
  source: string;
}

export interface NYAXPriceResponse {
  success: boolean;
  data?: NYAXPriceData;
  error?: string;
  message?: string;
}

/**
 * Fetch NYAX token price from dedicated API endpoint
 * This provides a fallback when CoinGecko doesn't have NYAX price data
 */
export async function fetchNYAXPrice(): Promise<NYAXPriceResponse> {
  try {
    console.log('🔍 Fetching NYAX price from dedicated API...');
    
    const response = await fetch('/api/nyax-price', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 30 seconds on client side
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: NYAXPriceResponse = await response.json();
    
    if (data.success && data.data) {
      console.log('✅ NYAX price fetched successfully:', data.data.price_usd);
      return data;
    } else {
      console.error('❌ NYAX price API returned error:', data.error || data.message);
      return data;
    }
  } catch (error) {
    console.error('💥 Error fetching NYAX price:', error);
    return {
      success: false,
      error: 'Failed to fetch NYAX price',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if a token is NYAX based on symbol or contract address
 */
export function isNYAXToken(symbol?: string, contractAddress?: string): boolean {
  const NYAX_CONTRACT = '0x5eed5621b92be4473f99bacac77acfa27deb57d9';
  
  if (symbol && symbol.toUpperCase() === 'NYAX') {
    return true;
  }
  
  if (contractAddress && contractAddress.toLowerCase() === NYAX_CONTRACT.toLowerCase()) {
    return true;
  }
  
  return false;
}

/**
 * Get NYAX price with automatic fallback handling
 * Returns price as number or null if unavailable
 */
export async function getNYAXPriceUSD(): Promise<number | null> {
  try {
    const response = await fetchNYAXPrice();
    
    if (response.success && response.data) {
      const price = parseFloat(response.data.price_usd);
      return isNaN(price) ? null : price;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting NYAX price USD:', error);
    return null;
  }
}

/**
 * Get NYAX price change percentage (24h)
 * Returns change as number or null if unavailable
 */
export async function getNYAXPriceChange24h(): Promise<number | null> {
  try {
    const response = await fetchNYAXPrice();
    
    if (response.success && response.data) {
      const change = parseFloat(response.data.price_change_24h);
      return isNaN(change) ? null : change;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting NYAX price change:', error);
    return null;
  }
}
