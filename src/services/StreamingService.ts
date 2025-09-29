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
      const response = await fetch(`${this.baseUrl}?action=active-streams`);
      
      if (!response.ok) {
        throw new Error(`Failed to get active streams: ${response.statusText}`);
      }

      const result = await response.json();
      return result.streams || [];
    } catch (error) {
      console.error('Error getting active streams:', error);
      return [];
    }
  }

  // Send chat message
  async sendChatMessage(broadcasterId: string, message: string, senderAddress: string, senderName?: string) {
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
      return result;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
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
    let lastMessageCount = 0;
    
    this.pollingInterval = setInterval(async () => {
      try {
        const messages = await this.getChatMessages(broadcasterId);
        
        // Only emit new messages
        if (messages.length > lastMessageCount) {
          const newMessages = messages.slice(lastMessageCount);
          newMessages.forEach(message => {
            this.emit('chat-message', message);
          });
          lastMessageCount = messages.length;
        }
      } catch (error) {
        console.error('Chat polling error:', error);
      }
    }, 2000); // Poll every 2 seconds
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
