import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!STREAM_API_KEY || !STREAM_API_SECRET) {
      return NextResponse.json(
        { error: 'Stream.io API credentials not configured' },
        { status: 500 }
      );
    }

    // Generate JWT token for Stream.io
    const payload = {
      user_id: userId,
      iss: 'stream-io',
      sub: 'user/' + userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    };

    const token = jwt.sign(payload, STREAM_API_SECRET);

    console.log('✅ Generated Stream.io token for user:', userId);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('❌ Failed to generate Stream.io token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
