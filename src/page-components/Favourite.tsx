'use client';

import { getCryptoIconUrl } from '@/utils/cryptoIcons';
import * as Avatar from '@radix-ui/react-avatar';
import { ExternalLinkIcon, PersonIcon, StarIcon, TrashIcon, UpdateIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAccount } from 'wagmi';

interface Favorite {
    id: string;
    wallet_address: string;
    token_address: string;
    token_symbol: string;
    token_name: string;
    chain_id: number;
    image_uri?: string | null;
    created_at: string;
}

const chainNames: { [key: number]: string } = {
    1: 'Ethereum',
    137: 'Polygon',
    56: 'BSC',
    42161: 'Arbitrum',
    10: 'Optimism',
    43114: 'Avalanche',
    101: 'Solana',
};

const getChainName = (chainId: number): string => {
    const chainNames: { [key: number]: string } = {
        1: 'ethereum',
        56: 'bsc',
        137: 'polygon',
        42161: 'arbitrum',
        10: 'optimism',
        43114: 'avalanche',
        101: 'solana',
    };
    return chainNames[chainId] || 'ethereum';
};

const chainColors: { [key: number]: string } = {
    1: 'bg-blue-500',
    137: 'bg-purple-500',
    56: 'bg-yellow-500',
    42161: 'bg-cyan-500',
    10: 'bg-red-500',
    43114: 'bg-red-600',
    101: 'bg-green-500',
};

