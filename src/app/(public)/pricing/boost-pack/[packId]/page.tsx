"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useSendTransaction, useWriteContract, useSwitchChain } from 'wagmi';
import { parseEther, erc20Abi, parseUnits } from 'viem';
import { useAppKit } from '@reown/appkit/react';
import PublicHeader from '@/components/PublicHeader';
import { FaRocket, FaSearch, FaCheck, FaTimes, FaArrowLeft, FaCoins, FaFire } from 'react-icons/fa';
import Image from 'next/image';

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

// Mock user tokens (in real app, fetch from API/blockchain)
const USER_TOKENS = [
  {
    id: '1',
    symbol: 'PEPE',
    name: 'Pepe Coin',
    address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    balance: 1000000,
    logo: '/crypto-icons/color/pepe.svg',
    currentBoost: 0,
    isRegistered: true
  },
  {
    id: '2',
    symbol: 'DOGE',
    name: 'Dogecoin',
    address: '0xba2ae424d960c26247dd6c32edc70b295c744c43',
    balance: 50000,
    logo: '/crypto-icons/color/doge.svg',
    currentBoost: 250,
    isRegistered: true
  },
  {
    id: '3',
    symbol: 'SHIB',
    name: 'Shiba Inu',
    address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
    balance: 10000000,
    logo: '/crypto-icons/color/shib.svg',
    currentBoost: 0,
    isRegistered: true
  },
  {
    id: '4',
    symbol: 'FLOKI',
    name: 'Floki Inu',
    address: '0xcf0c122c6b73ff809c693db761e7baebe62b6a2e',
    balance: 250000,
    logo: '/crypto-icons/color/floki.svg',
    currentBoost: 750,
    isRegistered: true
  }
];

// Payment configuration
const DEFAULT_RECEIVER: `0x${string}` = "0x81bA7b98E49014Bff22F811E9405640bC2B39cC0";
const DEFAULT_NYAX: `0x${string}` = "0x5eed5621b92be4473f99bacac77acfa27deb57d9";
const DEFAULT_USDT: `0x${string}` = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export default function BoostPackCheckout() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { open } = useAppKit();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  const packId = params.packId as string;
  const boostPack = BOOST_PACKS[packId as keyof typeof BOOST_PACKS];

  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'eth' | 'usdt' | 'nyax'>('eth');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(3000);

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
    return USER_TOKENS.filter(token => 
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Calculate pricing
  const totalPrice = boostPack ? boostPack.priceUSD : 0;
  const nyaxPrice = totalPrice * 0.8; // 20% discount for NYAX
  const ethAmount = totalPrice / ethPrice;

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
      let txHash;
      
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
            args: [DEFAULT_RECEIVER, parseUnits(totalPrice.toFixed(2), 6)]
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

      // In a real implementation, you would:
      // 1. Send transaction details to backend
      // 2. Apply boost to selected tokens
      // 3. Update user's token boost status
      
      console.log('Payment successful:', txHash);
      router.push(`/pricing/boost-pack/success?pack=${packId}&tokens=${selectedTokens.join(',')}&tx=${txHash}`);
      
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

                {/* Token List */}
                <div className="space-y-3">
                  {filteredTokens.map((token) => (
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
                          />
                          <div>
                            <div className="font-semibold text-white">{token.symbol}</div>
                            <div className="text-gray-400 text-sm">{token.name}</div>
                            <div className="text-gray-500 text-xs">
                              Balance: {token.balance.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {token.currentBoost > 0 && (
                            <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                              Current: {token.currentBoost} pts
                            </div>
                          )}
                          
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
                  ))}
                </div>

                {filteredTokens.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">No tokens found</div>
                    <div className="text-gray-600 text-sm">
                      {searchQuery ? 'Try a different search term' : 'You need to register tokens first'}
                    </div>
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
                    <span className="text-gray-400">Boost Points:</span>
                    <span className="text-white font-semibold">+{boostPack.points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Selected Tokens:</span>
                    <span className="text-white font-semibold">{selectedTokens.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Boost Value:</span>
                    <span className="text-cyan-400 font-semibold">
                      {(boostPack.points * selectedTokens.length).toLocaleString()} pts
                    </span>
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
                      <span className="text-gray-300">${totalPrice}</span>
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
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold rounded-lg hover:from-cyan-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaRocket />
                    Purchase Boost Pack
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
