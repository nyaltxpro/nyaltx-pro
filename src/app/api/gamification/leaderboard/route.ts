import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { BoostPoints, LeaderboardEntry, WeeklyWinner } from '@/types/gamification';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || 'current'; // 'current' or 'weekly'
    const limit = parseInt(searchParams.get('limit') || '50');

    const boostCollection = await getCollection<BoostPoints>('boost_points');
    const tokenCollection = await getCollection('token_registrations');
    const winnersCollection = await getCollection<WeeklyWinner>('weekly_winners');

    const now = new Date();
    
    // Get all active boosts
    const activeBoosts = await boostCollection.find({
      isActive: true,
      expiresAt: { $gt: now }
    }).toArray();

    // Calculate current points with decay for each token
    const tokenPointsMap = new Map<string, {
      currentPoints: number;
      weeklyPoints: number;
      boosts: BoostPoints[];
      lastBoostTime: Date;
    }>();

    activeBoosts.forEach(boost => {
      const hoursElapsed = (now.getTime() - boost.createdAt.getTime()) / (1000 * 60 * 60);
      const decayedPoints = Math.max(0, boost.originalPoints - (boost.decayRate * hoursElapsed));
      
      if (!tokenPointsMap.has(boost.tokenId)) {
        tokenPointsMap.set(boost.tokenId, {
          currentPoints: 0,
          weeklyPoints: 0,
          boosts: [],
          lastBoostTime: boost.createdAt
        });
      }

      const tokenData = tokenPointsMap.get(boost.tokenId)!;
      tokenData.currentPoints += Math.round(decayedPoints);
      tokenData.boosts.push(boost);
      
      // Update last boost time
      if (boost.createdAt > tokenData.lastBoostTime) {
        tokenData.lastBoostTime = boost.createdAt;
      }

      // Calculate weekly points (last 7 days)
      const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      if (boost.createdAt >= weekAgo) {
        tokenData.weeklyPoints += Math.round(decayedPoints);
      }
    });

    // Get token details and crown badges
    const tokenIds = Array.from(tokenPointsMap.keys());
    const tokens = await tokenCollection.find({
      id: { $in: tokenIds },
      status: 'approved'
    }).toArray();

    const crownBadges = await winnersCollection.find({
      tokenId: { $in: tokenIds },
      crownBadgeAwarded: true
    }).toArray();

    const crownBadgeSet = new Set(crownBadges.map(w => w.tokenId));

    // Build leaderboard entries
    const leaderboardEntries: LeaderboardEntry[] = tokens
      .map(token => {
        const pointsData = tokenPointsMap.get(token.id);
        if (!pointsData || pointsData.currentPoints <= 0) return null;

        return {
          tokenId: token.id,
          tokenName: token.tokenName,
          tokenSymbol: token.tokenSymbol,
          tokenLogo: token.imageUri || '/crypto-icons/color/generic.svg',
          currentPoints: pointsData.currentPoints,
          weeklyPoints: pointsData.weeklyPoints,
          position: 0, // Will be set after sorting
          hasCrownBadge: crownBadgeSet.has(token.id),
          isTopThree: false, // Will be set after sorting
          lastBoostTime: pointsData.lastBoostTime,
          decayingPoints: pointsData.boosts
        };
      })
      .filter(entry => entry !== null) as LeaderboardEntry[];

    // Sort by current points (or weekly points if timeframe is 'weekly')
    const sortKey = timeframe === 'weekly' ? 'weeklyPoints' : 'currentPoints';
    leaderboardEntries.sort((a, b) => b[sortKey] - a[sortKey]);

    // Set positions and top three flags
    leaderboardEntries.forEach((entry, index) => {
      entry.position = index + 1;
      entry.isTopThree = index < 3;
    });

    // Limit results
    const limitedEntries = leaderboardEntries.slice(0, limit);

    // Get current weekly winner info
    const currentWeekStart = getWeekStart(now);
    const currentWeekWinner = await winnersCollection.findOne({
      weekStartDate: { $gte: currentWeekStart },
      weekEndDate: { $lt: getWeekEnd(currentWeekStart) }
    });

    return NextResponse.json({
      success: true,
      leaderboard: limitedEntries,
      totalEntries: leaderboardEntries.length,
      timeframe,
      currentWeekWinner,
      lastUpdated: now.toISOString()
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Adjust to get Monday as start of week
  return new Date(d.setDate(diff));
}

function getWeekEnd(weekStart: Date): Date {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return weekEnd;
}
