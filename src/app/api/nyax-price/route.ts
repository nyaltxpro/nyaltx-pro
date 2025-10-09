import { NextRequest, NextResponse } from 'next/server';

// NYAX token configuration
const NYAX_CONTRACT_ADDRESS = '0x5eEd5621B92Be4473F99BaCAC77ACfA27DEB57d9';
const NYAX_POOL_ADDRESS = '0x9861039bF9b66b3b30d59da1e7d4034fd08b8b3f';
const GECKOTERMINAL_API_URL = `https://api.geckoterminal.com/api/v2/networks/eth/pools/${NYAX_POOL_ADDRESS}`;

interface GeckoTerminalPoolResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      base_token_price_usd: string;
      base_token_price_native_currency: string;
      quote_token_price_usd: string;
      quote_token_price_native_currency: string;
      price_change_percentage: {
        h24: string;
        h6: string;
        h1: string;
        m30: string;
        m15: string;
        m5: string;
      };
      fdv_usd: string;
      market_cap_usd: string | null;
      volume_usd: {
        h24: string;
        h6: string;
        h1: string;
        m30: string;
        m15: string;
        m5: string;
      };
      reserve_in_usd: string;
    };
    relationships: {
      base_token: {
        data: {
          id: string;
          type: string;
        };
      };
      quote_token: {
        data: {
          id: string;
          type: string;
        };
      };
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching NYAX price from GeckoTerminal...');
    
    // Fetch data from GeckoTerminal API
    const response = await fetch(GECKOTERMINAL_API_URL, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NYALTX-Price/1.0',
      },
      // Cache for 30 seconds to avoid rate limits
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      console.error('❌ GeckoTerminal API error:', response.status, response.statusText);
      throw new Error(`GeckoTerminal API error: ${response.status}`);
    }

    const data: GeckoTerminalPoolResponse = await response.json();
    
    if (!data?.data?.attributes) {
      console.error('❌ Invalid response structure from GeckoTerminal');
      throw new Error('Invalid response structure');
    }

    const attributes = data.data.attributes;
    
    // Extract price data
    const priceUsd = parseFloat(attributes.base_token_price_usd);
    const priceChange24h = parseFloat(attributes.price_change_percentage.h24);
    const volume24h = parseFloat(attributes.volume_usd.h24);
    const marketCap = attributes.market_cap_usd ? parseFloat(attributes.market_cap_usd) : null;
    const fdv = parseFloat(attributes.fdv_usd);

    console.log('✅ NYAX price fetched successfully:', {
      price: priceUsd,
      change24h: priceChange24h,
      volume24h: volume24h
    });

    // Return formatted response
    return NextResponse.json({
      success: true,
      data: {
        symbol: 'NYAX',
        contract_address: NYAX_CONTRACT_ADDRESS,
        pool_address: NYAX_POOL_ADDRESS,
        price_usd: priceUsd.toString(),
        price_change_24h: priceChange24h.toString(),
        volume_24h_usd: volume24h.toString(),
        market_cap_usd: marketCap?.toString() || null,
        fdv_usd: fdv.toString(),
        last_updated: new Date().toISOString(),
        source: 'geckoterminal'
      }
    });

  } catch (error) {
    console.error('💥 Error fetching NYAX price:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch NYAX price',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
