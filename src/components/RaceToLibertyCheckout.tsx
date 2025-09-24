"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { FaSearch, FaTrophy, FaCoins, FaArrowRight, FaStar } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import PayPalCheckout from '@/components/PayPalCheckout';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import TokenDebugger from '@/components/TokenDebugger';
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

  const loadUserTokens = async () => {
    if (!address) {
      console.log('No wallet address provided');
      setAvailableCoins([]);
      setUserTokens([]);
      return;
    }

    try {
      console.log('Fetching tokens for address:', address);
      
      const response = await fetch(`/api/tokens/by-wallet?address=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (!data.success) {
        console.error('API error:', data.error);
        setAvailableCoins([]);
        setUserTokens([]);
        return;
      }

      console.log('API response:', data);
      const allTokens = data.tokens as RegisteredToken[];
      
      // Filter for approved tokens only
      const approvedTokens = allTokens.filter(token => token.status === 'approved');
      console.log('Approved tokens:', approvedTokens);
      
      setUserTokens(approvedTokens);

      // Convert approved tokens to coin options
      const userCoinOptions: CoinOption[] = approvedTokens.map(token => {
        try {
          return {
            id: `user-${token.id}`,
            name: token.name || 'Unknown Token',
            symbol: token.symbol || 'UNKNOWN',
            logo: token.logo || '/crypto-icons/color/generic.svg',
            basePoints: Math.round(100 * (token.boostMultiplier || 1)), // Convert multiplier to base points
            isUserToken: true,
            boostMultiplier: token.boostMultiplier || 1,
            tokenId: token.id,
          };
        } catch (err) {
          console.error('Error mapping token to coin option:', token, err);
          return {
            id: `user-${token.id || 'unknown'}`,
            name: 'Error Token',
            symbol: 'ERROR',
            logo: '/crypto-icons/color/generic.svg',
            basePoints: 100,
            isUserToken: true,
            boostMultiplier: 1,
            tokenId: token.id || 'unknown',
          };
        }
      });

      console.log('User coin options:', userCoinOptions);
      setAvailableCoins(userCoinOptions);
      
    } catch (error) {
      console.error('Error loading user tokens from API:', error);
      
      // Fallback to localStorage if API fails
      try {
        console.log('Falling back to localStorage...');
        const storedTokens = JSON.parse(localStorage.getItem('registeredTokens') || '[]') as RegisteredToken[];
        const approvedTokens = storedTokens.filter(
          token => {
            const tokenAddress = token.submittedByAddress || token.walletAddress;
            return token.status === 'approved' && 
              tokenAddress && address && 
              tokenAddress.toLowerCase() === address.toLowerCase();
          }
        );
        
        setUserTokens(approvedTokens);
        
        const userCoinOptions: CoinOption[] = approvedTokens.map(token => ({
          id: `user-${token.id}`,
          name: token.name || 'Unknown Token',
          symbol: token.symbol || 'UNKNOWN',
          logo: token.logo || '/crypto-icons/color/generic.svg',
          basePoints: Math.round(100 * (token.boostMultiplier || 1)),
          isUserToken: true,
          boostMultiplier: token.boostMultiplier || 1,
          tokenId: token.id,
        }));
        
        setAvailableCoins(userCoinOptions);
      } catch (fallbackError) {
        console.error('Fallback to localStorage also failed:', fallbackError);
        setAvailableCoins([]);
        setUserTokens([]);
      }
    }
  };

  const filteredCoins = useMemo(() => {
    try {
      const searchLower = searchTerm.toLowerCase();
      return availableCoins.filter(coin => {
        try {
          return (coin.name && typeof coin.name === 'string' && coin.name.toLowerCase().includes(searchLower)) ||
                 (coin.symbol && typeof coin.symbol === 'string' && coin.symbol.toLowerCase().includes(searchLower));
        } catch (err) {
          console.error('Error filtering coin:', coin, err);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in filteredCoins:', error);
      return availableCoins;
    }
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
    <div className="min-h-screen  text-white">
      {/* Animated Background */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
      </div> */}

      <div className="relative z-0 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Modern Header */}
          <div className="mb-12">
            <button
              onClick={onBack}
              className="mb-6 group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                ←
              </div>
              Back to Pricing
            </button>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <FaTrophy className="text-yellow-400" />
                <span className="text-sm font-medium">{tierInfo.name} Tier</span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Race to Liberty
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {!isConnected ? (
                  'Connect your wallet to access your registered tokens with boost multipliers!'
                ) : userTokens.length > 0 ? (
                  <>
                    Select your registered token and boost your points in the race!
                    <span className="block text-cyan-400 text-lg mt-2 font-medium">
                      🎉 {userTokens.length} approved token{userTokens.length > 1 ? 's' : ''} ready for boost!
                    </span>
                  </>
                ) : (
                  'Register your tokens first to unlock boost multipliers in the race!'
                )}
              </p>
            </div>
          </div>

          {/* Debug Component - Remove in production */}
          <TokenDebugger />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Token Selection */}
            <div className="xl:col-span-2">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                      <FaCoins className="text-white" />
                    </div>
                    Select Your Token
                  </h2>
                  {userTokens.length > 0 && (
                    <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium">
                      {userTokens.length} Available
                    </div>
                  )}
                </div>

                {/* Modern Search */}
                {userTokens.length > 0 && (
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search your tokens..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                )}

                {/* Wallet Connection State */}
                {!isConnected ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Connect Your Wallet</h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      Connect your wallet to access your registered tokens and unlock boost multipliers for the race.
                    </p>
                    <ConnectWalletButton />
                  </div>
                ) : userTokens.length > 0 ? (
                  /* User's Registered Tokens */
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCoins.map((coin) => (
                        <button
                          key={coin.id}
                          onClick={() => setSelectedCoin(coin.id)}
                          className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                            selectedCoin === coin.id
                              ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 shadow-lg shadow-cyan-500/25'
                              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          {/* Boost Badge */}
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                            <FaStar className="text-white text-xs" />
                          </div>
                          
                          {/* Token Info */}
                          <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                              <Image src={coin.logo} alt={coin.name} width={40} height={40} className="rounded-xl" />
                            </div>
                            
                            <h4 className="font-bold text-lg mb-1">{coin.symbol}</h4>
                            <p className="text-gray-400 text-sm mb-3 truncate w-full">{coin.name}</p>
                            
                            {/* Stats */}
                            <div className="w-full space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Points:</span>
                                <span className="font-bold text-yellow-400">
                                  {Math.round(coin.basePoints * tierInfo.multiplier * (coin.boostMultiplier || 1))}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Boost:</span>
                                <span className="font-bold text-cyan-400">{coin.boostMultiplier}x</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Selection Indicator */}
                          {selectedCoin === coin.id && (
                            <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400 pointer-events-none">
                              <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* No Registered Tokens */
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <FaCoins className="text-3xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">No Registered Tokens</h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      You haven't registered any tokens yet. Register your tokens to unlock boost multipliers and dominate the race!
                    </p>
                    <a 
                      href="/dashboard/register-token" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <FaCoins />
                      Register Your Tokens
                    </a>
                  </div>
                )}

                {/* Payment Section */}
                {selectedCoin && (
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                        💳
                      </div>
                      Complete Purchase
                    </h3>
                    
                    {/* Payment Methods */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button
                        onClick={() => setPaymentMethod('paypal')}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          paymentMethod === 'paypal'
                            ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/25'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">💳</div>
                          <div className="font-semibold">PayPal</div>
                          <div className="text-xs text-gray-400">Credit & Debit Cards</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setPaymentMethod('crypto')}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          paymentMethod === 'crypto'
                            ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/25'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">🪙</div>
                          <div className="font-semibold">Crypto</div>
                          <div className="text-xs text-gray-400">Wallet Payment</div>
                        </div>
                      </button>
                    </div>

                    {/* Email Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-3">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                      />
                    </div>

                    {/* Terms */}
                    <div className="mb-6">
                      <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                          className="mt-1 w-4 h-4 text-cyan-500 bg-white/10 border-white/20 rounded focus:ring-cyan-500/50 focus:ring-2"
                        />
                        <span>I agree to the <a href="#" className="text-cyan-400 hover:text-cyan-300">Terms of Service</a> and <a href="#" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a></span>
                      </label>
                    </div>

                    {/* Payment Sections */}
                    {paymentMethod === 'paypal' && agree && (
                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
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
                      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm text-center">
                        <div className="mb-4">
                          <ConnectWalletButton />
                        </div>
                        <p className="text-gray-400">
                          Connect your wallet to pay with cryptocurrency
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>

            {/* Modern Summary Sidebar */}
            <div className="xl:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                    <FaTrophy className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Race Summary</h3>
                </div>

                {/* Tier Info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-cyan-400">{tierInfo.name}</span>
                    <div className="px-2 py-1 rounded-full bg-cyan-500/20 text-xs font-medium text-cyan-400">
                      {tierInfo.multiplier}x
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">{tierInfo.duration} placement</div>
                  <div className="text-xs text-gray-400 mt-1">Tier multiplier applied</div>
                </div>

                {/* Selected Token */}
                {selectedCoinData && (
                  <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <Image src={selectedCoinData.logo} alt={selectedCoinData.name} width={32} height={32} className="rounded-lg" />
                      </div>
                      <div>
                        <div className="font-bold">{selectedCoinData.name}</div>
                        <div className="text-sm text-gray-400">{selectedCoinData.symbol}</div>
                      </div>
                      {selectedCoinData.isUserToken && (
                        <div className="ml-auto">
                          <FaStar className="text-yellow-400" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-300">
                      Base Points: <span className="font-bold text-white">{selectedCoinData.basePoints}</span>
                    </div>
                  </div>
                )}

                {/* Points Calculation */}
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-bold text-yellow-400">Points Earned</h4>
                    {selectedCoinData?.isUserToken && <FaStar className="text-yellow-400 text-sm" />}
                  </div>
                  {selectedCoinData ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Base Points:</span>
                        <span className="font-medium">{selectedCoinData.basePoints}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Tier Multiplier:</span>
                        <span className="font-medium text-cyan-400">{tierInfo.multiplier}x</span>
                      </div>
                      {selectedCoinData.isUserToken && selectedCoinData.boostMultiplier && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Token Boost:</span>
                          <span className="font-medium text-purple-400">{selectedCoinData.boostMultiplier}x</span>
                        </div>
                      )}
                      <div className="border-t border-yellow-500/30 pt-2 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-yellow-400">Total Points:</span>
                          <span className="text-2xl font-bold text-yellow-400">{totalPoints}</span>
                        </div>
                      </div>
                      {selectedCoinData.isUserToken && (
                        <div className="text-xs text-purple-400 mt-2 flex items-center gap-1">
                          <FaStar className="text-xs" />
                          Boosted by your registered token!
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm text-center py-4">
                      Select a token to see points calculation
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Total Price:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                      ${amount}
                    </span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-300 mb-3">What's Included:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      Featured placement for {tierInfo.duration}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      Points boost in Race to Liberty
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      Enhanced project visibility
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      Priority support
                    </div>
                    {userTokens.length > 0 && (
                      <div className="flex items-center gap-2 text-purple-400 mt-3 pt-2 border-t border-white/10">
                        <FaStar className="text-sm" />
                        Extra boost from your {userTokens.length} approved token{userTokens.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
