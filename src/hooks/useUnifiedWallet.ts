'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

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
  // Wagmi EVM state
  const {
    isConnected: isWagmiConnected,
    address: wagmiAddress,
    chain: evmChain,
    isConnecting: isEvmConnecting,
    status: wagmiStatus,
  } = useAccount();

  // AppKit can report connected before/without wagmi catching up
  const {
    address: appKitAddress,
    isConnected: isAppKitConnected,
    status: appKitStatus,
  } = useAppKitAccount();

  // Solana wallet state
  const {
    connected: isSolanaConnected,
    publicKey: solanaPublicKey,
    wallet: solanaWallet,
    connecting: isSolanaConnecting,
  } = useWallet();

  const solanaAddress = solanaPublicKey?.toString() || null;
  const isEvmConnected = Boolean(
    (isWagmiConnected && wagmiAddress) || (isAppKitConnected && appKitAddress)
  );
  const evmAddress = (wagmiAddress || appKitAddress || null) as string | null;
  const isEvmConnectingState =
    isEvmConnecting ||
    wagmiStatus === 'connecting' ||
    wagmiStatus === 'reconnecting' ||
    appKitStatus === 'connecting' ||
    appKitStatus === 'reconnecting';

  return useMemo(() => {
    const primaryWalletType: 'evm' | 'solana' | null = isEvmConnected
      ? 'evm'
      : isSolanaConnected
        ? 'solana'
        : null;

    const primaryAddress =
      primaryWalletType === 'evm'
        ? evmAddress
        : primaryWalletType === 'solana'
          ? solanaAddress
          : null;

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
          case 1:
            return `https://etherscan.io/address/${address}`;
          case 56:
            return `https://bscscan.com/address/${address}`;
          case 137:
            return `https://polygonscan.com/address/${address}`;
          case 42161:
            return `https://arbiscan.io/address/${address}`;
          case 10:
            return `https://optimistic.etherscan.io/address/${address}`;
          case 11155111:
            return `https://sepolia.etherscan.io/address/${address}`;
          default:
            return `https://etherscan.io/address/${address}`;
        }
      }

      if (primaryWalletType === 'solana') {
        return `https://explorer.solana.com/address/${address}`;
      }

      return '';
    };

    return {
      isConnected: isEvmConnected || isSolanaConnected,
      isConnecting: isEvmConnectingState || isSolanaConnecting,

      address: primaryAddress,
      walletType: primaryWalletType,
      walletName:
        primaryWalletType === 'evm'
          ? 'EVM Wallet'
          : primaryWalletType === 'solana'
            ? solanaWallet?.adapter.name || 'Solana Wallet'
            : null,

      chainId: evmChain?.id || null,
      chainName: evmChain?.name || (isSolanaConnected ? 'Solana' : null),

      evmAddress,
      evmChain,
      isEvmConnected,

      solanaAddress,
      solanaWallet,
      isSolanaConnected,

      formatAddress,
      getExplorerUrl,
    };
  }, [
    isEvmConnected,
    evmAddress,
    evmChain,
    isEvmConnectingState,
    isSolanaConnected,
    solanaAddress,
    solanaWallet,
    isSolanaConnecting,
  ]);
}

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
    }

    if (preferredType === 'solana') {
      return {
        isConnected: unified.isSolanaConnected,
        address: unified.solanaAddress,
        walletType: 'solana' as const,
        chainId: null,
        chainName: 'Solana',
      };
    }

    return {
      isConnected: unified.isConnected,
      address: unified.address,
      walletType: unified.walletType,
      chainId: unified.chainId,
      chainName: unified.chainName,
    };
  }, [unified, preferredType]);
}
