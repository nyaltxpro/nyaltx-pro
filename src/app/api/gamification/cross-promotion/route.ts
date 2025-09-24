import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { CrossPromotion, WeeklyWinner } from '@/types/gamification';

export async function POST(req: NextRequest) {
  try {
    const { weeklyWinnerId, podcastEpisode, scheduledDate } = await req.json();

    if (!weeklyWinnerId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Weekly winner ID is required' 
      }, { status: 400 });
    }

    const winnersCollection = await getCollection<WeeklyWinner>('weekly_winners');
    const crossPromoCollection = await getCollection<CrossPromotion>('cross_promotions');

    // Get the weekly winner
    const winner = await winnersCollection.findOne({ id: weeklyWinnerId });
    if (!winner) {
      return NextResponse.json({ 
        success: false, 
        error: 'Weekly winner not found' 
      }, { status: 404 });
    }

    // Get top 3 from that week's leaderboard
    const leaderboardResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gamification/leaderboard?timeframe=weekly&limit=3`);
    const leaderboardData = await leaderboardResponse.json();

    if (!leaderboardData.success || leaderboardData.leaderboard.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No leaderboard data available'
      });
    }

    const topThree = leaderboardData.leaderboard;
    const crossPromotions: CrossPromotion[] = [];

    // Create cross-promotion entries for top 3
    topThree.forEach((entry: any, index: number) => {
      const tier = index === 0 ? 'top1' : index === 1 ? 'top2' : 'top3';
      const adSlot = index === 0 ? 'opening' : index === 1 ? 'mid-roll' : 'closing';

      const crossPromotion: CrossPromotion = {
        id: `promo_${weeklyWinnerId}_${entry.tokenId}_${tier}`,
        tokenId: entry.tokenId,
        weeklyWinnerId,
        podcastEpisode: podcastEpisode || `Episode ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
        adSlot,
        scheduledDate: new Date(scheduledDate || Date.now() + (7 * 24 * 60 * 60 * 1000)), // Default to next week
        status: 'scheduled',
        tier
      };

      crossPromotions.push(crossPromotion);
    });

    // Save cross-promotions
    if (crossPromotions.length > 0) {
      await crossPromoCollection.insertMany(crossPromotions);
    }

    // Update winner record to indicate cross-promotion is active
    await winnersCollection.updateOne(
      { id: weeklyWinnerId },
      { $set: { crossPromotionActive: true } }
    );

    return NextResponse.json({
      success: true,
      crossPromotions,
      message: `Cross-promotion scheduled for top ${crossPromotions.length} projects`
    });

  } catch (error) {
    console.error('Error creating cross-promotion:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status') || 'scheduled';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Validate status parameter
    const validStatuses: Array<'scheduled' | 'aired' | 'cancelled'> = ['scheduled', 'aired', 'cancelled'];
    const status = validStatuses.includes(statusParam as any) ? statusParam as 'scheduled' | 'aired' | 'cancelled' : 'scheduled';

    const crossPromoCollection = await getCollection<CrossPromotion>('cross_promotions');
    const tokenCollection = await getCollection('token_registrations');

    const crossPromotions = await crossPromoCollection
      .find({ status })
      .sort({ scheduledDate: -1 })
      .limit(limit)
      .toArray();

    // Enrich with token details
    const enrichedPromotions = await Promise.all(
      crossPromotions.map(async (promo) => {
        const token = await tokenCollection.findOne({ id: promo.tokenId });
        return {
          ...promo,
          tokenName: token?.tokenName || 'Unknown Token',
          tokenSymbol: token?.tokenSymbol || 'UNKNOWN',
          tokenLogo: token?.imageUri || '/crypto-icons/color/generic.svg'
        };
      })
    );

    return NextResponse.json({
      success: true,
      crossPromotions: enrichedPromotions,
      count: enrichedPromotions.length
    });

  } catch (error) {
    console.error('Error fetching cross-promotions:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Update cross-promotion status (mark as aired)
export async function PUT(req: NextRequest) {
  try {
    const { crossPromotionId, status: statusParam, engagementMetrics } = await req.json();

    if (!crossPromotionId || !statusParam) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cross-promotion ID and status are required' 
      }, { status: 400 });
    }

    // Validate status parameter
    const validStatuses: Array<'scheduled' | 'aired' | 'cancelled'> = ['scheduled', 'aired', 'cancelled'];
    if (!validStatuses.includes(statusParam)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid status. Must be one of: scheduled, aired, cancelled' 
      }, { status: 400 });
    }

    const status = statusParam as 'scheduled' | 'aired' | 'cancelled';
    const crossPromoCollection = await getCollection<CrossPromotion>('cross_promotions');

    const updateData: any = { status };
    if (engagementMetrics) {
      updateData.engagementMetrics = engagementMetrics;
    }

    const result = await crossPromoCollection.updateOne(
      { id: crossPromotionId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Cross-promotion not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Cross-promotion status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating cross-promotion:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
