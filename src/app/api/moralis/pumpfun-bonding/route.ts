import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
    
    if (!MORALIS_API_KEY) {
      console.error('❌ MORALIS_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Moralis API key not configured' },
        { status: 500 }
      );
    }

    const url = 'https://solana-gateway.moralis.io/token/mainnet/exchange/pumpfun/bonding?limit=100';
    
    console.log('🚀 Fetching Pump.fun bonding tokens from Moralis API...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-API-Key': MORALIS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Moralis API error: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { error: `Moralis API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.result || !Array.isArray(data.result)) {
      console.error('❌ Invalid response structure from Moralis API');
      return NextResponse.json(
        { error: 'Invalid response structure from Moralis API' },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully fetched ${data.result.length} Pump.fun bonding tokens`);
    
    // Return the data with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ Error in Pump.fun bonding API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
