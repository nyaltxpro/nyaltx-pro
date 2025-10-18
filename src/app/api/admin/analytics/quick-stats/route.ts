import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getAdminFromRequest } from '@/lib/adminAuth';

export async function GET() {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) {
      console.log('Quick Stats API: No admin authentication found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let db;
    try {
      db = await getDb();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        data: {
          onlineUsers: 0,
          today: { visitors: 0, visits: 0 },
          yesterday: { visitors: 0, visits: 0 },
          last7Days: { visitors: 0, visits: 0 },
          last30Days: { visitors: 0, visits: 0 },
          last365Days: { visitors: 0, visits: 0 },
          total: { visitors: 0, visits: 0 },
          dailyHits: []
        }
      });
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const yesterdayEnd = new Date(todayStart);
    
    const last7DaysStart = new Date(todayStart);
    last7DaysStart.setDate(last7DaysStart.getDate() - 7);
    
    const last30DaysStart = new Date(todayStart);
    last30DaysStart.setDate(last30DaysStart.getDate() - 30);
    
    const last365DaysStart = new Date(todayStart);
    last365DaysStart.setDate(last365DaysStart.getDate() - 365);
    
    const last10DaysStart = new Date(todayStart);
    last10DaysStart.setDate(last10DaysStart.getDate() - 10);

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

    // Helper function to get stats for a time period
    const getStatsForPeriod = async (startDate: Date, endDate?: Date) => {
      try {
        const query: any = { timestamp: { $gte: startDate } };
        if (endDate) {
          query.timestamp.$lt = endDate;
        }

        const visits = await db.collection('page_visits').countDocuments(query);
        const visitorIPs = await db.collection('page_visits').distinct('ipAddress', query);
        const visitors = visitorIPs.length;

        return { visitors, visits };
      } catch (error) {
        console.warn(`Error fetching stats for period:`, error);
        return { visitors: 0, visits: 0 };
      }
    };

    // Get stats for different time periods
    const today = await getStatsForPeriod(todayStart);
    const yesterday = await getStatsForPeriod(yesterdayStart, yesterdayEnd);
    const last7Days = await getStatsForPeriod(last7DaysStart);
    const last30Days = await getStatsForPeriod(last30DaysStart);
    const last365Days = await getStatsForPeriod(last365DaysStart);
    const total = await getStatsForPeriod(new Date(0)); // All time

    // Get daily hits for the last 10 days
    let dailyHits: Array<{ date: string; visitors: number; visits: number }> = [];
    try {
      const dailyData = await db.collection('page_visits').aggregate([
        {
          $match: {
            timestamp: { $gte: last10DaysStart }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            visits: { $sum: 1 },
            uniqueIPs: { $addToSet: '$ipAddress' }
          }
        },
        {
          $project: {
            date: '$_id',
            visits: 1,
            visitors: { $size: '$uniqueIPs' }
          }
        },
        { $sort: { date: 1 } }
      ]).toArray();

      // Fill in missing dates with zeros
      const dateMap = new Map(dailyData.map(d => [d.date, d]));
      for (let i = 9; i >= 0; i--) {
        const date = new Date(todayStart);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const data = dateMap.get(dateStr);
        dailyHits.push({
          date: dateStr,
          visitors: data?.visitors || 0,
          visits: data?.visits || 0
        });
      }
    } catch (error) {
      console.warn('Error fetching daily hits:', error);
    }

    const quickStats = {
      onlineUsers,
      today,
      yesterday,
      last7Days,
      last30Days,
      last365Days,
      total,
      dailyHits
    };

    return NextResponse.json({ data: quickStats });
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quick stats data' },
      { status: 500 }
    );
  }
}
