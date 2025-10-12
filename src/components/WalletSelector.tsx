'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppKit } from '@reown/appkit/react';
import SolanaMultiWalletButton from './SolanaMultiWalletButton';
import { FaEthereum, FaWallet } from 'react-icons/fa';
import { SiSolana } from 'react-icons/si';

interface WalletSelectorProps {
  className?: string;
  onWalletTypeChange?: (type: 'evm' | 'solana' | null) => void;
}

export default function WalletSelector({ 
  className = '',
  onWalletTypeChange
}: WalletSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);
  
  // EVM wallet state
  const { isConnected: isEvmConnected, address: evmAddress } = useAccount();
  const { open: openEvmModal } = useAppKit();
  
  // Solana wallet state
  const { connected: isSolanaConnected, publicKey: solanaPublicKey } = useWallet();

  const handleEvmConnect = () => {
    openEvmModal({ view: 'Connect' });
    onWalletTypeChange?.('evm');
    setShowSelector(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // If both wallets connected, show both
  if (isEvmConnected && isSolanaConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-xl">
          <FaEthereum className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-white">{formatAddress(evmAddress!)}</span>
        </div>
        <SolanaMultiWalletButton variant="compact" />
      </div>
    );
  }

  // If only EVM connected
  if (isEvmConnected && !isSolanaConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-xl">
          <FaEthereum className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-white">{formatAddress(evmAddress!)}</span>
        </div>
        <SolanaMultiWalletButton />
      </div>
    );
  }

  // If only Solana connected
  if (isSolanaConnected && !isEvmConnected) {
    return (
      <div className="flex items-center gap-2">
        <SolanaMultiWalletButton variant="compact" />
        <button
          onClick={handleEvmConnect}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-xl hover:bg-blue-600/30 transition-colors"
        >
          <FaEthereum className="w-4 h-4 text-blue-400" />
          <span className="text-sm">Connect EVM</span>
        </button>
      </div>
    );
  }

  // No wallets connected
  return (
    <div className="relative">
      <button
        onClick={() => setShowSelector(!showSelector)}
        className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 ${className}`}
      >
        <FaWallet className="w-4 h-4" />
        <span className="font-medium">Connect Wallet</span>
      </button>

      {showSelector && (
        <div className="absolute right-0 top-12 bg-gray-800/95 backdrop-blur-lg border border-gray-700/50 rounded-xl p-4 min-w-[250px] shadow-2xl z-50">
          <div className="space-y-3">
            <button
              onClick={handleEvmConnect}
              className="w-full flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
            >
              <FaEthereum className="w-5 h-5 text-blue-400" />
              <span className="text-white">EVM Wallets</span>
            </button>
            
            <div className="w-full">
              <SolanaMultiWalletButton className="w-full" />
            </div>
          </div>
        </div>
      )}

      {showSelector && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}
