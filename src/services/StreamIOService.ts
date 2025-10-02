import { StreamVideoClient, Call, User } from '@stream-io/video-client';
import { StreamChat, Channel, ChannelData } from 'stream-chat';
import { createStreamClient, generateUserToken, CALL_TYPES, STREAM_API_KEY } from '@/lib/stream-config';

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
  type?: 'regular' | 'system' | 'donation' | 'streamer_announcement' | 'viewer_joined' | 'viewer_left';
  amount?: number;
  token?: string;
  isStreamer?: boolean;
  metadata?: {
    donation?: {
      amount: number;
      token: string;
      txHash?: string;
    };
    announcement?: {
      priority: 'low' | 'medium' | 'high';
      color?: string;
    };
  };
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

      // Log call details for debugging
      console.log('🔍 Created call details:', {
        id: callId,
        type: call.type,
        state: call.state,
        custom: (call as any).custom,
      });

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
      
      // Join as viewer
      await call.join({
        create: false,
      });
      
      // Ensure camera and microphone are disabled for viewers
      try {
        await call.camera.disable();
        await call.microphone.disable();
        console.log('✅ Viewer camera and microphone disabled');
      } catch (disableError) {
        console.warn('⚠️ Could not disable camera/microphone:', disableError);
      }
      
      // Join the chat channel
      const chatChannelId = `livestream-${callId}`;
      const chatChannel = this.chatClient.channel('livestream', chatChannelId);
      await chatChannel.watch();
      
      this.currentCall = call;
      this.currentChannel = chatChannel;
      
      console.log('✅ Joined live stream and chat successfully as viewer');
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
        
        // Disable camera and microphone for retry case too
        try {
          await call.camera.disable();
          await call.microphone.disable();
          console.log('✅ Viewer camera and microphone disabled (retry)');
        } catch (disableError) {
          console.warn('⚠️ Could not disable camera/microphone (retry):', disableError);
        }
        
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
      
      // Send stream ending announcement
      if (this.currentChannel && this.isCurrentUserStreamer()) {
        await this.sendSystemMessage('🔴 Stream has ended. Thank you for watching!', 'viewer_left');
      }
      
      // End the call properly to trigger cleanup for all participants
      await this.currentCall.endCall();
      this.currentCall = null;
      
      // Clean up and destroy the chat channel
      if (this.currentChannel) {
        try {
          // Send final cleanup message
          console.log('🧹 Cleaning up chat channel...');
          
          // Stop watching the channel
          await this.currentChannel.stopWatching();
          
          // Delete the channel to destroy all messages (if streamer)
          if (this.isCurrentUserStreamer()) {
            await this.currentChannel.delete();
            console.log('🗑️ Chat channel and messages destroyed');
          }
          
          this.currentChannel = null;
        } catch (channelError) {
          console.warn('⚠️ Failed to cleanup chat channel:', channelError);
          this.currentChannel = null;
        }
      }
      
      console.log('✅ Live stream and chat ended successfully');
    } catch (error) {
      console.error('❌ Failed to end live stream:', error);
      throw error;
    }
  }

  // Force cleanup all stream data (emergency cleanup)
  async forceCleanupStream(): Promise<void> {
    try {
      console.log('🚨 Force cleaning up stream data...');
      
      if (this.currentCall) {
        await this.currentCall.leave().catch(() => {});
        this.currentCall = null;
      }
      
      if (this.currentChannel) {
        await this.currentChannel.stopWatching().catch(() => {});
        await this.currentChannel.delete().catch(() => {});
        this.currentChannel = null;
      }
      
      console.log('✅ Force cleanup completed');
    } catch (error) {
      console.error('❌ Force cleanup failed:', error);
    }
  }

  // Chat functionality
  async sendChatMessage(
    text: string, 
    type: 'regular' | 'system' | 'donation' | 'streamer_announcement' | 'viewer_joined' | 'viewer_left' = 'regular', 
    metadata?: { 
      amount?: number; 
      token?: string;
      donation?: {
        amount: number;
        token: string;
        txHash?: string;
      };
      announcement?: {
        priority: 'low' | 'medium' | 'high';
        color?: string;
      };
    }
  ): Promise<void> {
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
        messageData.custom = {
          ...metadata,
          isStreamer: this.isCurrentUserStreamer(),
          walletAddress: this.user.walletAddress,
        };
      }

      await this.currentChannel.sendMessage(messageData);
      console.log('💬 Chat message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send chat message:', error);
      throw error;
    }
  }

  // Send streamer announcement (highlighted message)
  async sendStreamerAnnouncement(text: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    if (!this.isCurrentUserStreamer()) {
      throw new Error('Only streamers can send announcements');
    }

    await this.sendChatMessage(text, 'streamer_announcement', {
      announcement: {
        priority,
        color: priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981'
      }
    });
  }

  // Send donation message
  async sendDonationMessage(amount: number, token: string, txHash?: string, message?: string): Promise<void> {
    const donationText = message || `Donated ${amount} ${token}! 🎉`;
    
    await this.sendChatMessage(donationText, 'donation', {
      donation: {
        amount,
        token,
        txHash
      }
    });
  }

  // Send system message (viewer joined/left)
  async sendSystemMessage(text: string, type: 'viewer_joined' | 'viewer_left'): Promise<void> {
    await this.sendChatMessage(text, type);
  }

  // Check if current user is the streamer
  private isCurrentUserStreamer(): boolean {
    return this.currentCall?.isCreatedByMe || false;
  }

  // Enable screen sharing for streamers
  async enableScreenShare(): Promise<void> {
    if (!this.currentCall) {
      throw new Error('No active call to enable screen sharing');
    }

    try {
      console.log('🖥️ Enabling screen share...');
      await this.currentCall.screenShare.enable();
      console.log('✅ Screen sharing enabled');
    } catch (error) {
      console.error('❌ Failed to enable screen sharing:', error);
      throw error;
    }
  }

  // Disable screen sharing
  async disableScreenShare(): Promise<void> {
    if (!this.currentCall) {
      throw new Error('No active call to disable screen sharing');
    }

    try {
      console.log('🖥️ Disabling screen share...');
      await this.currentCall.screenShare.disable();
      console.log('✅ Screen sharing disabled');
    } catch (error) {
      console.error('❌ Failed to disable screen sharing:', error);
      throw error;
    }
  }

  // Toggle camera on/off
  async toggleCamera(): Promise<boolean> {
    if (!this.currentCall) {
      throw new Error('No active call to toggle camera');
    }

    try {
      const isEnabled = this.currentCall.camera.state.status === 'enabled';
      
      if (isEnabled) {
        await this.currentCall.camera.disable();
        console.log('📷 Camera disabled');
        return false;
      } else {
        await this.currentCall.camera.enable();
        console.log('📷 Camera enabled');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to toggle camera:', error);
      throw error;
    }
  }

  // Toggle microphone on/off
  async toggleMicrophone(): Promise<boolean> {
    if (!this.currentCall) {
      throw new Error('No active call to toggle microphone');
    }

    try {
      const isEnabled = this.currentCall.microphone.state.status === 'enabled';
      
      if (isEnabled) {
        await this.currentCall.microphone.disable();
        console.log('🎤 Microphone disabled');
        return false;
      } else {
        await this.currentCall.microphone.enable();
        console.log('🎤 Microphone enabled');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to toggle microphone:', error);
      throw error;
    }
  }

  // Get current camera state
  getCameraState(): boolean {
    return this.currentCall?.camera.state.status === 'enabled';
  }

  // Get current microphone state
  getMicrophoneState(): boolean {
    return this.currentCall?.microphone.state.status === 'enabled';
  }

  // Get current screen share state
  getScreenShareState(): boolean {
    return this.currentCall?.screenShare.state.status === 'enabled';
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
          walletAddress: msg.user.custom?.walletAddress || msg.custom?.walletAddress,
        },
        created_at: new Date(msg.created_at),
        type: msg.type || 'regular',
        amount: msg.custom?.amount,
        token: msg.custom?.token,
        isStreamer: msg.custom?.isStreamer || false,
        metadata: {
          donation: msg.custom?.donation,
          announcement: msg.custom?.announcement,
        },
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
            walletAddress: msg.user.custom?.walletAddress || msg.custom?.walletAddress,
          },
          created_at: new Date(msg.created_at),
          type: msg.type || 'regular',
          amount: msg.custom?.amount,
          token: msg.custom?.token,
          isStreamer: msg.custom?.isStreamer || false,
          metadata: {
            donation: msg.custom?.donation,
            announcement: msg.custom?.announcement,
          },
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
      
      // Try multiple query strategies
      const queryStrategies = [
        // Strategy 1: Query ongoing calls
        {
          name: 'ongoing calls',
          filter: { type: CALL_TYPES.DEFAULT, ongoing: true }
        },
        // Strategy 2: Query all recent calls
        {
          name: 'all recent calls',
          filter: { type: CALL_TYPES.DEFAULT }
        },
        // Strategy 3: Query livestream type calls
        {
          name: 'livestream type calls',
          filter: { type: CALL_TYPES.LIVESTREAM }
        }
      ];

      let response;
      let usedStrategy = '';
      
      for (const strategy of queryStrategies) {
        try {
          console.log(`🔍 Trying strategy: ${strategy.name}`);
          response = await this.client.queryCalls({
            filter_conditions: strategy.filter,
            sort: [{ field: 'created_at', direction: -1 }],
            limit: 50, // Increased limit
          });
          usedStrategy = strategy.name;
          console.log(`✅ ${strategy.name} query successful - found ${response.calls.length} calls`);
          break;
        } catch (queryError) {
          console.warn(`⚠️ ${strategy.name} query failed:`, queryError);
          continue;
        }
      }

      if (!response) {
        console.error('❌ All query strategies failed');
        return [];
      }

      console.log(`🔍 Raw calls response (${usedStrategy}):`, {
        totalCalls: response.calls.length,
        calls: response.calls.map((call: any) => ({
          id: call.id,
          type: call.type,
          ongoing: call.ongoing,
          ended_at: call.ended_at,
          custom: call.custom,
          created_by: call.created_by?.id,
          session: call.session,
          participants: call.session?.participants?.length || 0,
          created_at: call.created_at
        }))
      });

      // Very permissive filtering - show any call that could be a stream
      const liveStreams: LiveStream[] = response.calls
        .filter((call: any) => {
          const isOurStream = call.id?.startsWith('live_');
          const hasLiveStreamFlag = call.custom?.isLiveStream === true;
          const hasTitle = !!call.custom?.title;
          const isOngoing = call.ongoing === true;
          const notEnded = !call.ended_at;
          const isRecent = call.created_at && (Date.now() - new Date(call.created_at).getTime()) < 24 * 60 * 60 * 1000; // Within 24 hours
          
          console.log(`🔍 Evaluating call ${call.id}:`, {
            isOurStream,
            hasLiveStreamFlag,
            hasTitle,
            isOngoing,
            notEnded,
            isRecent,
            created_at: call.created_at,
            custom: call.custom
          });
          
          // Very permissive: include if it matches any of our criteria
          const couldBeOurStream = isOurStream || hasLiveStreamFlag || hasTitle;
          const couldBeActive = notEnded && isRecent;
          
          const shouldInclude = couldBeOurStream && couldBeActive;
          console.log(`🎯 Call ${call.id} - Include: ${shouldInclude}`);
          
          // TEMPORARY: Show all calls for debugging
          const debugMode = true; // Set to false after debugging
          if (debugMode) {
            console.log(`🚨 DEBUG MODE: Including all calls`);
            return true;
          }
          
          return shouldInclude;
        })
        .map((call: any) => ({
          id: call.id,
          title: call.custom?.title || call.id || 'Live Stream',
          hostId: call.created_by?.id || 'unknown',
          hostName: call.created_by?.name || `User ${call.created_by?.id?.slice(0, 8) || 'Unknown'}`,
          hostWallet: call.custom?.hostWallet || call.created_by?.id || '',
          viewerCount: call.session?.participants?.length || 0,
          isLive: call.ongoing !== false,
          createdAt: new Date(call.created_at || Date.now()),
        }));

      console.log(`✅ Found ${liveStreams.length} potential live streams:`, liveStreams);
      
      // Always run debug if no streams found
      if (liveStreams.length === 0) {
        console.log('🔍 No streams found with any strategy, running comprehensive debug...');
        await this.debugStreamCreation();
      }
      
      return liveStreams;
    } catch (error) {
      console.error('❌ Failed to fetch live streams:', error);
      return [];
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
      console.log('🔍 === COMPREHENSIVE STREAM DEBUG ===');
      console.log('🔍 API Key:', STREAM_API_KEY?.slice(0, 8) + '...');
      console.log('🔍 Current User:', this.user);
      
      // Test multiple query approaches
      const queryTests = [
        { name: 'All calls (no filter)', filter: {} },
        { name: 'Default type calls', filter: { type: CALL_TYPES.DEFAULT } },
        { name: 'Livestream type calls', filter: { type: CALL_TYPES.LIVESTREAM } },
        { name: 'Ongoing calls', filter: { ongoing: true } },
      ];

      for (const test of queryTests) {
        try {
          console.log(`\n🔍 Testing: ${test.name}`);
          const response = await this.client.queryCalls({
            filter_conditions: test.filter,
            sort: [{ field: 'created_at', direction: -1 }],
            limit: 20,
          });

          console.log(`✅ ${test.name} - Found ${response.calls.length} calls`);
          
          if (response.calls.length > 0) {
            console.log('📋 Sample calls:', response.calls.slice(0, 3).map((call: any) => ({
              id: call.id,
              type: call.type,
              ongoing: call.ongoing,
              ended_at: call.ended_at,
              created_at: call.created_at,
              custom: call.custom,
              created_by: call.created_by?.id,
              session_participants: call.session?.participants?.length || 0
            })));

            // Check for our streams in this result
            const ourStreams = response.calls.filter((call: any) => 
              call.id?.startsWith('live_') || call.custom?.isLiveStream || call.custom?.title
            );
            
            if (ourStreams.length > 0) {
              console.log(`🎯 Found ${ourStreams.length} potential streams in ${test.name}:`, ourStreams.map((call: any) => ({
                id: call.id,
                title: call.custom?.title,
                isLiveStream: call.custom?.isLiveStream,
                ongoing: call.ongoing,
                ended_at: call.ended_at
              })));
            }
          }
        } catch (queryError) {
          console.error(`❌ ${test.name} failed:`, queryError);
        }
      }

      // Check current call state if we have one
      if (this.currentCall) {
        console.log('\n🔍 Current call state:', {
          id: this.currentCall.id,
          type: this.currentCall.type,
          state: this.currentCall.state,
          custom: (this.currentCall as any).custom,
        });
      } else {
        console.log('\n⚠️ No current call active');
      }

      console.log('\n🔍 === DEBUG COMPLETE ===');

    } catch (error) {
      console.error('❌ Debug failed:', error);
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
