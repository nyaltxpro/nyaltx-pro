import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { BoostPoints, BoostPack } from '@/types/gamification';

// Boost pack configurations
const BOOST_PACKS: Record<string, BoostPack> = {
  paddle: {
    id: 'paddle',
    name: 'Paddle Boat',
    basePoints: 100,
    duration: '24 hours',
    price: { usd: 300, eth: 0.1, usdc: 300, nyax: 240 },
    features: ['24h visibility boost', 'Basic leaderboard placement'],
    decayHours: 24
  },
  motor: {
    id: 'motor',
    name: 'Motor Boat',
    basePoints: 250,
    duration: '36 hours',
    price: { usd: 500, eth: 0.167, usdc: 500, nyax: 400 },
    features: ['36h visibility boost', 'Enhanced leaderboard placement', 'Social media eligibility'],
    decayHours: 36
  },
  helicopter: {
    id: 'helicopter',
    name: 'Helicopter',
    basePoints: 500,
    duration: '48 hours',
    price: { usd: 700, eth: 0.233, usdc: 700, nyax: 560 },
    features: ['48h visibility boost', 'Premium leaderboard placement', 'Social media priority', 'Cross-promotion eligibility'],
    decayHours: 48
  }
};

export async function POST(req: NextRequest) {
  try {
    const { tokenId, boostPackType, transactionHash, walletAddress } = await req.json();

    if (!tokenId || !boostPackType || !transactionHash || !walletAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const boostPack = BOOST_PACKS[boostPackType];
    if (!boostPack) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid boost pack type' 
      }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (boostPack.decayHours * 60 * 60 * 1000));
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
      boostPackType: boostPack.id
    };

    // Store in database
    const boostCollection = await getCollection<BoostPoints>('boost_points');
    await boostCollection.insertOne(boostPoints);

    // Update leaderboard
    await updateLeaderboard(tokenId);

    return NextResponse.json({
      success: true,
      boostPoints,
      message: `${boostPack.name} boost activated! ${boostPack.basePoints} points added.`
    });

  } catch (error) {
    console.error('Error creating boost:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get('tokenId');

    if (!tokenId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token ID is required' 
      }, { status: 400 });
    }

    const boostCollection = await getCollection<BoostPoints>('boost_points');
    
    // Get active boosts for the token
    const activeBoosts = await boostCollection.find({
      tokenId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).toArray();

    // Calculate current points with decay
    const currentBoosts = activeBoosts.map(boost => {
      const now = new Date();
      const hoursElapsed = (now.getTime() - boost.createdAt.getTime()) / (1000 * 60 * 60);
      const decayedPoints = Math.max(0, boost.originalPoints - (boost.decayRate * hoursElapsed));
      
      return {
        ...boost,
        points: Math.round(decayedPoints)
      };
    });

    const totalPoints = currentBoosts.reduce((sum, boost) => sum + boost.points, 0);

    return NextResponse.json({
      success: true,
      activeBoosts: currentBoosts,
      totalPoints,
      boostPacks: BOOST_PACKS
    });

  } catch (error) {
    console.error('Error fetching boosts:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function updateLeaderboard(tokenId: string) {
  // This would trigger a leaderboard recalculation
  // Implementation depends on your leaderboard storage strategy
  console.log(`Updating leaderboard for token: ${tokenId}`);
}
