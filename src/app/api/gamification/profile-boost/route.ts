import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

interface ProfileBoost {
  id: string;
  profileAddress: string;
  points: number;
  originalPoints: number;
  createdAt: Date;
  expiresAt: Date;
  decayRate: number; // Points lost per hour
  isActive: boolean;
  transactionHash?: string;
  boostPackType: 'starter' | 'growth' | 'pro' | 'elite';
  walletAddress: string;
}

interface ProfileBoostPack {
  id: 'starter' | 'growth' | 'pro' | 'elite';
  name: string;
  basePoints: number;
  duration: string;
  price: {
    usd: number;
    eth: number;
    usdc: number;
    nyax: number;
  };
  features: string[];
  decayHours: number;
}

// Profile boost pack configurations
const PROFILE_BOOST_PACKS: Record<string, ProfileBoostPack> = {
  starter: {
    id: 'starter',
    name: 'Starter Boost',
    basePoints: 200,
    duration: '1 week',
    price: { usd: 199, eth: 0.066, usdc: 199, nyax: 159 },
    features: ['1 week profile visibility', 'Enhanced profile placement', 'Social media eligibility'],
    decayHours: 168
  },
  growth: {
    id: 'growth',
    name: 'Growth Boost',
    basePoints: 500,
    duration: '2 weeks',
    price: { usd: 399, eth: 0.133, usdc: 399, nyax: 319 },
    features: ['2 weeks profile visibility', 'Premium profile placement', 'Social media priority', 'Cross-promotion eligibility'],
    decayHours: 336
  },
  pro: {
    id: 'pro',
    name: 'Pro Boost',
    basePoints: 1000,
    duration: '1 month',
    price: { usd: 599, eth: 0.2, usdc: 599, nyax: 479 },
    features: ['1 month profile visibility', 'Featured profile placement', 'Premium social media priority', 'Cross-promotion eligibility', 'Priority support'],
    decayHours: 720
  },
  elite: {
    id: 'elite',
    name: 'Elite Boost',
    basePoints: 5000,
    duration: '3 months',
    price: { usd: 2999, eth: 1.0, usdc: 2999, nyax: 2399 },
    features: ['3 months profile visibility', 'Premium featured placement', 'Maximum social media priority', 'Guaranteed cross-promotion', 'Podcast appearance opportunity', 'Dedicated account manager'],
    decayHours: 2160
  }
};

export async function POST(req: NextRequest) {
  try {
    const { profileAddress, boostPackType, transactionHash, walletAddress } = await req.json();

    if (!profileAddress || !boostPackType || !transactionHash || !walletAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const boostPack = PROFILE_BOOST_PACKS[boostPackType];
    if (!boostPack) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid boost pack type' 
      }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (boostPack.decayHours * 60 * 60 * 1000));
    const decayRate = boostPack.basePoints / boostPack.decayHours; // Points lost per hour

    const profileBoost: ProfileBoost = {
      id: `profile_boost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      profileAddress,
      points: boostPack.basePoints,
      originalPoints: boostPack.basePoints,
      createdAt: now,
      expiresAt,
      decayRate,
      isActive: true,
      transactionHash,
      boostPackType: boostPack.id,
      walletAddress
    };

    // Store in database
    const profileBoostCollection = await getCollection<ProfileBoost>('profile_boosts');
    await profileBoostCollection.insertOne(profileBoost);

    // Update profile leaderboard
    await updateProfileLeaderboard(profileAddress);

    return NextResponse.json({
      success: true,
      profileBoost,
      message: `${boostPack.name} activated! ${boostPack.basePoints} points added to profile.`
    });

  } catch (error) {
    console.error('Error creating profile boost:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileAddress = searchParams.get('profileAddress');

    if (!profileAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile address is required' 
      }, { status: 400 });
    }

    const profileBoostCollection = await getCollection<ProfileBoost>('profile_boosts');
    
    // Get active boosts for the profile
    const activeBoosts = await profileBoostCollection.find({
      profileAddress,
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
      boostPacks: PROFILE_BOOST_PACKS
    });

  } catch (error) {
    console.error('Error fetching profile boosts:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function updateProfileLeaderboard(profileAddress: string) {
  // This would trigger a profile leaderboard recalculation
  // Implementation depends on your profile leaderboard storage strategy
  console.log(`Updating profile leaderboard for: ${profileAddress}`);
}
