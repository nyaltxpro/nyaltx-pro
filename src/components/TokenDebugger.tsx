'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { RegisteredToken } from '@/types/token';

export default function TokenDebugger() {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<RegisteredToken[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    if (isConnected && address) {
      loadAndAnalyzeTokens();
    }
  }, [isConnected, address]);

  const loadAndAnalyzeTokens = () => {
    try {
      const storedTokens = JSON.parse(localStorage.getItem('registeredTokens') || '[]') as RegisteredToken[];
      setTokens(storedTokens);

      // Debug analysis
      const currentAddress = address?.toLowerCase();
      const userTokens = storedTokens.filter(token => 
        token.walletAddress.toLowerCase() === currentAddress
      );
      const approvedUserTokens = userTokens.filter(token => token.status === 'approved');
      
      setDebugInfo({
        totalTokens: storedTokens.length,
        currentAddress,
        userTokens: userTokens.length,
        approvedUserTokens: approvedUserTokens.length,
        tokensByStatus: {
          pending: storedTokens.filter(t => t.status === 'pending').length,
          approved: storedTokens.filter(t => t.status === 'approved').length,
          rejected: storedTokens.filter(t => t.status === 'rejected').length,
        },
        userTokensByStatus: {
          pending: userTokens.filter(t => t.status === 'pending').length,
          approved: userTokens.filter(t => t.status === 'approved').length,
          rejected: userTokens.filter(t => t.status === 'rejected').length,
        }
      });
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const approveAllUserTokens = () => {
    try {
      const storedTokens = JSON.parse(localStorage.getItem('registeredTokens') || '[]') as RegisteredToken[];
      const currentAddress = address?.toLowerCase();
      
      const updatedTokens = storedTokens.map(token => {
        if (token.walletAddress.toLowerCase() === currentAddress && token.status === 'pending') {
          return {
            ...token,
            status: 'approved' as const,
            approvedAt: Date.now(),
            approvedBy: currentAddress,
          };
        }
        return token;
      });

      localStorage.setItem('registeredTokens', JSON.stringify(updatedTokens));
      loadAndAnalyzeTokens();
      alert('All your pending tokens have been approved for testing!');
    } catch (error) {
      console.error('Error approving tokens:', error);
    }
  };

  const clearAllTokens = () => {
    if (confirm('Are you sure you want to clear all tokens? This cannot be undone.')) {
      localStorage.removeItem('registeredTokens');
      setTokens([]);
      setDebugInfo({});
      alert('All tokens cleared!');
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
        <h3 className="text-red-400 font-bold mb-2">Token Debugger</h3>
        <p className="text-red-300">Please connect your wallet to debug token issues.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 mb-6">
      <h3 className="text-blue-400 font-bold text-lg mb-4">🔍 Token Debug Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Current Wallet</h4>
          <p className="text-gray-300 font-mono text-sm break-all">{address}</p>
          <p className="text-gray-400 text-sm mt-1">Lowercase: {debugInfo.currentAddress}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Token Summary</h4>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300">Total tokens in storage: <span className="text-yellow-400">{debugInfo.totalTokens}</span></p>
            <p className="text-gray-300">Your tokens: <span className="text-blue-400">{debugInfo.userTokens}</span></p>
            <p className="text-gray-300">Your approved tokens: <span className="text-green-400">{debugInfo.approvedUserTokens}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">All Tokens by Status</h4>
          <div className="space-y-1 text-sm">
            <p className="text-yellow-400">Pending: {debugInfo.tokensByStatus?.pending || 0}</p>
            <p className="text-green-400">Approved: {debugInfo.tokensByStatus?.approved || 0}</p>
            <p className="text-red-400">Rejected: {debugInfo.tokensByStatus?.rejected || 0}</p>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Your Tokens by Status</h4>
          <div className="space-y-1 text-sm">
            <p className="text-yellow-400">Pending: {debugInfo.userTokensByStatus?.pending || 0}</p>
            <p className="text-green-400">Approved: {debugInfo.userTokensByStatus?.approved || 0}</p>
            <p className="text-red-400">Rejected: {debugInfo.userTokensByStatus?.rejected || 0}</p>
          </div>
        </div>
      </div>

      {tokens.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-3">Your Registered Tokens</h4>
          <div className="space-y-2">
            {tokens
              .filter(token => token.walletAddress.toLowerCase() === address?.toLowerCase())
              .map(token => (
                <div key={token.id} className="flex items-center justify-between bg-gray-700 rounded p-3">
                  <div>
                    <span className="text-white font-medium">{token.name} ({token.symbol})</span>
                    <span className="text-gray-400 ml-2">• {token.boostMultiplier}x</span>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      token.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                      token.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {token.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={approveAllUserTokens}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          🚀 Approve All My Tokens (Test)
        </button>
        
        <button
          onClick={loadAndAnalyzeTokens}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          🔄 Refresh Debug Info
        </button>
        
        <button
          onClick={clearAllTokens}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          🗑️ Clear All Tokens
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-sm">
          <strong>Debug Tips:</strong> If you see your tokens but they're not showing in Race to Liberty, 
          they might be in 'pending' status. Use the "Approve All My Tokens" button to test, 
          or ask an admin to approve them properly.
        </p>
      </div>
    </div>
  );
}
