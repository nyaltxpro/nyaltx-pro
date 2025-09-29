import { StreamVideoClient, Call, User } from '@stream-io/video-client';
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
}

export class StreamIOService {
  private client: StreamVideoClient | null = null;
  private currentCall: Call | null = null;
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
      
      // Create Stream client
      this.client = createStreamClient(streamUser, token);
      this.user = user;
      
      console.log('✅ Stream.io client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Stream.io service:', error);
      throw error;
    }
  }

  // Start a live stream as broadcaster
  async startLiveStream(streamTitle: string): Promise<{ callId: string; call: Call }> {
    if (!this.client || !this.user) {
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
      
      // Create a livestream call
      const call = this.client.call(CALL_TYPES.LIVESTREAM, callId);
      
      // Join the call as host
      await call.join({
        create: true,
        data: {
          custom: {
            title: streamTitle,
            hostWallet: this.user.walletAddress,
          },
          members: [
            {
              user_id: this.user.id,
              role: 'host',
            },
          ],
          // Note: settings_override API may vary by Stream.io version
          // Using basic call creation for compatibility
        },
      });

      this.currentCall = call;
      
      console.log('✅ Live stream started successfully:', callId);
      return { callId, call };
    } catch (error) {
      console.error('❌ Failed to start live stream:', error);
      throw error;
    }
  }

  // Join a live stream as viewer
  async joinLiveStream(callId: string): Promise<Call> {
    if (!this.client || !this.user) {
      throw new Error('Stream.io service not initialized');
    }

    try {
      console.log('👀 Joining live stream:', callId);
      
      // Get the call
      const call = this.client.call(CALL_TYPES.LIVESTREAM, callId);
      
      // Join as viewer
      await call.join();
      
      this.currentCall = call;
      
      console.log('✅ Joined live stream successfully');
      return call;
    } catch (error) {
      console.error('❌ Failed to join live stream:', error);
      throw error;
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
      
      console.log('✅ Live stream ended successfully');
    } catch (error) {
      console.error('❌ Failed to end live stream:', error);
      throw error;
    }
  }

  // Get list of active live streams
  async getActiveLiveStreams(): Promise<LiveStream[]> {
    if (!this.client) {
      throw new Error('Stream.io service not initialized');
    }

    try {
      console.log('📡 Fetching active live streams...');
      
      // Query for active livestream calls
      const response = await this.client.queryCalls({
        filter_conditions: {
          type: CALL_TYPES.LIVESTREAM,
          ongoing: true,
        },
        sort: [{ field: 'created_at', direction: -1 }],
        limit: 25,
      });

      const liveStreams: LiveStream[] = response.calls.map((call: any) => ({
        id: call.id,
        title: call.custom?.title || 'Untitled Stream',
        hostId: call.created_by?.id || 'unknown',
        hostName: call.created_by?.name || 'Unknown Host',
        hostWallet: call.custom?.hostWallet || '',
        viewerCount: call.session?.participants?.length || 0,
        isLive: call.session?.live || false,
        createdAt: new Date(call.created_at || Date.now()),
      }));

      console.log(`✅ Found ${liveStreams.length} active live streams`);
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
