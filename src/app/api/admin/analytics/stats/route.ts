import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

interface AnalyticsData {
  onlineUsers: any[];
  recentVisitors: any[];
  trafficByCountry: any[];
  searchEngines: any[];
  browsers: any[];
  walletConnections: any[];
  totalHits: number;
  todayHits: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export async function GET() {
  try {
    const db = await getDb();
    
    // Get current timestamp for today's calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Online Users (active in last 5 minutes)
    const onlineUsers = await db.collection('user_sessions').find({
      lastActivity: { $gte: fiveMinutesAgo },
      isActive: true
    }).toArray();

    // Recent Visitors (last 50 visitors)
    const recentVisitors = await db.collection('page_visits').find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    // Traffic by Country
    const trafficByCountryPipeline = [
      {
        $group: {
          _id: { country: '$country', countryCode: '$countryCode' },
          visitors: { $sum: 1 }
        }
      },
      {
        $sort: { visitors: -1 }
      },
      {
        $limit: 10
      }
    ];
    
    const trafficByCountryRaw = await db.collection('page_visits').aggregate(trafficByCountryPipeline).toArray();
    const totalTraffic = trafficByCountryRaw.reduce((sum, item) => sum + item.visitors, 0);
    
    const trafficByCountry = trafficByCountryRaw.map(item => ({
      country: item._id.country,
      countryCode: item._id.countryCode,
      visitors: item.visitors,
      percentage: totalTraffic > 0 ? (item.visitors / totalTraffic) * 100 : 0
    }));

    // Search Engines
    const searchEnginesPipeline = [
      {
        $match: {
          referrer: { $regex: /(google|bing|yahoo|duckduckgo|baidu)/i }
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $regexMatch: { input: '$referrer', regex: /google/i } }, 'Google',
              {
                $cond: [
                  { $regexMatch: { input: '$referrer', regex: /bing/i } }, 'Bing',
                  {
                    $cond: [
                      { $regexMatch: { input: '$referrer', regex: /yahoo/i } }, 'Yahoo',
                      {
                        $cond: [
                          { $regexMatch: { input: '$referrer', regex: /duckduckgo/i } }, 'DuckDuckGo',
                          'Other'
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          visits: { $sum: 1 }
        }
      },
      {
        $sort: { visits: -1 }
      }
    ];

    const searchEnginesRaw = await db.collection('page_visits').aggregate(searchEnginesPipeline).toArray();
    const totalSearchTraffic = searchEnginesRaw.reduce((sum, item) => sum + item.visits, 0);
    
    const searchEngines = searchEnginesRaw.map(item => ({
      engine: item._id,
      visits: item.visits,
      percentage: totalSearchTraffic > 0 ? (item.visits / totalSearchTraffic) * 100 : 0
    }));

    // Browser Analytics
    const browsersPipeline = [
      {
        $group: {
          _id: { browser: '$browser', version: '$browserVersion' },
          visits: { $sum: 1 }
        }
      },
      {
        $sort: { visits: -1 }
      },
      {
        $limit: 10
      }
    ];

    const browsersRaw = await db.collection('page_visits').aggregate(browsersPipeline).toArray();
    const totalBrowserVisits = browsersRaw.reduce((sum, item) => sum + item.visits, 0);
    
    const browsers = browsersRaw.map(item => ({
      browser: item._id.browser,
      version: item._id.version,
      visits: item.visits,
      percentage: totalBrowserVisits > 0 ? (item.visits / totalBrowserVisits) * 100 : 0
    }));

    // Wallet Connections
    const walletConnectionsPipeline = [
      {
        $group: {
          _id: '$walletType',
          connections: { $sum: 1 },
          uniqueUsers: { $addToSet: '$walletAddress' }
        }
      },
      {
        $project: {
          walletType: '$_id',
          connections: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      {
        $sort: { connections: -1 }
      }
    ];

    const walletConnections = await db.collection('wallet_connections').aggregate(walletConnectionsPipeline).toArray();

    // Total Statistics
    const totalHits = await db.collection('page_visits').countDocuments();
    const todayHits = await db.collection('page_visits').countDocuments({
      timestamp: { $gte: today }
    });

    const uniqueVisitors = await db.collection('page_visits').distinct('ipAddress').then(ips => ips.length);
    const pageViews = await db.collection('page_visits').countDocuments();

    // Calculate bounce rate (sessions with only 1 page view)
    const sessionsPipeline = [
      {
        $group: {
          _id: '$sessionId',
          pageViews: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          bouncedSessions: {
            $sum: {
              $cond: [{ $eq: ['$pageViews', 1] }, 1, 0]
            }
          }
        }
      }
    ];

    const bounceData = await db.collection('page_visits').aggregate(sessionsPipeline).toArray();
    const bounceRate = bounceData.length > 0 && bounceData[0].totalSessions > 0 
      ? (bounceData[0].bouncedSessions / bounceData[0].totalSessions) * 100 
      : 0;

    // Calculate average session duration
    const sessionDurationPipeline = [
      {
        $group: {
          _id: '$sessionId',
          startTime: { $min: '$timestamp' },
          endTime: { $max: '$timestamp' }
        }
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ['$endTime', '$startTime'] },
              1000 // Convert to seconds
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ];

    const durationData = await db.collection('page_visits').aggregate(sessionDurationPipeline).toArray();
    const avgSessionDuration = durationData.length > 0 ? Math.round(durationData[0].avgDuration) : 0;

    const analyticsData: AnalyticsData = {
      onlineUsers: onlineUsers.map(user => ({
        id: user._id.toString(),
        walletAddress: user.walletAddress,
        ipAddress: user.ipAddress,
        region: user.region || 'Unknown',
        country: user.country || 'Unknown',
        lastSeen: user.lastActivity,
        userAgent: user.userAgent || 'Unknown'
      })),
      recentVisitors: recentVisitors.map(visitor => ({
        id: visitor._id.toString(),
        ipAddress: visitor.ipAddress,
        region: visitor.region || 'Unknown',
        country: visitor.country || 'Unknown',
        timestamp: visitor.timestamp,
        page: visitor.page,
        referrer: visitor.referrer,
        userAgent: visitor.userAgent || 'Unknown'
      })),
      trafficByCountry,
      searchEngines,
      browsers,
      walletConnections: walletConnections.map(wallet => ({
        walletType: wallet.walletType,
        connections: wallet.connections,
        uniqueUsers: wallet.uniqueUsers
      })),
      totalHits,
      todayHits,
      uniqueVisitors,
      pageViews,
      bounceRate,
      avgSessionDuration
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics stats' },
      { status: 500 }
    );
  }
}
