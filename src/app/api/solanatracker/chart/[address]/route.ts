// API route for fetching Solana token chart data from Solana Tracker
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'd82b528d-a84d-4008-ac0f-cea123d8203c';
const BASE_URL = 'https://data.solanatracker.io';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '24h';

    if (!address) {
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      );
    }

    console.log(`📈 Fetching Solana chart data for: ${address}`);

    const url = new URL(`${BASE_URL}/chart/${address}`);
    url.searchParams.append('timeframe', timeframe);

    const response = await fetch(url.toString(), {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Solana Tracker API error: ${response.status}`);
      return NextResponse.json(
        { error: `API Error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Solana chart data fetched successfully: ${data.oclhv?.length || 0} data points`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching Solana chart data:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch chart data',
        oclhv: [] // Return empty array for graceful fallback
      },
      { status: 500 }
    );
  }
}
