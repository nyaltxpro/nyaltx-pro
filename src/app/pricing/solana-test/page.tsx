'use client';

import React, { useState } from 'react';
import { SolanaPaymentButton } from '@/components/SolanaPaymentButton';
import SolanaWalletButton from '@/components/SolanaWalletButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import toast from 'react-hot-toast';

export default function SolanaTestPage() {
  const { connected, publicKey } = useWallet();
  const [testAmount, setTestAmount] = useState(1);
  const [isTestnet, setIsTestnet] = useState(true);
  const [lastTransaction, setLastTransaction] = useState<string | null>(null);

  const handlePaymentSuccess = (txHash: string) => {
    console.log('✅ Solana test payment successful:', txHash);
    setLastTransaction(txHash);
    toast.success('🎉 Test payment completed successfully!');
    
    // Show explorer link
    const explorerUrl = isTestnet 
      ? `https://explorer.solana.com/tx/${txHash}?cluster=testnet`
      : `https://solscan.io/tx/${txHash}`;
    
    toast.success(
      <div>
        <p>View on Explorer:</p>
        <a 
          href={explorerUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          {txHash.slice(0, 8)}...{txHash.slice(-8)}
        </a>
      </div>,
      { duration: 8000 }
    );
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Solana test payment failed:', error);
    toast.error(`Payment failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧪 Solana Wallet Test
          </h1>
          <p className="text-gray-300 text-lg">
            Test your Solana wallet connectivity with a $1 transaction
          </p>
        </div>

        {/* Network Toggle */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Network Selection</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="network"
                checked={isTestnet}
                onChange={() => setIsTestnet(true)}
                className="text-purple-500"
              />
              <span className="text-white">Solana Testnet (Recommended for testing)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="network"
                checked={!isTestnet}
                onChange={() => setIsTestnet(false)}
                className="text-purple-500"
              />
              <span className="text-white">Solana Mainnet (Real SOL)</span>
            </label>
          </div>
          {isTestnet && (
            <div className="mt-3 p-3 bg-blue-900/30 border border-blue-500 rounded-lg">
              <p className="text-blue-300 text-sm">
                💡 <strong>Testnet Mode:</strong> Get free testnet SOL from{' '}
                <a 
                  href="https://faucet.solana.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  Solana Faucet
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Wallet Connection */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Wallet Connection</h3>
          
          <div className="flex flex-col items-center space-y-4">
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-500 !rounded-xl !h-auto !py-3 !px-6 !text-white !font-medium" />
            
            {connected && publicKey && (
              <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 w-full">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-green-300 font-medium">Wallet Connected</span>
                </div>
                <p className="text-green-200 text-sm mt-1">
                  Address: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Test */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Payment Test</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Test Amount (USD)
              </label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                min="0.01"
                max="10"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-gray-400 text-xs mt-1">
                Minimum: $0.01, Maximum: $10.00
              </p>
            </div>

            {connected ? (
              <SolanaPaymentButton
                amount={testAmount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                className="w-full"
              />
            ) : (
              <div className="p-4 bg-yellow-900/30 border border-yellow-500 rounded-lg">
                <p className="text-yellow-300 text-center">
                  Please connect your Solana wallet to test payments
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        {lastTransaction && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Last Transaction</h3>
            
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 font-medium">Payment Successful</p>
                  <p className="text-green-200 text-sm">Amount: ${testAmount} USD</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 text-sm">Transaction ID:</p>
                  <p className="text-green-300 font-mono text-xs">
                    {lastTransaction.slice(0, 8)}...{lastTransaction.slice(-8)}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <a
                  href={isTestnet 
                    ? `https://explorer.solana.com/tx/${lastTransaction}?cluster=testnet`
                    : `https://solscan.io/tx/${lastTransaction}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
                >
                  View on Explorer
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(lastTransaction)}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
                >
                  Copy TX ID
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">How to Test</h3>
          
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white text-sm rounded-full flex items-center justify-center">1</span>
              <p>Install <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">Phantom Wallet</a> browser extension</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white text-sm rounded-full flex items-center justify-center">2</span>
              <p>Create or import a Solana wallet in Phantom</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white text-sm rounded-full flex items-center justify-center">3</span>
              <p>For testnet: Get free SOL from <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Solana Faucet</a></p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white text-sm rounded-full flex items-center justify-center">4</span>
              <p>Connect your wallet using the button above</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white text-sm rounded-full flex items-center justify-center">5</span>
              <p>Test a small payment to verify everything works</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
