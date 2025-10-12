'use client';

import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

export interface UnifiedWalletState {
  // Connection status
  isConnected: boolean;
  isConnecting: boolean;
  
  // Wallet information
  address: string | null;
  walletType: 'evm' | 'solana' | null;
  walletName: string | null;
  
  // Chain/Network information
  chainId: number | null;
  chainName: string | null;
  
  // EVM specific
  evmAddress: string | null;
  evmChain: any;
  isEvmConnected: boolean;
  
  // Solana specific
  solanaAddress: string | null;
  solanaWallet: any;
  isSolanaConnected: boolean;
  
  // Utility functions
  formatAddress: (addr?: string) => string;
  getExplorerUrl: (addr?: string) => string;
}

export function useUnifiedWallet(): UnifiedWalletState {
  // EVM wallet state
  const { 
    isConnected: isEvmConnected, 
    address: evmAddress, 
    chain: evmChain,
    isConnecting: isEvmConnecting 
  } = useAccount();
  
  // Solana wallet state
  const { 
    connected: isSolanaConnected, 
    publicKey: solanaPublicKey, 
    wallet: solanaWallet,
    connecting: isSolanaConnecting 
  } = useWallet();

  const solanaAddress = solanaPublicKey?.toString() || null;

  return useMemo(() => {
    // Determine primary wallet (prefer EVM if both connected)
    const primaryWalletType: 'evm' | 'solana' | null = 
      isEvmConnected ? 'evm' : 
      isSolanaConnected ? 'solana' : 
      null;
    
    const primaryAddress = 
      primaryWalletType === 'evm' ? evmAddress || null :
      primaryWalletType === 'solana' ? solanaAddress :
      null;
    
    const formatAddress = (addr?: string) => {
      const address = addr || primaryAddress;
      if (!address) return '';
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };
    
    const getExplorerUrl = (addr?: string) => {
      const address = addr || primaryAddress;
      if (!address) return '';
      
      if (primaryWalletType === 'evm') {
        const chainId = evmChain?.id;
        switch (chainId) {
          case 1: return `https://etherscan.io/address/${address}`;
          case 56: return `https://bscscan.com/address/${address}`;
          case 137: return `https://polygonscan.com/address/${address}`;
          case 42161: return `https://arbiscan.io/address/${address}`;
          case 10: return `https://optimistic.etherscan.io/address/${address}`;
          default: return `https://etherscan.io/address/${address}`;
        }
      } else if (primaryWalletType === 'solana') {
        return `https://explorer.solana.com/address/${address}`;
      }
      
      return '';
    };

    return {
      // Connection status
      isConnected: isEvmConnected || isSolanaConnected,
      isConnecting: isEvmConnecting || isSolanaConnecting,
      
      // Wallet information
      address: primaryAddress,
      walletType: primaryWalletType,
      walletName: primaryWalletType === 'evm' ? 'EVM Wallet' : 
                 primaryWalletType === 'solana' ? solanaWallet?.adapter.name || 'Solana Wallet' : 
                 null,
      
      // Chain/Network information
      chainId: evmChain?.id || null,
      chainName: evmChain?.name || (isSolanaConnected ? 'Solana' : null),
      
      // EVM specific
      evmAddress: evmAddress || null,
      evmChain,
      isEvmConnected,
      
      // Solana specific
      solanaAddress,
      solanaWallet,
      isSolanaConnected,
      
      // Utility functions
      formatAddress,
      getExplorerUrl,
    };
  }, [
    isEvmConnected,
    evmAddress,
    evmChain,
    isEvmConnecting,
    isSolanaConnected,
    solanaAddress,
    solanaWallet,
    isSolanaConnecting
  ]);
}

// Hook for components that need to work with a specific wallet type
export function useWalletByType(preferredType?: 'evm' | 'solana') {
  const unified = useUnifiedWallet();
  
  return useMemo(() => {
    if (preferredType === 'evm') {
      return {
        isConnected: unified.isEvmConnected,
        address: unified.evmAddress,
        walletType: 'evm' as const,
        chainId: unified.chainId,
        chainName: unified.chainName,
      };
    } else if (preferredType === 'solana') {
      return {
        isConnected: unified.isSolanaConnected,
        address: unified.solanaAddress,
        walletType: 'solana' as const,
        chainId: null,
        chainName: 'Solana',
      };
    }
    
    // Return primary wallet
    return {
      isConnected: unified.isConnected,
      address: unified.address,
      walletType: unified.walletType,
      chainId: unified.chainId,
      chainName: unified.chainName,
    };
  }, [unified, preferredType]);
}
