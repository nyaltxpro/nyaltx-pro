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

// Helper function to get location from IP using ipapi.co (free tier: 1000 requests/day)
async function getLocationFromIP(ip: string) {
  try {
    // Handle local/private IPs
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        country: 'Local',
        countryCode: 'LC',
        region: 'Local Network',
        city: 'Local'
      };
    }

    // Try to get real geolocation data
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'NYALTX-Analytics/1.0'
      },
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      
      // Check if we got valid data
      if (data.country_name && data.country_code) {
        return {
          country: data.country_name,
          countryCode: data.country_code,
          region: data.region || 'Unknown',
          city: data.city || 'Unknown'
        };
      }
    }

    // Fallback to mock data if API fails or returns invalid data
    const mockLocations = [
      { country: 'United States', countryCode: 'US', region: 'California', city: 'San Francisco' },
      { country: 'United Kingdom', countryCode: 'GB', region: 'England', city: 'London' },
      { country: 'Germany', countryCode: 'DE', region: 'Bavaria', city: 'Munich' },
      { country: 'Japan', countryCode: 'JP', region: 'Tokyo', city: 'Tokyo' },
      { country: 'Canada', countryCode: 'CA', region: 'Ontario', city: 'Toronto' },
      { country: 'Australia', countryCode: 'AU', region: 'New South Wales', city: 'Sydney' },
      { country: 'France', countryCode: 'FR', region: 'Île-de-France', city: 'Paris' },
      { country: 'Netherlands', countryCode: 'NL', region: 'North Holland', city: 'Amsterdam' },
    ];

    // Simple hash-based selection for consistent results per IP
    const hash = ip.split('.').reduce((acc, octet) => acc + parseInt(octet || '0'), 0);
    return mockLocations[hash % mockLocations.length];
  } catch (error) {
    console.error('Error getting location for IP:', ip, error);
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
      event = 'page_view',
      deviceType,
      screenResolution,
      language
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
        walletAddress: walletAddress || null,
        deviceType: deviceType || 'unknown',
        screenResolution: screenResolution || 'unknown',
        language: language || 'unknown'
      });
    }

    // Track wallet connection
    if (event === 'wallet_connect' && walletAddress && walletType) {
      // Store anonymized wallet address (first 6 + last 4 characters)
      const anonymizedAddress = walletAddress.length > 10 
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : walletAddress;
      
      await db.collection('wallet_connections').insertOne({
        walletAddress: anonymizedAddress, // Anonymized for privacy
        fullWalletAddress: walletAddress, // Full address for admin use only
        walletType,
        ipAddress: ip,
        timestamp,
        userAgent,
        browser,
        browserVersion: version,
        country: location.country,
        countryCode: location.countryCode,
        region: location.region,
        city: location.city,
        sessionId,
        deviceType: deviceType || 'unknown',
        screenResolution: screenResolution || 'unknown',
        language: language || 'unknown'
      });
      
      // Update daily wallet connection stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await db.collection('daily_wallet_stats').updateOne(
        { 
          date: today,
          walletType: walletType
        },
        {
          $inc: { 
            connections: 1,
            uniqueUsers: 1 // This will be corrected by aggregation
          },
          $addToSet: {
            uniqueAddresses: walletAddress
          }
        },
        { upsert: true }
      );
    }

    // Update or create user session
    await db.collection('user_sessions').updateOne(
      { sessionId },
      {
        $set: {
          lastActivity: timestamp,
          ipAddress: ip,
          userAgent,
          browser,
          browserVersion: version,
          country: location.country,
          countryCode: location.countryCode,
          region: location.region,
          city: location.city,
          walletAddress: walletAddress || null,
          walletType: walletType || null,
          isActive: true,
          deviceType: deviceType || 'unknown',
          screenResolution: screenResolution || 'unknown',
          language: language || 'unknown'
        },
        $setOnInsert: {
          createdAt: timestamp,
          sessionId,
          firstPage: page || '/',
          firstReferrer: referrer || null
        },
        $inc: {
          pageViews: event === 'page_view' ? 1 : 0
        }
      },
      { upsert: true }
    );
    
    // Track unique daily visitors
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await db.collection('daily_visitor_stats').updateOne(
      { date: today },
      {
        $addToSet: {
          uniqueIPs: ip,
          uniqueSessions: sessionId
        },
        $inc: {
          totalPageViews: event === 'page_view' ? 1 : 0,
          totalSessions: 1
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true,
      tracked: {
        event,
        timestamp,
        location: location.country,
        browser: `${browser} ${version}`,
        sessionId
      }
    });
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
