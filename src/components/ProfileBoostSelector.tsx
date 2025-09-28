'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaRocket, FaFire, FaClock, FaCoins, FaTwitter, FaTelegram, FaMicrophone, FaStar, FaCrown } from 'react-icons/fa';
import { useAccount, useSendTransaction, useWriteContract, useSwitchChain } from 'wagmi';
import { parseEther, erc20Abi, parseUnits } from 'viem';

interface ProfileBoostPack {
  id: 'starter' | 'growth' | 'pro' | 'elite';
  name: string;
  basePoints: number;
  duration: string;
  price: {
    usd: number;
    eth: number;
    usdc: number;
    nyax: number; // 20% discount
  };
  features: string[];
  decayHours: number;
}

interface ProfileBoostSelectorProps {
  profileAddress: string;
  profileName?: string;
  onBoostSuccess?: (boostData: any) => void;
  className?: string;
}

const PROFILE_BOOST_PACKS: ProfileBoostPack[] = [
  {
    id: 'starter',
    name: 'Starter Boost',
    basePoints: 200,
    duration: '1 week',
    price: { usd: 199, eth: 0.066, usdc: 199, nyax: 159 },
    features: [
      '200 Boost Points',
      '1 week profile visibility',
      'Enhanced profile placement',
      'Social media eligibility',
      'Profile badge upgrade'
    ],
    decayHours: 168
  },
  {
    id: 'growth',
    name: 'Growth Boost',
    basePoints: 500,
    duration: '2 weeks',
    price: { usd: 399, eth: 0.133, usdc: 399, nyax: 319 },
    features: [
      '500 Boost Points',
      '2 weeks profile visibility',
      'Premium profile placement',
      'Social media priority',
      'Cross-promotion eligibility',
      'Featured profile badge'
    ],
    decayHours: 336
  },
  {
    id: 'pro',
    name: 'Pro Boost',
    basePoints: 1000,
    duration: '1 month',
    price: { usd: 599, eth: 0.2, usdc: 599, nyax: 479 },
    features: [
      '1000 Boost Points',
      '1 month profile visibility',
      'Featured profile placement',
      'Premium social media priority',
      'Cross-promotion eligibility',
      'Priority support',
      'Pro profile badge'
    ],
    decayHours: 720
  },
  {
    id: 'elite',
    name: 'Elite Boost',
    basePoints: 5000,
    duration: '3 months',
    price: { usd: 2999, eth: 1.0, usdc: 2999, nyax: 2399 },
    features: [
      '5000 Boost Points',
      '3 months profile visibility',
      'Premium featured placement',
      'Maximum social media priority',
      'Guaranteed cross-promotion',
      'Podcast appearance opportunity',
      'Dedicated account manager',
      'Elite profile badge'
    ],
    decayHours: 2160
  }
];

// Payment configuration
const DEFAULT_RECEIVER: `0x${string}` = "0x81bA7b98E49014Bff22F811E9405640bC2B39cC0";
const DEFAULT_NYAX: `0x${string}` = "0x5eed5621b92be4473f99bacac77acfa27deb57d9";
const DEFAULT_USDC: `0x${string}` = "0xA0b86a33E6441c8C06DD2b7c94b7E0c8f8c8b8c8";

const RECEIVER = (process.env.NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS as `0x${string}` | undefined) ?? DEFAULT_RECEIVER;
const NYAX_TOKEN = (process.env.NEXT_PUBLIC_NYAX_TOKEN_ADDRESS as `0x${string}` | undefined) ?? DEFAULT_NYAX;
const USDC_TOKEN = DEFAULT_USDC;

