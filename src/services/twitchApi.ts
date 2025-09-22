// Twitch API service for live streaming integration
export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email?: string;
  created_at: string;
}

export interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: 'live' | '';
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  tags: string[];
  is_mature: boolean;
}

export interface TwitchStreamKey {
  stream_key: string;
  stream_url: string;
}

class TwitchApiService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '';
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
    this.redirectUri = process.env.NEXT_PUBLIC_TWITCH_REDIRECT_URI || `${window?.location?.origin}/auth/twitch/callback`;
  }

  // OAuth URL for Twitch authentication
  getAuthUrl(): string {
    const scopes = [
      'channel:manage:broadcast',
      'channel:read:stream_key',
      'user:read:email',
      'chat:read',
      'chat:edit'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes,
      state: Math.random().toString(36).substring(7) // CSRF protection
    });

    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<{ access_token: string; refresh_token: string }> {
    const response = await fetch('/api/twitch/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    
    // Store tokens in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('twitch_access_token', data.access_token);
      localStorage.setItem('twitch_refresh_token', data.refresh_token);
    }

    return data;
  }

  // Get stored access token
  getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;
    
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('twitch_access_token');
    }
    
    return this.accessToken;
  }

  // Refresh access token
  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.refreshToken || (typeof window !== 'undefined' ? localStorage.getItem('twitch_refresh_token') : null);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/twitch/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('twitch_access_token', data.access_token);
    }

    return data.access_token;
  }

  // Make authenticated API request
  private async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    let token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`https://api.twitch.tv/helix${endpoint}`, {
      ...options,
      headers: {
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // If token expired, try to refresh
    if (response.status === 401) {
      try {
        token = await this.refreshAccessToken();
        const retryResponse = await fetch(`https://api.twitch.tv/helix${endpoint}`, {
          ...options,
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        
        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.statusText}`);
        }
        
        return retryResponse.json();
      } catch (error) {
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Get current user info
  async getCurrentUser(): Promise<TwitchUser> {
    const response = await this.makeApiRequest('/users');
    return response.data[0];
  }

  // Get user's stream key
  async getStreamKey(userId: string): Promise<TwitchStreamKey> {
    const response = await this.makeApiRequest(`/streams/key?broadcaster_id=${userId}`);
    return {
      stream_key: response.data[0].stream_key,
      stream_url: 'rtmp://live.twitch.tv/live/'
    };
  }

  // Get stream information
  async getStreamInfo(userId: string): Promise<TwitchStream | null> {
    const response = await this.makeApiRequest(`/streams?user_id=${userId}`);
    return response.data.length > 0 ? response.data[0] : null;
  }

  // Update stream information
  async updateStreamInfo(userId: string, title: string, categoryId?: string): Promise<void> {
    const body: any = { title };
    if (categoryId) {
      body.game_id = categoryId;
    }

    await this.makeApiRequest(`/channels?broadcaster_id=${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  // Get game categories
  async searchCategories(query: string): Promise<any[]> {
    const response = await this.makeApiRequest(`/games?name=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Get popular categories
  async getTopCategories(limit: number = 20): Promise<any[]> {
    const response = await this.makeApiRequest(`/games/top?first=${limit}`);
    return response.data;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Logout user
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('twitch_access_token');
      localStorage.removeItem('twitch_refresh_token');
    }
  }
}

export const twitchApi = new TwitchApiService();
