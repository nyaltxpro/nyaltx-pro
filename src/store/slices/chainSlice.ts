import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BlockchainNetwork {
  id: string;
  name: string;
  symbol: string;
  logoPath: string;
  image?: {
    thumb: string | null;
    small: string | null;
    large: string | null;
  };
}

interface ChainState {
  selectedChain: BlockchainNetwork | null;
  availableChains: BlockchainNetwork[];
  isLoading: boolean;
  error: string | null;
}

// All Networks option (no filtering)
const allNetworksChain: BlockchainNetwork = {
  id: 'all-networks',
  name: 'All Networks',
  symbol: 'ALL',
  logoPath: '/globe.svg',
  image: {
    thumb: '/globe.svg',
    small: '/globe.svg',
    large: '/globe.svg'
  }
};

// Default chain (All Networks - no filtering)
const defaultChain: BlockchainNetwork = allNetworksChain;

const initialState: ChainState = {
  selectedChain: defaultChain,
  availableChains: [],
  isLoading: false,
  error: null,
};

const chainSlice = createSlice({
  name: 'chain',
  initialState,
  reducers: {
    setSelectedChain: (state, action: PayloadAction<BlockchainNetwork>) => {
      state.selectedChain = action.payload;
      state.error = null;
      console.log(`🔗 Chain selected: ${action.payload.name} (${action.payload.id})`);
    },
    
    setAvailableChains: (state, action: PayloadAction<BlockchainNetwork[]>) => {
      state.availableChains = action.payload;
      // If no chain is selected, select the first available one
      if (!state.selectedChain && action.payload.length > 0) {
        state.selectedChain = action.payload[0];
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    resetChainState: (state) => {
      state.selectedChain = defaultChain;
      state.error = null;
      state.isLoading = false;
    },
    
    // Action to filter tokens by selected chain
    filterTokensByChain: (state) => {
      if (state.selectedChain) {
        console.log(`🔍 Filtering tokens for chain: ${state.selectedChain.name}`);
        // This action can be used to trigger filtering in other parts of the app
      }
    }
  },
});

export const {
  setSelectedChain,
  setAvailableChains,
  setLoading,
  setError,
  resetChainState,
  filterTokensByChain
} = chainSlice.actions;

// Selectors
export const selectSelectedChain = (state: { chain: ChainState }) => state.chain.selectedChain;
export const selectAvailableChains = (state: { chain: ChainState }) => state.chain.availableChains;
export const selectChainLoading = (state: { chain: ChainState }) => state.chain.isLoading;
export const selectChainError = (state: { chain: ChainState }) => state.chain.error;

// Export the all networks chain for use in components
export { allNetworksChain };

export default chainSlice.reducer;
