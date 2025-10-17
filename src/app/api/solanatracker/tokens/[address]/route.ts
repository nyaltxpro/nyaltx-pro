// API route for fetching Solana token info from Solana Tracker
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'd82b528d-a84d-4008-ac0f-cea123d8203c';
const BASE_URL = 'https://data.solanatracker.io';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching Solana token info for: ${address}`);

    const response = await fetch(`${BASE_URL}/tokens/${address}`, {
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
    console.log('✅ Solana token info fetched successfully');

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching Solana token info:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch token info',
      },
      { status: 500 }
    );
  }
}
