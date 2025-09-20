"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { FaSearch, FaTrophy, FaCoins, FaArrowRight, FaStar } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import PayPalCheckout from '@/components/PayPalCheckout';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { RegisteredToken } from '@/types/token';

// Default message for when no wallet is connected
const NO_WALLET_MESSAGE = {
  id: 'no-wallet',
  name: 'Connect Wallet Required',
  symbol: 'WALLET',
  logo: '/crypto-icons/color/generic.svg',
  basePoints: 0,
  isUserToken: false
};

interface CoinOption {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  basePoints: number;
  isUserToken: boolean;
  boostMultiplier?: number;
  tokenId?: string;
}

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
  const { address, isConnected } = useAccount();
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'crypto'>('paypal');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(true);
  const [availableCoins, setAvailableCoins] = useState<CoinOption[]>([]);
  const [userTokens, setUserTokens] = useState<RegisteredToken[]>([]);

  const tierInfo = TIER_MULTIPLIERS[tier];

  // Load user's approved tokens
  useEffect(() => {
    if (isConnected && address) {
      loadUserTokens();
    } else {
      // Clear tokens when wallet disconnected
      setAvailableCoins([]);
      setUserTokens([]);
      setSelectedCoin(null);
    }
  }, [isConnected, address]);

  const loadUserTokens = () => {
    try {
      const storedTokens = JSON.parse(localStorage.getItem('registeredTokens') || '[]') as RegisteredToken[];
      const approvedTokens = storedTokens.filter(
        token => token.status === 'approved' && token.walletAddress.toLowerCase() === address?.toLowerCase()
      );
      setUserTokens(approvedTokens);

      // Convert approved tokens to coin options
      const userCoinOptions: CoinOption[] = approvedTokens.map(token => ({
        id: `user-${token.id}`,
        name: token.name,
        symbol: token.symbol,
        logo: token.logo || '/crypto-icons/color/generic.svg',
        basePoints: Math.round(100 * token.boostMultiplier), // Convert multiplier to base points
        isUserToken: true,
        boostMultiplier: token.boostMultiplier,
        tokenId: token.id,
      }));

      // Only show user's registered tokens
      setAvailableCoins(userCoinOptions);
    } catch (error) {
      console.error('Error loading user tokens:', error);
    }
  };

  const filteredCoins = useMemo(() => {
    return availableCoins.filter(coin =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, availableCoins]);

  const selectedCoinData = useMemo(() => {
    return availableCoins.find(coin => coin.id === selectedCoin);
  }, [selectedCoin, availableCoins]);

  const totalPoints = useMemo(() => {
    if (!selectedCoinData) return 0;
    let points = selectedCoinData.basePoints * tierInfo.multiplier;
    
    // Apply additional boost if it's a user token
    if (selectedCoinData.isUserToken && selectedCoinData.boostMultiplier) {
      points = Math.round(points * selectedCoinData.boostMultiplier);
    }
    
    return points;
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
          <p className="text-gray-300 mt-2">
            {!isConnected ? (
              'Connect your wallet to access your registered tokens with boost multipliers!'
            ) : userTokens.length > 0 ? (
              <>
                Select your registered token and boost your points in the race!
                <span className="block text-cyan-400 text-sm mt-1">
                  🎉 You have {userTokens.length} approved token{userTokens.length > 1 ? 's' : ''} with extra boosts!
                </span>
              </>
            ) : (
              'Register your tokens first to unlock boost multipliers in the race!'
            )}
          </p>
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

              {/* Wallet Connection Check */}
              {!isConnected ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <ConnectWalletButton />
                  </div>
                  <p className="text-gray-400 text-sm">
                    Connect your wallet to view your registered tokens for Race to Liberty boosts.
                  </p>
                </div>
              ) : userTokens.length > 0 ? (
                /* User's Registered Tokens */
                <div>
                  <h4 className="text-sm font-medium text-cyan-400 mb-3 flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    Your Registered Tokens ({userTokens.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {filteredCoins.map((coin) => (
                      <button
                        key={coin.id}
                        onClick={() => setSelectedCoin(coin.id)}
                        className={`p-4 rounded-lg border transition-all relative ${
                          selectedCoin === coin.id
                            ? 'border-cyan-400 bg-cyan-900/30'
                            : 'border-yellow-500/50 bg-yellow-900/20 hover:border-yellow-400'
                        }`}
                      >
                        <div className="absolute top-1 right-1">
                          <FaStar className="text-yellow-400 text-xs" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Image src={coin.logo} alt={coin.name} width={32} height={32} />
                          <div className="text-center">
                            <div className="font-medium text-sm">{coin.symbol}</div>
                            <div className="text-xs text-gray-400">{coin.name}</div>
                            <div className="text-xs text-yellow-400 mt-1">
                              {Math.round(coin.basePoints * tierInfo.multiplier * (coin.boostMultiplier || 1))} pts
                            </div>
                            <div className="text-xs text-cyan-400">
                              {coin.boostMultiplier}x boost
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* No Registered Tokens */
                <div className="text-center py-8">
                  <div className="mb-4">
                    <FaCoins className="text-4xl text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">No Registered Tokens</h4>
                    <p className="text-gray-400 mb-4">
                      You haven't registered any tokens yet. Register your tokens to unlock boost multipliers!
                    </p>
                    <a 
                      href="/dashboard/register-token" 
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Register Tokens
                    </a>
                  </div>
                </div>
              )}

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
                <div className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
                  Points Earned
                  {selectedCoinData?.isUserToken && <FaStar className="text-yellow-400 text-sm" />}
                </div>
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
                    {selectedCoinData.isUserToken && selectedCoinData.boostMultiplier && (
                      <div className="flex justify-between text-cyan-400">
                        <span>Token Boost:</span>
                        <span>{selectedCoinData.boostMultiplier}x</span>
                      </div>
                    )}
                    <div className="border-t border-yellow-500/30 pt-1 mt-2">
                      <div className="flex justify-between font-bold text-yellow-400">
                        <span>Total Points:</span>
                        <span>{totalPoints}</span>
                      </div>
                    </div>
                    {selectedCoinData.isUserToken && (
                      <div className="text-xs text-cyan-400 mt-1">
                        🎉 Boosted by your registered token!
                      </div>
                    )}
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
                {userTokens.length > 0 && (
                  <div className="text-cyan-400 mt-2 pt-2 border-t border-gray-700">
                    ✓ Extra boost from your {userTokens.length} approved token{userTokens.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
