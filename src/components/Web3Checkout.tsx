"use client";

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import PayPalCheckout from '@/components/PayPalCheckout';
import { FaWallet, FaShieldAlt, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { useAccount, useSendTransaction, useWriteContract, useSwitchChain } from 'wagmi';
import { parseEther, erc20Abi, parseUnits } from 'viem';
import { useAppKit } from '@reown/appkit/react';

type Product = { id: number; name: string; desc: string; priceUsd: number; image: string; qty: number };

export default function Web3Checkout({ selectedTier, paymentMethod }: { selectedTier?: string; paymentMethod?: string }) {
  // Products for pricing flow
  const baseProducts: Record<string, Product[]> = {
    nyaltxpro: [
      { id: 1, name: 'NyaltxPro Membership', desc: 'Project profile + socials + video', priceUsd: 200, image: '/logo.png', qty: 1 },
    ],
    nyaltxpro1: [
      { id: 1, name: 'NyaltxPro Starter', desc: 'Starter access to Pro features', priceUsd: 1, image: '/logo.png', qty: 1 },
    ],
    paddle: [
      { id: 1, name: 'Race to Liberty — Paddle Boat', desc: '1 week on Recently Updated', priceUsd: 300, image: '/banner/1.png', qty: 1 },
    ],
    motor: [
      { id: 1, name: 'Race to Liberty — Motor Boat', desc: '1 month placement', priceUsd: 500, image: '/banner/2.png', qty: 1 },
    ],
    helicopter: [
      { id: 1, name: 'Race to Liberty — Helicopter', desc: '3 months placement', priceUsd: 700, image: '/banner/3.png', qty: 1 },
    ],
    default: [
      { id: 1, name: 'NyaltxPro Membership', desc: 'Project profile + socials + video', priceUsd: 200, image: '/logo.png', qty: 1 },
    ],
  };

  const products: Product[] = useMemo(() => {
    const key = (selectedTier || 'default').toLowerCase();
    return baseProducts[key] || baseProducts.default;
  }, [selectedTier]);

  const tokens = [
    { symbol: 'USDC', name: 'USD Coin', chain: 'ethereum' },
    { symbol: 'USDT', name: 'Tether USD', chain: 'ethereum' },
    { symbol: 'ETH', name: 'Ethereum', chain: 'ethereum' },
    { symbol: 'MATIC', name: 'Polygon', chain: 'polygon' },
    { symbol: 'ARB', name: 'Arbitrum', chain: 'arbitrum' },
    { symbol: 'SOL', name: 'Solana', chain: 'solana' },
  ];

  const networks = [
    { id: 'ethereum', label: 'Ethereum' },
    { id: 'arbitrum', label: 'Arbitrum' },
    { id: 'optimism', label: 'Optimism' },
    { id: 'base', label: 'Base' },
    { id: 'polygon', label: 'Polygon' },
    { id: 'solana', label: 'Solana' },
  ];

  const [network, setNetwork] = useState('ethereum');
  const [token, setToken] = useState(paymentMethod?.toUpperCase() || 'USDT');
  const [email, setEmail] = useState('');
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoValidation, setPromoValidation] = useState<any>(null);
  const [agree, setAgree] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Wagmi hooks
  const { isConnected, address, chain } = useAccount();
  const { open } = useAppKit();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  // Mainnet Ethereum configuration
  const MAINNET_CHAIN_ID = 1;
  const RECEIVER_ADDRESS = '0x81bA7b98E49014Bff22F811E9405640bC2B39cC0' as `0x${string}`;
  const USDT_MAINNET = '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`; // Official USDT on Ethereum mainnet

  const filteredTokens = useMemo(() => tokens.filter(t => {
    if (network === 'solana') return t.chain === 'solana';
    if (network === 'polygon') return t.chain === 'polygon' || t.symbol === 'USDC' || t.symbol === 'USDT';
    return t.chain === 'ethereum' || ['arbitrum','optimism','base'].includes(network);
  }), [network]);

  const subtotal = useMemo(() => products.reduce((s, p) => s + p.priceUsd * p.qty, 0), [products]);
  const discount = useMemo(() => {
    if (promoValidation?.valid && promoValidation?.discount) {
      return subtotal * (promoValidation.discount / 100);
    }
    return 0;
  }, [promoValidation, subtotal]);
  const fees = useMemo(() => promoValidation?.isFree ? 0 : Math.max(0.3, subtotal * 0.015), [subtotal, promoValidation]);
  const total = useMemo(() => Math.max(0, subtotal - discount) + fees, [subtotal, discount, fees]);

  // Auto-open wallet and initiate payment when component loads with specific conditions
  useEffect(() => {
    if (paymentMethod === 'usdt' && selectedTier === 'nyaltxpro') {
      // Auto-trigger wallet connection and payment flow only if no promo code is being used
      setTimeout(() => {
        if (!promo.trim()) {
          handlePayment();
        }
      }, 1000);
    }
  }, [paymentMethod, selectedTier, promo]);

  const validatePromoCode = async () => {
    if (!promo.trim()) {
      setPromoValidation(null);
      setPromoApplied(false);
      return;
    }

    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCode: promo.trim(), tier: selectedTier || 'nyaltxpro' })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setPromoValidation(result);
      setPromoApplied(result.valid);
      
      if (!result.valid) {
        setError(result.message || 'Invalid promo code');
      } else {
        setError(null);
      }
    } catch (err: any) {
      console.error('Promo validation error:', err);
      setError(`Failed to validate promo code: ${err.message}`);
      setPromoValidation(null);
      setPromoApplied(false);
    }
  };

  const handleFreeSubscription = async () => {
    if (!promoValidation?.isFree) return;

    setProcessing(true);
    setError(null);

    try {
      // Connect wallet first if not connected
      if (!isConnected) {
        await open({ view: 'Connect' });
        setProcessing(false);
        return;
      }

      // Wait a moment for address to be available after connection
      if (!address) {
        setError('Wallet connected but address not available. Please try again.');
        setProcessing(false);
        return;
      }

      const response = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promoCode: promo.trim(),
          tier: selectedTier || 'nyaltxpro',
          email: email.trim() || undefined,
          walletAddress: address
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess(`${result.message} (Wallet: ${address})`);
        // Set cookie for pro status if nyaltxpro or nyaltxpro1
        const tierKey = (selectedTier || 'nyaltxpro').toLowerCase();
        if (tierKey.startsWith('nyaltxpro')) {
          document.cookie = "nyaltx_pro=1; path=/; max-age=31536000"; // 1 year
          
          // Redirect to register token page after successful free activation
          setTimeout(() => {
            window.location.href = '/dashboard/register-token?payment=free';
          }, 2000);
        }
      } else {
        setError(result.message || 'Failed to activate subscription');
      }
    } catch (err: any) {
      console.error('Free subscription error:', err);
      setError(`Failed to activate free subscription: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!agree) {
      setError('Please accept Terms to continue.');
      return;
    }

    setError(null);
    setSuccess(null);
    setProcessing(true);

    try {
      // Connect wallet if not connected
      if (!isConnected) {
        await open({ view: 'Connect' });
        return;
      }

      // Switch to Ethereum mainnet if not already on it
      if (chain?.id !== MAINNET_CHAIN_ID) {
        try {
          await switchChainAsync({ chainId: MAINNET_CHAIN_ID });
        } catch (switchError: any) {
          throw new Error(`Failed to switch to Ethereum mainnet: ${switchError?.message || 'Please add Ethereum mainnet to your wallet'}`);
        }
      }

      let txHash: string;

      if (token === 'ETH') {
        // Send 0.1 ETH as requested
        const ethAmount = '0.1';
        txHash = await sendTransactionAsync({
          to: RECEIVER_ADDRESS,
          value: parseEther(ethAmount)
        });
      } else if (token === 'USDT') {
        // Send USDT equivalent (assuming $199 worth)
        const usdtAmount = total.toString();
        txHash = await writeContractAsync({
          abi: erc20Abi,
          address: USDT_MAINNET,
          functionName: 'transfer',
          args: [RECEIVER_ADDRESS, parseUnits(usdtAmount, 6)]
        });
      } else {
        throw new Error('Unsupported payment method');
      }

      // Place order in admin panel
      await placeOrder(txHash);
      
      // Set pro status cookie for nyaltxpro or nyaltxpro1 purchases
      const tierKey = (selectedTier || 'nyaltxpro').toLowerCase();
      if (tierKey.startsWith('nyaltxpro')) {
        document.cookie = "nyaltx_pro=1; path=/; max-age=31536000"; // 1 year
        
        // Redirect to register token page after successful payment
        setTimeout(() => {
          window.location.href = '/dashboard/register-token?payment=success';
        }, 2000);
      }
      
      setSuccess(`Payment successful! Transaction: ${txHash}. Redirecting to register token...`);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err?.shortMessage || err?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const placeOrder = async (txHash: string) => {
    try {
      const orderData = {
        method: token as 'ETH' | 'NYAX',
        tierId: selectedTier as 'paddle' | 'motor' | 'helicopter',
        wallet: address,
        txHash,
        amount: token === 'ETH' ? '0.1' : total.toString(),
        chainId: MAINNET_CHAIN_ID
      };

      const response = await fetch('/api/admin/orders/onchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to place order in admin panel');
      }

      console.log('Order placed successfully in admin panel');
    } catch (err) {
      console.error('Failed to place order:', err);
      // Don't throw here as the payment was successful
    }
  };

  const handlePayPalSuccess = (details: any) => {
    setSuccess(`Payment successful! Transaction ID: ${details?.id}. Redirecting...`);
    setError(null);
  };

  const handlePayPalError = (error: any) => {
    setError(error?.message || 'PayPal payment failed');
    setSuccess(null);
  };

  const handlePay = handlePayment;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Payment form */}
      <div className="lg:col-span-2">
        <div className="bg-[#0f1923] rounded-xl p-6 border border-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Payment</h2>
              {selectedTier && (
                <p className="text-gray-400 text-sm mt-1">Selected plan: <span className="text-white font-medium">{selectedTier}</span></p>
              )}
              {paymentMethod === 'usdt' && selectedTier === 'nyaltxpro' && (
                <p className="text-cyan-400 text-sm mt-1">Auto-payment mode: 0.1 ETH on Ethereum mainnet</p>
              )}
            </div>
            <ConnectWalletButton />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-md border border-red-500 bg-red-900/30 text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-md border border-green-500 bg-green-900/30 text-green-200">
              {success}
            </div>
          )}
          
          {/* Wallet Connection Status */}
          {promoValidation?.isFree && !isConnected && (
            <div className="mb-4 p-3 rounded-md border border-yellow-500 bg-yellow-900/30 text-yellow-200">
              <div className="flex items-center gap-2">
                <FaWallet />
                <span>Please connect your wallet to activate the free subscription with promo code.</span>
              </div>
            </div>
          )}

          {/* Customer */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="FREEPRO, ADMIN2024, NYAX10"
                    className="flex-1 px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                  />
                  <button 
                    onClick={validatePromoCode}
                    disabled={processing}
                    className="px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-gray-300 hover:text-white disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {promoValidation?.valid && (
                  <p className="text-xs text-green-400 mt-1">
                    ✓ {promoValidation.description} ({promoValidation.discount}% off)
                  </p>
                )}
                {!promoValidation?.valid && promo && promoApplied === false && (
                  <p className="text-xs text-red-400 mt-1">Invalid promo code</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Try: FREEPRO (free), ADMIN2024 (free), NYAX10 (10% off)</p>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          {paymentMethod === 'paypal' ? (
            <div className="mb-6">
              <div className="p-4 rounded-lg bg-blue-900/30 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a9.124 9.124 0 0 1-.077.437c-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287z"/>
                  </svg>
                  <h3 className="text-lg font-semibold text-blue-400">PayPal Payment</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">Complete your payment securely with PayPal.</p>
                
                {agree && !promoValidation?.isFree && (
                  <PayPalCheckout
                    amount={total.toFixed(2)}
                    tier={selectedTier || 'nyaltxpro'}
                    email={email.trim() || undefined}
                    onSuccess={handlePayPalSuccess}
                    onError={handlePayPalError}
                  />
                )}
                
                {!agree && (
                  <div className="text-yellow-400 text-sm">
                    Please accept the Terms of Service to continue with PayPal payment.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Network</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                  >
                    {networks.map(n => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Pay With</label>
                  <select
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                  >
                    {filteredTokens.map(t => (
                      <option key={t.symbol} value={t.symbol}>{t.symbol} • {t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
                <FaWallet />
                <span>Pay directly from your connected wallet</span>
              </div>
            </div>
          )}

          {/* Terms */}
          <div className="mb-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" className="accent-[#00b8d8]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              I agree to the Terms of Service and Refund Policy
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FaShieldAlt />
              <span>Secure checkout — your payment is protected</span>
            </div>
            {promoValidation?.isFree ? (
              <button
                onClick={handleFreeSubscription}
                disabled={processing}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${processing ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-500'} text-white`}
              >
                {processing ? 'Activating…' : isConnected ? 'Activate Free Subscription' : 'Connect Wallet & Activate'}
              </button>
            ) : paymentMethod === 'paypal' ? (
              <div className="text-center text-sm text-gray-400">
                PayPal payment button is displayed above
              </div>
            ) : (
              <button
                onClick={handlePayment}
                disabled={processing}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${processing ? 'bg-gray-600' : 'bg-[#00b8d8] hover:bg-[#00a6c4]'} text-white`}
              >
                {processing ? 'Processing…' : `Pay $${total.toFixed(2)}`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: Summary */}
      <div className="lg:col-span-1">
        <div className="bg-[#0f1923] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {products.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-[#1a2932]">
                    <Image src={p.image} alt={p.name} width={40} height={40} />
                  </div>
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.desc}</div>
                  </div>
                </div>
                <div className="text-sm">${p.priceUsd.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount ({promoValidation?.description})</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-300"><span>Fees</span><span>${fees.toFixed(2)}</span></div>
            <div className="flex justify-between text-white font-semibold text-base pt-2">
              <span>Total</span>
              <span className={promoValidation?.isFree ? 'text-green-400' : ''}>
                {promoValidation?.isFree ? 'FREE' : `$${total.toFixed(2)}`}
              </span>
            </div>
            {promoValidation?.isFree && (
              <div className="text-xs text-green-400 text-center pt-2">
                🎉 Free subscription with promo code: {promo.toUpperCase()}
              </div>
            )}
          </div>

          <div className="mt-4 p-3 rounded-md bg-[#102530] border border-gray-800 text-gray-300 text-xs">
            <div className="flex items-center gap-2 mb-1"><FaInfoCircle className="text-gray-400" /><span>Network fees vary by chain and are paid separately in the network's native token.</span></div>
            <div className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /><span>No custody — funds go directly from your wallet.</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
