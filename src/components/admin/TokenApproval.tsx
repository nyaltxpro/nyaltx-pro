'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { RegisteredToken } from '@/types/token';

const ADMIN_ADDRESSES = [
  '0x77b6321d2888aa62f2a42620852fee8eedcfa77b',
  '0x81ba7b98e49014bff22f811e9405640bc2b39cc0'
];

export default function TokenApproval() {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<RegisteredToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTokens, setProcessingTokens] = useState<Set<string>>(new Set());

  const isAdmin = isConnected && address && ADMIN_ADDRESSES.includes(address.toLowerCase());

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = () => {
    try {
      const storedTokens = JSON.parse(localStorage.getItem('registeredTokens') || '[]');
      setTokens(storedTokens);
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTokenStatus = async (tokenId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    if (!isAdmin || !address) return;

    setProcessingTokens(prev => new Set(prev).add(tokenId));

    try {
      const updatedTokens = tokens.map(token => {
        if (token.id === tokenId) {
          return {
            ...token,
            status,
            approvedAt: status === 'approved' ? Date.now() : undefined,
            approvedBy: status === 'approved' ? address : undefined,
            rejectionReason: status === 'rejected' ? rejectionReason : undefined,
          };
        }
        return token;
      });

      localStorage.setItem('registeredTokens', JSON.stringify(updatedTokens));
      setTokens(updatedTokens);
    } catch (error) {
      console.error('Error updating token status:', error);
    } finally {
      setProcessingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(tokenId);
        return newSet;
      });
    }
  };

  const handleApprove = (tokenId: string) => {
    updateTokenStatus(tokenId, 'approved');
  };

  const handleReject = (tokenId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    updateTokenStatus(tokenId, 'rejected', reason || undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-900/20 border-green-500';
      case 'rejected': return 'text-red-400 bg-red-900/20 border-red-500';
      default: return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Token Approval System</h2>
        <p className="text-gray-400">Please connect your wallet to access the admin panel.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
        <p className="text-gray-400">You don't have admin privileges to access this panel.</p>
        <p className="text-gray-500 text-sm mt-2">Connected wallet: {address}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Token Approval System</h2>
        <p className="text-gray-400">Loading tokens...</p>
      </div>
    );
  }

  const pendingTokens = tokens.filter(token => token.status === 'pending');
  const approvedTokens = tokens.filter(token => token.status === 'approved');
  const rejectedTokens = tokens.filter(token => token.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Token Approval System</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{pendingTokens.length}</div>
            <div className="text-yellow-300">Pending</div>
          </div>
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{approvedTokens.length}</div>
            <div className="text-green-300">Approved</div>
          </div>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{rejectedTokens.length}</div>
            <div className="text-red-300">Rejected</div>
          </div>
        </div>
      </div>

      {/* Pending Tokens */}
      {pendingTokens.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Pending Approval ({pendingTokens.length})</h3>
          <div className="space-y-4">
            {pendingTokens.map(token => (
              <div key={token.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {token.logo && (
                        <img src={token.logo} alt={token.name} className="w-8 h-8 rounded-full" />
                      )}
                      <div>
                        <h4 className="text-lg font-semibold text-white">{token.name} ({token.symbol})</h4>
                        <p className="text-sm text-gray-400">
                          {token.chain.charAt(0).toUpperCase() + token.chain.slice(1)} • 
                          Boost: {token.boostMultiplier}x
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-3">{token.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Contract:</span>
                        <p className="text-gray-300 font-mono break-all">{token.contractAddress}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Submitted by:</span>
                        <p className="text-gray-300 font-mono">{token.walletAddress}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Submitted:</span>
                        <p className="text-gray-300">{formatDate(token.submittedAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        {token.website && (
                          <a href={token.website} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-400 hover:text-blue-300">Website</a>
                        )}
                        {token.twitter && (
                          <a href={token.twitter} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-400 hover:text-blue-300">Twitter</a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(token.id)}
                      disabled={processingTokens.has(token.id)}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {processingTokens.has(token.id) ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(token.id)}
                      disabled={processingTokens.has(token.id)}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {processingTokens.has(token.id) ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Tokens */}
      {approvedTokens.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Approved Tokens ({approvedTokens.length})</h3>
          <div className="grid gap-4">
            {approvedTokens.map(token => (
              <div key={token.id} className="bg-gray-800 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {token.logo && (
                      <img src={token.logo} alt={token.name} className="w-6 h-6 rounded-full" />
                    )}
                    <div>
                      <span className="text-white font-medium">{token.name} ({token.symbol})</span>
                      <span className="text-gray-400 ml-2">• {token.boostMultiplier}x boost</span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-green-400">Approved</div>
                    <div className="text-gray-400">{formatDate(token.approvedAt!)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Tokens */}
      {rejectedTokens.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Rejected Tokens ({rejectedTokens.length})</h3>
          <div className="grid gap-4">
            {rejectedTokens.map(token => (
              <div key={token.id} className="bg-gray-800 rounded-lg p-4 border border-red-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {token.logo && (
                      <img src={token.logo} alt={token.name} className="w-6 h-6 rounded-full" />
                    )}
                    <div>
                      <span className="text-white font-medium">{token.name} ({token.symbol})</span>
                      {token.rejectionReason && (
                        <p className="text-gray-400 text-sm mt-1">Reason: {token.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-red-400">Rejected</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tokens.length === 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 text-center">
          <p className="text-gray-400">No tokens have been registered yet.</p>
        </div>
      )}
    </div>
  );
}
