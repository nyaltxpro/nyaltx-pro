import { NextRequest, NextResponse } from 'next/server';

interface MessageParams {
  params: Promise<{
    streamId: string;
  }>;
}

// Mock message storage - in production, use database
const mockMessages = new Map<string, any[]>();

export async function GET(request: NextRequest, { params }: MessageParams) {
  try {
    const { streamId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!streamId) {
      return NextResponse.json(
        { error: 'Stream ID is required' },
        { status: 400 }
      );
    }
    
    // Get messages for stream
    const messages = mockMessages.get(streamId) || [];
    
    // Apply pagination
    const paginatedMessages = messages
      .slice(offset, offset + limit)
      .reverse(); // Most recent first
    
    return NextResponse.json({
      messages: paginatedMessages,
      total: messages.length,
      hasMore: offset + limit < messages.length
    });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: MessageParams) {
  try {
    const { streamId } = await params;
    const body = await request.json();
    const { userId, username, message, type = 'chat', amount, token } = body;
    
    if (!streamId) {
      return NextResponse.json(
        { error: 'Stream ID is required' },
        { status: 400 }
      );
    }
    
    if (!userId || !username || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, username, message' },
        { status: 400 }
      );
    }
    
    // Create new message
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streamId,
      userId,
      username,
      userAvatar: `/avatars/${userId.slice(2, 8)}.png`,
      message,
      timestamp: Date.now(),
      type,
      ...(amount && { amount }),
      ...(token && { token })
    };
    
    // Get existing messages or create new array
    const messages = mockMessages.get(streamId) || [];
    
    // Add new message
    messages.push(newMessage);
    
    // Keep only last 100 messages per stream
    if (messages.length > 100) {
      messages.splice(0, messages.length - 100);
    }
    
    // Update storage
    mockMessages.set(streamId, messages);
    
    return NextResponse.json({
      success: true,
      message: newMessage
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: MessageParams) {
  try {
    const { streamId } = await params;
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    
    if (!streamId) {
      return NextResponse.json(
        { error: 'Stream ID is required' },
        { status: 400 }
      );
    }
    
    const messages = mockMessages.get(streamId) || [];
    
    if (messageId) {
      // Delete specific message
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex === -1) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }
      
      messages.splice(messageIndex, 1);
      mockMessages.set(streamId, messages);
      
      return NextResponse.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } else {
      // Clear all messages for stream
      mockMessages.delete(streamId);
      
      return NextResponse.json({
        success: true,
        message: 'All messages cleared successfully'
      });
    }
    
  } catch (error) {
    console.error('Error deleting messages:', error);
    return NextResponse.json(
      { error: 'Failed to delete messages' },
      { status: 500 }
    );
  }
}
