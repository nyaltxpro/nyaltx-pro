// API route for fetching Solana token chart data from Solana Tracker
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'd82b528d-a84d-4008-ac0f-cea123d8203c';
const BASE_URL = 'https://data.solanatracker.io';

// In-memory cache for chart data (5 minute cache)
const chartCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If rate limited, wait and retry
      if (response.status === 429) {
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // Exponential backoff with jitter
          console.log(`⏳ Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
          await sleep(waitTime);
          continue;
        }
      }
      
      return response;
    } catch (error) {
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 500; // Shorter wait for network errors
        console.log(`🔄 Network error, retrying in ${waitTime}ms (${attempt + 1}/${maxRetries})`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}

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

    // Create cache key
    const cacheKey = `${address}-${timeframe}`;
    const now = Date.now();

    // Check cache first
    const cached = chartCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`💾 Returning cached Solana chart data for: ${address}`);
      return NextResponse.json(cached.data);
    }

    console.log(`📈 Fetching Solana chart data for: ${address} (timeframe: ${timeframe})`);

    const url = new URL(`${BASE_URL}/chart/${address}`);
    url.searchParams.append('timeframe', timeframe);

    const response = await fetchWithRetry(url.toString(), {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        'User-Agent': 'NYALTX-Chart/1.0',
      },
    });

    if (!response.ok) {
      console.error(`❌ Solana Tracker API error: ${response.status} ${response.statusText}`);
      
      // If rate limited and we have cached data, return it even if expired
      if (response.status === 429 && cached) {
        console.log(`⚠️ Rate limited, returning expired cache for: ${address}`);
        return NextResponse.json(cached.data);
      }
      
      return NextResponse.json(
        { 
          error: `API Error: ${response.status} ${response.statusText}`,
          oclhv: [] // Return empty array for graceful fallback
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Solana chart data fetched successfully: ${data.oclhv?.length || 0} data points`);

    // Cache the successful response
    chartCache.set(cacheKey, { data, timestamp: now });

    // Clean up old cache entries (keep cache size manageable)
    if (chartCache.size > 100) {
      const oldestKey = chartCache.keys().next().value;
      if (oldestKey) {
        chartCache.delete(oldestKey);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching Solana chart data:', error);
    
    // Try to return cached data if available, even if expired
    const cacheKey = `${params.address}-${request.nextUrl.searchParams.get('timeframe') || '24h'}`;
    const cached = chartCache.get(cacheKey);
    if (cached) {
      console.log(`🔄 Returning cached data due to error for: ${params.address}`);
      return NextResponse.json(cached.data);
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch chart data',
        oclhv: [] // Return empty array for graceful fallback
      },
      { status: 500 }
    );
  }
}
