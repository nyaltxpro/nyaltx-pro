'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { FaEthereum, FaWallet, FaRegCopy, FaCheck, FaTwitter, FaDiscord } from 'react-icons/fa';
import { BiEdit, BiLogOut } from 'react-icons/bi';
import { RiExchangeFill } from 'react-icons/ri';
import ConnectWalletButton from '../../../../components/ConnectWalletButton';
import SocialLinksEditor from '../../../../components/SocialLinksEditor';
import ProfileBoostSelector from '../../../../components/ProfileBoostSelector';
import { useAppKit } from "@reown/appkit/react";
export default function ProfilePage() {
  const { isConnected: isWagmiConnected, address } = useAccount();

  const { open, close } = useAppKit();
  const [activeTab, setActiveTab] = useState('tokens');
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [myRegisteredTokens, setMyRegisteredTokens] = useState<any[] | null>(null);
  const [myRegError, setMyRegError] = useState<string | null>(null);
  const [myCreatedTokens, setMyCreatedTokens] = useState<any[] | null>(null);
  const [myCreatedError, setMyCreatedError] = useState<string | null>(null);

  // Mock user data
  const mockUser = {
    name: 'Crypto Enthusiast',
    walletAddress: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0',
    avatarUrl: '/crypto-icons/color/eth.svg',
    bannerUrl: '/banner/1.png',
    ethBalance: 3.245,
    tokens: [
      { symbol: 'ETH', name: 'Ethereum', balance: 3.245, value: 9735.00, icon: '/crypto-icons/color/eth.svg' },
      { symbol: 'BTC', name: 'Bitcoin', balance: 0.125, value: 7625.00, icon: '/crypto-icons/color/btc.svg' },
      { symbol: 'SOL', name: 'Solana', balance: 45.75, value: 2287.50, icon: '/crypto-icons/color/sol.svg' },
      { symbol: 'USDT', name: 'Tether', balance: 1250.00, value: 1250.00, icon: '/crypto-icons/color/usdt.svg' },
    ],
  };

  // Combined connected state (prefer real wallet connection if present)
  const derivedConnected = isWagmiConnected || isConnected;
  const userAddress = address || mockUser.walletAddress;

  // Note: Tab system removed - now shows all sections when connected

  // Load user's registered tokens when connected
  React.useEffect(() => {
    if (!derivedConnected || !userAddress) {
      setMyRegisteredTokens(null);
      return;
    }
    setMyRegError(null);
    setMyRegisteredTokens(null);
    fetch(`/api/tokens/by-user?address=${encodeURIComponent(userAddress)}`)
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
      .then((d) => setMyRegisteredTokens(d?.data || []))
      .catch((e) => setMyRegError(e?.error || 'Failed to load submissions'));
  }, [derivedConnected, userAddress]);

  // Load user's created tokens when connected
  React.useEffect(() => {
    if (!derivedConnected || !userAddress) {
      setMyCreatedTokens(null);
      return;
    }
    setMyCreatedError(null);
    setMyCreatedTokens(null);
    fetch(`/api/tokens/created?address=${encodeURIComponent(userAddress)}`)
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
      .then((d) => setMyCreatedTokens(d?.data || []))
      .catch((e) => setMyCreatedError(e?.error || 'Failed to load created tokens'));
  }, [derivedConnected, userAddress]);

  // Handle wallet connection
  const handleConnectWallet = () => {
    // Open the wallet connection modal
    open({ view: 'Connect' });
    // Don't set isConnected here - let wagmi handle the connection state
    // The derivedConnected will automatically update when wallet connects
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    // Open the account modal where user can disconnect
    open({ view: 'Account' });
  };

  // Copy wallet address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(userAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Handle token update from SocialLinksEditor
  const handleTokenUpdate = (tokenId: string, updatedToken: any) => {
    // Update registered tokens
    if (myRegisteredTokens) {
      setMyRegisteredTokens(prev =>
        prev?.map(token => token.id === tokenId ? updatedToken : token) || []
      );
    }

    // Update created tokens
    if (myCreatedTokens) {
      setMyCreatedTokens(prev =>
        prev?.map(token => token.id === tokenId ? updatedToken : token) || []
      );
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Profile Banner */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-16 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-700/40"></div>
        <Image
          src={mockUser.bannerUrl}
          alt="Profile Banner"
          fill
          className="object-cover mix-blend-overlay"
        />

        {/* Profile Avatar */}
        <div className="absolute -bottom-12 left-8">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white/20 backdrop-blur-sm bg-gray-800/50 shadow-2xl">
            <Image
              src={mockUser.avatarUrl}
              alt="Profile Avatar"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20"></div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-3">
            {mockUser.name}
          </h1>

          {derivedConnected ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700/50">
                <FaEthereum className="text-blue-400 mr-2" />
                <span className="text-gray-300 text-sm mr-3 font-mono">{formatWalletAddress(userAddress)}</span>
                <button
                  onClick={copyToClipboard}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700/50"
                >
                  {copied ? <FaCheck className="text-green-400" /> : <FaRegCopy />}
                </button>
              </div>
              <button
                onClick={handleDisconnectWallet}
                className="flex items-center text-red-400 hover:text-red-300 text-sm px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all duration-200"
              >
                <BiLogOut className="mr-1" /> Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="flex items-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
            >
              <FaWallet className="mr-2" /> Connect Wallet
            </button>
          )}
        </div>

        {derivedConnected && (
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center border border-gray-700/50">
              <FaEthereum className="text-blue-400 mr-3 text-xl" />
              <div>
                <div className="text-white font-semibold">{mockUser.ethBalance} ETH</div>
                <div className="text-xs text-gray-400">Main Balance</div>
              </div>
            </div>
            <button className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm hover:from-gray-700/80 hover:to-gray-800/80 p-3 rounded-xl text-white border border-gray-700/50 transition-all duration-200">
              <BiEdit />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      {/* <div className="flex bg-gray-800/30 rounded-xl p-1 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap rounded-lg transition-all duration-200 ${
            activeTab === 'tokens' 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          💰 My Tokens
        </button>
        <button
          onClick={() => setActiveTab('social-links')}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap rounded-lg transition-all duration-200 ${
            activeTab === 'social-links' 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          🔗 Social Links
        </button>
        <button
          onClick={() => setActiveTab('boost')}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap rounded-lg transition-all duration-200 ${
            activeTab === 'boost' 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          🚀 Profile Boost
        </button>
      </div> */}

      {/* My Tokens Tab */}

      <div>


        {/* My Registered Token Submissions */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden mt-6">
          <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">My Registered Tokens</h3>
              <p className="text-sm text-gray-400">Tokens you've submitted for approval</p>
            </div>
            <a
              href="/dashboard/register-token"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
            >
              Submit New Token
            </a>
          </div>
          <div className="p-6">
            {!myRegisteredTokens ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                <span className="ml-3 text-gray-400">Loading tokens...</span>
              </div>
            ) : myRegisteredTokens.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🪙</span>
                </div>
                <h4 className="text-lg font-medium text-white mb-2">No tokens registered yet</h4>
                <p className="text-gray-400 mb-6">Submit your first token to get started with the NYALTX ecosystem</p>
                <a
                  href="/dashboard/register-token"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Register Your First Token
                </a>
              </div>
            ) : (
              <div className="grid gap-4">
                {myRegisteredTokens.map((token) => (
                  <div key={token.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center flex-shrink-0">
                        {token.imageUri ? (
                          <Image
                            src={token.imageUri}
                            alt={token.tokenSymbol}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full ${token.imageUri ? 'hidden' : 'flex'} items-center justify-center text-gray-400 font-semibold`}>
                          {token.tokenSymbol?.charAt(0) || '?'}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-white truncate">{token.tokenName}</h4>
                          <span className="px-2 py-1 bg-gray-700 rounded-md text-xs font-mono text-gray-300">
                            {token.tokenSymbol}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${token.status === 'approved'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : token.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                            {token.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            {token.blockchain}
                          </span>
                          <code className="text-xs bg-gray-700/50 px-2 py-1 rounded">
                            {token.contractAddress?.slice(0, 6)}...{token.contractAddress?.slice(-4)}
                          </code>
                          <span>{new Date(token.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {myRegError && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{myRegError}</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Social Links Management Tab */}

      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Manage Token Social Links</h2>
          <p className="text-gray-400 mb-6">
            Update social media links and promotional content for your registered and created tokens.
            These links help users discover more about your projects.
          </p>
        </div>

        {/* Registered Tokens Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Registered Tokens</h3>
            <a
              href="/dashboard/register-token"
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Register New Token
            </a>
          </div>

          {!myRegisteredTokens ? (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm">Loading registered tokens...</div>
            </div>
          ) : myRegisteredTokens.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-2">No registered tokens found</div>
              <div className="text-sm text-gray-500">
                Register your first token to manage its social links here.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {myRegisteredTokens.map((token) => (
                <SocialLinksEditor
                  key={token.id}
                  token={token}
                  tokenType="registered"
                  userAddress={userAddress}
                  onUpdate={handleTokenUpdate}
                />
              ))}
            </div>
          )}

          {myRegError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mt-4">
              <div className="text-red-400 text-sm">{myRegError}</div>
            </div>
          )}
        </div>

        {/* Created Tokens Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Created Tokens</h3>
            <a
              href="/dashboard/create-token"
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Create New Token
            </a>
          </div>

          {!myCreatedTokens ? (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm">Loading created tokens...</div>
            </div>
          ) : myCreatedTokens.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-2">No created tokens found</div>
              <div className="text-sm text-gray-500">
                Create your first token using our pump.fun integration to manage its social links here.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {myCreatedTokens.map((token) => (
                <SocialLinksEditor
                  key={token.id}
                  token={token}
                  tokenType="created"
                  userAddress={userAddress}
                  onUpdate={handleTokenUpdate}
                />
              ))}
            </div>
          )}

          {myCreatedError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mt-4">
              <div className="text-red-400 text-sm">{myCreatedError}</div>
            </div>
          )}
        </div>
      </div>


      {/* Profile Boost Tab */}
      {/* Not Connected State */}
      {!derivedConnected && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md">
            <FaWallet className="text-5xl text-blue-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">Connect your wallet to view your tokens and manage social links</p>
            <button
              onClick={handleConnectWallet}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
