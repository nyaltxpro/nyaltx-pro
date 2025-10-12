'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletSelector from './WalletSelector';
import { FaEthereum, FaCopy } from 'react-icons/fa';
import { SiSolana } from 'react-icons/si';

export default function DualWalletExample() {
  // EVM wallet state
  const { isConnected: isEvmConnected, address: evmAddress, chain } = useAccount();
  
  // Solana wallet state
  const { connected: isSolanaConnected, publicKey: solanaPublicKey, wallet: solanaWallet } = useWallet();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-2xl">
      <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
        Dual Wallet Connection
      </h2>
      
      {/* Wallet Selector */}
      <div className="mb-8">
        <WalletSelector 
          onWalletTypeChange={(type) => console.log('Selected wallet type:', type)}
        />
      </div>

      {/* Connection Status */}
      <div className="space-y-4">
        {/* EVM Wallet Status */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <div className="flex items-center gap-3 mb-3">
            <FaEthereum className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">EVM Wallet</h3>
            <div className={`w-3 h-3 rounded-full ${isEvmConnected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
          </div>
          
          {isEvmConnected ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Network:</span>
                <span className="text-white font-medium">{chain?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Address:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono text-sm">{formatAddress(evmAddress!)}</span>
                  <button
                    onClick={() => copyToClipboard(evmAddress!)}
                    className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <FaCopy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Chain ID:</span>
                <span className="text-white">{chain?.id}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Not connected</p>
          )}
        </div>

        {/* Solana Wallet Status */}
        <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <div className="flex items-center gap-3 mb-3">
            <SiSolana className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Solana Wallet</h3>
            <div className={`w-3 h-3 rounded-full ${isSolanaConnected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
          </div>
          
          {isSolanaConnected ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Wallet:</span>
                <span className="text-white font-medium">{solanaWallet?.adapter.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Address:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono text-sm">{formatAddress(solanaPublicKey!.toString())}</span>
                  <button
                    onClick={() => copyToClipboard(solanaPublicKey!.toString())}
                    className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <FaCopy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Network:</span>
                <span className="text-white">Solana Mainnet</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Not connected</p>
          )}
        </div>
      </div>

      {/* Usage Examples */}
      {(isEvmConnected || isSolanaConnected) && (
        <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
          <h4 className="text-cyan-400 font-semibold mb-2">Connected Wallets Usage:</h4>
          <div className="text-sm text-gray-300 space-y-1">
            {isEvmConnected && (
              <p>✅ EVM: Can participate in Race to Liberty, register EVM tokens, make ETH/USDT/NYAX payments</p>
            )}
            {isSolanaConnected && (
              <p>✅ Solana: Can register Solana tokens, participate in Solana-based features</p>
            )}
            {isEvmConnected && isSolanaConnected && (
              <p>🚀 Both connected: Full access to all NYALTX features across both ecosystems!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
