import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const c = await cookies();
    if (c.get('admin_auth')?.value !== '1') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Online users (active in last 5 minutes)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const onlineUsers = await db.collection('user_sessions').countDocuments({
      isActive: true,
      lastActivity: { $gte: fiveMinutesAgo }
    });

    // Recent visitors (last 24 hours) with enhanced data
    const recentVisitors = await db.collection('user_sessions').find({
      createdAt: { $gte: oneDayAgo }
    }).sort({ createdAt: -1 }).limit(50).toArray();
    
    // Device and browser statistics (last 7 days)
    const deviceStats = await db.collection('page_visits').aggregate([
      {
        $match: {
          timestamp: { $gte: oneWeekAgo },
          deviceType: { $ne: 'unknown' }
        }
      },
      {
        $group: {
          _id: '$deviceType',
          visits: { $sum: 1 },
          uniqueUsers: { $addToSet: '$ipAddress' }
        }
      },
      {
        $project: {
          deviceType: '$_id',
          visits: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { visits: -1 } }
    ]).toArray();

    // Traffic by country (last 7 days)
    const trafficByCountry = await db.collection('page_visits').aggregate([
      {
        $match: {
          timestamp: { $gte: oneWeekAgo },
          country: { $ne: 'Unknown' }
        }
      },
      {
        $group: {
          _id: '$country',
          visits: { $sum: 1 },
          uniqueIPs: { $addToSet: '$ipAddress' },
          countryCode: { $first: '$countryCode' }
        }
      },
      {
        $project: {
          country: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniqueIPs' },
          countryCode: 1
        }
      },
      { $sort: { visits: -1 } },
      { $limit: 20 }
    ]).toArray();

    // Browser statistics (last 7 days)
    const browserStats = await db.collection('page_visits').aggregate([
      {
        $match: {
          timestamp: { $gte: oneWeekAgo },
          browser: { $ne: 'Unknown' }
        }
      },
      {
        $group: {
          _id: '$browser',
          visits: { $sum: 1 },
          uniqueIPs: { $addToSet: '$ipAddress' }
        }
      },
      {
        $project: {
          browser: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniqueIPs' }
        }
      },
      { $sort: { visits: -1 } }
    ]).toArray();

    // Page views statistics
    const pageViews = {
      today: await db.collection('page_visits').countDocuments({
        timestamp: { $gte: oneDayAgo }
      }),
      thisWeek: await db.collection('page_visits').countDocuments({
        timestamp: { $gte: oneWeekAgo }
      }),
      thisMonth: await db.collection('page_visits').countDocuments({
        timestamp: { $gte: oneMonthAgo }
      })
    };

    // Unique visitors
    const uniqueVisitors = {
      today: (await db.collection('page_visits').distinct('ipAddress', {
        timestamp: { $gte: oneDayAgo }
      })).length,
      thisWeek: (await db.collection('page_visits').distinct('ipAddress', {
        timestamp: { $gte: oneWeekAgo }
      })).length,
      thisMonth: (await db.collection('page_visits').distinct('ipAddress', {
        timestamp: { $gte: oneMonthAgo }
      })).length
    };

    // Top pages (last 7 days)
    const topPages = await db.collection('page_visits').aggregate([
      {
        $match: {
          timestamp: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: '$page',
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' }
        }
      },
      {
        $project: {
          page: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { visits: -1 } },
      { $limit: 10 }
    ]).toArray();

    // Wallet connections statistics (last 7 days)
    const walletConnectionsStats = await db.collection('wallet_connections').aggregate([
      {
        $match: {
          timestamp: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: '$walletType',
          connections: { $sum: 1 },
          uniqueUsers: { $addToSet: '$fullWalletAddress' },
          countries: { $addToSet: '$country' },
          devices: { $addToSet: '$deviceType' }
        }
      },
      {
        $project: {
          walletType: '$_id',
          connections: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          countries: { $size: '$countries' },
          devices: 1
        }
      },
      { $sort: { connections: -1 } }
    ]).toArray();
    
    const totalWalletConnections = walletConnectionsStats.reduce((sum, wallet) => sum + wallet.connections, 0);

    // Hourly traffic pattern (last 24 hours)
    const hourlyTraffic = await db.collection('page_visits').aggregate([
      {
        $match: {
          timestamp: { $gte: oneDayAgo }
        }
      },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          visits: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]).toArray();

    // Format hourly traffic data
    const formattedHourlyTraffic = Array.from({ length: 24 }, (_, hour) => {
      const data = hourlyTraffic.find(h => h._id === hour);
      return {
        hour,
        visits: data ? data.visits : 0
      };
    });

    const analytics = {
      onlineUsers,
      recentVisitors: recentVisitors.map(visitor => ({
        sessionId: visitor.sessionId,
        ipAddress: visitor.ipAddress,
        country: visitor.country,
        region: visitor.region,
        city: visitor.city,
        createdAt: visitor.createdAt,
        lastActivity: visitor.lastActivity,
        walletAddress: visitor.walletAddress,
        walletType: visitor.walletType,
        isActive: visitor.isActive,
        deviceType: visitor.deviceType || 'unknown',
        browser: visitor.browser || 'unknown',
        browserVersion: visitor.browserVersion || 'unknown',
        pageViews: visitor.pageViews || 0,
        firstPage: visitor.firstPage || '/',
        language: visitor.language || 'unknown'
      })),
      trafficByCountry,
      browserStats,
      pageViews,
      uniqueVisitors,
      topPages,
      walletConnections: totalWalletConnections,
      walletConnectionsStats,
      deviceStats,
      hourlyTraffic: formattedHourlyTraffic
    };

    return NextResponse.json({ data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
