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

export default function ProfilePage() {
  const { isConnected: isWagmiConnected, address } = useAccount();
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

  // Set default active tab to tokens
  React.useEffect(() => {
    if (derivedConnected && activeTab === 'collections') {
      setActiveTab('tokens');
    }
  }, [derivedConnected, activeTab]);

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
    setIsConnected(true);
    setActiveTab('tokens');
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    setIsConnected(false);
  };

  // Copy wallet address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(mockUser.walletAddress);
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
      <div className="relative h-64 w-full rounded-xl overflow-hidden mb-16">
        <Image 
          src={mockUser.bannerUrl} 
          alt="Profile Banner" 
          fill
          className="object-cover"
        />
        
        {/* Profile Avatar */}
        <div className="absolute -bottom-12 left-8">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-gray-900">
            <Image 
              src={mockUser.avatarUrl} 
              alt="Profile Avatar" 
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{mockUser.name}</h1>
          
          {derivedConnected ? (
            <div className="flex items-center">
              <div className="flex items-center bg-gray-800 rounded-lg px-3 py-1">
                <FaEthereum className="text-blue-400 mr-1" />
                <span className="text-gray-300 text-sm mr-2">{formatWalletAddress(userAddress)}</span>
                <button 
                  onClick={copyToClipboard} 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <FaCheck className="text-green-500" /> : <FaRegCopy />}
                </button>
              </div>
              <button 
                onClick={handleDisconnectWallet}
                className="ml-3 flex items-center text-red-400 hover:text-red-300 text-sm"
              >
                <BiLogOut className="mr-1" /> Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={handleConnectWallet}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaWallet className="mr-2" /> Connect Wallet
            </button>
          )}
        </div>
        
        {derivedConnected && (
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center">
              <FaEthereum className="text-blue-400 mr-2 text-xl" />
              <span className="text-white font-semibold">{mockUser.ethBalance} ETH</span>
            </div>
            <button className="ml-3 bg-gray-800 hover:bg-gray-700 p-2 rounded-lg text-white">
              <BiEdit />
            </button>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'tokens' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
        >
          My Tokens
        </button>
        <button
          onClick={() => setActiveTab('social-links')}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'social-links' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
        >
          Social Links
        </button>
        <button
          onClick={() => setActiveTab('boost')}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'boost' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
        >
          Profile Boost
        </button>
      </div>
      
      {/* My Tokens Tab */}
      {derivedConnected && activeTab === 'tokens' && (
        <div>
          <div className="bg-gray-800 rounded-xl overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">My Tokens</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="p-4">Asset</th>
                    <th className="p-4">Balance</th>
                    <th className="p-4">Value (USD)</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUser.tokens.map((token, index) => (
                    <tr key={token.symbol} className={index < mockUser.tokens.length - 1 ? 'border-b border-gray-700' : ''}>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="relative h-8 w-8 mr-3">
                            <Image 
                              src={token.icon} 
                              alt={token.name} 
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-white">{token.name}</div>
                            <div className="text-sm text-gray-400">{token.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white">{token.balance}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white">${token.value.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors">Send</button>
                          <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors">Receive</button>
                          <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors">Swap</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center">
              <RiExchangeFill className="mr-2" /> Swap Tokens
            </button>
          </div>

          {/* My Registered Token Submissions */}
          <div className="bg-gray-800 rounded-xl overflow-hidden mt-6">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">My Registered Tokens</h3>
              <a href="/dashboard/register-token" className="text-sm underline text-blue-400">Submit new</a>
            </div>
            <div className="p-4">
              {!myRegisteredTokens ? (
                <div className="text-gray-400 text-sm">Loading…</div>
              ) : myRegisteredTokens.length === 0 ? (
                <div className="text-gray-400 text-sm">You have not submitted any tokens yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-gray-300">
                      <tr>
                        <th className="px-2 py-1">Name</th>
                        <th className="px-2 py-1">Symbol</th>
                        <th className="px-2 py-1">Chain</th>
                        <th className="px-2 py-1">Contract</th>
                        <th className="px-2 py-1">Status</th>
                        <th className="px-2 py-1">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRegisteredTokens.map((t) => (
                        <tr key={t.id} className="border-t border-gray-700">
                          <td className="px-2 py-1 text-white">{t.tokenName}</td>
                          <td className="px-2 py-1 text-white">{t.tokenSymbol}</td>
                          <td className="px-2 py-1 text-white">{t.blockchain}</td>
                          <td className="px-2 py-1 text-white"><code className="text-xs">{t.contractAddress}</code></td>
                          <td className="px-2 py-1 capitalize text-white">{t.status}</td>
                          <td className="px-2 py-1 text-gray-300">{new Date(t.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {myRegError && <div className="text-red-400 text-sm mt-2">{myRegError}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Social Links Management Tab */}
      {derivedConnected && activeTab === 'social-links' && (
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

          {/* Help Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3">Social Links Help</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• <strong>Website:</strong> Your project's official website or landing page</p>
              <p>• <strong>Twitter:</strong> Official Twitter/X account for announcements and updates</p>
              <p>• <strong>Telegram:</strong> Community chat or announcement channel</p>
              <p>• <strong>Discord:</strong> Community server for discussions and support</p>
              <p>• <strong>GitHub:</strong> Source code repository (for open-source projects)</p>
              <p>• <strong>YouTube:</strong> Channel with tutorials, updates, or promotional content</p>
              <p>• <strong>Video Link:</strong> Demo video, tutorial, or promotional content</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Boost Tab */}
      {derivedConnected && activeTab === 'boost' && (
        <div>
          <ProfileBoostSelector profileAddress={userAddress} />
        </div>
      )}

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
      
      {/* Social Connections */}
      <div className="mt-12 bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Connect Social Accounts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors">
            <div className="flex items-center">
              <FaTwitter className="text-blue-400 text-xl mr-3" />
              <span className="text-white">Twitter</span>
            </div>
            <span className="text-sm text-gray-400">Connect</span>
          </button>
          
          <button className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors">
            <div className="flex items-center">
              <FaDiscord className="text-indigo-400 text-xl mr-3" />
              <span className="text-white">Discord</span>
            </div>
            <span className="text-sm text-gray-400">Connect</span>
          </button>
        </div>
      </div>
    </main>
  );
}
