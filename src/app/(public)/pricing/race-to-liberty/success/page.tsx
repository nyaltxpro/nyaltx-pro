"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PublicHeader from '@/components/PublicHeader';
import { FaCheck, FaTrophy, FaCoins, FaArrowRight, FaHome, FaGift, FaTag } from 'react-icons/fa';
import Image from 'next/image';

const TIER_INFO = {
  paddle: { 
    name: "Paddle Boat", 
    multiplier: 1, 
    duration: '1 week',
    description: "Entry-level competition tier",
    icon: "🚣",
    color: "from-blue-600 to-blue-700"
  },
  motor: { 
    name: "Motor Boat", 
    multiplier: 2, 
    duration: '1 month',
    description: "Enhanced visibility features",
    icon: "🛥️",
    color: "from-green-600 to-green-700"
  },
  helicopter: { 
    name: "Helicopter", 
    multiplier: 3, 
    duration: '3 months',
    description: "Premium leaderboard placement",
    icon: "🚁",
    color: "from-purple-600 to-purple-700"
  },
};

function RaceToLibertySuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const tier = searchParams.get('tier') as keyof typeof TIER_INFO;
  const token = searchParams.get('token');
  const promoCode = searchParams.get('promo');
  const points = searchParams.get('points');
  const isFree = searchParams.get('free') === 'true';
  const txHash = searchParams.get('tx');

  const tierInfo = TIER_INFO[tier];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !tierInfo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

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
              {isFree ? 'Free Race to Liberty Claimed!' : 'Race to Liberty Entry Successful!'}
            </h1>
            
            <p className="text-gray-300 text-lg">
              {isFree 
                ? 'Your token has been entered into the race for free and is climbing the leaderboard!'
                : 'Your token has been entered into the race and is climbing the leaderboard!'
              }
            </p>
            
            {promoCode && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <FaTag className="text-green-400" />
                <span className="text-green-400 font-semibold">Promo Code: {promoCode}</span>
                {isFree && <FaGift className="text-yellow-400" />}
              </div>
            )}
          </div>

          {/* Race Summary */}
          <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tier Details */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaTrophy className="text-green-400" />
                  Race Tier Activated
                </h2>
                
                <div className={`p-6 rounded-lg bg-gradient-to-r ${tierInfo.color} mb-4`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">{tierInfo.icon}</div>
                    <h3 className="text-xl font-bold text-white">{tierInfo.name}</h3>
                    <div className="text-lg text-white/90 mt-1">{tierInfo.description}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tier Multiplier:</span>
                    <span className="text-white font-semibold">{tierInfo.multiplier}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-semibold">{tierInfo.duration}</span>
                  </div>
                  {points && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Points:</span>
                      <span className="text-green-400 font-bold text-lg">
                        +{parseInt(points).toLocaleString()} points
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Token Details */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaCoins className="text-cyan-400" />
                  Racing Token
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <FaTrophy className="text-green-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Token ID: {token}</div>
                        <div className="text-green-400 text-sm">Now Racing!</div>
                      </div>
                    </div>
                    <div className="text-green-400 font-bold">
                      Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction/Promo Details */}
          {(txHash || isFree) && (
            <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-white mb-3">
                {isFree ? 'Promo Code Details' : 'Transaction Details'}
              </h3>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isFree ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <div>
                  {isFree ? (
                    <>
                      <div className="text-gray-400 text-sm">Free Promo Code Applied:</div>
                      <div className="text-white font-semibold text-sm flex items-center gap-2">
                        <FaGift className="text-yellow-400" />
                        {promoCode} - 100% Discount
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-400 text-sm">Transaction Hash:</div>
                      <div className="text-white font-mono text-sm break-all">
                        {txHash}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">What's Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-cyan-500/10 rounded-lg">
                <FaTrophy className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Climb the Leaderboard</h4>
                <p className="text-gray-400 text-sm">Your token is now competing in Race to Liberty</p>
              </div>
              
              <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                <FaCoins className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Track Progress</h4>
                <p className="text-gray-400 text-sm">Monitor your position in real-time</p>
              </div>
              
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <FaCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-1">Enjoy Benefits</h4>
                <p className="text-gray-400 text-sm">Access enhanced visibility and features</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard/race-to-liberty')}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium rounded-lg hover:from-cyan-700 hover:to-indigo-700 transition-all"
            >
              <FaTrophy />
              View Leaderboard
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaHome />
              Go to Dashboard
            </button>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-12">
            <p className="text-gray-400">
              {isFree 
                ? `Thank you for using promo code ${promoCode}! Your token is now racing for free. 🎉`
                : 'Thank you for joining Race to Liberty! Your token is now competing for the top spot. 🏆'
              }
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function RaceToLibertySuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    }>
      <RaceToLibertySuccessContent />
    </Suspense>
  );
}
