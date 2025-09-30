import { NextRequest, NextResponse } from 'next/server';

interface StreamParams {
  params: Promise<{
    streamId: string;
  }>;
}

// Mock stream storage - in production, use database
const mockStreams = new Map();

export async function GET(request: NextRequest, { params }: StreamParams) {
  try {
    const { streamId } = await params;
    
    if (!streamId) {
      return NextResponse.json(
        { error: 'Stream ID is required' },
        { status: 400 }
      );
    }
    
    // In production, fetch from database
    const stream = mockStreams.get(streamId);
    
    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ stream });
    
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: StreamParams) {
  try {
    const { streamId } = await params;
    const body = await request.json();
    
    if (!streamId) {
      return NextResponse.json(
        { error: 'Stream ID is required' },
        { status: 400 }
      );
    }
    
    // In production, fetch from database
    const existingStream = mockStreams.get(streamId);
    
    if (!existingStream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }
    
    // Update stream data
    const updatedStream = {
      ...existingStream,
      ...body,
      id: streamId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    // In production, save to database
    mockStreams.set(streamId, updatedStream);
    
    return NextResponse.json({
      success: true,
      stream: updatedStream
    });
    
  } catch (error) {
    console.error('Error updating stream:', error);
    return NextResponse.json(
      { error: 'Failed to update stream' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: StreamParams) {
  try {
    const { streamId } = await params;
    
    if (!streamId) {
      return NextResponse.json(
        { error: 'Stream ID is required' },
        { status: 400 }
      );
    }
    
    // In production, fetch from database first
    const stream = mockStreams.get(streamId);
    
    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }
    
    // Mark stream as ended
    const endedStream = {
      ...stream,
      isLive: false,
      endedAt: new Date().toISOString()
    };
    
    // In production, update database
    mockStreams.set(streamId, endedStream);
    
    // Schedule stream deletion after 5 minutes (cleanup)
    setTimeout(() => {
      mockStreams.delete(streamId);
      console.log(`Stream ${streamId} deleted from storage`);
    }, 5 * 60 * 1000);
    
    return NextResponse.json({
      success: true,
      message: 'Stream ended successfully',
      stream: endedStream
    });
    
  } catch (error) {
    console.error('Error ending stream:', error);
    return NextResponse.json(
      { error: 'Failed to end stream' },
      { status: 500 }
    );
  }
}
