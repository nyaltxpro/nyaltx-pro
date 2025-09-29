import { StreamVideoClient, User } from '@stream-io/video-client';

// Stream.io configuration
export const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY || 'rcjuja6eu7my';
export const STREAM_API_SECRET = process.env.STREAM_API_SECRET || 'eyre9m3xpkyrn6tgbt9t3656gg9enhw26ub7e8e7u5k4qbzjw7kg8qeswyav4zzg';

// Initialize Stream Video Client
export const createStreamClient = (user: User, token: string) => {
  return new StreamVideoClient({
    apiKey: STREAM_API_KEY,
    user,
    token,
  });
};

// Generate user token (in production, this should be done server-side)
export const generateUserToken = async (userId: string): Promise<string> => {
  try {
    // Call our API route to generate token server-side
    const response = await fetch('/api/stream-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Token generation failed: ${response.status}`);
    }

    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error('❌ Failed to generate Stream.io token:', error);
    
    // Fallback: Generate a basic development token
    if (typeof window === 'undefined') {
      // Server-side token generation using jwt
      const jwt = await import('jsonwebtoken');
      const payload = {
        user_id: userId,
        iss: 'stream-io',
        sub: 'user/' + userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
      };
      return jwt.sign(payload, STREAM_API_SECRET);
    }
    
    throw new Error('Token generation failed and no fallback available on client-side');
  }
};

// Stream call configuration
export const createCallConfig = () => ({
  video: {
    enabled: true,
    camera_default_on: true,
  },
  audio: {
    enabled: true,
    mic_default_on: true,
  },
  screenshare: {
    enabled: true,
  },
  recording: {
    enabled: false, // Can be enabled for stream recording
  },
});

// Call types
export const CALL_TYPES = {
  LIVESTREAM: 'livestream',
  DEFAULT: 'default',
} as const;
