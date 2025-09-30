import { StreamVideoClient, Call, User } from '@stream-io/video-client';
import { StreamChat, Channel, ChannelData } from 'stream-chat';
import { createStreamClient, generateUserToken, CALL_TYPES } from '@/lib/stream-config';

export interface StreamUser {
  id: string;
  name: string;
  walletAddress: string;
  image?: string;
}

export interface LiveStream {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  hostWallet: string;
  viewerCount: number;
  isLive: boolean;
  createdAt: Date;
  chatChannelId?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
    image?: string;
    walletAddress?: string;
  };
  created_at: Date;
  type?: 'regular' | 'system' | 'donation';
  amount?: number;
  token?: string;
}

export class StreamIOService {
  private client: StreamVideoClient | null = null;
  private chatClient: StreamChat | null = null;
  private currentCall: Call | null = null;
  private currentChannel: Channel | null = null;
  private user: StreamUser | null = null;

  // Initialize the service with user credentials
  async initialize(user: StreamUser): Promise<void> {
    try {
      console.log('🔌 Initializing Stream.io service for user:', user.id);
      
      const streamUser: User = {
        id: user.id,
        name: user.name,
        image: user.image,
        custom: {
          walletAddress: user.walletAddress,
        },
      };

      // Generate user token (in production, get this from your backend)
      const token = await generateUserToken(user.id);
      
      // Create Stream Video client
      this.client = createStreamClient(streamUser, token);
      
      // Create Stream Chat client
      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      if (!apiKey) {
        throw new Error('Stream API key not found');
      }
      
      this.chatClient = StreamChat.getInstance(apiKey);
      await this.chatClient.connectUser(streamUser, token);
      
      this.user = user;
      
      console.log('✅ Stream.io video and chat clients initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Stream.io service:', error);
      throw error;
    }
  }

  // Start a live stream as broadcaster
  async startLiveStream(streamTitle: string): Promise<{ callId: string; call: Call; chatChannel: Channel }> {
    if (!this.client || !this.chatClient || !this.user) {
      throw new Error('Stream.io service not initialized');
    }

    try {
      console.log('🎥 Starting live stream:', streamTitle);
      
      // Generate unique call ID (max 64 chars for Stream.io)
      // Format: "live_" (5) + shortWallet (12) + "_" (1) + timestamp (13) = 31 chars
      const shortWallet = this.user.id.length > 12 
        ? `${this.user.id.slice(0, 8)}${this.user.id.slice(-4)}`
        : this.user.id;
      const callId = `live_${shortWallet}_${Date.now()}`;
      
      console.log(`📏 Generated call ID: ${callId} (${callId.length} chars)`);
      if (callId.length > 64) {
        throw new Error(`Call ID too long: ${callId.length} chars (max 64)`);
      }
      
      // Create a livestream call (use 'default' type for better compatibility)
      const call = this.client.call(CALL_TYPES.DEFAULT, callId);
      
      // Join the call as host with public access
      await call.join({
        create: true,
        data: {
          custom: {
            title: streamTitle,
            hostWallet: this.user.walletAddress,
            isLiveStream: true, // Flag to identify our streams
          },
          members: [
            {
              user_id: this.user.id,
              role: 'host',
            },
          ],
        },
      });

      // Set additional call metadata after creation
      try {
        await call.update({
          custom: {
            title: streamTitle,
            hostWallet: this.user.walletAddress,
            isLiveStream: true,
          },
        });
        console.log('✅ Updated call metadata successfully');
      } catch (updateError) {
        console.warn('⚠️ Failed to update call metadata:', updateError);
      }

      // Create chat channel for the stream
      const chatChannelId = `livestream-${callId}`;
      const chatChannel = this.chatClient.channel('livestream', chatChannelId, {
        created_by_id: this.user.id,
        members: [this.user.id],
      });
      
      await chatChannel.create();
      
      this.currentCall = call;
      this.currentChannel = chatChannel;
      
      console.log('✅ Live stream and chat started successfully:', callId);
      return { callId, call, chatChannel };
    } catch (error) {
      console.error('❌ Failed to start live stream:', error);
      throw error;
    }
  }

