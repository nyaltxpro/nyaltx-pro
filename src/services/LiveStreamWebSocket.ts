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
  private isConnected = false;
  private subscriptions = new Map<string, Set<(message: WebSocketStreamMessage) => void>>();
  
  constructor() {
    super();
    this.connect();
  }
  
  private connect() {
    // Simulate connection for demo purposes
    setTimeout(() => {
      console.log('Live stream WebSocket connected (simulated)');
      this.isConnected = true;
      this.emit('connected');
      
      // Notify all subscribers about connection status
      this.broadcastToSubscribers({
        type: 'connection_status',
        data: { status: 'connected' },
        timestamp: Date.now()
      });
    }, 1000);
  }
  
  private broadcastToSubscribers(message: WebSocketStreamMessage) {
    if (message.streamId) {
      const streamSubscribers = this.subscriptions.get(message.streamId);
      streamSubscribers?.forEach(callback => callback(message));
    }
    
    // Always broadcast to global subscribers
    const globalSubscribers = this.subscriptions.get('global');
    globalSubscribers?.forEach(callback => callback(message));
  }
  
  // Public API methods
  subscribeToStream(streamId: string, callback: (message: WebSocketStreamMessage) => void) {
    const subscribers = this.subscriptions.get(streamId) || new Set();
    subscribers.add(callback);
    this.subscriptions.set(streamId, subscribers);
  }
  
  subscribeToGlobal(callback: (message: WebSocketStreamMessage) => void) {
    const subscribers = this.subscriptions.get('global') || new Set();
    subscribers.add(callback);
    this.subscriptions.set('global', subscribers);
  }
  
  unsubscribeFromStream(streamId: string, callback: (message: WebSocketStreamMessage) => void) {
    const subscribers = this.subscriptions.get(streamId);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscriptions.delete(streamId);
      }
    }
  }
  
  unsubscribeFromGlobal(callback: (message: WebSocketStreamMessage) => void) {
    const subscribers = this.subscriptions.get('global');
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscriptions.delete('global');
      }
    }
  }
  
  // Stream management methods
  sendChatMessage(streamId: string, message: string, userId: string, username: string, userAvatar?: string) {
    // Simulate chat message
    const chatMessage: StreamMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streamId,
      userId,
      username,
      userAvatar,
      message,
      timestamp: Date.now(),
      type: 'chat'
    };
    
    // Broadcast to stream subscribers
    setTimeout(() => {
      this.broadcastToSubscribers({
        type: 'chat_message',
        streamId,
        data: chatMessage,
        timestamp: Date.now()
      });
    }, 100);
  }
  
  sendDonation(streamId: string, amount: number, token: string, userId: string, username: string, message?: string) {
    // Simulate donation
    const donation: StreamMessage = {
      id: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streamId,
      userId,
      username,
      message: message || '',
      timestamp: Date.now(),
      type: 'donation',
      amount,
      token
    };
    
    setTimeout(() => {
      this.broadcastToSubscribers({
        type: 'donation',
        streamId,
        data: donation,
        timestamp: Date.now()
      });
    }, 100);
  }
  
  createStream(streamData: Omit<LiveStreamData, 'id' | 'isLive' | 'viewerCount' | 'startedAt'>) {
    // Simulate stream creation
    const stream: LiveStreamData = {
      ...streamData,
      id: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isLive: true,
      viewerCount: 0,
      startedAt: new Date().toISOString()
    };
    
    setTimeout(() => {
      this.broadcastToSubscribers({
        type: 'stream_created',
        streamId: stream.id,
        data: stream,
        timestamp: Date.now()
      });
    }, 500);
  }
  
  endStream(streamId: string) {
    setTimeout(() => {
      this.broadcastToSubscribers({
        type: 'stream_ended',
        streamId,
        data: { isLive: false, endedAt: new Date().toISOString() },
        timestamp: Date.now()
      });
    }, 100);
  }
  
  updateStream(streamId: string, updates: Partial<LiveStreamData>) {
    setTimeout(() => {
      this.broadcastToSubscribers({
        type: 'stream_updated',
        streamId,
        data: updates,
        timestamp: Date.now()
      });
    }, 100);
  }
  
  // Connection status
  get connected(): boolean {
    return this.isConnected;
  }
  
  // Manual connection management
  reconnect() {
    this.isConnected = false;
    this.connect();
  }
  
  disconnect() {
    this.isConnected = false;
    this.broadcastToSubscribers({
      type: 'connection_status',
      data: { status: 'disconnected' },
      timestamp: Date.now()
    });
  }
}

export const liveStreamWebSocket = new LiveStreamWebSocket();
