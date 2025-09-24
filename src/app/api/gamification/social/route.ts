import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { SocialAnnouncement } from '@/types/gamification';

export async function POST(req: NextRequest) {
  try {
    const { type, tokenId, customMessage } = await req.json();

    if (!tokenId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token ID is required' 
      }, { status: 400 });
    }

    const socialCollection = await getCollection<SocialAnnouncement>('social_announcements');
    const tokenCollection = await getCollection('token_registrations');

    // Get token details
    const token = await tokenCollection.findOne({ id: tokenId, status: 'approved' });
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token not found or not approved' 
      }, { status: 404 });
    }

    const now = new Date();
    const announcements: SocialAnnouncement[] = [];

    if (type === 'boost_activated' || type === 'weekly_winner') {
      // Twitter announcement
      const twitterMessage = customMessage || generateBoostMessage(token, 'twitter');
      const twitterAnnouncement: SocialAnnouncement = {
        id: `twitter_${type}_${tokenId}_${Date.now()}`,
        tokenId,
        platform: 'twitter',
        message: twitterMessage,
        scheduledAt: new Date(now.getTime() + (2 * 60 * 1000)), // 2 minutes delay
        status: 'pending'
      };

      // Telegram announcement
      const telegramMessage = customMessage || generateBoostMessage(token, 'telegram');
      const telegramAnnouncement: SocialAnnouncement = {
        id: `telegram_${type}_${tokenId}_${Date.now()}`,
        tokenId,
        platform: 'telegram',
        message: telegramMessage,
        scheduledAt: new Date(now.getTime() + (5 * 60 * 1000)), // 5 minutes delay
        status: 'pending'
      };

      announcements.push(twitterAnnouncement, telegramAnnouncement);
    }

    if (announcements.length > 0) {
      await socialCollection.insertMany(announcements);
    }

    return NextResponse.json({
      success: true,
      announcements,
      message: `${announcements.length} social announcements scheduled`
    });

  } catch (error) {
    console.error('Error scheduling social announcements:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '20');

    const socialCollection = await getCollection<SocialAnnouncement>('social_announcements');
    
    const announcements = await socialCollection
      .find({ status })
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      announcements,
      count: announcements.length
    });

  } catch (error) {
    console.error('Error fetching social announcements:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Process pending announcements (would be called by cron job)
export async function PUT(req: NextRequest) {
  try {
    const socialCollection = await getCollection<SocialAnnouncement>('social_announcements');
    const now = new Date();

    // Get pending announcements that are ready to be sent
    const pendingAnnouncements = await socialCollection.find({
      status: 'pending',
      scheduledAt: { $lte: now }
    }).toArray();

    const results = [];

    for (const announcement of pendingAnnouncements) {
      try {
        // Here you would integrate with actual Twitter/Telegram APIs
        const success = await sendSocialAnnouncement(announcement);
        
        if (success) {
          await socialCollection.updateOne(
            { id: announcement.id },
            { 
              $set: { 
                status: 'sent', 
                sentAt: now,
                engagementMetrics: { views: 0, likes: 0, retweets: 0, replies: 0 }
              } 
            }
          );
          results.push({ id: announcement.id, status: 'sent' });
        } else {
          await socialCollection.updateOne(
            { id: announcement.id },
            { $set: { status: 'failed' } }
          );
          results.push({ id: announcement.id, status: 'failed' });
        }
      } catch (error) {
        console.error(`Error sending announcement ${announcement.id}:`, error);
        await socialCollection.updateOne(
          { id: announcement.id },
          { $set: { status: 'failed' } }
        );
        results.push({ id: announcement.id, status: 'failed', error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('Error processing social announcements:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateBoostMessage(token: any, platform: 'twitter' | 'telegram'): string {
  const baseMessage = platform === 'twitter' 
    ? `🚀 ${token.tokenName} ($${token.tokenSymbol}) just boosted their visibility in the Race to Liberty!\n\n🏁 Join the race and boost your token\n🏆 Compete for the weekly crown\n💎 NYAX holders get 20% off\n\n#RaceToLiberty #NYALTX #${token.tokenSymbol}`
    : `🚀 **BOOST ALERT!**\n\n${token.tokenName} ($${token.tokenSymbol}) just activated a boost in the Race to Liberty!\n\n🏁 Join the race: nyaltx.com/pricing\n🏆 Weekly winners get crown badges\n💎 Use NYAX for 20% discount\n\n#RaceToLiberty #NYALTX`;

  return baseMessage;
}

async function sendSocialAnnouncement(announcement: SocialAnnouncement): Promise<boolean> {
  // Mock implementation - replace with actual API calls
  console.log(`Sending ${announcement.platform} announcement:`, announcement.message);
  
  if (announcement.platform === 'twitter') {
    // Twitter API integration would go here
    // const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    // await twitterClient.v2.tweet(announcement.message);
    return true;
  } else if (announcement.platform === 'telegram') {
    // Telegram Bot API integration would go here
    // const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    // await telegramBot.sendMessage(process.env.TELEGRAM_CHANNEL_ID, announcement.message);
    return true;
  }

  return false;
}
