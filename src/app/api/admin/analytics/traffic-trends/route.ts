import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getAdminFromRequest } from '@/lib/adminAuth';

export async function GET(request: Request) {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) {
      console.log('Traffic Trends API: No admin authentication found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    let db;
    try {
      db = await getDb();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        data: {
          trends: [],
          summary: { totalVisits: 0, totalVisitors: 0, avgVisitsPerDay: 0, avgVisitorsPerDay: 0 }
        }
      });
    }

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get daily aggregated data
    try {
      const dailyData = await db.collection('page_visits').aggregate([
        {
          $match: {
            timestamp: { $gte: startDate }
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

      // Create a map for quick lookup
      const dataMap = new Map(dailyData.map(d => [d.date, d]));

      // Fill in all dates including those with zero traffic
      const trends = [];
      let totalVisits = 0;
      let totalVisitors = 0;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split('T')[0];
        
        const data = dataMap.get(dateStr);
        const visits = data?.visits || 0;
        const visitors = data?.visitors || 0;

        totalVisits += visits;
        totalVisitors += visitors;

        trends.push({
          date: dateStr,
          displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          visits,
          visitors
        });
      }

      const summary = {
        totalVisits,
        totalVisitors,
        avgVisitsPerDay: days > 0 ? Math.round(totalVisits / days) : 0,
        avgVisitorsPerDay: days > 0 ? Math.round(totalVisitors / days) : 0
      };

      return NextResponse.json({ 
        data: { trends, summary }
      });
    } catch (error) {
      console.warn('Error fetching traffic trends:', error);
      return NextResponse.json({ 
        data: {
          trends: [],
          summary: { totalVisits: 0, totalVisitors: 0, avgVisitsPerDay: 0, avgVisitorsPerDay: 0 }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching traffic trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traffic trends data' },
      { status: 500 }
    );
  }
}
