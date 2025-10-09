import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { headers } from 'next/headers';

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-vercel-forwarded-for');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (remoteAddr) {
    return remoteAddr;
  }
  
  return '127.0.0.1'; // fallback
}

// Helper function to parse user agent
function parseUserAgent(userAgent: string) {
  const browsers = [
    { name: 'Chrome', regex: /Chrome\/([0-9.]+)/ },
    { name: 'Firefox', regex: /Firefox\/([0-9.]+)/ },
    { name: 'Safari', regex: /Safari\/([0-9.]+)/ },
    { name: 'Edge', regex: /Edge\/([0-9.]+)/ },
    { name: 'Opera', regex: /Opera\/([0-9.]+)/ },
  ];

  for (const browser of browsers) {
    const match = userAgent.match(browser.regex);
    if (match) {
      return {
        browser: browser.name,
        version: match[1]
      };
    }
  }

  return {
    browser: 'Unknown',
    version: 'Unknown'
  };
}

// Helper function to get location from IP (mock implementation)
async function getLocationFromIP(ip: string) {
  try {
    // In production, you would use a service like ipapi.co, ipgeolocation.io, etc.
    // For now, we'll return mock data
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        country: 'Local',
        countryCode: 'LC',
        region: 'Local Network',
        city: 'Local'
      };
    }

    // Mock implementation - in production, replace with actual IP geolocation service
    const mockLocations = [
      { country: 'United States', countryCode: 'US', region: 'California', city: 'San Francisco' },
      { country: 'United Kingdom', countryCode: 'GB', region: 'England', city: 'London' },
      { country: 'Germany', countryCode: 'DE', region: 'Bavaria', city: 'Munich' },
      { country: 'Japan', countryCode: 'JP', region: 'Tokyo', city: 'Tokyo' },
      { country: 'Canada', countryCode: 'CA', region: 'Ontario', city: 'Toronto' },
    ];

    // Simple hash-based selection for consistent results per IP
    const hash = ip.split('.').reduce((acc, octet) => acc + parseInt(octet), 0);
    return mockLocations[hash % mockLocations.length];
  } catch (error) {
    return {
      country: 'Unknown',
      countryCode: 'UN',
      region: 'Unknown',
      city: 'Unknown'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      page,
      referrer,
      sessionId,
      walletAddress,
      walletType,
      event = 'page_view'
    } = body;

    const db = await getDb();
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const { browser, version } = parseUserAgent(userAgent);
    const location = await getLocationFromIP(ip);

    const timestamp = new Date();

    // Track page visit
    if (event === 'page_view') {
      await db.collection('page_visits').insertOne({
        ipAddress: ip,
        page,
        referrer,
        sessionId,
        timestamp,
        userAgent,
        browser,
        browserVersion: version,
        country: location.country,
        countryCode: location.countryCode,
        region: location.region,
        city: location.city,
        walletAddress: walletAddress || null
      });
    }

    // Track wallet connection
    if (event === 'wallet_connect' && walletAddress && walletType) {
      await db.collection('wallet_connections').insertOne({
        walletAddress,
        walletType,
        ipAddress: ip,
        timestamp,
        userAgent,
        country: location.country,
        region: location.region
      });
    }

    // Update or create user session
    await db.collection('user_sessions').updateOne(
      { sessionId },
      {
        $set: {
          lastActivity: timestamp,
          ipAddress: ip,
          userAgent,
          country: location.country,
          countryCode: location.countryCode,
          region: location.region,
          city: location.city,
          walletAddress: walletAddress || null,
          isActive: true
        },
        $setOnInsert: {
          createdAt: timestamp,
          sessionId
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}

// Endpoint to mark user as offline
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    await db.collection('user_sessions').updateOne(
      { sessionId },
      {
        $set: {
          isActive: false,
          lastActivity: new Date()
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating session status:', error);
    return NextResponse.json(
      { error: 'Failed to update session status' },
      { status: 500 }
    );
  }
}
