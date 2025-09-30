import { NextRequest, NextResponse } from 'next/server';

// Mock active streams data - in production, this would come from your database
const mockActiveStreams = [
  {
    id: 'stream_1',
    title: 'Bitcoin Technical Analysis - Bull Run Incoming? 🚀',
    description: 'Deep dive into BTC charts and market analysis',
    streamerId: '0x1234...5678',
    streamerName: 'CryptoAnalyst',
    streamerAvatar: '/avatars/analyst.png',
    category: 'trading',
    isLive: true,
    viewerCount: 1247,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    tags: ['bitcoin', 'analysis', 'trading'],
    chatEnabled: true,
    donationsEnabled: true,
    thumbnail: '/api/placeholder/320/180'
  },
  {
    id: 'stream_2',
    title: 'DeFi Yield Farming Strategies for 2024',
    description: 'Learn the best yield farming protocols and strategies',
    streamerId: '0x9876...5432',
    streamerName: 'DeFiMaster',
    streamerAvatar: '/avatars/defi.png',
    category: 'education',
    isLive: true,
    viewerCount: 892,
    startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    tags: ['defi', 'yield', 'education'],
    chatEnabled: true,
    donationsEnabled: true,
    thumbnail: '/api/placeholder/320/180'
  },
  {
    id: 'stream_3',
    title: 'Live: Crypto Market News & Updates',
    description: 'Breaking news and market updates',
    streamerId: '0xabcd...efgh',
    streamerName: 'NewsTrader',
    streamerAvatar: '/avatars/news.png',
    category: 'news',
    isLive: true,
    viewerCount: 2156,
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    tags: ['news', 'market', 'updates'],
    chatEnabled: true,
    donationsEnabled: true,
    thumbnail: '/api/placeholder/320/180'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    let streams = [...mockActiveStreams];
    
    // Filter by category if specified
    if (category && category !== 'all') {
      streams = streams.filter(stream => stream.category === category);
    }
    
    // Limit results
    streams = streams.slice(0, limit);
    
    // Add some randomization to viewer counts for demo
    streams = streams.map(stream => ({
      ...stream,
      viewerCount: stream.viewerCount + Math.floor(Math.random() * 100) - 50
    }));
    
    return NextResponse.json({
      streams,
      total: streams.length,
      totalViewers: streams.reduce((sum, stream) => sum + stream.viewerCount, 0)
    });
    
  } catch (error) {
    console.error('Error fetching active streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active streams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      category, 
      streamerId, 
      streamerName,
      tags = [],
      chatEnabled = true,
      donationsEnabled = true 
    } = body;
    
    // Validate required fields
    if (!title || !streamerId || !streamerName) {
      return NextResponse.json(
        { error: 'Missing required fields: title, streamerId, streamerName' },
        { status: 400 }
      );
    }
    
    // Create new stream
    const newStream = {
      id: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: description || '',
      streamerId,
      streamerName,
      streamerAvatar: `/avatars/${streamerId.slice(2, 8)}.png`,
      category: category || 'other',
      isLive: true,
      viewerCount: 0,
      startedAt: new Date().toISOString(),
      tags: Array.isArray(tags) ? tags : [],
      chatEnabled,
      donationsEnabled,
      thumbnail: '/api/placeholder/320/180'
    };
    
    // In production, save to database
    mockActiveStreams.push(newStream);
    
    return NextResponse.json({
      success: true,
      stream: newStream
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating stream:', error);
    return NextResponse.json(
      { error: 'Failed to create stream' },
      { status: 500 }
    );
  }
}
