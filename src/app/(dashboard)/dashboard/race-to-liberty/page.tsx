'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import RaceToLibertyLeaderboard from '@/components/RaceToLibertyLeaderboard';
import BoostPackSelector from '@/components/BoostPackSelector';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { FaTrophy, FaRocket, FaCrown, FaFire, FaTwitter, FaTelegram, FaMicrophone, FaInfoCircle } from 'react-icons/fa';

export default function DashboardRaceToLibertyPage() {
  const { address, isConnected } = useAccount();
  const [userTokens, setUserTokens] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

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
    console.log('Boost successful:', boostData);
    // Optionally refresh leaderboard or show success notification
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-white/10 rounded-2xl"></div>
            <div className="h-96 bg-white/10 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
            <FaTrophy className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Race to Liberty</h1>
            <p className="text-gray-400">Compete for the top spot and win exclusive rewards</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <FaInfoCircle className="text-gray-400" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaInfoCircle className="text-cyan-400" />
            How Race to Liberty Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <FaFire className="text-orange-400 text-xl mb-2" />
              <h4 className="font-semibold mb-1">Point Decay</h4>
              <p className="text-sm text-gray-400">Points fade over 24-48h keeping competition active</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <FaCrown className="text-yellow-400 text-xl mb-2" />
              <h4 className="font-semibold mb-1">Weekly Crown</h4>
              <p className="text-sm text-gray-400">Top project gets permanent crown badge</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex gap-1 mb-2">
                <FaTwitter className="text-blue-400" />
                <FaTelegram className="text-blue-400" />
              </div>
              <h4 className="font-semibold mb-1">Social Push</h4>
              <p className="text-sm text-gray-400">Winners get automatic social announcements</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <FaMicrophone className="text-purple-400 text-xl mb-2" />
              <h4 className="font-semibold mb-1">Podcast Ads</h4>
              <p className="text-sm text-gray-400">Top 3 featured in Off Road with Frank Ferraro</p>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            <p className="mb-2"><strong>Boost Packs:</strong></p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Paddle Boat ($300):</strong> 100 points, 24h decay</li>
              <li>• <strong>Motor Boat ($500):</strong> 250 points, 36h decay + social eligibility</li>
              <li>• <strong>Helicopter ($700):</strong> 500 points, 48h decay + podcast promotion</li>
            </ul>
          </div>
        </div>
      )}

      {!isConnected ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
            <FaRocket className="text-white text-2xl" />
          </div>
          <h2 className="text-xl font-bold mb-4">Connect Wallet to Compete</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Connect your wallet to boost your registered tokens and compete in the Race to Liberty.
          </p>
          <ConnectWalletButton />
        </div>
      ) : userTokens.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
            <FaRocket className="text-white text-2xl" />
          </div>
          <h2 className="text-xl font-bold mb-4">No Approved Tokens</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            You need approved tokens to participate in the Race to Liberty. 
            Register your tokens first and wait for admin approval.
          </p>
          <a 
            href="/dashboard/register-token" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300"
          >
            Register Token
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Boost Controls */}
          <div className="xl:col-span-1 space-y-6">
            {/* Token Selector */}
            {userTokens.length > 1 && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4">Select Token to Boost</h3>
                <div className="space-y-3">
                  {userTokens.map((token) => (
                    <button
                      key={token.id}
                      onClick={() => setSelectedToken(token)}
                      className={`w-full p-3 rounded-xl border transition-all ${
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
                          <div className="text-sm text-gray-400 truncate">{token.name}</div>
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
          <div className="xl:col-span-2">
            <RaceToLibertyLeaderboard />
          </div>
        </div>
      )}
    </div>
  );
}
