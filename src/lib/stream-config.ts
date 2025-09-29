import { StreamVideoClient, User } from '@stream-io/video-client';

// Stream.io configuration
export const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY || 'your-stream-api-key';
export const STREAM_API_SECRET = process.env.STREAM_API_SECRET || 'your-stream-api-secret';

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
  // In production, call your backend to generate a JWT token
  // For development, you can use Stream's token generator
  
  if (typeof window === 'undefined') {
    // Server-side token generation
    const { StreamChat } = await import('stream-chat');
    const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
    return serverClient.createToken(userId);
  }
  
  // Client-side fallback (development only)
  return 'development-token';
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
