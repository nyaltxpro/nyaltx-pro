"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PublicHeader from '@/components/PublicHeader';
import { FaCheck, FaRocket, FaCoins, FaArrowRight, FaHome } from 'react-icons/fa';
import Image from 'next/image';

const BOOST_PACKS = {
  starter: { 
    name: "Starter Boost", 
    points: 250, 
    description: "Gain entry into the Boosted Zone",
    icon: "🔹",
    color: "from-blue-600 to-blue-700"
  },
  growth: { 
    name: "Growth Boost", 
    points: 750, 
    description: "Highlighted in daily \"Top Movers\" feed",
    icon: "🔹",
    color: "from-green-600 to-green-700"
  },
  pro: { 
    name: "Pro Boost", 
    points: 1500, 
    description: "Unlocks \"Turbo Highlight\" (color frames, 48h push)",
    icon: "🔹",
    color: "from-purple-600 to-purple-700"
  },
  elite: { 
    name: "Elite Boost", 
    points: 7500, 
    description: "Premium: Top of board + Featured Video slot",
    icon: "🔹",
    color: "from-yellow-600 to-yellow-700"
  },
};

const TOKEN_SYMBOLS = {
  '1': 'PEPE',
  '2': 'DOGE', 
  '3': 'SHIB',
  '4': 'FLOKI'
};

function BoostPackSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const packId = searchParams.get('pack') as keyof typeof BOOST_PACKS;
  const tokenIds = searchParams.get('tokens')?.split(',') || [];
  const txHash = searchParams.get('tx');

  const boostPack = BOOST_PACKS[packId];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !boostPack) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const totalBoostPoints = boostPack.points * tokenIds.length;

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-black text-white">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-green-500/20 blur-3xl" />
          <div className="absolute top-40 right-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 py-20">
          {/* Success Animation */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
              <FaCheck className="text-white text-3xl" />
            </div>
            
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400 mb-4">
              Boost Pack Purchased Successfully!
            </h1>
            
            <p className="text-gray-300 text-lg">
              Your tokens have been boosted and are now climbing the leaderboard
            </p>
          </div>

          {/* Purchase Summary */}
          <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Boost Pack Details */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaRocket className="text-green-400" />
                  Boost Pack Applied
                </h2>
                
                <div className={`p-6 rounded-lg bg-gradient-to-r ${boostPack.color} mb-4`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">{boostPack.icon}</div>
                    <h3 className="text-xl font-bold text-white">{boostPack.name}</h3>
                    <div className="text-lg text-white/90 mt-1">{boostPack.description}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Points per Token:</span>
                    <span className="text-white font-semibold">+{boostPack.points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tokens Boosted:</span>
                    <span className="text-white font-semibold">{tokenIds.length}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-3">
                    <span className="text-gray-400">Total Boost Applied:</span>
                    <span className="text-green-400 font-bold text-lg">
                      +{totalBoostPoints.toLocaleString()} points
                    </span>
                  </div>
                </div>
              </div>

              {/* Boosted Tokens */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaCoins className="text-cyan-400" />
                  Boosted Tokens
                </h2>
                
                <div className="space-y-3">
                  {tokenIds.map((tokenId, index) => {
                    const symbol = TOKEN_SYMBOLS[tokenId as keyof typeof TOKEN_SYMBOLS];
                    return (
                      <div
                        key={tokenId}
                        className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <span className="text-green-400 font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-white">{symbol}</div>
                            <div className="text-green-400 text-sm">Boost Active</div>
                          </div>
                        </div>
                        <div className="text-green-400 font-bold">
                          +{boostPack.points} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {txHash && (
            <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-white mb-3">Transaction Details</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-gray-400 text-sm">Transaction Hash:</div>
                  <div className="text-white font-mono text-sm break-all">
                    {txHash}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">What's Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-cyan-500/10 rounded-lg">
                <FaRocket className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Climb the Board</h4>
                <p className="text-gray-400 text-sm">Your tokens are now boosted and climbing the leaderboard</p>
              </div>
              
              <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                <FaCoins className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Track Progress</h4>
                <p className="text-gray-400 text-sm">Monitor your token performance in real-time</p>
              </div>
              
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <FaCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Enjoy Benefits</h4>
                <p className="text-gray-400 text-sm">Access exclusive features and enhanced visibility</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium rounded-lg hover:from-cyan-700 hover:to-indigo-700 transition-all"
            >
              <FaHome />
              Go to Dashboard
            </button>
            
            <button
              onClick={() => router.push('/pricing')}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaArrowRight />
              Buy More Boosts
            </button>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-12">
            <p className="text-gray-400">
              Thank you for choosing NYALTX Boost Packs! Your tokens are now supercharged. 🚀
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function BoostPackSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    }>
      <BoostPackSuccessContent />
    </Suspense>
  );
}
