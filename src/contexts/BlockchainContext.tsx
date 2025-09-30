'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BlockchainContextType {
  selectedChain: string;
  setSelectedChain: (chain: string) => void;
  chainFilter: string | null;
  setChainFilter: (filter: string | null) => void;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

interface BlockchainProviderProps {
  children: ReactNode;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children }) => {
  const [selectedChain, setSelectedChain] = useState<string>('ethereum');
  const [chainFilter, setChainFilter] = useState<string | null>(null);

  // Map blockchain IDs to chain identifiers for filtering
  const blockchainToChainMap: Record<string, string> = {
    'ethereum': 'ethereum',
    'binance-smart-chain': 'binance',
    'polygon-pos': 'polygon',
    'avalanche': 'avalanche',
    'arbitrum-one': 'arbitrum',
    'optimistic-ethereum': 'optimism',
    'base': 'base',
    'fantom': 'fantom',
    'solana': 'solana',
    'bitcoin': 'bitcoin',
    'tron': 'tron',
    'cardano': 'cardano',
    'cosmos': 'cosmos',
    'polkadot': 'polkadot',
    'near-protocol': 'near',
    'internet-computer': 'icp',
    'celestia': 'celestia',
    'ronin': 'ronin',
    'sei-v2': 'sei',
    'sui': 'sui',
    'xai': 'xai'
  };

  // Update chain filter when selected chain changes
  useEffect(() => {
    const mappedChain = blockchainToChainMap[selectedChain];
    setChainFilter(mappedChain || selectedChain);
    console.log(`🔗 Blockchain filter updated: ${selectedChain} -> ${mappedChain || selectedChain}`);
  }, [selectedChain]);

  const value = {
    selectedChain,
    setSelectedChain,
    chainFilter,
    setChainFilter
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = (): BlockchainContextType => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export default BlockchainContext;
