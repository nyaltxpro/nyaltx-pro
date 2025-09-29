# Stream.io Environment Setup

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Stream.io Configuration
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key_here
STREAM_API_SECRET=your_stream_api_secret_here
```

## Getting Stream.io API Keys

1. **Sign up for Stream.io**:
   - Go to [getstream.io](https://getstream.io/)
   - Create a free account
   - Navigate to your dashboard

2. **Create a Video App**:
   - In the Stream dashboard, create a new Video application
   - Choose the "Video Calling & Livestreaming" product
   - Copy your API Key and Secret

3. **Configure Environment**:
   - Add the API key to `NEXT_PUBLIC_STREAM_API_KEY`
   - Add the secret to `STREAM_API_SECRET` (server-side only)

## Stream.io Features Enabled

### ✅ Live Streaming
- **Professional Quality**: HD video streaming with adaptive bitrate
- **Low Latency**: Sub-second latency for real-time interaction
- **Scalable**: Handles thousands of concurrent viewers
- **Global CDN**: Worldwide content delivery network

### ✅ Video Calling
- **WebRTC**: Direct peer-to-peer connections
- **Screen Sharing**: Built-in screen sharing capabilities
- **Camera Controls**: Toggle camera/microphone
- **Recording**: Optional stream recording

### ✅ Chat Integration
- **Real-time Chat**: Built-in messaging system
- **Moderation**: Chat moderation tools
- **Reactions**: Emoji reactions and interactions
- **User Management**: Participant management

### ✅ Advanced Features
- **Analytics**: Stream performance metrics
- **Authentication**: JWT-based security
- **Webhooks**: Real-time event notifications
- **Mobile Support**: iOS and Android SDKs

## Pricing

Stream.io offers:
- **Free Tier**: 10,000 minutes/month
- **Growth Plan**: $99/month for 100,000 minutes
- **Enterprise**: Custom pricing for high-volume usage

## Security Notes

- Never expose your `STREAM_API_SECRET` in client-side code
- Use JWT tokens for user authentication
- Implement proper user validation in production
- Consider rate limiting for API calls

## Next Steps

1. Get your Stream.io API keys
2. Add them to your environment variables
3. Restart your development server
4. Test the streaming functionality

The Stream.io integration provides enterprise-grade streaming capabilities with minimal setup!
