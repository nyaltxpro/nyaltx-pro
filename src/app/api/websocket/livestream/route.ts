import { NextRequest, NextResponse } from 'next/server';

// Mock WebSocket server for build compatibility
// In production, you would use a separate WebSocket server or Socket.IO
interface StreamRoom {
  streamId: string;
  streamData: any;
  viewers: Set<string>;
  messages: any[];
  createdAt: number;
}

class LiveStreamManager {
  private streams = new Map<string, StreamRoom>();
  private static instance: LiveStreamManager;
  
  static getInstance() {
    if (!LiveStreamManager.instance) {
      LiveStreamManager.instance = new LiveStreamManager();
    }
    return LiveStreamManager.instance;
  }
  
  createStream(streamData: any) {
    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const stream: StreamRoom = {
      streamId,
      streamData: {
        ...streamData,
        id: streamId,
        isLive: true,
        viewerCount: 0,
        startedAt: new Date().toISOString()
      },
      viewers: new Set(),
      messages: [],
      createdAt: Date.now()
    };
    
    this.streams.set(streamId, stream);
    return stream;
  }
  
  getStream(streamId: string) {
    return this.streams.get(streamId);
  }
  
  endStream(streamId: string) {
    const stream = this.streams.get(streamId);
    if (stream) {
      stream.streamData.isLive = false;
      stream.streamData.endedAt = new Date().toISOString();
      
      // Schedule cleanup
      setTimeout(() => {
        this.streams.delete(streamId);
      }, 5 * 60 * 1000);
    }
    return stream;
  }
  
  getActiveStreams() {
    return Array.from(this.streams.values())
      .filter(stream => stream.streamData.isLive)
      .map(stream => stream.streamData);
  }
}

// Create singleton instance
const liveStreamManager = LiveStreamManager.getInstance();

// Handle HTTP upgrade to WebSocket
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'WebSocket endpoint for live streaming',
    status: 'available',
    activeStreams: liveStreamManager.getActiveStreams().length
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, streamData, streamId } = body;
    
    switch (action) {
      case 'create_stream':
        const newStream = liveStreamManager.createStream(streamData);
        return NextResponse.json({ success: true, stream: newStream.streamData });
        
      case 'end_stream':
        const endedStream = liveStreamManager.endStream(streamId);
        return NextResponse.json({ success: true, stream: endedStream?.streamData });
        
      case 'get_active_streams':
        const activeStreams = liveStreamManager.getActiveStreams();
        return NextResponse.json({ streams: activeStreams });
        
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('WebSocket API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
