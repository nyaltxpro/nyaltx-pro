import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// Cleanup old analytics data to prevent database bloat
export async function POST() {
  try {
    const db = await getDb();
    
    // Define cleanup periods
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Cleanup old page visits (keep last 30 days)
    const pageVisitsDeleted = await db.collection('page_visits').deleteMany({
      timestamp: { $lt: thirtyDaysAgo }
    });

    // Cleanup old user sessions (keep last 7 days)
    const userSessionsDeleted = await db.collection('user_sessions').deleteMany({
      lastActivity: { $lt: sevenDaysAgo }
    });

    // Mark inactive sessions as offline (inactive for more than 1 day)
    const inactiveSessionsUpdated = await db.collection('user_sessions').updateMany(
      {
        lastActivity: { $lt: oneDayAgo },
        isActive: true
      },
      {
        $set: { isActive: false }
      }
    );

    // Cleanup old wallet connections (keep last 30 days)
    const walletConnectionsDeleted = await db.collection('wallet_connections').deleteMany({
      timestamp: { $lt: thirtyDaysAgo }
    });

    return NextResponse.json({
      success: true,
      message: 'Analytics cleanup completed',
      stats: {
        pageVisitsDeleted: pageVisitsDeleted.deletedCount,
        userSessionsDeleted: userSessionsDeleted.deletedCount,
        inactiveSessionsUpdated: inactiveSessionsUpdated.modifiedCount,
        walletConnectionsDeleted: walletConnectionsDeleted.deletedCount
      }
    });
  } catch (error) {
    console.error('Error cleaning up analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup analytics data' },
      { status: 500 }
    );
  }
}
