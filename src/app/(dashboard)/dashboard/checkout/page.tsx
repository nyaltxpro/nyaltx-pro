'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { FaWallet, FaShieldAlt, FaCheckCircle, FaChevronDown, FaInfoCircle } from 'react-icons/fa';

const products = [
  { id: 1, name: 'Pro Plan', desc: 'Advanced analytics and alerts', priceUsd: 19.99, image: '/logo.png', qty: 1 },
  { id: 2, name: 'Premium Support', desc: '24/7 concierge support', priceUsd: 9.99, image: '/logo.png', qty: 1 },
];

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

export default function CheckoutPage() {
  const [network, setNetwork] = useState('ethereum');
  const [token, setToken] = useState('USDC');
  const [email, setEmail] = useState('');
  const [promo, setPromo] = useState('');
  const [agree, setAgree] = useState(true);
  const [processing, setProcessing] = useState(false);

  const filteredTokens = useMemo(() => tokens.filter(t => {
    if (network === 'solana') return t.chain === 'solana';
    if (network === 'polygon') return t.chain === 'polygon' || t.symbol === 'USDC' || t.symbol === 'USDT';
    return t.chain === 'ethereum' || ['arbitrum','optimism','base'].includes(network);
  }), [network]);

  const subtotal = useMemo(() => products.reduce((s, p) => s + p.priceUsd * p.qty, 0), []);
  const discount = useMemo(() => promo.trim().toUpperCase() === 'NYAX10' ? subtotal * 0.1 : 0, [promo, subtotal]);
  const fees = useMemo(() => Math.max(0.3, subtotal * 0.015), [subtotal]);
  const total = useMemo(() => Math.max(0, subtotal - discount) + fees, [subtotal, discount, fees]);

  const handlePay = async () => {
    if (!agree) return alert('Please accept Terms to continue.');
    setProcessing(true);
    // TODO: Integrate on-chain or payment API
    setTimeout(() => {
      setProcessing(false);
      alert(`Payment initiated: ${token} on ${network} for $${total.toFixed(2)}`);
    }, 1200);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Checkout</h1>
        <ConnectWalletButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Payment form */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f1923] rounded-xl p-6 border border-gray-800">
            {/* Customer */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-[#00b8d8] text-white flex items-center justify-center text-xs mr-2">1</div>
                <h2 className="text-lg font-semibold">Customer</h2>
              </div>
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
                      placeholder="NYAX10"
                      className="flex-1 px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#00b8d8]"
                    />
                    <button className="px-3 py-2 bg-[#1a2932] border border-gray-700 rounded-md text-gray-300 hover:text-white">Apply</button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Use NYAX10 to get 10% off</p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-[#00b8d8] text-white flex items-center justify-center text-xs mr-2">2</div>
                <h2 className="text-lg font-semibold">Payment</h2>
              </div>
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
              <button
                onClick={handlePay}
                disabled={processing}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${processing ? 'bg-gray-600' : 'bg-[#00b8d8] hover:bg-[#00a6c4]'} text-white`}
              >
                {processing ? 'Processing…' : `Pay $${total.toFixed(2)}`}
              </button>
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
              <div className="flex justify-between text-gray-300"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-300"><span>Fees</span><span>${fees.toFixed(2)}</span></div>
              <div className="flex justify-between text-white font-semibold text-base pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>

            <div className="mt-4 p-3 rounded-md bg-[#102530] border border-gray-800 text-gray-300 text-xs">
              <div className="flex items-center gap-2 mb-1"><FaInfoCircle className="text-gray-400" /><span>Network fees vary by chain and are paid separately in the network's native token.</span></div>
              <div className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /><span>No custody — funds go directly from your wallet.</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
