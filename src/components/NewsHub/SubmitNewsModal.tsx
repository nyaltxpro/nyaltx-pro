'use client';

import React, { useState, useEffect, useRef } from 'react';
import PayPalCheckout from '@/components/PayPalCheckout';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { useAccount, useSendTransaction, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseEther } from 'viem';

export interface SubmitNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'news' | 'pr';
  initialPlan?: string;
  onSuccess?: (item: any) => void;
}

const GRADS = [
  "linear-gradient(135deg,#0e7490,#06b6d4)",
  "linear-gradient(135deg,#4c1d95,#8b5cf6)",
  "linear-gradient(135deg,#9a3412,#f59e0b)",
  "linear-gradient(135deg,#14532d,#22c55e)",
  "linear-gradient(135deg,#1e293b,#475569)"
];

const PLANS_CONFIG = {
  news: [
    { id: "feed", name: "Feed listing", desc: "RSS feed + news page · 7 days", price: 29 },
    { id: "slider", name: "Featured slider", desc: "Top banner slider + feed + RSS · 7 days", price: 99 },
    { id: "prem", name: "Premium spotlight", desc: "Pinned slide, newsletter mention · 30 days", price: 249 }
  ],
  pr: [
    { id: "feed", name: "Direct distribution", desc: "News Hub, RSS feed, newsletter and social · unlimited words", price: 199 },
    { id: "slider", name: "Full service", desc: "Editorial review + banner slot 7 days + Google News / partner network", price: 499 }
  ]
};

const RECEIVER_ADDRESS = (process.env.NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS as string) || '0x81bA7b98E49014Bff22F811E9405640bC2B39cC0';
const SOLANA_RECEIVER = (process.env.NEXT_PUBLIC_SOLANA_RECEIVER_ADDRESS as string) || 'GjTfUFXFvL1wKkHQH48Q5hN9aUjR9tZ2oP6mX7y3sW';