export default function FavoritesPage() {
    const { address, isConnected } = useAccount();
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchFavorites();
    }, [address, isConnected]);

    const fetchFavorites = async () => {
        if (!isConnected || !address) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/favorites?wallet=${address}`);
            if (response.ok) {
                const { favorites } = await response.json();
                console.log('Fetched favorites from API:', favorites);
                setFavorites(favorites);
            } else {
                toast.error('Failed to fetch favorites');
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
            toast.error('Error loading favorites');
        } finally {
            setIsLoading(false);
        }
    };

    const removeFavorite = async (favorite: Favorite) => {
        if (!address) return;

        setRemovingId(favorite.id);

        try {
            const response = await fetch(
                `/api/favorites?wallet=${address}&token=${favorite.token_address}&chain=${favorite.chain_id}`,
                { method: 'DELETE' }
            );

            if (response.ok) {
                setFavorites(prev => prev.filter(f => f.id !== favorite.id));
                toast.success('Removed from favorites');
            } else {
                const { error } = await response.json();
                toast.error(error || 'Failed to remove favorite');
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            toast.error('Something went wrong');
        } finally {
            setRemovingId(null);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchFavorites();
        setIsRefreshing(false);
        toast.success('Favorites refreshed');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (!isConnected) {
        return (
            <Tooltip.Provider>
                <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#1a1f2e] px-4 py-6 md:px-6 lg:px-8">
                    <div className="mx-auto">
                        {/* Header Section */}
                        <div className="relative mb-8">
                            <div className="absolute inset-0 rounded-2xl blur-xl"></div>
                            <div className="relative rounded-2xl p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-[#00c3ff] to-[#7c3aed] bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            My Favorites
                                        </h1>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                Wallet not connected • Please connect to view favorites
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <PersonIcon className="w-10 h-10 text-gray-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-4" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Connect Your Wallet</h2>
                            <p className="text-gray-300 text-lg mb-6" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                Please connect your wallet to view and manage your favorite tokens
                            </p>
                        </div>
                    </div>
                </div>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: 'rgba(0, 0, 0, 0.9)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        },
                        success: {
                            iconTheme: {
                                primary: '#00c3ff',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </Tooltip.Provider>
        );
    }

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
                                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-[#00c3ff] to-[#7c3aed] bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        My Favorites
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <p className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                            Live updates • Your personalized token collection
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                        {favorites.length} token{favorites.length !== 1 ? 's' : ''} favorited
                                    </div>
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <button
                                                onClick={handleRefresh}
                                                disabled={isRefreshing || isLoading}
                                                className="shadow-2xl px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-xs"
                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                            >
                                                <UpdateIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                            </button>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                Refresh favorites list
                                                <Tooltip.Arrow className="fill-black/90" />
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </div>
                            </div>

                            {/* Stats Bar */}
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[#00c3ff] rounded-full"></div>
                                    <span className="text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Personal collection</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[#7c3aed] rounded-full"></div>
                                    <span className="text-gray-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Multi-chain support</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
                            <div className="w-16 h-16 border-4 border-[#00c3ff]/30 border-t-[#00c3ff] rounded-full animate-spin mx-auto mb-6"></div>
                            <p className="text-gray-300 text-lg" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Loading your favorites...</p>
                        </div>
                    ) : favorites.length === 0 ? (
                        <div className="backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <StarIcon className="w-10 h-10 text-gray-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-4" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>No Favorites Yet</h2>
                            <p className="text-gray-300 text-lg mb-8" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                Start exploring tokens and add them to your favorites by clicking the star icon
                            </p>
                            <Link
                                href="/dashboard/trade"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00c3ff] to-[#7c3aed] text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#00c3ff]/25 hover:scale-105"
                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                            >
                                Explore Tokens
                                <ExternalLinkIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {favorites.map((favorite, index) => {
                                return (
                                    <div key={favorite.id} className="group relative">
                                        {/* Glow effect */}
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00c3ff]/20 via-[#7c3aed]/20 to-[#f59e0b]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                                        <div className="relative bg-black/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Avatar.Root className="w-14 h-14">
                                                        <Avatar.Image
                                                            src={favorite.image_uri || getCryptoIconUrl(favorite.token_symbol)}
                                                            alt={favorite.token_symbol}
                                                            className="w-full h-full object-cover rounded-full"
                                                        />
                                                        <Avatar.Fallback className="w-full h-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg rounded-full">
                                                            {favorite.token_symbol?.slice(0, 2) || favorite.token_name?.slice(0, 2) || '??'}
                                                        </Avatar.Fallback>
                                                    </Avatar.Root>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{favorite.token_name}</h3>
                                                            <span className="text-sm text-gray-400 uppercase font-mono bg-gray-800/50 px-2 py-1 rounded-md" style={{ fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace' }}>
                                                                {favorite.token_symbol}
                                                            </span>
                                                            {favorite.image_uri && (
                                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                                    IMG
                                                                </span>
                                                            )}
                                                            <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${chainColors[favorite.chain_id] || 'bg-gray-500'}`} style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                                {chainNames[favorite.chain_id] || `Chain ${favorite.chain_id}`}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-400 mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                                            Added on {formatDate(favorite.created_at)}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono" style={{ fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace' }}>
                                                            {favorite.token_address}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Tooltip.Root>
                                                        <Tooltip.Trigger asChild>
                                                            <Link
                                                                href={`/dashboard/trade?address=${favorite.token_address}&base=${favorite.token_symbol}&chain=${getChainName(favorite.chain_id)}`}
                                                                className="px-4 py-2 bg-gradient-to-r from-[#00c3ff] to-[#7c3aed] text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#00c3ff]/25 flex items-center gap-2"
                                                                style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                                                            >
                                                                Trade
                                                                <ExternalLinkIcon className="w-4 h-4" />
                                                            </Link>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Portal>
                                                            <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                                View token details
                                                                <Tooltip.Arrow className="fill-black/90" />
                                                            </Tooltip.Content>
                                                        </Tooltip.Portal>
                                                    </Tooltip.Root>

                                                    <Tooltip.Root>
                                                        <Tooltip.Trigger asChild>
                                                            <button
                                                                onClick={() => removeFavorite(favorite)}
                                                                disabled={removingId === favorite.id}
                                                                className={`p-3 rounded-lg transition-all duration-200 ${removingId === favorite.id
                                                                    ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                                                                    : 'bg-gray-800/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                                                                    }`}
                                                            >
                                                                {removingId === favorite.id ? (
                                                                    <UpdateIcon className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <TrashIcon className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Portal>
                                                            <Tooltip.Content className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm">
                                                                Remove from favorites
                                                                <Tooltip.Arrow className="fill-black/90" />
                                                            </Tooltip.Content>
                                                        </Tooltip.Portal>
                                                    </Tooltip.Root>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'rgba(0, 0, 0, 0.9)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    },
                    success: {
                        iconTheme: {
                            primary: '#00c3ff',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </Tooltip.Provider>
    );
}
