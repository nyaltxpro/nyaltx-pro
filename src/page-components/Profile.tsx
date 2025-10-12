'use client';

import SocialLinksEditor from '@/components/SocialLinksEditor';
import * as Avatar from '@radix-ui/react-avatar';
import { PersonIcon, PlusIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useAppKit } from '@reown/appkit/react';
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
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
            {
                symbol: 'ETH',
                name: 'Ethereum',
                balance: 3.245,
                value: 9735.0,
                icon: '/crypto-icons/color/eth.svg',
            },
            {
                symbol: 'BTC',
                name: 'Bitcoin',
                balance: 0.125,
                value: 7625.0,
                icon: '/crypto-icons/color/btc.svg',
            },
            {
                symbol: 'SOL',
                name: 'Solana',
                balance: 45.75,
                value: 2287.5,
                icon: '/crypto-icons/color/sol.svg',
            },
            {
                symbol: 'USDT',
                name: 'Tether',
                balance: 1250.0,
                value: 1250.0,
                icon: '/crypto-icons/color/usdt.svg',
            },
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
            .then(async r => (r.ok ? r.json() : Promise.reject(await r.json())))
            .then(d => setMyRegisteredTokens(d?.data || []))
            .catch(e => setMyRegError(e?.error || 'Failed to load submissions'));
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
            .then(async r => (r.ok ? r.json() : Promise.reject(await r.json())))
            .then(d => setMyCreatedTokens(d?.data || []))
            .catch(e => setMyCreatedError(e?.error || 'Failed to load created tokens'));
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
            setMyRegisteredTokens(
                prev => prev?.map(token => (token.id === tokenId ? updatedToken : token)) || []
            );
        }

        // Update created tokens
        if (myCreatedTokens) {
            setMyCreatedTokens(
                prev => prev?.map(token => (token.id === tokenId ? updatedToken : token)) || []
            );
        }
    };

    return (
        <Tooltip.Provider>
            <div className="min-h-screen  px-4 py-6 md:px-6 lg:px-8">
                <div className="mx-auto">
                    {/* Header Section */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 rounded-2xl blur-xl"></div>
                        <div className="relative rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold bg-white bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        My Profile
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2 h-2 ${derivedConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'} rounded-full`}></div>
                                        <p className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            {derivedConnected ? 'Wallet connected • Manage your tokens and social links' : 'Wallet not connected • Connect to access profile features'}
                                        </p>
                                    </div>
                                </div>
                                {derivedConnected && (
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            {formatWalletAddress(userAddress)}
                                        </div>
                                        <Tooltip.Root>
                                            <Tooltip.Trigger asChild>
                                                <button
                                                    onClick={handleDisconnectWallet}
                                                    className="shadow-2xl px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-all flex items-center gap-2 text-xs"
                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                >
                                                    <PersonIcon className="w-4 h-4" />
                                                    Account
                                                </button>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                    Manage wallet connection
                                                    <Tooltip.Arrow className="fill-black/90" />
                                                </Tooltip.Content>
                                            </Tooltip.Portal>
                                        </Tooltip.Root>
                                    </div>
                                )}
                            </div>

                            {/* Stats Bar */}
                            {derivedConnected && (
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#00c3ff] rounded-full"></div>
                                        <span className="text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Token management</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#7c3aed] rounded-full"></div>
                                        <span className="text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Social links</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* My Tokens Tab */}

                    {derivedConnected && <div>
                        <br />
                        {/* My Registered Token Submissions */}
                        <div className="bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>My Registered Tokens</h3>
                                    <p className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Tokens you've submitted for approval</p>
                                </div>
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <a
                                            href="/dashboard/register-token"
                                            className="px-4 py-2 bg-gradient-to-r from-[#00c3ff] to-[#7c3aed] text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#00c3ff]/25 flex items-center gap-2"
                                            style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Submit New Token
                                        </a>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                            Register a new token
                                            <Tooltip.Arrow className="fill-black/90" />
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                            </div>
                            <div className="p-6">
                                {!myRegisteredTokens ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="w-16 h-16 border-4 border-[#00c3ff]/30 border-t-[#00c3ff] rounded-full animate-spin"></div>
                                        <span className="ml-4 text-gray-300 text-lg" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Loading tokens...</span>
                                    </div>
                                ) : myRegisteredTokens.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <span className="text-3xl">🪙</span>
                                        </div>
                                        <h4 className="text-2xl font-semibold text-white mb-4" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>No tokens registered yet</h4>
                                        <p className="text-gray-300 text-lg mb-8" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Submit your first token to get started with the NYALTX ecosystem
                                        </p>
                                        <a
                                            href="/dashboard/register-token"
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00c3ff] to-[#7c3aed] text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#00c3ff]/25 hover:scale-105"
                                            style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Register Your First Token
                                        </a>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {myRegisteredTokens.map(token => (
                                            <div key={token.id} className="group relative">
                                                {/* Glow effect */}
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00c3ff]/20 via-[#7c3aed]/20 to-[#f59e0b]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                                                <div className="relative bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar.Root className="w-14 h-14">
                                                            <Avatar.Image
                                                                src={token.imageUri}
                                                                alt={token.tokenSymbol}
                                                                className="w-full h-full object-cover rounded-full"
                                                            />
                                                            <Avatar.Fallback className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg rounded-full">
                                                                {token.tokenSymbol?.slice(0, 2) || token.tokenName?.slice(0, 2) || '??'}
                                                            </Avatar.Fallback>
                                                        </Avatar.Root>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="text-xl font-bold text-white truncate" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{token.tokenName}</h4>
                                                                <span className="px-2 py-1 bg-gray-800/50 rounded-md text-xs font-mono text-gray-300" style={{ fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace' }}>
                                                                    {token.tokenSymbol}
                                                                </span>
                                                                <span
                                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${token.status === 'approved'
                                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                        : token.status === 'pending'
                                                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                                        }`}
                                                                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                                >
                                                                    {token.status}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                                <span className="flex items-center gap-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                                                    {token.blockchain}
                                                                </span>
                                                                <code className="text-xs bg-gray-700/50 px-2 py-1 rounded font-mono" style={{ fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace' }}>
                                                                    {token.contractAddress?.slice(0, 6)}...
                                                                    {token.contractAddress?.slice(-4)}
                                                                </code>
                                                                <span style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{new Date(token.createdAt).toLocaleDateString()}</span>
                                                            </div>
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

                    }

                    {/* Social Links Management Tab */}
                    <br />

                    {derivedConnected && <div>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-4">Manage Token Social Links</h2>
                            <p className="text-gray-400 mb-6">
                                Update social media links and promotional content for your registered and created
                                tokens. These links help users discover more about your projects.
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
                                    {myRegisteredTokens.map(token => (
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
                                        Create your first token using our pump.fun integration to manage its social links
                                        here.
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myCreatedTokens.map(token => (
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

                    }

                    {/* Profile Boost Tab */}
                    {/* Not Connected State */}
                    {!derivedConnected && (
                        <div className="backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <PersonIcon className="w-10 h-10 text-gray-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-4" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Connect Your Wallet</h2>
                            <p className="text-gray-300 text-lg mb-8" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                Connect your wallet to view your tokens and manage social links
                            </p>
                            <button
                                onClick={handleConnectWallet}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00c3ff] to-[#7c3aed] text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#00c3ff]/25 hover:scale-105"
                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                            >
                                <PersonIcon className="w-4 h-4" />
                                Connect Wallet
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Tooltip.Provider>
    );
}
