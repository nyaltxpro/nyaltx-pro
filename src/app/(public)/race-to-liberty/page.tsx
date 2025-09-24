'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import RaceToLibertyLeaderboard from '@/components/RaceToLibertyLeaderboard';
import BoostPackSelector from '@/components/BoostPackSelector';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { FaTrophy, FaRocket, FaCrown, FaFire, FaTwitter, FaTelegram, FaMicrophone } from 'react-icons/fa';

export default function RaceToLibertyPage() {
  const { address, isConnected } = useAccount();
  const [userTokens, setUserTokens] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      fetchUserTokens();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const fetchUserTokens = async () => {
    try {
      const response = await fetch(`/api/tokens/by-wallet?address=${address}`);
      const data = await response.json();
      
      if (data.success) {
        const approvedTokens = data.tokens.filter((token: any) => token.status === 'approved');
        setUserTokens(approvedTokens);
        if (approvedTokens.length > 0 && !selectedToken) {
          setSelectedToken(approvedTokens[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching user tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoostSuccess = (boostData: any) => {
    // Refresh leaderboard or show success message
    console.log('Boost successful:', boostData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-20 bg-white/10 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-white/10 rounded-2xl"></div>
              <div className="h-96 bg-white/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                <FaTrophy className="text-white text-3xl" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-6">
              Race to Liberty
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              The ultimate crypto marketing competition. Boost your token, climb the leaderboard, 
              and win exclusive rewards including social media features and podcast mentions.
            </p>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <FaFire className="text-orange-400 text-2xl mx-auto mb-2" />
                <h3 className="font-bold mb-1">Point Decay</h3>
                <p className="text-sm text-gray-400">Points fade over 24-48h keeping competition active</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <FaCrown className="text-yellow-400 text-2xl mx-auto mb-2" />
                <h3 className="font-bold mb-1">Weekly Crown</h3>
                <p className="text-sm text-gray-400">Top project gets permanent crown badge</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-center gap-1 mb-2">
                  <FaTwitter className="text-blue-400 text-lg" />
                  <FaTelegram className="text-blue-400 text-lg" />
                </div>
                <h3 className="font-bold mb-1">Social Push</h3>
                <p className="text-sm text-gray-400">Winners get automatic social announcements</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <FaMicrophone className="text-purple-400 text-2xl mx-auto mb-2" />
                <h3 className="font-bold mb-1">Podcast Ads</h3>
                <p className="text-sm text-gray-400">Top 3 featured in Off Road with Frank Ferraro</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
              <FaRocket className="text-white text-3xl" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Ready to Race?</h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Connect your wallet to boost your registered tokens and compete for the top spot.
            </p>
            <ConnectWalletButton />
          </div>
        ) : userTokens.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <FaRocket className="text-white text-3xl" />
            </div>
            <h2 className="text-3xl font-bold mb-4">No Approved Tokens</h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              You need approved tokens to participate in the Race to Liberty. 
              Register your tokens first and wait for admin approval.
            </p>
            <a 
              href="/dashboard/register-token" 
              className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300"
            >
              Register Token
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Boost Packs */}
            <div className="space-y-6">
              {/* Token Selector */}
              {userTokens.length > 1 && (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold mb-4">Select Token to Boost</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {userTokens.map((token) => (
                      <button
                        key={token.id}
                        onClick={() => setSelectedToken(token)}
                        className={`p-3 rounded-xl border transition-all ${
                          selectedToken?.id === token.id
                            ? 'border-cyan-500 bg-cyan-500/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={token.logo || '/crypto-icons/color/generic.svg'} 
                            alt={token.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="text-left">
                            <div className="font-bold">{token.symbol}</div>
                            <div className="text-sm text-gray-400">{token.name}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Boost Pack Selector */}
              {selectedToken && (
                <BoostPackSelector
                  tokenId={selectedToken.id}
                  tokenName={selectedToken.name}
                  tokenSymbol={selectedToken.symbol}
                  onBoostSuccess={handleBoostSuccess}
                />
              )}
            </div>

            {/* Right Column - Leaderboard */}
            <div>
              <RaceToLibertyLeaderboard />
            </div>
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            The Race to Liberty gamifies crypto marketing with decaying points, weekly competitions, and exclusive rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Connect Wallet</h3>
            <p className="text-gray-400">Connect your wallet with ETH, USDC, or NYAX for payments</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Select Boost Pack</h3>
            <p className="text-gray-400">Choose from Paddle Boat, Motor Boat, or Helicopter boosts</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Climb Leaderboard</h3>
            <p className="text-gray-400">Points decay over time, keeping the competition active</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">4</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Win Rewards</h3>
            <p className="text-gray-400">Weekly winners get crown badges and social media features</p>
          </div>
        </div>
      </div>
    </div>
  );
}
