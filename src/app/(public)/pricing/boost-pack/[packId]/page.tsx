"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useSendTransaction, useWriteContract, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseUnits, formatUnits, parseEther } from 'viem';
import { erc20Abi } from 'viem';
import { FaCoins, FaCheck, FaSearch, FaTimes, FaExternalLinkAlt, FaArrowLeft, FaRocket, FaTag, FaGift } from 'react-icons/fa';
import Image from 'next/image';
import PublicHeader from '@/components/PublicHeader';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  fetchUserTokens, 
  addTokenBoost, 
  loadTokenBoostsFromStorage, 
  saveTokenBoostsToStorage 
} from '@/store/slices/tokenSlice';

// Boost pack configurations
const BOOST_PACKS = {
  starter: { 
    id: "starter", 
    name: "Starter Boost", 
    points: 250, 
    priceUSD: 199, 
    description: "Gain entry into the Boosted Zone",
    icon: "🔹",
    color: "from-blue-600 to-blue-700"
  },
  growth: { 
    id: "growth", 
    name: "Growth Boost", 
    points: 750, 
    priceUSD: 499, 
    description: "Highlighted in daily \"Top Movers\" feed",
    icon: "🔹",
    color: "from-green-600 to-green-700"
  },
  pro: { 
    id: "pro", 
    name: "Pro Boost", 
    points: 1500, 
    priceUSD: 899, 
    description: "Unlocks \"Turbo Highlight\" (color frames, 48h push)",
    icon: "🔹",
    color: "from-purple-600 to-purple-700"
  },
  elite: { 
    id: "elite", 
    name: "Elite Boost", 
    points: 7500, 
    priceUSD: 3999, 
    description: "Premium: Top of board + Featured Video slot",
    icon: "🔹",
    color: "from-yellow-600 to-yellow-700"
  },
};

// Promo code configurations
const PROMO_CODES = {
  'FREEBOOST': { 
    type: 'free', 
    discount: 100, 
    description: 'Free boost pack - 100% off',
    isActive: true
  },
  'SAVE50': { 
    type: 'percentage', 
    discount: 50, 
    description: '50% off boost pack',
    isActive: true
  },
  'WELCOME25': { 
    type: 'percentage', 
    discount: 25, 
    description: '25% off for new users',
    isActive: true
  },
  'FIXED100': { 
    type: 'fixed', 
    discount: 100, 
    description: '$100 off boost pack',
    isActive: true
  }
};

// Token categories with boost multipliers
const TOKEN_CATEGORIES = {
  defi: { name: 'DeFi', multiplier: 1.2, color: 'text-blue-400' },
  gaming: { name: 'Gaming', multiplier: 1.3, color: 'text-purple-400' },
  meme: { name: 'Meme', multiplier: 1.1, color: 'text-yellow-400' },
  nft: { name: 'NFT', multiplier: 1.25, color: 'text-pink-400' },
  infrastructure: { name: 'Infrastructure', multiplier: 1.4, color: 'text-green-400' },
  ai: { name: 'AI', multiplier: 1.5, color: 'text-cyan-400' }
};

