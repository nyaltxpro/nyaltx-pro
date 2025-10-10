import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '7d'; // 24h, 7d, 30d
    const walletAddress = searchParams.get('wallet');

    const boostCollection = await getCollection('boost_points');
    const now = new Date();
    
    // Calculate timeframe
    let startDate: Date;
    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Base query
    const baseQuery: any = {
      createdAt: { $gte: startDate }
    };

    // Add wallet filter if provided
    if (walletAddress) {
      baseQuery.walletAddress = walletAddress.toLowerCase();
    }

    // Get boost purchases
    const boosts = await boostCollection
      .find(baseQuery)
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate analytics
    const analytics = {
      totalBoosts: boosts.length,
      totalSpent: boosts.reduce((sum, boost) => {
        const price = getBoostPackPrice(boost.boostPackType);
        return sum + price;
      }, 0),
      totalPoints: boosts.reduce((sum, boost) => sum + boost.originalPoints, 0),
      averagePoints: boosts.length > 0 ? Math.round(boosts.reduce((sum, boost) => sum + boost.originalPoints, 0) / boosts.length) : 0,
      
      // Boost pack breakdown
      packBreakdown: getPackBreakdown(boosts),
      
      // Daily breakdown
      dailyBreakdown: getDailyBreakdown(boosts, startDate, now),
      
      // Performance metrics
      activeBoosts: boosts.filter(boost => boost.isActive && boost.expiresAt > now).length,
      expiredBoosts: boosts.filter(boost => !boost.isActive || boost.expiresAt <= now).length,
      
      // ROI metrics (if wallet specific)
      ...(walletAddress && {
        averagePosition: await getAveragePosition(walletAddress),
        bestPosition: await getBestPosition(walletAddress),
        currentPosition: await getCurrentPosition(walletAddress),
      })
    };

    return NextResponse.json({
      success: true,
      analytics,
      timeframe,
      walletAddress: walletAddress || null,
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function getBoostPackPrice(packType: string): number {
  const prices: Record<string, number> = {
    'kayak': 1,
    'starter': 199,
    'growth': 399,
    'pro': 599,
  };
  return prices[packType] || 0;
}

function getPackBreakdown(boosts: any[]) {
  const breakdown: Record<string, { count: number; totalSpent: number; totalPoints: number }> = {};
  
  boosts.forEach(boost => {
    const packType = boost.boostPackType;
    if (!breakdown[packType]) {
      breakdown[packType] = { count: 0, totalSpent: 0, totalPoints: 0 };
    }
    
    breakdown[packType].count++;
    breakdown[packType].totalSpent += getBoostPackPrice(packType);
    breakdown[packType].totalPoints += boost.originalPoints;
  });
  
  return breakdown;
}

function getDailyBreakdown(boosts: any[], startDate: Date, endDate: Date) {
  const days: Record<string, { count: number; points: number; spent: number }> = {};
  
  // Initialize all days
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    days[dateKey] = { count: 0, points: 0, spent: 0 };
  }
  
  // Fill in actual data
  boosts.forEach(boost => {
    const dateKey = boost.createdAt.toISOString().split('T')[0];
    if (days[dateKey]) {
      days[dateKey].count++;
      days[dateKey].points += boost.originalPoints;
      days[dateKey].spent += getBoostPackPrice(boost.boostPackType);
    }
  });
  
  return Object.entries(days).map(([date, data]) => ({
    date,
    ...data
  }));
}

async function getAveragePosition(walletAddress: string): Promise<number | null> {
  try {
    // This would require historical position tracking
    // For now, return null as it's not implemented
    return null;
  } catch (error) {
    return null;
  }
}

async function getBestPosition(walletAddress: string): Promise<number | null> {
  try {
    // This would require historical position tracking
    // For now, return null as it's not implemented
    return null;
  } catch (error) {
    return null;
  }
}

async function getCurrentPosition(walletAddress: string): Promise<number | null> {
  try {
    const tokenCollection = await getCollection('token_registrations');
    const leaderboardResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gamification/leaderboard?limit=100`);
    
    if (!leaderboardResponse.ok) return null;
    
    const leaderboardData = await leaderboardResponse.json();
    
    if (!leaderboardData.success) return null;
    
    // Get user tokens
    const userTokens = await tokenCollection
      .find({ 
        submittedByAddressLower: walletAddress.toLowerCase(),
        status: 'approved'
      })
      .toArray();
    
    if (userTokens.length === 0) return null;
    
    const userTokenIds = userTokens.map(token => token.id);
    const userEntries = leaderboardData.leaderboard?.filter((entry: any) =>
      userTokenIds.includes(entry.tokenId)
    ) || [];
    
    if (userEntries.length === 0) return null;
    
    // Return best position
    return Math.min(...userEntries.map((entry: any) => entry.position));
    
  } catch (error) {
    return null;
  }
}