  // Join a live stream as viewer
  async joinLiveStream(callId: string): Promise<{ call: Call; chatChannel: Channel }> {
    if (!this.client || !this.chatClient || !this.user) {
      throw new Error('Stream.io service not initialized');
    }

    try {
      console.log('👀 Joining live stream:', callId);
      
      // Get the call (use same type as broadcaster)
      const call = this.client.call(CALL_TYPES.DEFAULT, callId);
      
      // Join as viewer with minimal configuration
      await call.join({
        create: false,
      });
      
      // Join the chat channel
      const chatChannelId = `livestream-${callId}`;
      const chatChannel = this.chatClient.channel('livestream', chatChannelId);
      await chatChannel.watch();
      
      this.currentCall = call;
      this.currentChannel = chatChannel;
      
      console.log('✅ Joined live stream and chat successfully');
      return { call, chatChannel };
    } catch (error) {
      console.error('❌ Failed to join live stream:', error);
      
      // If join failed, try with explicit member addition
      try {
        console.log('🔄 Retrying join with member addition...');
        const call = this.client.call(CALL_TYPES.DEFAULT, callId);
        await call.join({
          create: false,
          data: {
            members: [
              {
                user_id: this.user.id,
                role: 'viewer',
              },
            ],
          },
        });
        
        // Join the chat channel for retry case too
        const chatChannelId = `livestream-${callId}`;
        const chatChannel = this.chatClient.channel('livestream', chatChannelId);
        await chatChannel.watch();
        
        this.currentCall = call;
        this.currentChannel = chatChannel;
        console.log('✅ Joined live stream and chat successfully (retry)');
        return { call, chatChannel };
      } catch (retryError) {
        console.error('❌ Retry also failed:', retryError);
        throw new Error('Failed to join stream. Stream may have ended or is not accessible.');
      }
    }
  }

  // End the current stream
  async endStream(): Promise<void> {
    if (!this.currentCall) {
      console.warn('⚠️ No active call to end');
      return;
    }

    try {
      console.log('🛑 Ending live stream...');
      
      await this.currentCall.leave();
      this.currentCall = null;
      
      // Stop watching the chat channel
      if (this.currentChannel) {
        await this.currentChannel.stopWatching();
        this.currentChannel = null;
      }
      
      console.log('✅ Live stream and chat ended successfully');
    } catch (error) {
      console.error('❌ Failed to end live stream:', error);
      throw error;
    }
  }

  // Chat functionality
  async sendChatMessage(text: string, type: 'regular' | 'system' | 'donation' = 'regular', metadata?: { amount?: number; token?: string }): Promise<void> {
    if (!this.currentChannel || !this.user) {
      throw new Error('No active chat channel or user not initialized');
    }

    try {
      const messageData: any = {
        text,
        user_id: this.user.id,
        type,
      };

      if (metadata) {
        messageData.custom = metadata;
      }

      await this.currentChannel.sendMessage(messageData);
      console.log('💬 Chat message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send chat message:', error);
      throw error;
    }
  }

