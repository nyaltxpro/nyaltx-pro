// WebRTC Streaming Service for Vercel-compatible deployment
// Uses HTTP polling instead of WebSockets for better Vercel compatibility

export interface StreamData {
  broadcasterId: string;
  streamTitle: string;
  walletAddress: string;
  viewerCount: number;
}

export interface ChatMessage {
  message: string;
  senderAddress: string;
  senderName: string;
  timestamp: number;
}

export class StreamingService {
  private baseUrl: string;
  private pollingInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private callbacks: { [event: string]: Function[] } = {};

  constructor() {
    this.baseUrl = '/api/streaming';
  }

  // Event emitter pattern
  on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // Join as broadcaster
  async joinAsBroadcaster(broadcasterId: string, walletAddress: string, streamTitle: string) {
    try {
      const response = await fetch(`${this.baseUrl}?action=broadcaster-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcasterId, walletAddress, streamTitle })
      });

      if (!response.ok) {
        throw new Error(`Failed to join as broadcaster: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Start heartbeat to keep connection alive
      this.startHeartbeat(broadcasterId, 'broadcaster');
      
      this.emit('broadcaster-joined', { broadcasterId });
      return result;
    } catch (error) {
      console.error('Error joining as broadcaster:', error);
      this.emit('error', error);
      throw error;
    }
  }

  // Join as viewer
  async joinAsViewer(viewerId: string, broadcasterId: string, walletAddress: string) {
    try {
      const response = await fetch(`${this.baseUrl}?action=viewer-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewerId, broadcasterId, walletAddress })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to join as viewer: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Start heartbeat to keep connection alive
      this.startHeartbeat(viewerId, 'viewer');
      
      // Start polling for chat messages
      this.startChatPolling(broadcasterId);
      
      this.emit('viewer-joined', { viewerId, broadcasterId });
      return result;
    } catch (error) {
      console.error('Error joining as viewer:', error);
      this.emit('error', error);
      throw error;
    }
  }

  // Get active streams
  async getActiveStreams(): Promise<StreamData[]> {
    try {
      const url = `${this.baseUrl}?action=get-active-streams`;
      console.log('🔍 Fetching active streams from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API response not ok:', response.status, response.statusText, errorText);
        throw new Error(`Failed to get active streams: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Active streams response:', result);
      return result.streams || [];
    } catch (error) {
      console.error('❌ Error getting active streams:', error);
      return [];
    }
  }

  // Send chat message with retry logic
  async sendChatMessage(broadcasterId: string, message: string, senderAddress: string, senderName?: string, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}?action=chat-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ broadcasterId, message, senderAddress, senderName })
        });

        if (!response.ok) {
          throw new Error(`Failed to send chat message: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Chat message sent successfully');
        return result;
      } catch (error) {
        console.error(`❌ Error sending chat message (attempt ${i + 1}/${retries}):`, error);
        
        if (i === retries - 1) {
          // Last attempt failed
          this.emit('error', `Failed to send message after ${retries} attempts`);
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  // Get chat messages
  async getChatMessages(broadcasterId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=chat&broadcasterId=${broadcasterId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get chat messages: ${response.statusText}`);
      }

      const result = await response.json();
      return result.messages || [];
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  // End stream
  async endStream(broadcasterId: string) {
    try {
      const response = await fetch(`${this.baseUrl}?action=stream-end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcasterId })
      });

      if (!response.ok) {
        throw new Error(`Failed to end stream: ${response.statusText}`);
      }

      this.stopPolling();
      this.emit('stream-ended', { broadcasterId });
      
      return await response.json();
    } catch (error) {
      console.error('Error ending stream:', error);
      throw error;
    }
  }

  // Start heartbeat to keep connection alive
  private startHeartbeat(id: string, type: 'broadcaster' | 'viewer') {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await fetch(`${this.baseUrl}?action=heartbeat&id=${id}&type=${type}`);
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 15000); // Send heartbeat every 15 seconds
  }

  // Start polling for chat messages
  private startChatPolling(broadcasterId: string) {
    let lastMessageTimestamp = 0;
    
    this.pollingInterval = setInterval(async () => {
      try {
        const messages = await this.getChatMessages(broadcasterId);
        
        // Only emit messages newer than last timestamp
        const newMessages = messages.filter(msg => msg.timestamp > lastMessageTimestamp);
        
        if (newMessages.length > 0) {
          // Update last timestamp to the newest message
          lastMessageTimestamp = Math.max(...newMessages.map(msg => msg.timestamp));
          
          // Emit all new messages
          newMessages.forEach(message => {
            this.emit('chat-message', message);
          });
          
          // Also emit all messages for full sync
          this.emit('chat-messages-sync', messages);
        }
      } catch (error) {
        console.error('Chat polling error:', error);
      }
    }, 1000); // Poll every 1 second for better responsiveness
  }

  // Stop all polling
  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Disconnect and cleanup
  disconnect() {
    this.stopPolling();
    this.callbacks = {};
    this.emit('disconnected');
  }

  // WebRTC signaling methods
  async sendSignal(fromId: string, toId: string, signal: any, type: 'broadcaster' | 'viewer') {
    try {
      const response = await fetch(`${this.baseUrl}?action=webrtc-signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId, toId, signal, type })
      });

      if (!response.ok) {
        throw new Error(`Failed to send signal: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending WebRTC signal:', error);
      throw error;
    }
  }

  async getSignals(id: string, type: 'broadcaster' | 'viewer') {
    try {
      const response = await fetch(`${this.baseUrl}?action=get-signals&id=${id}&type=${type}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get signals: ${response.statusText}`);
      }

      const result = await response.json();
      return result.signals || [];
    } catch (error) {
      console.error('Error getting signals:', error);
      return [];
    }
  }

  // Start polling for active streams (for live stream page)
  startStreamPolling(callback: (streams: StreamData[]) => void) {
    const poll = async () => {
      const streams = await this.getActiveStreams();
      callback(streams);
    };
    
    // Initial poll
    poll();
    
    // Poll every 5 seconds
    const interval = setInterval(poll, 5000);
    
    return () => clearInterval(interval);
  }
}

// Export singleton instance
export const streamingService = new StreamingService();
