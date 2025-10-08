import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { BoostPoints, BoostPack } from '@/types/gamification';

// Boost pack configurations
const BOOST_PACKS: Record<string, BoostPack> = {
  kayak: {
    id: 'kayak',
    name: 'Kayak',
    basePoints: 25,
    duration: '6 hours',
    price: { usd: 1, eth: 0.0003, usdc: 1, nyax: 0.8 },
    features: ['6h visibility boost', 'Entry-level leaderboard placement'],
    decayHours: 6,
  },
  starter: {
    id: 'starter',
    name: 'Starter Boost',
    basePoints: 200,
    duration: '1 week',
    price: { usd: 199, eth: 0.066, usdc: 199, nyax: 159 },
    features: [
      '1 week visibility boost',
      'Basic leaderboard placement',
      'Social media eligibility',
    ],
    decayHours: 168,
  },
  growth: {
    id: 'growth',
    name: 'Growth Boost',
    basePoints: 500,
    duration: '2 weeks',
    price: { usd: 399, eth: 0.133, usdc: 399, nyax: 319 },
    features: [
      '2 weeks visibility boost',
      'Enhanced leaderboard placement',
      'Social media priority',
      'Cross-promotion eligibility',
    ],
    decayHours: 336,
  },
  pro: {
    id: 'pro',
    name: 'Pro Boost',
    basePoints: 1000,
    duration: '1 month',
    price: { usd: 599, eth: 0.2, usdc: 599, nyax: 479 },
    features: [
      '1 month visibility boost',
      'Featured leaderboard placement',
      'Premium social media priority',
      'Cross-promotion eligibility',
      'Priority support',
    ],
    decayHours: 720,
  },
  elite: {
    id: 'elite',
    name: 'Elite Boost',
    basePoints: 5000,
    duration: '3 months',
    price: { usd: 2999, eth: 1.0, usdc: 2999, nyax: 2399 },
    features: [
      '3 months visibility boost',
      'Premium featured placement',
      'Maximum social media priority',
      'Guaranteed cross-promotion',
      'Podcast appearance opportunity',
      'Dedicated account manager',
    ],
    decayHours: 2160,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { tokenId, boostPackType, transactionHash, walletAddress } = await req.json();

    if (!tokenId || !boostPackType || !transactionHash || !walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const boostPack = BOOST_PACKS[boostPackType];
    if (!boostPack) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid boost pack type',
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + boostPack.decayHours * 60 * 60 * 1000);
    const decayRate = boostPack.basePoints / boostPack.decayHours; // Points lost per hour

    const boostPoints: BoostPoints = {
      id: `boost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tokenId,
      points: boostPack.basePoints,
      originalPoints: boostPack.basePoints,
      createdAt: now,
      expiresAt,
      decayRate,
      isActive: true,
      transactionHash,
      boostPackType: boostPack.id,
    };

    // Store in database
    const boostCollection = await getCollection<BoostPoints>('boost_points');
    await boostCollection.insertOne(boostPoints);

    // Update leaderboard
    await updateLeaderboard(tokenId);

    return NextResponse.json({
      success: true,
      boostPoints,
      message: `${boostPack.name} boost activated! ${boostPack.basePoints} points added.`,
    });
  } catch (error) {
    console.error('Error creating boost:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get('tokenId');

    if (!tokenId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token ID is required',
        },
        { status: 400 }
      );
    }

    const boostCollection = await getCollection<BoostPoints>('boost_points');

    // Get active boosts for the token
    const activeBoosts = await boostCollection
      .find({
        tokenId,
        isActive: true,
        expiresAt: { $gt: new Date() },
      })
      .toArray();

    // Calculate current points with decay
    const currentBoosts = activeBoosts.map(boost => {
      const now = new Date();
      const hoursElapsed = (now.getTime() - boost.createdAt.getTime()) / (1000 * 60 * 60);
      const decayedPoints = Math.max(0, boost.originalPoints - boost.decayRate * hoursElapsed);

      return {
        ...boost,
        points: Math.round(decayedPoints),
      };
    });

    const totalPoints = currentBoosts.reduce((sum, boost) => sum + boost.points, 0);

    return NextResponse.json({
      success: true,
      activeBoosts: currentBoosts,
      totalPoints,
      boostPacks: BOOST_PACKS,
    });
  } catch (error) {
    console.error('Error fetching boosts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function updateLeaderboard(tokenId: string) {
  // This would trigger a leaderboard recalculation
  // Implementation depends on your leaderboard storage strategy
  console.log(`Updating leaderboard for token: ${tokenId}`);
}
