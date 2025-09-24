import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types for token registration
export interface RegisteredToken {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  contractAddress: string;
  imageUri?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  submittedByAddress?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  category?: 'defi' | 'gaming' | 'meme' | 'nft' | 'infrastructure' | 'ai';
  boostMultiplier?: number;
  // Additional properties for UI
  symbol?: string;
  name?: string;
  address?: string;
  balance?: number;
  logo?: string;
  currentBoost?: number;
  isRegistered?: boolean;
  multiplier?: number;
}

export interface TokenBoost {
  tokenId: string;
  points: number;
  multiplier: number;
  appliedAt: string;
}

export interface TokenState {
  // Token registration
  registeredTokens: RegisteredToken[];
  userTokens: RegisteredToken[];
  
  // Token boosts
  tokenBoosts: Record<string, number>; // tokenId -> boost points
  
  // UI state
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  
  // Form state
  formData: {
    tokenName: string;
    tokenSymbol: string;
    blockchain: string;
    contractAddress: string;
    imageUri: string;
    website: string;
    twitter: string;
    telegram: string;
    discord: string;
    github: string;
  };
}

const initialState: TokenState = {
  registeredTokens: [],
  userTokens: [],
  tokenBoosts: {},
  isLoading: false,
  isSubmitting: false,
  error: null,
  success: null,
  formData: {
    tokenName: '',
    tokenSymbol: '',
    blockchain: 'ethereum',
    contractAddress: '',
    imageUri: '',
    website: '',
    twitter: '',
    telegram: '',
    discord: '',
    github: '',
  },
};

// Async thunks for API calls
export const registerToken = createAsyncThunk(
  'tokens/register',
  async (tokenData: Omit<RegisteredToken, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch('/api/tokens/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to register token');
    }

    return response.json();
  }
);

export const fetchUserTokens = createAsyncThunk(
  'tokens/fetchUserTokens',
  async (walletAddress: string) => {
    const response = await fetch(`/api/tokens/by-user?address=${walletAddress}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user tokens');
    }

    const data = await response.json();
    const tokenBoosts = JSON.parse(localStorage.getItem('tokenBoosts') || '{}');
    
    // Token categories with boost multipliers
    const TOKEN_CATEGORIES = {
      defi: { name: 'DeFi', multiplier: 1.2, color: 'text-blue-400' },
      gaming: { name: 'Gaming', multiplier: 1.3, color: 'text-purple-400' },
      meme: { name: 'Meme', multiplier: 1.1, color: 'text-yellow-400' },
      nft: { name: 'NFT', multiplier: 1.25, color: 'text-pink-400' },
      infrastructure: { name: 'Infrastructure', multiplier: 1.4, color: 'text-green-400' },
      ai: { name: 'AI', multiplier: 1.5, color: 'text-cyan-400' }
    };
    
    // Only return approved tokens with boost data
    return (data.data || [])
      .filter((token: any) => token.status === 'approved')
      .map((token: any) => ({
        ...token,
        symbol: token.tokenSymbol,
        name: token.tokenName,
        address: token.contractAddress,
        balance: Math.floor(Math.random() * 1000000) + 10000, // Mock balance
        logo: token.imageUri || `/crypto-icons/color/${token.tokenSymbol.toLowerCase()}.svg`,
        currentBoost: tokenBoosts[token.id] || 0,
        isRegistered: true,
        multiplier: TOKEN_CATEGORIES[token.category as keyof typeof TOKEN_CATEGORIES]?.multiplier || 1.0
      }));
  }
);

export const fetchAllTokens = createAsyncThunk(
  'tokens/fetchAll',
  async (params: { status?: string; limit?: number } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/tokens/list?${searchParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tokens');
    }

    const data = await response.json();
    return data.data || [];
  }
);

const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    // Form actions
    updateFormField: (state, action: PayloadAction<{ field: keyof TokenState['formData']; value: string }>) => {
      state.formData[action.payload.field] = action.payload.value;
    },
    
    resetForm: (state) => {
      state.formData = initialState.formData;
    },
    
    // Token boost actions
    addTokenBoost: (state, action: PayloadAction<{ tokenId: string; points: number }>) => {
      const { tokenId, points } = action.payload;
      state.tokenBoosts[tokenId] = (state.tokenBoosts[tokenId] || 0) + points;
    },
    
    setTokenBoosts: (state, action: PayloadAction<Record<string, number>>) => {
      state.tokenBoosts = action.payload;
    },
    
    // UI state actions
    clearError: (state) => {
      state.error = null;
    },
    
    clearSuccess: (state) => {
      state.success = null;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    setSuccess: (state, action: PayloadAction<string>) => {
      state.success = action.payload;
    },
    
    // Local storage sync
    loadTokenBoostsFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('tokenBoosts');
        if (stored) {
          state.tokenBoosts = JSON.parse(stored);
        }
      }
    },
    
    saveTokenBoostsToStorage: (state) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tokenBoosts', JSON.stringify(state.tokenBoosts));
      }
    },
  },
  
  extraReducers: (builder) => {
    // Register token
    builder
      .addCase(registerToken.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(registerToken.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.success = 'Token registered successfully!';
        state.registeredTokens.push(action.payload.record);
        state.formData = initialState.formData;
      })
      .addCase(registerToken.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.error.message || 'Failed to register token';
      });
    
    // Fetch user tokens
    builder
      .addCase(fetchUserTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userTokens = action.payload;
      })
      .addCase(fetchUserTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user tokens';
      });
    
    // Fetch all tokens
    builder
      .addCase(fetchAllTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registeredTokens = action.payload;
      })
      .addCase(fetchAllTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch tokens';
      });
  },
});

export const {
  updateFormField,
  resetForm,
  addTokenBoost,
  setTokenBoosts,
  clearError,
  clearSuccess,
  setError,
  setSuccess,
  loadTokenBoostsFromStorage,
  saveTokenBoostsToStorage,
} = tokenSlice.actions;

export default tokenSlice.reducer;
