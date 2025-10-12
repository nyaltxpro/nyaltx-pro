'use client';

import React from 'react';
import DualWalletExample from '@/components/DualWalletExample';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { FaEthereum, FaCoins } from 'react-icons/fa';
import { SiSolana } from 'react-icons/si';

export default function WalletDemoPage() {
  const { 
    isConnected, 
    walletType, 
    address, 
    chainName,
    isEvmConnected,
    isSolanaConnected,
    formatAddress 
  } = useUnifiedWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            Dual Wallet Integration Demo
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            Connect both EVM and Solana wallets to experience the full NYALTX ecosystem
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connection Status */}
          <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <h3 className="text-lg font-semibold text-white">Connection Status</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Overall:</span>
                <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Primary Wallet:</span>
                <span className="text-white">{walletType || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Address:</span>
                <span className="text-white font-mono">{address ? formatAddress(address) : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network:</span>
                <span className="text-white">{chainName || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* EVM Status */}
          <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaEthereum className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">EVM Wallets</h3>
              <div className={`w-3 h-3 rounded-full ${isEvmConnected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">
                {isEvmConnected ? (
                  <>
                    <p className="text-green-400 mb-2">✅ Connected</p>
                    <p>• Race to Liberty participation</p>
                    <p>• ETH/USDT/NYAX payments</p>
                    <p>• EVM token registration</p>
                    <p>• Multi-chain trading</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 mb-2">❌ Not Connected</p>
                    <p>Connect to access:</p>
                    <p>• Ethereum ecosystem</p>
                    <p>• DeFi protocols</p>
                    <p>• NFT trading</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Solana Status */}
          <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <SiSolana className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Solana Wallets</h3>
              <div className={`w-3 h-3 rounded-full ${isSolanaConnected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">
                {isSolanaConnected ? (
                  <>
                    <p className="text-green-400 mb-2">✅ Connected</p>
                    <p>• Solana token registration</p>
                    <p>• SOL payments</p>
                    <p>• Solana DeFi access</p>
                    <p>• Fast transactions</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 mb-2">❌ Not Connected</p>
                    <p>Connect to access:</p>
                    <p>• Solana ecosystem</p>
                    <p>• Low-cost transactions</p>
                    <p>• Solana NFTs</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Demo Component */}
        <DualWalletExample />

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NYALTX Features */}
          <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaCoins className="text-cyan-400" />
              NYALTX Features
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span>Token Registration & Approval</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span>Race to Liberty Gamification</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span>Live Streaming Platform</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span>Multi-chain Trading</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span>Boost Pack System</span>
              </div>
            </div>
          </div>

          {/* Integration Benefits */}
          <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Integration Benefits</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 font-medium mb-1">EVM Integration</p>
                <p>Access to Ethereum, BSC, Polygon, Arbitrum, and Optimism ecosystems</p>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-purple-400 font-medium mb-1">Solana Integration</p>
                <p>Fast, low-cost transactions with 20+ wallet options</p>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-cyan-400 font-medium mb-1">Unified Experience</p>
                <p>Seamless switching between ecosystems in one platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="text-white font-semibold mb-2">For EVM Users:</h4>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Click "Connect Wallet" and select EVM wallets</li>
                <li>Choose MetaMask, Coinbase, or any WalletConnect wallet</li>
                <li>Access Race to Liberty, token registration, and payments</li>
                <li>Optionally connect Solana wallet for full access</li>
              </ol>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">For Solana Users:</h4>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Click "Connect Wallet" and select Solana wallets</li>
                <li>Choose Phantom, Solflare, or any Solana wallet</li>
                <li>Register Solana tokens and participate in features</li>
                <li>Optionally connect EVM wallet for cross-chain access</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
