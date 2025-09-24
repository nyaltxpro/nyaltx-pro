'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaRocket, FaFire, FaClock, FaCoins, FaTwitter, FaTelegram, FaMicrophone } from 'react-icons/fa';
import { useAccount, useSendTransaction, useWriteContract, useSwitchChain } from 'wagmi';
import { parseEther, erc20Abi, parseUnits } from 'viem';
import { BoostPack } from '@/types/gamification';

interface BoostPackSelectorProps {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  onBoostSuccess?: (boostData: any) => void;
  className?: string;
}

const BOOST_PACKS: BoostPack[] = [
  {
    id: 'paddle',
    name: 'Paddle Boat',
    basePoints: 100,
    duration: '24 hours',
    price: { usd: 300, eth: 0.1, usdc: 300, nyax: 240 },
    features: [
      '100 Boost Points',
      '24h visibility boost',
      'Basic leaderboard placement',
      'Points decay over 24h'
    ],
    decayHours: 24
  },
  {
    id: 'motor',
    name: 'Motor Boat',
    basePoints: 250,
    duration: '36 hours',
    price: { usd: 500, eth: 0.167, usdc: 500, nyax: 400 },
    features: [
      '250 Boost Points',
      '36h visibility boost',
      'Enhanced leaderboard placement',
      'Social media eligibility',
      'Points decay over 36h'
    ],
    decayHours: 36
  },
  {
    id: 'helicopter',
    name: 'Helicopter',
    basePoints: 500,
    duration: '48 hours',
    price: { usd: 700, eth: 0.233, usdc: 700, nyax: 560 },
    features: [
      '500 Boost Points',
      '48h visibility boost',
      'Premium leaderboard placement',
      'Social media priority',
      'Cross-promotion eligibility',
      'Podcast mention opportunity',
      'Points decay over 48h'
    ],
    decayHours: 48
  }
];

// Payment configuration (same as Race to Liberty)
const DEFAULT_RECEIVER: `0x${string}` = "0x81bA7b98E49014Bff22F811E9405640bC2B39cC0";
const DEFAULT_NYAX: `0x${string}` = "0x5eed5621b92be4473f99bacac77acfa27deb57d9";
const DEFAULT_USDC: `0x${string}` = "0xA0b86a33E6441c8C06DD2b7c94b7E0c8f8c8b8c8";

const RECEIVER = (process.env.NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS as `0x${string}` | undefined) ?? DEFAULT_RECEIVER;
const NYAX_TOKEN = (process.env.NEXT_PUBLIC_NYAX_TOKEN_ADDRESS as `0x${string}` | undefined) ?? DEFAULT_NYAX;
const USDC_TOKEN = DEFAULT_USDC;

export default function BoostPackSelector({ 
  tokenId, 
  tokenName, 
  tokenSymbol, 
  onBoostSuccess,
  className = '' 
}: BoostPackSelectorProps) {
  const { address, isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  const [selectedPack, setSelectedPack] = useState<BoostPack | null>(null);
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

      // Register the boost
      const boostResponse = await fetch('/api/gamification/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId,
          boostPackType: selectedPack.id,
          transactionHash,
          walletAddress: address
        })
      });

      const boostData = await boostResponse.json();

      if (boostData.success) {
        setSuccess(`🚀 ${selectedPack.name} boost activated! ${selectedPack.basePoints} points added to ${tokenSymbol}.`);
        onBoostSuccess?.(boostData);
        setSelectedPack(null);
      } else {
        throw new Error(boostData.error || 'Failed to activate boost');
      }

    } catch (err: any) {
      setError(err?.shortMessage || err?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const getPackIcon = (packId: string) => {
    switch (packId) {
      case 'paddle': return '🚣';
      case 'motor': return '🚤';
      case 'helicopter': return '🚁';
      default: return '🚀';
    }
  };

  const getPackColor = (packId: string) => {
    switch (packId) {
      case 'paddle': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'motor': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'helicopter': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
          <FaRocket className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Boost {tokenSymbol}</h3>
          <p className="text-sm text-gray-400">Select a boost pack to race to the top</p>
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

      {/* Boost Packs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {BOOST_PACKS.map((pack) => (
          <div
            key={pack.id}
            onClick={() => setSelectedPack(pack)}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedPack?.id === pack.id
                ? `bg-gradient-to-r ${getPackColor(pack.id)} ring-2 ring-cyan-500/50`
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
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
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

            {pack.id === 'helicopter' && (
              <div className="mt-3 p-2 bg-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-yellow-400">
                  <FaMicrophone className="text-xs" />
                  <span>Podcast mention eligible</span>
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
                  ? 'border-cyan-500 bg-cyan-500/20'
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
                  ? 'border-cyan-500 bg-cyan-500/20'
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
                  ? 'border-cyan-500 bg-cyan-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="text-center">
                <Image src="/logo.png" alt="NYAX" width={24} height={24} className="mx-auto mb-2" />
                <div className="text-sm font-medium">NYAX</div>
                <div className="text-xs text-cyan-400">
                  ${selectedPack.price.nyax} (20% off)
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading || !isConnected}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? (
              'Processing...'
            ) : !isConnected ? (
              'Connect Wallet'
            ) : (
              `Boost ${tokenSymbol} with ${selectedPack.name}`
            )}
          </button>

          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">
              <strong>What happens next:</strong>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div>• {selectedPack.basePoints} points added instantly</div>
              <div>• Points decay over {selectedPack.duration}</div>
              <div>• Leaderboard updates in real-time</div>
              {selectedPack.id !== 'paddle' && (
                <div className="flex items-center gap-1">
                  <FaTwitter className="text-xs" />
                  <FaTelegram className="text-xs" />
                  <span>Social media announcement eligible</span>
                </div>
              )}
              {selectedPack.id === 'helicopter' && (
                <div className="flex items-center gap-1">
                  <FaMicrophone className="text-xs" />
                  <span>Podcast cross-promotion opportunity</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
