'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { RegisteredToken } from '@/types/token';
import { FaStar, FaClock, FaTimes, FaPlus, FaExternalLinkAlt } from 'react-icons/fa';
import TokenRegistration from './TokenRegistration';

export default function UserTokenDashboard() {
  const { address, isConnected } = useAccount();
  const [userTokens, setUserTokens] = useState<RegisteredToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadUserTokens();
    } else {
      setUserTokens([]);
      setLoading(false);
    }
  }, [isConnected, address]);

  const loadUserTokens = () => {
    try {
      const storedTokens = JSON.parse(localStorage.getItem('registeredTokens') || '[]') as RegisteredToken[];
      const myTokens = storedTokens.filter(
        token => token.walletAddress && address && 
        token.walletAddress.toLowerCase() === address.toLowerCase()
      );
      setUserTokens(myTokens);
    } catch (error) {
      console.error('Error loading user tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenRegistered = (token: RegisteredToken) => {
    setUserTokens(prev => [...prev, token]);
    setShowRegistration(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-900/20 border-green-500';
      case 'rejected': return 'text-red-400 bg-red-900/20 border-red-500';
      default: return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <FaStar className="text-green-400" />;
      case 'rejected': return <FaTimes className="text-red-400" />;
      default: return <FaClock className="text-yellow-400" />;
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

  const approvedTokens = userTokens.filter(token => token.status === 'approved');
  const pendingTokens = userTokens.filter(token => token.status === 'pending');
  const rejectedTokens = userTokens.filter(token => token.status === 'rejected');

  if (!isConnected) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">My Registered Tokens</h2>
        <p className="text-gray-400 mb-4">
          Connect your wallet to view and manage your registered tokens for Race to Liberty boosts.
        </p>
        <div className="text-center">
          <p className="text-gray-500">Please connect your wallet to continue</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">My Registered Tokens</h2>
        <p className="text-gray-400">Loading your tokens...</p>
      </div>
    );
  }

  if (showRegistration) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Register New Token</h2>
          <button
            onClick={() => setShowRegistration(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <TokenRegistration onTokenRegistered={handleTokenRegistered} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">My Registered Tokens</h2>
          <button
            onClick={() => setShowRegistration(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FaPlus /> Register New Token
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{approvedTokens.length}</div>
            <div className="text-green-300">Approved</div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{pendingTokens.length}</div>
            <div className="text-yellow-300">Pending</div>
          </div>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{rejectedTokens.length}</div>
            <div className="text-red-300">Rejected</div>
          </div>
        </div>
      </div>

      {/* Approved Tokens */}
      {approvedTokens.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaStar className="text-green-400" />
            Approved Tokens ({approvedTokens.length})
          </h3>
          <p className="text-gray-400 mb-4">
            These tokens are available for boost multipliers in Race to Liberty!
          </p>
          <div className="grid gap-4">
            {approvedTokens.map(token => (
              <div key={token.id} className="bg-green-900/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {token.logo && (
                      <img src={token.logo} alt={token.name} className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-white">{token.name} ({token.symbol})</h4>
                      <p className="text-sm text-gray-400">
                        {token.chain.charAt(0).toUpperCase() + token.chain.slice(1)} • 
                        <span className="text-green-400 font-medium ml-1">
                          {token.boostMultiplier}x boost multiplier
                        </span>
                      </p>
                      <p className="text-gray-300 text-sm mt-1">{token.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-green-400 mb-1">
                      <FaStar className="text-xs" />
                      Approved
                    </div>
                    <div className="text-gray-400">{formatDate(token.approvedAt!)}</div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-green-500/20">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-400">
                      Contract: <span className="font-mono text-gray-300">{token.contractAddress.slice(0, 10)}...{token.contractAddress.slice(-8)}</span>
                    </div>
                    <div className="flex gap-2">
                      {token.website && (
                        <a href={token.website} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          <FaExternalLinkAlt className="text-xs" /> Website
                        </a>
                      )}
                      {token.twitter && (
                        <a href={token.twitter} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          <FaExternalLinkAlt className="text-xs" /> Twitter
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Tokens */}
      {pendingTokens.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaClock className="text-yellow-400" />
            Pending Approval ({pendingTokens.length})
          </h3>
          <p className="text-gray-400 mb-4">
            These tokens are waiting for admin approval.
          </p>
          <div className="grid gap-4">
            {pendingTokens.map(token => (
              <div key={token.id} className="bg-yellow-900/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {token.logo && (
                      <img src={token.logo} alt={token.name} className="w-8 h-8 rounded-full" />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-white">{token.name} ({token.symbol})</h4>
                      <p className="text-sm text-gray-400">
                        {token.chain.charAt(0).toUpperCase() + token.chain.slice(1)} • 
                        Potential {token.boostMultiplier}x boost
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-yellow-400 mb-1">
                      <FaClock className="text-xs" />
                      Pending
                    </div>
                    <div className="text-gray-400">{formatDate(token.submittedAt)}</div>
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
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaTimes className="text-red-400" />
            Rejected Tokens ({rejectedTokens.length})
          </h3>
          <div className="grid gap-4">
            {rejectedTokens.map(token => (
              <div key={token.id} className="bg-red-900/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {token.logo && (
                      <img src={token.logo} alt={token.name} className="w-8 h-8 rounded-full" />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-white">{token.name} ({token.symbol})</h4>
                      <p className="text-sm text-gray-400">
                        {token.chain.charAt(0).toUpperCase() + token.chain.slice(1)}
                      </p>
                      {token.rejectionReason && (
                        <p className="text-red-400 text-sm mt-1">
                          Reason: {token.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-red-400">
                      <FaTimes className="text-xs" />
                      Rejected
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {userTokens.length === 0 && (
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 text-center">
          <div className="mb-4">
            <FaPlus className="text-4xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Tokens Registered</h3>
            <p className="text-gray-400 mb-6">
              Register your tokens to unlock boost multipliers in Race to Liberty and increase your points earnings.
            </p>
            <button
              onClick={() => setShowRegistration(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <FaPlus /> Register Your First Token
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-semibold mb-2">How Token Boosts Work</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Register your tokens for admin review and approval</li>
          <li>• Approved tokens get boost multipliers based on their category</li>
          <li>• Use approved tokens in Race to Liberty for enhanced point earnings</li>
          <li>• Higher category tokens (DeFi, Gaming) provide better multipliers</li>
          <li>• Boost multipliers stack with tier multipliers for maximum points</li>
        </ul>
      </div>
    </div>
  );
}