export default function SubmitNewsModal({
  isOpen,
  onClose,
  initialType = 'news',
  initialPlan = 'feed',
  onSuccess
}: SubmitNewsModalProps) {
  const [modalStep, setModalStep] = useState(1);
  const [subType, setSubType] = useState<'news' | 'pr'>(initialType);
  const [plan, setPlan] = useState(initialPlan);
  const [payMethod, setPayMethod] = useState<'paypal' | 'eth' | 'sol' | 'nyax'>('paypal');
  const [selectedSwatch, setSelectedSwatch] = useState(0);
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);

  // Form inputs
  const [headline, setHeadline] = useState("");
  const [category, setCategory] = useState("NYAX");
  const [sourceLink, setSourceLink] = useState("");
  const [summary, setSummary] = useState("");
  const [storyBody, setStoryBody] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [imgError, setImgError] = useState("");
  const [cryptoTxHash, setCryptoTxHash] = useState("");
  const [ethPrice, setEthPrice] = useState(3200);
  const [solPrice, setSolPrice] = useState(180);
  const [copiedReceiver, setCopiedReceiver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Web3 hooks
  const { address: walletAddress, isConnected, chain } = useAccount();
  const { open: openAppKit } = useAppKit();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const [walletPaying, setWalletPaying] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSubType(initialType);
      setPlan(initialPlan);
      setModalStep(1);
      setFormError("");
      setImgError("");
    }
  }, [isOpen, initialType, initialPlan]);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana&vs_currencies=usd')
      .then(r => r.json())
      .then(d => {
        if (d?.ethereum?.usd) setEthPrice(d.ethereum.usd);
        if (d?.solana?.usd) setSolPrice(d.solana.usd);
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  // Price calculations
  const currentPlans = PLANS_CONFIG[subType];
  const activePlanObj = currentPlans.find(p => p.id === plan) || currentPlans[0];
  const basePrice = activePlanObj.price;
  const finalPrice = payMethod === 'nyax' ? (basePrice * 0.9) : basePrice;

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2097152) {
      setImgError("File is over 2 MB. Please compress it.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 1200 || img.height < 450) {
          setImgError(`Image is ${img.width}×${img.height}. Minimum recommended is 1200×450 px.`);
        } else {
          setImgError("");
        }
        setUploadedImg(reader.result as string);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const execFmt = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setStoryBody(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const handleLinkPrompt = () => {
    const url = prompt("Enter Link URL (https://...):");
    if (url) execFmt('createLink', url);
  };

  const validateStep1 = () => {
    const titleOk = headline.trim().length >= 8;
    const summaryOk = summary.trim().length >= 10;
    const bodyContent = editorRef.current ? editorRef.current.textContent?.trim() || "" : storyBody.trim();
    const bodyOk = bodyContent.length >= 30;

    if (!titleOk || !summaryOk || !bodyOk) {
      setFormError("Please add a headline (8+ chars), a short summary (10+ chars), and at least a few sentences of story (30+ chars).");
      return;
    }
    setFormError("");
    setModalStep(2);
  };

  const handlePayAndSubmit = async (paymentOverride?: {
    paymentMethod?: 'paypal' | 'eth' | 'sol' | 'nyax';
    paymentId?: string;
    txHash?: string;
    walletAddress?: string;
    paymentStatus?: string;
    amount?: number;
  }) => {
    setIsSubmitting(true);
    setFormError("");

    if (!userEmail.trim() || !userEmail.includes('@')) {
      setFormError("Please enter a valid contact email address.");
      setIsSubmitting(false);
      return;
    }

    const currentPayMethod = paymentOverride?.paymentMethod || payMethod;
    if ((currentPayMethod === 'eth' || currentPayMethod === 'sol' || currentPayMethod === 'nyax') && !paymentOverride?.txHash && !cryptoTxHash.trim()) {
      setFormError("Please enter the transaction hash / signature after sending your payment.");
      setIsSubmitting(false);
      return;
    }

    const bodyHtml = editorRef.current ? editorRef.current.innerHTML : storyBody;
    const chosenAmount = paymentOverride?.amount ?? finalPrice;

    const submissionPayload = {
      title: headline.trim(),
      type: subType,
      category,
      summary: summary.trim(),
      content: bodyHtml,
      sourceUrl: sourceLink.trim() || null,
      featuredImage: uploadedImg,
      coverColor: selectedSwatch,
      author: subType === 'pr' ? 'Press Release' : 'You',
      email: userEmail.trim(),
      plan,
      planName: activePlanObj.name,
      paymentMethod: currentPayMethod,
      amount: chosenAmount,
      txHash: paymentOverride?.txHash || (cryptoTxHash.trim() || null),
      paymentId: paymentOverride?.paymentId || null,
      walletAddress: paymentOverride?.walletAddress || null,
      paymentStatus: paymentOverride?.paymentStatus || 'completed'
    };

    try {
      const response = await fetch('/api/news/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Submission failed');
      }

      const newLocalItem = {
        t: headline.trim(),
        s: subType === 'pr' ? "Press release · You" : "You · just now",
        c: category,
        tm: "Just now",
        d: summary.trim(),
        g: selectedSwatch,
        img: uploadedImg,
        pend: true,
        com: subType !== 'pr',
        pr: subType === 'pr'
      };

      try {
        const stored = localStorage.getItem('nyaltx_news_submissions');
        const existing = stored ? JSON.parse(stored) : [];
        localStorage.setItem('nyaltx_news_submissions', JSON.stringify([newLocalItem, ...existing]));
      } catch {}

      onSuccess?.(newLocalItem);
      setModalStep(4);
    } catch (err: any) {
      setFormError(err.message || 'Error submitting story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletPay = async () => {
    if (!userEmail.trim() || !userEmail.includes('@')) {
      setFormError("Please enter your contact email address above first.");
      return;
    }

    if (!isConnected) {
      if (openAppKit) {
        openAppKit({ view: 'Connect' });
      }
      return;
    }

    setWalletPaying(true);
    setFormError("");

    try {
      const MAINNET_CHAIN_ID = 1;
      if (chain?.id !== MAINNET_CHAIN_ID && switchChainAsync) {
        try {
          await switchChainAsync({ chainId: MAINNET_CHAIN_ID });
        } catch (swErr) {
          console.warn("Chain switch bypassed or error:", swErr);
        }
      }

      let calculatedEth = finalPrice / (ethPrice || 3200);
      if (calculatedEth < 0.0001) calculatedEth = 0.0001;

      const txHash = await sendTransactionAsync({
        to: RECEIVER_ADDRESS as `0x${string}`,
        value: parseEther(calculatedEth.toFixed(8)),
      });

      if (!txHash) {
        throw new Error("Transaction was rejected or failed to broadcast.");
      }

      await handlePayAndSubmit({
        paymentMethod: 'eth',
        txHash,
        walletAddress: walletAddress || undefined,
        amount: finalPrice,
        paymentStatus: 'completed'
      });
    } catch (err: any) {
      console.error("Wallet payment failed:", err);
      setFormError(err?.shortMessage || err?.message || "Wallet transaction failed. You can also send manually and paste the tx hash below.");
    } finally {
      setWalletPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#0f1623] border border-gray-800 rounded-2xl w-full max-w-2xl p-6 my-8 text-white shadow-2xl relative">
        <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📰</span>
            <h3 className="text-xl font-bold">
              {subType === 'pr' ? 'Submit Press Release' : 'Submit News Story'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Stepper Header */}
        <div className="grid grid-cols-4 gap-2 mb-6 text-xs font-semibold text-center">
          <div className={`p-2 rounded-lg ${modalStep >= 1 ? 'bg-cyan-500 text-black font-bold' : 'bg-gray-800 text-gray-400'}`}>
            1 · Write
          </div>
          <div className={`p-2 rounded-lg ${modalStep >= 2 ? 'bg-cyan-500 text-black font-bold' : 'bg-gray-800 text-gray-400'}`}>
            2 · Package
          </div>
          <div className={`p-2 rounded-lg ${modalStep >= 3 ? 'bg-cyan-500 text-black font-bold' : 'bg-gray-800 text-gray-400'}`}>
            3 · Pay
          </div>
          <div className={`p-2 rounded-lg ${modalStep >= 4 ? 'bg-cyan-500 text-black font-bold' : 'bg-gray-800 text-gray-400'}`}>
            4 · Done
          </div>
        </div>

        {/* Step 1: Write */}
        {modalStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">What are you submitting?</label>
              <select
                value={subType}
                onChange={(e) => {
                  const t = e.target.value as 'news' | 'pr';
                  setSubType(t);
                  setPlan('feed');
                }}
                className="w-full bg-[#070b12] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="news">News story (from $29)</option>
                <option value="pr">Press release (from $199)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Headline *</label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={110}
                placeholder="e.g. NYAX launches staking rewards v2"
                className="w-full bg-[#070b12] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#070b12] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option>NYAX</option>
                  <option>Bitcoin</option>
                  <option>Ethereum</option>
                  <option>DeFi</option>
                  <option>Tokenized Stocks</option>
                  <option>Community</option>
                  <option>Press Releases</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Source link (optional)</label>
                <input
                  value={sourceLink}
                  onChange={(e) => setSourceLink(e.target.value)}
                  placeholder="https://original-link.com"
                  className="w-full bg-[#070b12] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Short summary (shown in feed) *</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                maxLength={180}
                placeholder="One or two sentences shown in the newsfeed..."
                className="w-full bg-[#070b12] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Story Content *</label>
              <div className="flex gap-1.5 mb-1 bg-[#070b12] p-1.5 rounded-t-lg border border-b-0 border-gray-700">
                <button type="button" onClick={() => execFmt('bold')} className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold">B</button>
                <button type="button" onClick={() => execFmt('italic')} className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-xs italic">I</button>
                <button type="button" onClick={() => execFmt('insertUnorderedList')} className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-xs">• List</button>
                <button type="button" onClick={handleLinkPrompt} className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-xs">Link</button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setStoryBody(e.currentTarget.innerHTML)}
                placeholder="Write your full story here..."
                className="w-full bg-[#070b12] border border-gray-700 rounded-b-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 min-h-[140px] max-h-[220px] overflow-y-auto"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Cover image (optional)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImgChange}
                className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-800 file:text-white hover:file:bg-gray-700"
              />
              {imgError && <p className="text-xs text-red-400 mt-1">{imgError}</p>}
            </div>

            {formError && <p className="text-xs text-red-400 font-semibold">{formError}</p>}

            <div className="flex justify-between items-center pt-3 border-t border-gray-800">
              <span className="text-xs text-gray-400">Stories are reviewed before going live.</span>
              <button
                type="button"
                onClick={validateStep1}
                className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black font-bold rounded-lg text-sm shadow-md transition-all"
              >
                Continue to Package →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Package */}
        {modalStep === 2 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Select your visibility package</h4>

            <div className="space-y-3">
              {currentPlans.map(p => (
                <div
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                    plan === p.id
                      ? 'border-cyan-400 bg-cyan-950/20 shadow-md'
                      : 'border-gray-800 hover:border-gray-700 bg-gray-900/40'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white text-base flex items-center gap-2">
                      {p.name}
                      {p.id === 'slider' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                          ★ RECOMMENDED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{p.desc}</div>
                  </div>
                  <div className="text-xl font-extrabold text-cyan-400">
                    ${p.price}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setModalStep(1)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setModalStep(3)}
                className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black font-bold rounded-lg text-sm shadow-md transition-all"
              >
                Continue to Payment →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pay (Exact same PayPal & Connect Wallet as pricing checkout) */}
        {modalStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Your Contact Email (for editorial updates & live notification) *
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                className="w-full bg-[#070b12] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Payment Method Tabs */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Select Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMethod('paypal')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                    payMethod === 'paypal'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-md'
                      : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  🅿️ PayPal & Cards
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('eth')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                    payMethod === 'eth'
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-md'
                      : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  ⟠ Connect Wallet (ETH)
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('sol')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                    payMethod === 'sol'
                      ? 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-md'
                      : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  ◎ Solana (SOL)
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('nyax')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                    payMethod === 'nyax'
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-md'
                      : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  ⚡ NYAX (10% off)
                </button>
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold text-white">{activePlanObj.name}</span>
                {payMethod === 'nyax' && <span className="block text-xs text-amber-400">10% NYAX Discount applied</span>}
              </div>
              <span className="text-2xl font-extrabold text-cyan-400">
                ${finalPrice.toFixed(2)} USD
              </span>
            </div>

            {/* 1. Full PayPal option used on pricing checkout */}
            {payMethod === 'paypal' && (
              <div className="p-4 bg-white/5 border border-blue-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                    <span className="text-lg">💳</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-400">PayPal & Card Payment</h4>
                    <p className="text-xs text-gray-400">Complete payment securely with PayPal or Credit/Debit Card</p>
                  </div>
                </div>

                {!userEmail.trim() || !userEmail.includes('@') ? (
                  <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    ⚠️ Please enter a valid contact email above to activate PayPal checkout buttons.
                  </p>
                ) : (
                  <div className="pt-2">
                    <PayPalCheckout
                      amount={finalPrice.toFixed(2)}
                      tier={`${subType}_${plan}`}
                      email={userEmail.trim()}
                      onSuccess={(details: any) => {
                        handlePayAndSubmit({
                          paymentMethod: 'paypal',
                          paymentId: details.id,
                          amount: finalPrice,
                          paymentStatus: 'completed'
                        });
                      }}
                      onError={(err: any) => {
                        setFormError(err?.message || 'PayPal payment cancelled or failed.');
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 2. Connect Wallet & Pay method used on pricing checkout */}
            {payMethod === 'eth' && (
              <div className="p-4 bg-gray-900/80 border border-cyan-500/30 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-cyan-300">Connect Wallet & Pay</h4>
                    <p className="text-xs text-gray-400">Pay directly on Ethereum Mainnet</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-gray-800 px-2 py-1 rounded">
                    ~{(finalPrice / (ethPrice || 3200)).toFixed(4)} ETH
                  </span>
                </div>

                {!isConnected ? (
                  <div className="text-center py-4 bg-black/40 rounded-lg border border-gray-800 space-y-2">
                    <p className="text-xs text-gray-400">Connect your Web3 wallet (MetaMask, Coinbase, WalletConnect) to pay:</p>
                    <div className="flex justify-center">
                      <ConnectWalletButton />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-lg text-xs">
                      <span className="text-gray-400">Connected Wallet:</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        ● {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connected'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleWalletPay}
                      disabled={walletPaying}
                      className="w-full py-3 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black font-extrabold rounded-lg text-sm shadow-lg transition-all"
                    >
                      {walletPaying ? 'Sending On-Chain Payment...' : `⚡ Pay $${finalPrice.toFixed(2)} with Connected Wallet`}
                    </button>
                  </div>
                )}

                {/* Manual Transfer Option */}
                <details className="text-xs text-gray-400 pt-1">
                  <summary className="cursor-pointer font-semibold text-gray-400 hover:text-white">
                    Or send manually to Treasury address & paste TXID ▾
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-black/60 rounded border border-gray-800 text-[11px] truncate">
                        {RECEIVER_ADDRESS}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(RECEIVER_ADDRESS);
                          setCopiedReceiver(true);
                          setTimeout(() => setCopiedReceiver(false), 2000);
                        }}
                        className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs rounded text-white"
                      >
                        {copiedReceiver ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <input
                      placeholder="0x... (paste your transaction hash here)"
                      value={cryptoTxHash}
                      onChange={(e) => setCryptoTxHash(e.target.value)}
                      className="w-full bg-[#070b12] border border-gray-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                </details>
              </div>
            )}

            {/* 3. Solana option */}
            {payMethod === 'sol' && (
              <div className="p-4 bg-gray-900/80 border border-purple-500/30 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-purple-300">Solana Payment</span>
                  <span className="font-mono text-white">~{(finalPrice / (solPrice || 180)).toFixed(3)} SOL</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-black/60 rounded border border-gray-800 text-[11px] truncate">
                    {SOLANA_RECEIVER}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(SOLANA_RECEIVER);
                      setCopiedReceiver(true);
                      setTimeout(() => setCopiedReceiver(false), 2000);
                    }}
                    className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-white"
                  >
                    {copiedReceiver ? '✓' : 'Copy'}
                  </button>
                </div>
                <input
                  placeholder="Enter Solana transaction signature..."
                  value={cryptoTxHash}
                  onChange={(e) => setCryptoTxHash(e.target.value)}
                  className="w-full bg-[#070b12] border border-gray-700 rounded p-2 text-white"
                />
              </div>
            )}

            {/* 4. NYAX Token option */}
            {payMethod === 'nyax' && (
              <div className="p-4 bg-gray-900/80 border border-amber-500/30 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-300">NYAX Token (10% Discount)</span>
                  <span className="font-mono text-white">${(finalPrice * 0.9).toFixed(2)} USD in NYAX</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-black/60 rounded border border-gray-800 text-[11px] truncate">
                    {RECEIVER_ADDRESS}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(RECEIVER_ADDRESS);
                      setCopiedReceiver(true);
                      setTimeout(() => setCopiedReceiver(false), 2000);
                    }}
                    className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-white"
                  >
                    {copiedReceiver ? '✓' : 'Copy'}
                  </button>
                </div>
                <input
                  placeholder="0x... (paste your transaction hash here)"
                  value={cryptoTxHash}
                  onChange={(e) => setCryptoTxHash(e.target.value)}
                  className="w-full bg-[#070b12] border border-gray-700 rounded p-2 text-white"
                />
              </div>
            )}

            {formError && <p className="text-xs text-red-400 font-semibold">{formError}</p>}

            <div className="flex justify-between items-center pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setModalStep(2)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium"
              >
                ← Back
              </button>
              {payMethod !== 'paypal' && (
                <button
                  type="button"
                  onClick={() => handlePayAndSubmit()}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-sm transition-all"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Story with Manual TX'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {modalStep === 4 && (
          <div className="text-center py-8 space-y-4">
            <div className="text-5xl">✅</div>
            <h3 className="text-2xl font-bold text-white">Story submitted for moderation!</h3>
            <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
              Thank you! Your submission is now in our moderation queue and marked as <b>“Pending review”</b>.
              Our editors verify the payment and accuracy, and you will receive an email as soon as it goes live!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-bold rounded-lg text-sm shadow-md transition-all hover:scale-105"
            >
              Back to News Hub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