  // Get chat messages
  async getChatMessages(limit: number = 50): Promise<ChatMessage[]> {
    if (!this.currentChannel) {
      throw new Error('No active chat channel');
    }

    try {
      const response = await this.currentChannel.query({
        messages: { limit },
      });

      return response.messages.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        user: {
          id: msg.user.id,
          name: msg.user.name || msg.user.id,
          image: msg.user.image,
          walletAddress: msg.user.custom?.walletAddress,
        },
        created_at: new Date(msg.created_at),
        type: msg.type || 'regular',
        amount: msg.custom?.amount,
        token: msg.custom?.token,
      }));
    } catch (error) {
      console.error('❌ Failed to get chat messages:', error);
      return [];
    }
  }

  // Subscribe to chat events
  subscribeToChatEvents(callback: (message: ChatMessage) => void): () => void {
    if (!this.currentChannel) {
      throw new Error('No active chat channel');
    }

    const handleNewMessage = (event: any) => {
      if (event.type === 'message.new') {
        const msg = event.message;
        const chatMessage: ChatMessage = {
          id: msg.id,
          text: msg.text,
          user: {
            id: msg.user.id,
            name: msg.user.name || msg.user.id,
            image: msg.user.image,
            walletAddress: msg.user.custom?.walletAddress,
          },
          created_at: new Date(msg.created_at),
          type: msg.type || 'regular',
          amount: msg.custom?.amount,
          token: msg.custom?.token,
        };
        callback(chatMessage);
      }
    };

    this.currentChannel.on('message.new', handleNewMessage);

    // Return unsubscribe function
    return () => {
      if (this.currentChannel) {
        this.currentChannel.off('message.new', handleNewMessage);
      }
    };
  }

  // Get list of active live streams
  async getActiveLiveStreams(): Promise<LiveStream[]> {
    if (!this.client) {
      throw new Error('Stream.io service not initialized');
    }

    try {
      console.log('📡 Fetching active live streams...');
      
      // Try multiple query approaches to find streams
      let response;
      
      // First try: Query for default calls that are ongoing
      try {
        response = await this.client.queryCalls({
          filter_conditions: {
            type: CALL_TYPES.DEFAULT,
            ongoing: true,
          },
          sort: [{ field: 'created_at', direction: -1 }],
          limit: 25,
        });
        console.log('✅ Default call query successful');
      } catch (queryError) {
        console.warn('⚠️ Default call query failed, trying broader query:', queryError);
        
        // Fallback: Query all recent calls
        response = await this.client.queryCalls({
          sort: [{ field: 'created_at', direction: -1 }],
          limit: 25,
        });
        console.log('✅ Broader query successful');
      }

      console.log('🔍 Raw calls response:', {
        totalCalls: response.calls.length,
        calls: response.calls.map((call: any) => ({
          id: call.id,
          type: call.type,
          ongoing: call.ongoing,
          custom: call.custom,
          created_by: call.created_by?.id,
          session: call.session
        }))
      });

      const liveStreams: LiveStream[] = response.calls
        .filter((call: any) => {
          // More lenient filtering - accept any call that looks like ours
          const isOurStream = call.id?.startsWith('live_'); // Our call IDs start with 'live_'
          const hasCustomData = call.custom && Object.keys(call.custom).length > 0;
          console.log(`🔍 Call ${call.id}: isOurStream=${isOurStream}, hasCustomData=${hasCustomData}, custom=`, call.custom);
          return isOurStream || hasCustomData;
        })
        .map((call: any) => ({
          id: call.id,
          title: call.custom?.title || call.id || 'Live Stream',
          hostId: call.created_by?.id || 'unknown',
          hostName: call.created_by?.name || `User ${call.created_by?.id?.slice(0, 8) || 'Unknown'}`,
          hostWallet: call.custom?.hostWallet || call.created_by?.id || '',
          viewerCount: call.session?.participants?.length || 0,
          isLive: true, // If it's in the ongoing query, it's live
          createdAt: new Date(call.created_at || Date.now()),
        }));

      console.log(`✅ Found ${liveStreams.length} active live streams:`, liveStreams);
      return liveStreams;
    } catch (error) {
      console.error('❌ Failed to fetch live streams:', error);
      return [];
    }
  }

  // Enable screen sharing
  async enableScreenShare(): Promise<void> {
    if (!this.currentCall) {
      throw new Error('No active call');
    }

    try {
      console.log('🖥️ Enabling screen share...');
      await this.currentCall.screenShare.enable();
      console.log('✅ Screen share enabled');
    } catch (error) {
      console.error('❌ Failed to enable screen share:', error);
      throw error;
    }
  }

  // Disable screen sharing
  async disableScreenShare(): Promise<void> {
    if (!this.currentCall) {
      throw new Error('No active call');
    }

    try {
      console.log('🖥️ Disabling screen share...');
      await this.currentCall.screenShare.disable();
      console.log('✅ Screen share disabled');
    } catch (error) {
      console.error('❌ Failed to disable screen share:', error);
      throw error;
    }
  }

  // Toggle camera
  async toggleCamera(): Promise<boolean> {
    if (!this.currentCall) {
      throw new Error('No active call');
    }

    try {
      const isEnabled = this.currentCall.camera.state.status === 'enabled';
      
      if (isEnabled) {
        await this.currentCall.camera.disable();
        console.log('📷 Camera disabled');
      } else {
        await this.currentCall.camera.enable();
        console.log('📷 Camera enabled');
      }
      
      return !isEnabled;
    } catch (error) {
      console.error('❌ Failed to toggle camera:', error);
      throw error;
    }
  }

  // Toggle microphone
  async toggleMicrophone(): Promise<boolean> {
    if (!this.currentCall) {
      throw new Error('No active call');
    }

    try {
      const isEnabled = this.currentCall.microphone.state.status === 'enabled';
      
      if (isEnabled) {
        await this.currentCall.microphone.disable();
        console.log('🎤 Microphone disabled');
      } else {
        await this.currentCall.microphone.enable();
        console.log('🎤 Microphone enabled');
      }
      
      return !isEnabled;
    } catch (error) {
      console.error('❌ Failed to toggle microphone:', error);
      throw error;
    }
  }

  // Get current call
  getCurrentCall(): Call | null {
    return this.currentCall;
  }

  // Get current client
  getCurrentClient(): StreamVideoClient | null {
    return this.client;
  }

  // Get current user
  getCurrentUser(): StreamUser | null {
    return this.user;
  }

  // Debug method to check if streams are being created
  async debugStreamCreation(): Promise<void> {
    if (!this.client) {
      console.error('❌ Client not initialized');
      return;
    }

    try {
      console.log('🔍 Debug: Checking all calls...');
      
      // Query all calls without filters
      const allCalls = await this.client.queryCalls({
        sort: [{ field: 'created_at', direction: -1 }],
        limit: 50,
      });

      console.log('🔍 All calls:', {
        total: allCalls.calls.length,
        calls: allCalls.calls.map((call: any) => ({
          id: call.id,
          type: call.type,
          ongoing: call.ongoing,
          created_at: call.created_at,
          custom: call.custom,
          created_by: call.created_by?.id,
        }))
      });

      // Check for our specific streams
      const ourStreams = allCalls.calls.filter((call: any) => 
        call.id?.startsWith('live_') || call.custom?.isLiveStream
      );

      console.log('🔍 Our streams:', ourStreams);

      if (ourStreams.length === 0) {
        console.log('⚠️ No streams found with our format. Try creating a stream first.');
      }

    } catch (error) {
      console.error('❌ Debug query failed:', error);
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      if (this.currentCall) {
        await this.currentCall.leave();
        this.currentCall = null;
      }
      
      if (this.client) {
        // Disconnect client if needed
        this.client = null;
      }
      
      this.user = null;
      console.log('🧹 Stream.io service cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

// Export singleton instance
export const streamIOService = new StreamIOService();
