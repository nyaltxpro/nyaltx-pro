import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage (use Redis in production)
let broadcasters: Record<string, { walletAddress?: string; streamTitle?: string; lastSeen: number }> = {};
let viewers: Record<string, { broadcasterId: string; walletAddress?: string; lastSeen: number }> = {};
let chatMessages: Record<string, Array<{ message: string; senderAddress: string; senderName: string; timestamp: number }>> = {};

// Cleanup old connections (older than 30 seconds)
const cleanupOldConnections = () => {
  const now = Date.now();
  const timeout = 30000; // 30 seconds

  // Cleanup broadcasters
  Object.keys(broadcasters).forEach(id => {
    if (now - broadcasters[id].lastSeen > timeout) {
      delete broadcasters[id];
      delete chatMessages[id]; // Also cleanup chat for this stream
    }
  });

  // Cleanup viewers
  Object.keys(viewers).forEach(id => {
    if (now - viewers[id].lastSeen > timeout) {
      delete viewers[id];
    }
  });
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  cleanupOldConnections();

  switch (action) {
    case 'active-streams':
      const activeStreams = Object.entries(broadcasters).map(([broadcasterId, broadcaster]) => ({
        broadcasterId,
        streamTitle: broadcaster.streamTitle,
        walletAddress: broadcaster.walletAddress,
        viewerCount: Object.values(viewers).filter(v => v.broadcasterId === broadcasterId).length
      }));
      
      return NextResponse.json({ streams: activeStreams });

    case 'chat':
      const broadcasterId = searchParams.get('broadcasterId');
      if (!broadcasterId) {
        return NextResponse.json({ error: 'Missing broadcasterId' }, { status: 400 });
      }
      
      const messages = chatMessages[broadcasterId] || [];
      return NextResponse.json({ messages });

    case 'heartbeat':
      const id = searchParams.get('id');
      const type = searchParams.get('type'); // 'broadcaster' or 'viewer'
      
      if (!id || !type) {
        return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
      }

      const now = Date.now();
      if (type === 'broadcaster' && broadcasters[id]) {
        broadcasters[id].lastSeen = now;
      } else if (type === 'viewer' && viewers[id]) {
        viewers[id].lastSeen = now;
      }
      
      return NextResponse.json({ success: true });

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  try {
    const body = await req.json();
    cleanupOldConnections();

    switch (action) {
      case 'broadcaster-join':
        const { broadcasterId, walletAddress, streamTitle } = body;
        if (!broadcasterId) {
          return NextResponse.json({ error: 'Missing broadcasterId' }, { status: 400 });
        }
        
        broadcasters[broadcasterId] = {
          walletAddress,
          streamTitle,
          lastSeen: Date.now()
        };
        
        // Initialize chat for this stream
        if (!chatMessages[broadcasterId]) {
          chatMessages[broadcasterId] = [];
        }
        
        return NextResponse.json({ success: true, broadcasterId });

      case 'viewer-join':
        const { viewerId, broadcasterId: viewerBroadcasterId, walletAddress: viewerWallet } = body;
        if (!viewerId || !viewerBroadcasterId) {
          return NextResponse.json({ error: 'Missing viewerId or broadcasterId' }, { status: 400 });
        }
        
        // Check if broadcaster exists
        if (!broadcasters[viewerBroadcasterId]) {
          return NextResponse.json({ error: 'Broadcaster not found' }, { status: 404 });
        }
        
        viewers[viewerId] = {
          broadcasterId: viewerBroadcasterId,
          walletAddress: viewerWallet,
          lastSeen: Date.now()
        };
        
        return NextResponse.json({ success: true, viewerId });

      case 'chat-message':
        const { broadcasterId: chatBroadcasterId, message, senderAddress, senderName } = body;
        if (!chatBroadcasterId || !message || !senderAddress) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        // Check if broadcaster exists
        if (!broadcasters[chatBroadcasterId]) {
          return NextResponse.json({ error: 'Broadcaster not found' }, { status: 404 });
        }
        
        if (!chatMessages[chatBroadcasterId]) {
          chatMessages[chatBroadcasterId] = [];
        }
        
        const chatMessage = {
          message,
          senderAddress,
          senderName: senderName || `${senderAddress.slice(0, 6)}...${senderAddress.slice(-4)}`,
          timestamp: Date.now()
        };
        
        chatMessages[chatBroadcasterId].push(chatMessage);
        
        // Keep only last 100 messages
        if (chatMessages[chatBroadcasterId].length > 100) {
          chatMessages[chatBroadcasterId] = chatMessages[chatBroadcasterId].slice(-100);
        }
        
        return NextResponse.json({ success: true, message: chatMessage });

      case 'stream-end':
        const { broadcasterId: endBroadcasterId } = body;
        if (!endBroadcasterId) {
          return NextResponse.json({ error: 'Missing broadcasterId' }, { status: 400 });
        }
        
        // Remove broadcaster and associated viewers
        delete broadcasters[endBroadcasterId];
        delete chatMessages[endBroadcasterId];
        
        // Remove viewers for this stream
        Object.keys(viewers).forEach(viewerId => {
          if (viewers[viewerId].broadcasterId === endBroadcasterId) {
            delete viewers[viewerId];
          }
        });
        
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
