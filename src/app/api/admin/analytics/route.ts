import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getAdminFromRequest } from '@/lib/adminAuth';

export async function GET() {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) {
      console.log('Analytics API: No admin authentication found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Analytics API: Admin authenticated successfully');

    let db;
    try {
      db = await getDb();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return empty analytics data if database is not available
      return NextResponse.json({ 
        data: {
          onlineUsers: 0,
          recentVisitors: [],
          trafficByCountry: [],
          browserStats: [],
          deviceStats: [],
          pageViews: { today: 0, thisWeek: 0, thisMonth: 0 },
          uniqueVisitors: { today: 0, thisWeek: 0, thisMonth: 0 },
          topPages: [],
          walletConnections: 0,
          walletConnectionsStats: [],
          hourlyTraffic: Array.from({ length: 24 }, (_, hour) => ({ hour, visits: 0 }))
        }
      });
    }
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Online users (active in last 5 minutes)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    let onlineUsers = 0;
    try {
      onlineUsers = await db.collection('user_sessions').countDocuments({
        isActive: true,
        lastActivity: { $gte: fiveMinutesAgo }
      });
    } catch (error) {
      console.warn('Error fetching online users:', error);
    }

    // Recent visitors (last 24 hours) with enhanced data
    let recentVisitors: any[] = [];
    try {
      recentVisitors = await db.collection('user_sessions').find({
        createdAt: { $gte: oneDayAgo }
      }).sort({ createdAt: -1 }).limit(50).toArray();
    } catch (error) {
      console.warn('Error fetching recent visitors:', error);
    }
    
    // Device and browser statistics (last 7 days)
    let deviceStats: any[] = [];
    try {
      deviceStats = await db.collection('page_visits').aggregate([
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
    } catch (error) {
      console.warn('Error fetching device stats:', error);
    }

    // Traffic by country (last 7 days)
    let trafficByCountry: any[] = [];
    try {
      trafficByCountry = await db.collection('page_visits').aggregate([
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
    } catch (error) {
      console.warn('Error fetching traffic by country:', error);
    }

    // Browser statistics (last 7 days)
    let browserStats: any[] = [];
    try {
      browserStats = await db.collection('page_visits').aggregate([
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
    } catch (error) {
      console.warn('Error fetching browser stats:', error);
    }

    // Page views statistics
    let pageViews = { today: 0, thisWeek: 0, thisMonth: 0 };
    try {
      pageViews = {
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
    } catch (error) {
      console.warn('Error fetching page views:', error);
    }

    // Unique visitors
    let uniqueVisitors = { today: 0, thisWeek: 0, thisMonth: 0 };
    try {
      uniqueVisitors = {
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
    } catch (error) {
      console.warn('Error fetching unique visitors:', error);
    }

    // Top pages (last 7 days)
    let topPages: any[] = [];
    try {
      topPages = await db.collection('page_visits').aggregate([
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
    } catch (error) {
      console.warn('Error fetching top pages:', error);
    }

    // Wallet connections statistics (last 7 days)
    let walletConnectionsStats: any[] = [];
    try {
      walletConnectionsStats = await db.collection('wallet_connections').aggregate([
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
    } catch (error) {
      console.warn('Error fetching wallet connections:', error);
    }
    
    const totalWalletConnections = walletConnectionsStats.reduce((sum, wallet) => sum + wallet.connections, 0);

    // Hourly traffic pattern (last 24 hours)
    let hourlyTraffic: any[] = [];
    try {
      hourlyTraffic = await db.collection('page_visits').aggregate([
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
    } catch (error) {
      console.warn('Error fetching hourly traffic:', error);
    }

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
