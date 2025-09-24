import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { WeeklyWinner, SocialAnnouncement } from '@/types/gamification';

export async function POST(req: NextRequest) {
  try {
    // This endpoint would be called by a cron job weekly
    const winnersCollection = await getCollection<WeeklyWinner>('weekly_winners');
    const socialCollection = await getCollection<SocialAnnouncement>('social_announcements');
    
    const now = new Date();
    const lastWeekStart = getWeekStart(new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)));
    const lastWeekEnd = getWeekEnd(lastWeekStart);

    // Check if winner already exists for last week
    const existingWinner = await winnersCollection.findOne({
      weekStartDate: lastWeekStart,
      weekEndDate: lastWeekEnd
    });

    if (existingWinner) {
      return NextResponse.json({
        success: false,
        message: 'Weekly winner already determined for this period'
      });
    }

    // Get leaderboard for last week to determine winner
    const leaderboardResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gamification/leaderboard?timeframe=weekly&limit=1`);
    const leaderboardData = await leaderboardResponse.json();

    if (!leaderboardData.success || leaderboardData.leaderboard.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No eligible tokens for weekly winner'
      });
    }

    const winner = leaderboardData.leaderboard[0];

    // Create weekly winner record
    const weeklyWinner: WeeklyWinner = {
      id: `winner_${lastWeekStart.getTime()}_${winner.tokenId}`,
      tokenId: winner.tokenId,
      tokenName: winner.tokenName,
      tokenSymbol: winner.tokenSymbol,
      tokenLogo: winner.tokenLogo,
      weekStartDate: lastWeekStart,
      weekEndDate: lastWeekEnd,
      totalPoints: winner.weeklyPoints,
      crownBadgeAwarded: true,
      socialAnnouncementSent: false,
      crossPromotionActive: false
    };

    await winnersCollection.insertOne(weeklyWinner);

    // Schedule social media announcements
    const twitterAnnouncement: SocialAnnouncement = {
      id: `twitter_${weeklyWinner.id}`,
      tokenId: winner.tokenId,
      platform: 'twitter',
      message: `🏆 WEEKLY RACE WINNER! 🏆\n\n${winner.tokenName} ($${winner.tokenSymbol}) dominated this week with ${winner.weeklyPoints} points!\n\n👑 Crown Badge awarded\n🚀 Featured promotion incoming\n\n#RaceToLiberty #NYALTX #Crypto`,
      scheduledAt: new Date(now.getTime() + (5 * 60 * 1000)), // 5 minutes from now
      status: 'pending'
    };

    const telegramAnnouncement: SocialAnnouncement = {
      id: `telegram_${weeklyWinner.id}`,
      tokenId: winner.tokenId,
      platform: 'telegram',
      message: `🏆 WEEKLY RACE WINNER!\n\n${winner.tokenName} ($${winner.tokenSymbol}) is this week's champion with ${winner.weeklyPoints} points!\n\n👑 Crown Badge awarded forever\n🎯 Featured in upcoming promotions\n\nJoin the race: nyaltx.com/pricing`,
      scheduledAt: new Date(now.getTime() + (10 * 60 * 1000)), // 10 minutes from now
      status: 'pending'
    };

    await socialCollection.insertMany([twitterAnnouncement, telegramAnnouncement]);

    return NextResponse.json({
      success: true,
      weeklyWinner,
      socialAnnouncements: [twitterAnnouncement, telegramAnnouncement],
      message: `${winner.tokenName} crowned weekly winner!`
    });

  } catch (error) {
    console.error('Error determining weekly winner:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const winnersCollection = await getCollection<WeeklyWinner>('weekly_winners');
    
    const winners = await winnersCollection
      .find({})
      .sort({ weekStartDate: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      winners,
      count: winners.length
    });

  } catch (error) {
    console.error('Error fetching weekly winners:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function getWeekEnd(weekStart: Date): Date {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return weekEnd;
}
