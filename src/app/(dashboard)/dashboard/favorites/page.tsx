'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaTrash, FaExternalLinkAlt, FaWallet, FaSpinner, FaSync } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { getCryptoIconUrl } from '@/utils/cryptoIcons';

interface Favorite {
  id: string;
  wallet_address: string;
  token_address: string;
  token_symbol: string;
  token_name: string;
  chain_id: number;
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
      <div className="min-h-screen bg-[#0b1217] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              My Favorites
            </h1>
            
            <div className="bg-[#0f1923] rounded-lg p-8 text-center">
              <FaWallet className="mx-auto text-6xl text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">
                Please connect your wallet to view your favorite tokens
              </p>
            </div>
          </div>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a2932',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1217] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              My Favorites
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400">
                {favorites.length} token{favorites.length !== 1 ? 's' : ''} favorited
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isRefreshing || isLoading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-[#1a2932] hover:bg-[#243540] text-gray-400 hover:text-white'
                }`}
                title="Refresh favorites"
              >
                <FaSync className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-[#0f1923] rounded-lg p-8 text-center">
              <FaSpinner className="mx-auto text-4xl text-cyan-400 mb-4 animate-spin" />
              <p className="text-gray-400">Loading your favorites...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-[#0f1923] rounded-lg p-8 text-center">
              <FaStar className="mx-auto text-6xl text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Favorites Yet</h2>
              <p className="text-gray-400 mb-6">
                Start exploring tokens and add them to your favorites by clicking the star icon
              </p>
              <Link 
                href="/dashboard/trade"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Explore Tokens
                <FaExternalLinkAlt />
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-[#0f1923] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1a2932] flex items-center justify-center">
                        <Image
                          src={getCryptoIconUrl(favorite.token_symbol)}
                          alt={favorite.token_symbol}
                          width={48}
                          height={48}
                          unoptimized
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.src = '/crypto-icons/color/generic.svg';
                          }}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{favorite.token_name}</h3>
                          <span className="text-sm text-gray-400 uppercase font-mono">
                            {favorite.token_symbol}
                          </span>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${chainColors[favorite.chain_id] || 'bg-gray-500'}`}>
                            {chainNames[favorite.chain_id] || `Chain ${favorite.chain_id}`}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          Added on {formatDate(favorite.created_at)}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          {favorite.token_address}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/trade?address=${favorite.token_address}&base=${favorite.token_symbol}&chain=${getChainName(favorite.chain_id)}`}
                        className="p-2 rounded-full bg-[#1a2932] hover:bg-[#243540] text-gray-400 hover:text-white transition-all duration-200"
                        title="View token"
                      >
                        <FaExternalLinkAlt />
                      </Link>
                      
                      <button
                        onClick={() => removeFavorite(favorite)}
                        disabled={removingId === favorite.id}
                        className={`p-2 rounded-full transition-all duration-200 ${
                          removingId === favorite.id
                            ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                            : 'bg-[#1a2932] hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                        }`}
                        title="Remove from favorites"
                      >
                        {removingId === favorite.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a2932',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
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
    </div>
  );
}
