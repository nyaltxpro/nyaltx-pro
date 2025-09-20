"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { FaSearch, FaTrophy, FaCoins, FaArrowRight } from 'react-icons/fa';
import PayPalCheckout from '@/components/PayPalCheckout';
import ConnectWalletButton from '@/components/ConnectWalletButton';

// Sample coin data - this would typically come from an API
const AVAILABLE_COINS = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', logo: '/crypto-icons/color/btc.svg', basePoints: 100 },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', logo: '/crypto-icons/color/eth.svg', basePoints: 85 },
  { id: 'sol', name: 'Solana', symbol: 'SOL', logo: '/crypto-icons/color/sol.svg', basePoints: 75 },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', logo: '/crypto-icons/color/ada.svg', basePoints: 60 },
  { id: 'dot', name: 'Polkadot', symbol: 'DOT', logo: '/crypto-icons/color/dot.svg', basePoints: 55 },
  { id: 'matic', name: 'Polygon', symbol: 'MATIC', logo: '/crypto-icons/color/matic.svg', basePoints: 50 },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAX', logo: '/crypto-icons/color/avax.svg', basePoints: 45 },
  { id: 'link', name: 'Chainlink', symbol: 'LINK', logo: '/crypto-icons/color/link.svg', basePoints: 40 },
  { id: 'uni', name: 'Uniswap', symbol: 'UNI', logo: '/crypto-icons/color/uni.svg', basePoints: 35 },
  { id: 'atom', name: 'Cosmos', symbol: 'ATOM', logo: '/crypto-icons/color/atom.svg', basePoints: 30 },
];

const TIER_MULTIPLIERS = {
  paddle: { name: 'Paddle Boat', multiplier: 1, duration: '1 week' },
  motor: { name: 'Motor Boat', multiplier: 2, duration: '1 month' },
  helicopter: { name: 'Helicopter', multiplier: 3, duration: '3 months' },
};

interface RaceToLibertyCheckoutProps {
  tier: 'paddle' | 'motor' | 'helicopter';
  amount: number;
  onBack?: () => void;
}

export default function RaceToLibertyCheckout({ tier, amount, onBack }: RaceToLibertyCheckoutProps) {
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'crypto'>('paypal');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(true);

  const tierInfo = TIER_MULTIPLIERS[tier];

  const filteredCoins = useMemo(() => {
    return AVAILABLE_COINS.filter(coin =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const selectedCoinData = useMemo(() => {
    return AVAILABLE_COINS.find(coin => coin.id === selectedCoin);
  }, [selectedCoin]);

  const totalPoints = useMemo(() => {
    if (!selectedCoinData) return 0;
    return selectedCoinData.basePoints * tierInfo.multiplier;
  }, [selectedCoinData, tierInfo.multiplier]);

  const handlePayPalSuccess = (details: any) => {
    // Handle successful PayPal payment
    console.log('PayPal payment successful:', details);
    // Here you would typically save the coin selection and points to your backend
    alert(`Payment successful! Your ${selectedCoinData?.name} will earn ${totalPoints} points in the Race to Liberty!`);
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal payment failed:', error);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Pricing
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Race to Liberty - {tierInfo.name}
          </h1>
          <p className="text-gray-300 mt-2">Select your coin and boost your points in the race!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coin Selection */}
          <div className="lg:col-span-2">
            <div className="bg-[#0f1923] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaCoins className="text-yellow-400" />
                Select Your Coin
              </h2>

              {/* Search */}
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search coins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* Coin Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredCoins.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => setSelectedCoin(coin.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedCoin === coin.id
                        ? 'border-cyan-400 bg-cyan-900/30'
                        : 'border-gray-700 bg-[#1a2932] hover:border-gray-600'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Image src={coin.logo} alt={coin.name} width={32} height={32} />
                      <div className="text-center">
                        <div className="font-medium text-sm">{coin.symbol}</div>
                        <div className="text-xs text-gray-400">{coin.name}</div>
                        <div className="text-xs text-yellow-400 mt-1">
                          {coin.basePoints * tierInfo.multiplier} pts
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Payment Method Selection */}
              {selectedCoin && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        paymentMethod === 'paypal'
                          ? 'border-blue-500 bg-blue-900/30 text-blue-400'
                          : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      PayPal
                    </button>
                    <button
                      onClick={() => setPaymentMethod('crypto')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        paymentMethod === 'crypto'
                          ? 'border-cyan-500 bg-cyan-900/30 text-cyan-400'
                          : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      Crypto
                    </button>
                  </div>

                  {/* Email Input */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  {/* Terms */}
                  <div className="mb-4">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        className="accent-cyan-400"
                      />
                      I agree to the Terms of Service
                    </label>
                  </div>

                  {/* Payment Section */}
                  {paymentMethod === 'paypal' && agree && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                      <PayPalCheckout
                        amount={amount.toString()}
                        tier={`race-${tier}-${selectedCoin}`}
                        email={email}
                        onSuccess={handlePayPalSuccess}
                        onError={handlePayPalError}
                      />
                    </div>
                  )}

                  {paymentMethod === 'crypto' && agree && (
                    <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                      <div className="text-center mb-4">
                        <ConnectWalletButton />
                      </div>
                      <p className="text-sm text-gray-400 text-center">
                        Connect your wallet to pay with cryptocurrency
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f1923] rounded-xl p-6 border border-gray-800 sticky top-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-400" />
                Race Summary
              </h3>

              {/* Tier Info */}
              <div className="mb-4 p-3 bg-gradient-to-r from-cyan-900/30 to-indigo-900/30 rounded-lg border border-cyan-500/30">
                <div className="font-medium text-cyan-400">{tierInfo.name}</div>
                <div className="text-sm text-gray-300">{tierInfo.duration} placement</div>
                <div className="text-sm text-gray-300">Multiplier: {tierInfo.multiplier}x</div>
              </div>

              {/* Selected Coin */}
              {selectedCoinData && (
                <div className="mb-4 p-3 bg-[#1a2932] rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Image src={selectedCoinData.logo} alt={selectedCoinData.name} width={24} height={24} />
                    <div>
                      <div className="font-medium">{selectedCoinData.name}</div>
                      <div className="text-sm text-gray-400">{selectedCoinData.symbol}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">
                    Base Points: {selectedCoinData.basePoints}
                  </div>
                </div>
              )}

              {/* Points Calculation */}
              <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="text-yellow-400 font-medium mb-2">Points Earned</div>
                {selectedCoinData ? (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Base Points:</span>
                      <span>{selectedCoinData.basePoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tier Multiplier:</span>
                      <span>{tierInfo.multiplier}x</span>
                    </div>
                    <div className="border-t border-yellow-500/30 pt-1 mt-2">
                      <div className="flex justify-between font-bold text-yellow-400">
                        <span>Total Points:</span>
                        <span>{totalPoints}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">Select a coin to see points</div>
                )}
              </div>

              {/* Price */}
              <div className="mb-4 p-3 bg-[#1a2932] rounded-lg border border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Price:</span>
                  <span className="text-xl font-bold text-white">${amount}</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="text-xs text-gray-400 space-y-1">
                <div>✓ Featured placement for {tierInfo.duration}</div>
                <div>✓ Points boost in Race to Liberty</div>
                <div>✓ Enhanced project visibility</div>
                <div>✓ Priority support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
