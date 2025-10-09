import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
import { getDb } from '@/lib/mongodb';

const dataPath = (file: string) => path.join(process.cwd(), 'src', 'app', 'data', file);

export async function GET() {
  const c = await cookies();
  if (c.get('admin_auth')?.value !== '1')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Load local JSON resources (best-effort)
  const readJson = async (file: string) => {
    try {
      const content = await fs.readFile(dataPath(file), 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  };

  const [profiles, onchainOrders, campaigns] = await Promise.all([
    readJson('admin-profiles.json'),
    readJson('admin-onchain-orders.json'),
    readJson('admin-campaigns.json'),
  ]);

  // Get analytics data from MongoDB
  let analyticsData = null;
  try {
    const db = await getDb();
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get online users count
    const onlineUsers = await db.collection('user_sessions').countDocuments({
      isActive: true,
      lastActivity: { $gte: fiveMinutesAgo }
    });

    // Get today's page views
    const todayPageViews = await db.collection('page_visits').countDocuments({
      timestamp: { $gte: oneDayAgo }
    });

    // Get unique visitors today
    const todayUniqueVisitors = (await db.collection('page_visits').distinct('ipAddress', {
      timestamp: { $gte: oneDayAgo }
    })).length;

    // Get wallet connections this week
    const weeklyWalletConnections = await db.collection('wallet_connections').countDocuments({
      timestamp: { $gte: oneWeekAgo }
    });

    analyticsData = {
      onlineUsers,
      todayPageViews,
      todayUniqueVisitors,
      weeklyWalletConnections
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    analyticsData = {
      onlineUsers: 0,
      todayPageViews: 0,
      todayUniqueVisitors: 0,
      weeklyWalletConnections: 0
    };
  }

  const result = {
    profiles: {
      count: Array.isArray(profiles) ? profiles.length : 0,
      active: Array.isArray(profiles)
        ? profiles.filter((p: any) => p.status === 'active').length
        : 0,
    },
    orders: {
      onchain: {
        count: Array.isArray(onchainOrders) ? onchainOrders.length : 0,
      },
    },
    campaigns: {
      count: Array.isArray(campaigns) ? campaigns.length : 0,
      active: Array.isArray(campaigns)
        ? campaigns.filter(
            (c: any) => new Date(c.startDate) <= new Date() && new Date(c.endDate) >= new Date()
          ).length
        : 0,
    },
    analytics: analyticsData,
  };

  return NextResponse.json({ data: result });
}