export default function ProfileBoostSelector({ 
  profileAddress, 
  profileName = 'Profile',
  onBoostSuccess,
  className = '' 
}: ProfileBoostSelectorProps) {
  const { address, isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  const [selectedPack, setSelectedPack] = useState<ProfileBoostPack | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'eth' | 'usdc' | 'nyax'>('eth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(3000);

  useEffect(() => {
    fetchETHPrice();
  }, []);

  const fetchETHPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      if (data.ethereum?.usd) {
        setEthPrice(data.ethereum.usd);
      }
    } catch (error) {
      console.error('Error fetching ETH price:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedPack || !isConnected || !address) {
      setError('Please connect wallet and select a boost pack');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let transactionHash: string;

      if (paymentMethod === 'eth') {
        const ethAmount = selectedPack.price.usd / ethPrice;
        const hash = await sendTransactionAsync({
          to: RECEIVER,
          value: parseEther(ethAmount.toFixed(6))
        });
        transactionHash = hash;
      } else if (paymentMethod === 'usdc') {
        const hash = await writeContractAsync({
          abi: erc20Abi,
          address: USDC_TOKEN,
          functionName: 'transfer',
          args: [RECEIVER, parseUnits(selectedPack.price.usdc.toString(), 6)]
        });
        transactionHash = hash;
      } else { // nyax
        const hash = await writeContractAsync({
          abi: erc20Abi,
          address: NYAX_TOKEN,
          functionName: 'transfer',
          args: [RECEIVER, parseUnits(selectedPack.price.nyax.toString(), 18)]
        });
        transactionHash = hash;
      }

      // Register the profile boost
      const boostResponse = await fetch('/api/gamification/profile-boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileAddress,
          boostPackType: selectedPack.id,
          transactionHash,
          walletAddress: address
        })
      });

      const boostData = await boostResponse.json();

      if (boostData.success) {
        setSuccess(`🚀 ${selectedPack.name} activated for ${profileName}! ${selectedPack.basePoints} points added.`);
        onBoostSuccess?.(boostData);
        setSelectedPack(null);
      } else {
        throw new Error(boostData.error || 'Failed to activate profile boost');
      }

    } catch (err: any) {
      setError(err?.shortMessage || err?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const getPackIcon = (packId: string) => {
    switch (packId) {
      case 'starter': return '🚀';
      case 'growth': return '📈';
      case 'pro': return '⭐';
      case 'elite': return '👑';
      default: return '🚀';
    }
  };

  const getPackColor = (packId: string) => {
    switch (packId) {
      case 'starter': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'growth': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'pro': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 'elite': return 'from-red-500/20 to-rose-500/20 border-red-500/30';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <FaStar className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Boost {profileName}</h3>
          <p className="text-sm text-gray-400">Enhance profile visibility and ranking</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-200 text-sm">
          {success}
        </div>
      )}

      {/* Profile Boost Packs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {PROFILE_BOOST_PACKS.map((pack) => (
          <div
            key={pack.id}
            onClick={() => setSelectedPack(pack)}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedPack?.id === pack.id
                ? `bg-gradient-to-r ${getPackColor(pack.id)} ring-2 ring-purple-500/50`
                : `bg-gradient-to-r ${getPackColor(pack.id)} hover:border-white/30`
            }`}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{getPackIcon(pack.id)}</div>
              <h4 className="font-bold text-lg">{pack.name}</h4>
              <p className="text-sm text-gray-400">{pack.duration}</p>
            </div>

            <div className="space-y-2 mb-4">
              {pack.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold mb-1">${pack.price.usd}</div>
              <div className="text-xs text-gray-400">
                NYAX: ${pack.price.nyax} (20% off)
              </div>
            </div>

            {pack.id === 'elite' && (
              <div className="mt-3 p-2 bg-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <FaMicrophone className="text-xs" />
                  <span>Podcast appearance included</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Section */}
      {selectedPack && (
        <div className="border-t border-white/10 pt-6">
          <h4 className="font-bold mb-4">Payment Method</h4>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => setPaymentMethod('eth')}
              className={`p-3 rounded-lg border transition-all ${
                paymentMethod === 'eth'
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="text-center">
                <Image src="/crypto-icons/color/eth.svg" alt="ETH" width={24} height={24} className="mx-auto mb-2" />
                <div className="text-sm font-medium">ETH</div>
                <div className="text-xs text-gray-400">
                  ≈{(selectedPack.price.usd / ethPrice).toFixed(4)}
                </div>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('usdc')}
              className={`p-3 rounded-lg border transition-all ${
                paymentMethod === 'usdc'
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="text-center">
                <Image src="/crypto-icons/color/usdc.svg" alt="USDC" width={24} height={24} className="mx-auto mb-2" />
                <div className="text-sm font-medium">USDC</div>
                <div className="text-xs text-gray-400">
                  ${selectedPack.price.usdc}
                </div>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('nyax')}
              className={`p-3 rounded-lg border transition-all ${
                paymentMethod === 'nyax'
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="text-center">
                <Image src="/logo.png" alt="NYAX" width={24} height={24} className="mx-auto mb-2" />
                <div className="text-sm font-medium">NYAX</div>
                <div className="text-xs text-purple-400">
                  ${selectedPack.price.nyax} (20% off)
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading || !isConnected}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? (
              'Processing...'
            ) : !isConnected ? (
              'Connect Wallet'
            ) : (
              `Boost ${profileName} with ${selectedPack.name}`
            )}
          </button>

          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">
              <strong>What happens next:</strong>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div>• {selectedPack.basePoints} points added to profile</div>
              <div>• Enhanced visibility for {selectedPack.duration}</div>
              <div>• Profile ranking boost</div>
              <div className="flex items-center gap-1">
                <FaTwitter className="text-xs" />
                <FaTelegram className="text-xs" />
                <span>Social media promotion eligible</span>
              </div>
              {selectedPack.id === 'elite' && (
                <div className="flex items-center gap-1">
                  <FaMicrophone className="text-xs" />
                  <span>Podcast appearance opportunity</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
