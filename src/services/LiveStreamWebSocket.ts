import { EventEmitter } from 'events';

export interface StreamMessage {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system' | 'donation' | 'join' | 'leave';
  amount?: number; // For donations
  token?: string; // For token donations
}

export interface LiveStreamData {
  id: string;
  title: string;
  description: string;
  streamerId: string;
  streamerName: string;
  streamerAvatar?: string;
  category: string;
  isLive: boolean;
  viewerCount: number;
  startedAt: string;
  endedAt?: string;
  thumbnail?: string;
  tags: string[];
  chatEnabled: boolean;
  donationsEnabled: boolean;
  streamUrl?: string;
  streamKey?: string;
}

export interface WebSocketStreamMessage {
  type: 'stream_created' | 'stream_ended' | 'stream_updated' | 'chat_message' | 'viewer_joined' | 'viewer_left' | 'donation' | 'error' | 'connection_status';
  streamId?: string;
  data: any;
  timestamp: number;
}

class LiveStreamWebSocket extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;
  private subscriptions = new Map<string, Set<(message: WebSocketStreamMessage) => void>>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    super();
    this.connect();
  }
  
  private connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    
    this.isConnecting = true;
    
    try {
      // Use secure WebSocket in production, regular in development
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/websocket/livestream`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('Live stream WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected');
        this.startHeartbeat();
        
        // Notify all subscribers about connection status
        this.broadcastToSubscribers({
          type: 'connection_status',
          data: { status: 'connected' },
          timestamp: Date.now()
        });
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketStreamMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log('Live stream WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        this.emit('disconnected');
        
        // Notify subscribers about disconnection
        this.broadcastToSubscribers({
          type: 'connection_status',
          data: { status: 'disconnected' },
          timestamp: Date.now()
        });
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(), this.reconnectInterval * this.reconnectAttempts);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('Live stream WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
    }
  }
  
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }
  
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  private handleMessage(message: WebSocketStreamMessage) {
    // Broadcast to all relevant subscribers
    this.broadcastToSubscribers(message);
    
    // Emit events for specific message types
    switch (message.type) {
      case 'stream_created':
        this.emit('streamCreated', message.data);
        break;
      case 'stream_ended':
        this.emit('streamEnded', message.data);
        break;
      case 'stream_updated':
        this.emit('streamUpdated', message.data);
        break;
      case 'chat_message':
        this.emit('chatMessage', message.data);
        break;
      case 'viewer_joined':
        this.emit('viewerJoined', message.data);
        break;
      case 'viewer_left':
        this.emit('viewerLeft', message.data);
        break;
      case 'donation':
        this.emit('donation', message.data);
        break;
    }
  }
  
  private broadcastToSubscribers(message: WebSocketStreamMessage) {
    // Send to stream-specific subscribers
    if (message.streamId) {
      const streamSubscribers = this.subscriptions.get(`stream:${message.streamId}`);
      if (streamSubscribers) {
        streamSubscribers.forEach(callback => callback(message));
      }
    }
    
    // Send to global subscribers
    const globalSubscribers = this.subscriptions.get('global');
    if (globalSubscribers) {
      globalSubscribers.forEach(callback => callback(message));
    }
  }
  
  // Subscribe to stream events
  subscribeToStream(streamId: string, callback: (message: WebSocketStreamMessage) => void) {
    const key = `stream:${streamId}`;
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)!.add(callback);
    
    // Send join message to server
    this.sendMessage({
      type: 'join_stream',
      streamId,
      timestamp: Date.now()
    });
  }
  
  // Subscribe to global stream events (all streams)
  subscribeToGlobal(callback: (message: WebSocketStreamMessage) => void) {
    const key = 'global';
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)!.add(callback);
  }
  
  // Unsubscribe from stream
  unsubscribeFromStream(streamId: string, callback: (message: WebSocketStreamMessage) => void) {
    const key = `stream:${streamId}`;
    const subscribers = this.subscriptions.get(key);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscriptions.delete(key);
        
        // Send leave message to server
        this.sendMessage({
          type: 'leave_stream',
          streamId,
          timestamp: Date.now()
        });
      }
    }
  }
  
  // Unsubscribe from global events
  unsubscribeFromGlobal(callback: (message: WebSocketStreamMessage) => void) {
    const key = 'global';
    const subscribers = this.subscriptions.get(key);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscriptions.delete(key);
      }
    }
  }
  
  // Send chat message
  sendChatMessage(streamId: string, message: string, userId: string, username: string, userAvatar?: string) {
    this.sendMessage({
      type: 'send_chat_message',
      streamId,
      data: {
        message,
        userId,
        username,
        userAvatar,
      },
      timestamp: Date.now()
    });
  }
  
  // Send donation
  sendDonation(streamId: string, amount: number, token: string, userId: string, username: string, message?: string) {
    this.sendMessage({
      type: 'send_donation',
      streamId,
      data: {
        amount,
        token,
        userId,
        username,
        message,
      },
      timestamp: Date.now()
    });
  }
  
  // Create new stream
  createStream(streamData: Omit<LiveStreamData, 'id' | 'isLive' | 'viewerCount' | 'startedAt'>) {
    this.sendMessage({
      type: 'create_stream',
      data: streamData,
      timestamp: Date.now()
    });
  }
  
  // End stream
  endStream(streamId: string) {
    this.sendMessage({
      type: 'end_stream',
      streamId,
      timestamp: Date.now()
    });
  }
  
  // Update stream info
  updateStream(streamId: string, updates: Partial<LiveStreamData>) {
    this.sendMessage({
      type: 'update_stream',
      streamId,
      data: updates,
      timestamp: Date.now()
    });
  }
  
  private sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }
  
  // Get connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
  
  // Manually reconnect
  reconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.reconnectAttempts = 0;
    this.connect();
  }
  
  // Disconnect
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }
}

// Export singleton instance
export const liveStreamWebSocket = new LiveStreamWebSocket();