// Fetch user's registered and approved tokens from database
const fetchUserRegisteredTokens = async (walletAddress: string) => {
  try {
    const response = await fetch(`/api/tokens/by-user?address=${walletAddress}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user tokens');
    }
    
    const { data } = await response.json();
    const tokenBoosts = JSON.parse(localStorage.getItem('tokenBoosts') || '{}');
    
    // Only return approved tokens with boost data
    return data
      .filter((token: any) => token.status === 'approved')
      .map((token: any) => ({
        id: token.id,
        symbol: token.tokenSymbol,
        name: token.tokenName,
        address: token.contractAddress,
        balance: Math.floor(Math.random() * 1000000) + 10000, // Mock balance
        logo: token.imageUri || `/crypto-icons/color/${token.tokenSymbol.toLowerCase()}.svg`,
        currentBoost: tokenBoosts[token.id] || 0,
        isRegistered: true,
        category: token.category || 'defi',
        blockchain: token.blockchain || 'ethereum',
        multiplier: TOKEN_CATEGORIES[token.category as keyof typeof TOKEN_CATEGORIES]?.multiplier || 1.0,
        website: token.website,
        twitter: token.twitter,
        telegram: token.telegram,
        discord: token.discord,
        github: token.github,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt
      }));
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return [];
  }
};

// Payment configuration
const DEFAULT_RECEIVER: `0x${string}` = "0x81bA7b98E49014Bff22F811E9405640bC2B39cC0";
const DEFAULT_NYAX: `0x${string}` = "0x5eed5621b92be4473f99bacac77acfa27deb57d9";
const DEFAULT_USDT: `0x${string}` = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export default function BoostPackCheckout() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isConnected, chain, address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { open } = useAppKit();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  // Redux state
  const { userTokens, tokenBoosts, isLoading } = useAppSelector((state) => state.tokens);

  const packId = params.packId as string;
  const boostPack = BOOST_PACKS[packId as keyof typeof BOOST_PACKS];

  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'eth' | 'usdt' | 'nyax'>('eth');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(3000);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Load user tokens from database using Redux
  const refreshUserTokens = async () => {
    if (!address) return;
    
    try {
      await dispatch(fetchUserTokens(address));
    } catch (error) {
      console.error('Failed to load user tokens:', error);
    }
  };

  useEffect(() => {
    // Load token boosts from localStorage on mount
    dispatch(loadTokenBoostsFromStorage());
    
    // Fetch user tokens if connected
    if (address) {
      refreshUserTokens();
    }
  }, [address, dispatch]);

  // Listen for storage changes to refresh tokens when boosts are updated
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tokenBoosts' || e.key === 'registeredTokens') {
        refreshUserTokens();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch ETH price
  useEffect(() => {
    const fetchETHPrice = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await res.json();
        if (data?.ethereum?.usd) {
          setEthPrice(data.ethereum.usd);
        }
      } catch (error) {
        console.error('Failed to fetch ETH price:', error);
      }
    };
    fetchETHPrice();
  }, []);

  // Filter tokens based on search
  const filteredTokens = useMemo(() => {
    return userTokens.filter((token: any) => 
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, userTokens]);

  // Promo code validation function
  const validatePromoCode = (code: string) => {
    const upperCode = code.toUpperCase();
    const promo = PROMO_CODES[upperCode as keyof typeof PROMO_CODES];
    
    if (!promo) {
      return { isValid: false, error: 'Invalid promo code' };
    }
    
    if (!promo.isActive) {
      return { isValid: false, error: 'Promo code is no longer active' };
    }
    
    return { isValid: true, promo };
  };

  // Apply promo code
  const handleApplyPromo = () => {
    setPromoError(null);
    
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    
    const validation = validatePromoCode(promoCode);
    
    if (!validation.isValid) {
      setPromoError(validation.error || 'Invalid promo code');
      return;
    }
    
    setAppliedPromo(validation.promo);
    setPromoError(null);
  };

  // Remove applied promo code
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError(null);
  };

  // Calculate pricing with promo code
  const calculatePrice = () => {
    if (!boostPack) return { totalPrice: 0, discountAmount: 0, finalPrice: 0 };
    
    const basePrice = boostPack.priceUSD;
    let discountAmount = 0;
    
    if (appliedPromo) {
      switch (appliedPromo.type) {
        case 'percentage':
          discountAmount = (basePrice * appliedPromo.discount) / 100;
          break;
        case 'fixed':
          discountAmount = Math.min(appliedPromo.discount, basePrice);
          break;
        case 'free':
          discountAmount = basePrice;
          break;
      }
    }
    
    const finalPrice = Math.max(0, basePrice - discountAmount);
    
    return {
      totalPrice: basePrice,
      discountAmount,
      finalPrice
    };
  };

  const pricing = calculatePrice();
  const nyaxPrice = pricing.finalPrice * 0.8; // 20% discount for NYAX
  const ethAmount = pricing.finalPrice / ethPrice;

  const handleTokenToggle = (tokenId: string) => {
    setSelectedTokens(prev => 
      prev.includes(tokenId) 
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const handlePayment = async () => {
    if (!isConnected) {
      open({ view: 'Connect' });
      return;
    }

    if (selectedTokens.length === 0) {
      setError('Please select at least one token to boost');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let txHash = null;
      
      // Handle free promo code - skip payment
      if (appliedPromo && appliedPromo.type === 'free') {
        // Apply boost to selected tokens without payment
        const selectedTokenData = userTokens.filter(token => selectedTokens.includes(token.id));
        
        selectedTokenData.forEach(token => {
          const baseBoost = boostPack.points;
          const categoryMultiplier = token.multiplier || 1.0;
          const finalBoost = Math.floor(baseBoost * categoryMultiplier);
          
          dispatch(addTokenBoost({ tokenId: token.id, points: finalBoost }));
          console.log(`Applied ${finalBoost} boost points to ${token.symbol || token.tokenSymbol} (${token.name || token.tokenName}) - FREE PROMO`);
        });
        
        dispatch(saveTokenBoostsToStorage());
        await refreshUserTokens();
        
        // Redirect to success page with promo flag
        router.push(`/pricing/boost-pack/success?pack=${packId}&tokens=${selectedTokens.join(',')}&promo=${promoCode.toUpperCase()}&free=true`);
        return;
      }
      
      // Regular payment flow
      switch (paymentMethod) {
        case 'eth':
          txHash = await sendTransactionAsync({
            to: DEFAULT_RECEIVER,
            value: parseEther(ethAmount.toFixed(6))
          });
          break;
          
        case 'usdt':
          txHash = await writeContractAsync({
            abi: erc20Abi,
            address: DEFAULT_USDT,
            functionName: "transfer",
            args: [DEFAULT_RECEIVER, parseUnits(pricing.finalPrice.toFixed(2), 6)]
          });
          break;
          
        case 'nyax':
          txHash = await writeContractAsync({
            abi: erc20Abi,
            address: DEFAULT_NYAX,
            functionName: "transfer",
            args: [DEFAULT_RECEIVER, parseUnits(nyaxPrice.toFixed(6), 18)]
          });
          break;
      }

      // Apply boost to selected user-registered tokens using Redux
      const selectedTokenData = userTokens.filter(token => selectedTokens.includes(token.id));
      
      // Update boost points for each selected token
      selectedTokenData.forEach(token => {
        const baseBoost = boostPack.points;
        const categoryMultiplier = token.multiplier || 1.0;
        const finalBoost = Math.floor(baseBoost * categoryMultiplier);
        
        // Dispatch Redux action to add token boost
        dispatch(addTokenBoost({ tokenId: token.id, points: finalBoost }));
        
        console.log(`Applied ${finalBoost} boost points to ${token.symbol || token.tokenSymbol} (${token.name || token.tokenName})`);
      });
      
      // Save token boosts to localStorage via Redux
      dispatch(saveTokenBoostsToStorage());
      
      // Refresh token list to show updated boost values
      await refreshUserTokens();
      
      // Log the transaction for debugging
      console.log('Boost applied to tokens:', {
        packName: boostPack.name,
        basePoints: boostPack.points,
        selectedTokens: selectedTokenData.map(t => ({
          symbol: t.symbol || t.tokenSymbol,
          multiplier: t.multiplier || 1.0,
          finalBoost: Math.floor(boostPack.points * (t.multiplier || 1.0))
        })),
        totalBoostApplied: selectedTokenData.reduce((sum, t) => sum + Math.floor(boostPack.points * (t.multiplier || 1.0)), 0)
      });
      
      console.log('Payment successful:', txHash);
      const promoParam = appliedPromo ? `&promo=${promoCode.toUpperCase()}&discount=${pricing.discountAmount}` : '';
      router.push(`/pricing/boost-pack/success?pack=${packId}&tokens=${selectedTokens.join(',')}&tx=${txHash}${promoParam}`);
      
    } catch (error: any) {
      setError(error?.shortMessage || error?.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!boostPack) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Boost Pack Not Found</h1>
          <button 
            onClick={() => router.push('/pricing')}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-black text-white">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute top-40 right-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/pricing')}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
                {boostPack.name} Checkout
              </h1>
              <p className="text-gray-400 mt-1">{boostPack.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Token Selection */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaCoins className="text-cyan-400" />
                  Select Tokens to Boost
                </h2>
                
                {/* Search */}
                <div className="relative mb-6">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your tokens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-600 rounded w-20 mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded w-32"></div>
                          </div>
                          <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Token List */}
                {!isLoading && (
                  <div className="space-y-3">
                    {filteredTokens.map((token: any) => {
                    const category = TOKEN_CATEGORIES[token.category as keyof typeof TOKEN_CATEGORIES];
                    const boostedPoints = Math.floor(boostPack.points * (token.multiplier || 1.0));
                    
                    return (
                      <div
                        key={token.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedTokens.includes(token.id)
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                        onClick={() => handleTokenToggle(token.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Image
                              src={token.logo}
                              alt={token.symbol}
                              width={40}
                              height={40}
                              className="rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/crypto-icons/color/generic.svg';
                              }}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{token.symbol}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${category?.color || 'text-gray-400'} bg-gray-800`}>
                                  {category?.name || 'Other'}
                                </span>
                              </div>
                              <div className="text-gray-400 text-sm">{token.name}</div>
                              <div className="text-gray-500 text-xs">
                                Balance: {token.balance.toLocaleString()} • {token.blockchain}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {token.currentBoost > 0 && (
                              <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                                Current: {token.currentBoost} pts
                              </div>
                            )}
                            
                            <div className="text-right">
                              <div className="text-cyan-400 font-semibold text-sm">
                                +{boostedPoints} pts
                              </div>
                              <div className="text-gray-500 text-xs">
                                {token.multiplier}x multiplier
                              </div>
                            </div>
                            
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedTokens.includes(token.id)
                                ? 'border-cyan-500 bg-cyan-500'
                                : 'border-gray-600'
                            }`}>
                              {selectedTokens.includes(token.id) && (
                                <FaCheck className="text-white text-xs" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                )}

                {!isLoading && filteredTokens.length === 0 && (
                  <div className="text-center py-8">
                    <FaCoins className="text-gray-500 text-4xl mx-auto mb-4" />
                    <div className="text-gray-500 mb-2">
                      {!isConnected 
                        ? 'Connect wallet to view your tokens'
                        : searchQuery 
                          ? 'No tokens found' 
                          : 'No approved tokens available'
                      }
                    </div>
                    <div className="text-gray-600 text-sm mb-4">
                      {!isConnected
                        ? 'Connect your wallet to see registered tokens available for boosting'
                        : searchQuery 
                          ? 'Try a different search term' 
                          : 'Register your tokens and get them approved by admins to use boost packs'
                      }
                    </div>
                    {!isConnected ? (
                      <button
                        onClick={() => open({ view: 'Connect' })}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                      >
                        Connect Wallet
                      </button>
                    ) : !searchQuery && (
                      <div className="space-y-2">
                        <button
                          onClick={() => router.push('/dashboard/register-token')}
                          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                        >
                          Register Tokens
                        </button>
                        <div className="text-xs text-gray-500">
                          Register tokens → Wait for approval → Boost tokens
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Boost Pack Info */}
              <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6">
                <div className={`text-center p-6 rounded-lg bg-gradient-to-r ${boostPack.color} mb-4`}>
                  <div className="text-4xl mb-2">{boostPack.icon}</div>
                  <h3 className="text-xl font-bold text-white">{boostPack.name}</h3>
                  <div className="text-2xl font-bold text-white mt-2">
                    {boostPack.points} Points
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Points:</span>
                    <span className="text-white font-semibold">{boostPack.points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Selected Tokens:</span>
                    <span className="text-white font-semibold">{selectedTokens.length}</span>
                  </div>
                  {selectedTokens.length > 0 && (
                    <div className="border-t border-gray-700 pt-3">
                      <div className="text-gray-400 text-xs mb-2">Boosted Points per Token:</div>
                      {selectedTokens.map(tokenId => {
                        const token = userTokens.find(t => t.id === tokenId);
                        if (!token) return null;
                        const boostedPoints = Math.floor(boostPack.points * (token.multiplier || 1.0));
                        return (
                          <div key={tokenId} className="flex justify-between text-xs">
                            <span className="text-gray-400">{token.symbol}:</span>
                            <span className="text-cyan-400">+{boostedPoints} pts ({token.multiplier || 1.0}x)</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base Price:</span>
                      <span className="text-white">${pricing.totalPrice.toFixed(2)}</span>
                    </div>
                    {appliedPromo && pricing.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-green-400">Discount ({promoCode.toUpperCase()}):</span>
                        <span className="text-green-400">-${pricing.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
                      <span className="text-gray-400">Final Price:</span>
                      <span className={`${pricing.finalPrice === 0 ? 'text-green-400' : 'text-white'}`}>
                        {pricing.finalPrice === 0 ? 'FREE' : `$${pricing.finalPrice.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-semibold">Total Boost Value:</span>
                      <span className="text-cyan-400 font-semibold">
                        {selectedTokens.reduce((total, tokenId) => {
                          const token = userTokens.find(t => t.id === tokenId);
                          return total + (token ? Math.floor(boostPack.points * (token.multiplier || 1.0)) : 0);
                        }, 0).toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('eth')}
                    className={`w-full p-3 rounded-lg border transition-colors ${
                      paymentMethod === 'eth'
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image src="/crypto-icons/color/eth.svg" width={24} height={24} alt="ETH" />
                        <span className="text-white">ETH</span>
                      </div>
                      <span className="text-gray-300">{ethAmount.toFixed(5)} ETH</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('usdt')}
                    className={`w-full p-3 rounded-lg border transition-colors ${
                      paymentMethod === 'usdt'
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image src="/crypto-icons/color/usdt.svg" width={24} height={24} alt="USDT" />
                        <span className="text-white">USDT</span>
                      </div>
                      <span className="text-gray-300">${pricing.finalPrice.toFixed(2)}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('nyax')}
                    className={`w-full p-3 rounded-lg border transition-colors ${
                      paymentMethod === 'nyax'
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image src="/logo.png" width={24} height={24} alt="NYAX" />
                        <div>
                          <span className="text-white">NYAX</span>
                          <div className="text-green-400 text-xs">20% OFF + Bonus Points</div>
                        </div>
                      </div>
                      <span className="text-gray-300">${nyaxPrice.toFixed(2)}</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FaTag className="text-yellow-400" />
                  Promo Code
                </h3>
                
                {!appliedPromo ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={!promoCode.trim()}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    
                    {promoError && (
                      <div className="text-red-400 text-sm flex items-center gap-2">
                        <FaTimes />
                        {promoError}
                      </div>
                    )}
                    
                    <div className="text-gray-400 text-xs">
                      Try: FREEBOOST, SAVE50, WELCOME25, FIXED100
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaGift className="text-green-400" />
                        <div>
                          <div className="text-white font-semibold">{promoCode.toUpperCase()}</div>
                          <div className="text-green-400 text-sm">{appliedPromo.description}</div>
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    
                    <div className="text-green-400 text-sm">
                      {appliedPromo.type === 'free' ? '🎉 Free boost pack!' : 
                       appliedPromo.type === 'percentage' ? `${appliedPromo.discount}% discount applied` :
                       `$${appliedPromo.discount} discount applied`}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <FaTimes />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handlePayment}
                disabled={selectedTokens.length === 0 || isProcessing}
                className={`w-full py-4 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 ${
                  appliedPromo && appliedPromo.type === 'free' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {appliedPromo && appliedPromo.type === 'free' ? 'Claiming...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    {appliedPromo && appliedPromo.type === 'free' ? (
                      <>
                        <FaGift />
                        Claim Free Boost Pack
                      </>
                    ) : (
                      <>
                        <FaRocket />
                        {pricing.finalPrice === 0 ? 'Claim Free Boost Pack' : 'Purchase Boost Pack'}
                      </>
                    )}
                  </>
                )}
              </button>

              <div className="text-center text-gray-400 text-xs">
                By purchasing, you agree to apply the boost to selected tokens
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
