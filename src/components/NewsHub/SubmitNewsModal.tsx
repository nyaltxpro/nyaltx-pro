'use client';

import ConnectWalletButton from '@/components/ConnectWalletButton';
import PayPalCheckout from '@/components/PayPalCheckout';
import { useAppKit } from '@reown/appkit/react';
import React, { useEffect, useRef, useState } from 'react';
import { FaNewspaper, FaSpinner, FaTimes, FaUpload } from 'react-icons/fa';
import { parseEther } from 'viem';
import { useAccount, useSendTransaction, useSwitchChain } from 'wagmi';

export interface SubmitNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'news' | 'pr';
  initialPlan?: string;
  onSuccess?: (item: any) => void;
}

/* ---------- Corporate News (admin) theme tokens ---------- */
const FONT = { fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' } as const;
const INPUT =
  'w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500/50';
const LABEL = 'block text-sm font-medium text-gray-300 mb-2';
const BTN_GHOST =
  'px-4 py-2 bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 rounded-lg transition-all duration-200 font-medium text-sm';
const BTN_PRIMARY =
  'px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium text-sm';
const PANEL = 'bg-gray-700/30 border border-gray-600/30 rounded-lg';

const GRADS = [
  'linear-gradient(135deg,#0e7490,#06b6d4)',
  'linear-gradient(135deg,#4c1d95,#8b5cf6)',
  'linear-gradient(135deg,#9a3412,#f59e0b)',
  'linear-gradient(135deg,#14532d,#22c55e)',
  'linear-gradient(135deg,#1e293b,#475569)'
];

const PLANS_CONFIG = {
  news: [
    { id: 'feed', name: 'Feed listing', desc: 'RSS feed + news page · 7 days', price: 29 },
    { id: 'slider', name: 'Featured slider', desc: 'Top banner slider + feed + RSS · 7 days', price: 99 },
    { id: 'prem', name: 'Premium spotlight', desc: 'Pinned slide, newsletter mention · 30 days', price: 249 }
  ],
  pr: [
    { id: 'feed', name: 'Direct distribution', desc: 'News Hub, RSS feed, newsletter and social · unlimited words', price: 199 },
    { id: 'slider', name: 'Full service', desc: 'Editorial review + banner slot 7 days + Google News / partner network', price: 499 }
  ]
};

const RECEIVER_ADDRESS = (process.env.NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS as string) || '0x81bA7b98E49014Bff22F811E9405640bC2B39cC0';
const SOLANA_RECEIVER = (process.env.NEXT_PUBLIC_SOLANA_RECEIVER_ADDRESS as string) || 'GjTfUFXFvL1wKkHQH48Q5hN9aUjR9tZ2oP6mX7y3sW';

const convertToWorkingIPFSUrl = (url: string) =>
  url.replace('https://gateway.pinata.cloud/ipfs/', 'https://ipfs.io/ipfs/');

export default function SubmitNewsModalCorporate({
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

  // Cover image (now an IPFS / external URL instead of base64)
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  const [imgError, setImgError] = useState('');
  const [imgSuccess, setImgSuccess] = useState('');

  // Form inputs
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState('NYAX');
  const [sourceLink, setSourceLink] = useState('');
  const [summary, setSummary] = useState('');
  const [storyBody, setStoryBody] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [cryptoTxHash, setCryptoTxHash] = useState('');
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSubType(initialType);
      setPlan(initialPlan);
      setModalStep(1);
      setFormError('');
      setImgError('');
      setImgSuccess('');
    }
  }, [isOpen, initialType, initialPlan]);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana&vs_currencies=usd')
      .then(r => r.json())
      .then(d => {
        if (d?.ethereum?.usd) setEthPrice(d.ethereum.usd);
        if (d?.solana?.usd) setSolPrice(d.solana.usd);
      })
      .catch(() => { });
  }, []);

  if (!isOpen) return null;

  // Price calculations
  const currentPlans = PLANS_CONFIG[subType];
  const activePlanObj = currentPlans.find(p => p.id === plan) || currentPlans[0];
  const basePrice = activePlanObj.price;
  const finalPrice = payMethod === 'nyax' ? basePrice * 0.9 : basePrice;

  /* ---------- IPFS image handling (same rules as admin) ---------- */
  const clearFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgSuccess('');

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImgError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      clearFileInput();
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImgError('File size must be less than 10MB');
      clearFileInput();
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width < 400 || img.height < 200) {
        setImgError(`Image dimensions must be at least 400x200 pixels. Current image is ${img.width}x${img.height} pixels.`);
        clearFileInput();
        return;
      }
      setSelectedFile(file);
      setImgError(
        img.width < 1200 || img.height < 450
          ? `Image is ${img.width}×${img.height}. Minimum recommended is 1200×450 px.`
          : ''
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setImgError('Failed to load image. Please select a valid image file.');
      clearFileInput();
    };
    img.src = objectUrl;
  };

  const uploadToIPFS = async () => {
    if (!selectedFile) {
      setImgError('Please select a file first');
      return;
    }
    setIsUploadingToIPFS(true);
    setImgError('');
    setImgSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload/ipfs', { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload to IPFS');
      }

      const data = await response.json();
      const ipfsUrl = data.url || `https://gateway.pinata.cloud/ipfs/${data.hash}`;
      setUploadedImg(ipfsUrl);
      setImgSuccess('Image uploaded to IPFS successfully!');
      setSelectedFile(null);
      clearFileInput();
    } catch (err: any) {
      setImgError(err.message || 'IPFS upload failed');
    } finally {
      setIsUploadingToIPFS(false);
    }
  };

  /* ---------- Editor ---------- */
  const execFmt = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setStoryBody(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const handleLinkPrompt = () => {
    const url = prompt('Enter Link URL (https://...):');
    if (url) execFmt('createLink', url);
  };

  const validateStep1 = () => {
    const titleOk = headline.trim().length >= 8;
    const summaryOk = summary.trim().length >= 10;
    const bodyContent = editorRef.current ? editorRef.current.textContent?.trim() || '' : storyBody.trim();
    const bodyOk = bodyContent.length >= 30;

    if (!titleOk || !summaryOk || !bodyOk) {
      setFormError('Please add a headline (8+ chars), a short summary (10+ chars), and at least a few sentences of story (30+ chars).');
      return;
    }
    if (isUploadingToIPFS) {
      setFormError('Please wait for the image upload to finish.');
      return;
    }
    setFormError('');
    setModalStep(2);
  };

  /* ---------- Submit ---------- */
  const handlePayAndSubmit = async (paymentOverride?: {
    paymentMethod?: 'paypal' | 'eth' | 'sol' | 'nyax';
    paymentId?: string;
    txHash?: string;
    walletAddress?: string;
    paymentStatus?: string;
    amount?: number;
  }) => {
    setIsSubmitting(true);
    setFormError('');

    if (!userEmail.trim() || !userEmail.includes('@')) {
      setFormError('Please enter a valid contact email address.');
      setIsSubmitting(false);
      return;
    }

    const currentPayMethod = paymentOverride?.paymentMethod || payMethod;
    if ((currentPayMethod === 'eth' || currentPayMethod === 'sol' || currentPayMethod === 'nyax') && !paymentOverride?.txHash && !cryptoTxHash.trim()) {
      setFormError('Please enter the transaction hash / signature after sending your payment.');
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
      if (!response.ok) throw new Error(resData.error || 'Submission failed');

      const newLocalItem = {
        t: headline.trim(),
        s: subType === 'pr' ? 'Press release · You' : 'You · just now',
        c: category,
        tm: 'Just now',
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
      } catch { }

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
      setFormError('Please enter your contact email address above first.');
      return;
    }

    if (!isConnected) {
      if (openAppKit) openAppKit({ view: 'Connect' });
      return;
    }

    setWalletPaying(true);
    setFormError('');

    try {
      const MAINNET_CHAIN_ID = 1;
      if (chain?.id !== MAINNET_CHAIN_ID && switchChainAsync) {
        try {
          await switchChainAsync({ chainId: MAINNET_CHAIN_ID });
        } catch (swErr) {
          console.warn('Chain switch bypassed or error:', swErr);
        }
      }

      let calculatedEth = finalPrice / (ethPrice || 3200);
      if (calculatedEth < 0.0001) calculatedEth = 0.0001;

      const txHash = await sendTransactionAsync({
        to: RECEIVER_ADDRESS as `0x${string}`,
        value: parseEther(calculatedEth.toFixed(8)),
      });

      if (!txHash) throw new Error('Transaction was rejected or failed to broadcast.');

      await handlePayAndSubmit({
        paymentMethod: 'eth',
        txHash,
        walletAddress: walletAddress || undefined,
        amount: finalPrice,
        paymentStatus: 'completed'
      });
    } catch (err: any) {
      console.error('Wallet payment failed:', err);
      setFormError(err?.shortMessage || err?.message || 'Wallet transaction failed. You can also send manually and paste the tx hash below.');
    } finally {
      setWalletPaying(false);
    }
  };

  const copyAddr = (addr: string) => {
    navigator.clipboard?.writeText(addr);
    setCopiedReceiver(true);
    setTimeout(() => setCopiedReceiver(false), 2000);
  };

  const payTab = (id: typeof payMethod, label: string, active: string) => (
    <button
      type="button"
      onClick={() => setPayMethod(id)}
      className={`p-2.5 rounded-lg border text-xs font-medium transition-all text-center ${payMethod === id ? `${active} shadow-md` : 'border-gray-600/30 bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
        }`}
    >
      {label}
    </button>
  );

  const stepCls = (n: number) =>
    `p-2 rounded-lg ${modalStep >= n ? 'bg-cyan-500 text-black font-semibold' : 'bg-gray-700/50 text-gray-400'}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 z-50 overflow-y-auto" style={FONT}>
      <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-lg w-full max-w-3xl p-6 my-8 text-white shadow-xl relative">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700/20 pb-3">
          <h3 className="font-semibold text-white flex items-center gap-2 text-lg">
            <FaNewspaper className="w-5 h-5 text-blue-400" />
            {subType === 'pr' ? 'Submit Press Release' : 'Submit News Story'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="grid grid-cols-4 gap-2 mb-6 text-xs font-medium text-center">
          <div className={stepCls(1)}>1 · Write</div>
          <div className={stepCls(2)}>2 · Package</div>
          <div className={stepCls(3)}>3 · Pay</div>
          <div className={stepCls(4)}>4 · Done</div>
        </div>

        {/* Step 1: Write */}
        {modalStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className={LABEL}>What are you submitting?</label>
              <select
                value={subType}
                onChange={(e) => {
                  setSubType(e.target.value as 'news' | 'pr');
                  setPlan('feed');
                }}
                className={INPUT}
              >
                <option value="news">News story (from $29)</option>
                <option value="pr">Press release (from $199)</option>
              </select>
            </div>

            <div>
              <label className={LABEL}>Headline *</label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={110}
                placeholder="e.g. NYAX launches staking rewards v2"
                className={INPUT}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT}>
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
                <label className={LABEL}>Source link (optional)</label>
                <input
                  value={sourceLink}
                  onChange={(e) => setSourceLink(e.target.value)}
                  placeholder="https://original-link.com"
                  className={INPUT}
                />
              </div>
            </div>

            <div>
              <label className={LABEL}>Short summary (shown in feed) *</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                maxLength={180}
                placeholder="One or two sentences shown in the newsfeed..."
                className={INPUT}
              />
            </div>

            <div>
              <label className={LABEL}>Story Content *</label>
              <div className="flex gap-1.5 bg-gray-700/50 p-1.5 rounded-t-lg border border-b-0 border-gray-600/50">
                <button type="button" onClick={() => execFmt('bold')} className="px-2 py-0.5 bg-gray-600/50 hover:bg-gray-600/70 rounded text-xs font-bold">B</button>
                <button type="button" onClick={() => execFmt('italic')} className="px-2 py-0.5 bg-gray-600/50 hover:bg-gray-600/70 rounded text-xs italic">I</button>
                <button type="button" onClick={() => execFmt('insertUnorderedList')} className="px-2 py-0.5 bg-gray-600/50 hover:bg-gray-600/70 rounded text-xs">• List</button>
                <button type="button" onClick={handleLinkPrompt} className="px-2 py-0.5 bg-gray-600/50 hover:bg-gray-600/70 rounded text-xs">Link</button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setStoryBody(e.currentTarget.innerHTML)}
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-b-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500/50 min-h-[140px] max-h-[220px] overflow-y-auto"
              />
            </div>

            {/* Cover image — IPFS upload (same as admin) */}
            <div>
              <label className={LABEL}>Cover image (optional)</label>

              <div className={`mb-3 p-4 ${PANEL}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-cyan-300">Upload to IPFS</span>
                  <div className="flex-1 h-px bg-gray-600/50"></div>
                </div>
                <div className="mb-3 text-xs text-gray-400">
                  Requirements: Min 400x200 pixels (1200x450 recommended), Max 10MB, JPEG/PNG/GIF/WebP only
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    ref={fileInputRef}
                    id="submit-ipfs-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="submit-ipfs-file-input"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 rounded-lg cursor-pointer transition-all duration-200 text-sm"
                  >
                    <FaUpload className="w-4 h-4" />
                    Choose File
                  </label>

                  {selectedFile && (
                    <span className="text-sm text-gray-400 flex-1 truncate min-w-0">
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={uploadToIPFS}
                    disabled={!selectedFile || isUploadingToIPFS}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    {isUploadingToIPFS ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaUpload className="w-4 h-4" />
                        Upload to IPFS
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className={LABEL}>Or enter image URL manually</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={uploadedImg || ''}
                    onChange={(e) => setUploadedImg(e.target.value || null)}
                    className={`flex-1 ${INPUT}`}
                    placeholder="https://example.com/image.jpg or IPFS URL"
                  />
                  {uploadedImg?.includes('gateway.pinata.cloud') && (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImg(convertToWorkingIPFSUrl(uploadedImg));
                        setImgSuccess('URL converted to working IPFS gateway!');
                      }}
                      className="px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 rounded-lg border border-yellow-600/30 transition-all duration-200 text-sm font-medium whitespace-nowrap"
                      title="Convert Pinata gateway URL to working IPFS.io gateway"
                    >
                      Fix URL
                    </button>
                  )}
                </div>
              </div>

              {imgError && <p className="text-xs text-red-300 mt-2">{imgError}</p>}
              {imgSuccess && <p className="text-xs text-green-300 mt-2">{imgSuccess}</p>}

              {uploadedImg && (
                <div className="mt-3">
                  <label className={LABEL}>Preview</label>
                  <div className="relative w-full h-32 bg-gray-800/50 rounded-lg overflow-hidden">
                    <img
                      src={uploadedImg}
                      alt="Cover image preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImg(null);
                        setImgSuccess('');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-gray-300"
                      aria-label="Remove cover image"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {formError && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-medium">{formError}</div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-700/20">
              <span className="text-xs text-gray-400">Stories are reviewed before going live.</span>
              <button type="button" onClick={validateStep1} className={BTN_PRIMARY}>
                Continue to Package →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Package */}
        {modalStep === 2 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300">Select your visibility package</h4>

            <div className="space-y-3">
              {currentPlans.map(p => (
                <div
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${plan === p.id
                    ? 'border-cyan-500/60 bg-cyan-500/10 shadow-md'
                    : 'border-gray-600/30 bg-gray-700/30 hover:bg-gray-700/40'
                    }`}
                >
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      {p.name}
                      {p.id === 'slider' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                          ★ RECOMMENDED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{p.desc}</div>
                  </div>
                  <div className="text-xl font-semibold text-cyan-400">${p.price}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-700/20">
              <button type="button" onClick={() => setModalStep(1)} className={BTN_GHOST}>← Back</button>
              <button type="button" onClick={() => setModalStep(3)} className={BTN_PRIMARY}>Continue to Payment →</button>
            </div>
          </div>
        )}

        {/* Step 3: Pay */}
        {modalStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className={LABEL}>Your Contact Email (for editorial updates & live notification) *</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                className={INPUT}
              />
            </div>

            <div>
              <label className={LABEL}>Select Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {payTab('paypal', '🅿️ PayPal & Cards', 'border-blue-500/40 bg-blue-500/20 text-blue-300')}
                {payTab('eth', '⟠ Connect Wallet (ETH)', 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300')}
                {payTab('sol', '◎ Solana (SOL)', 'border-purple-500/40 bg-purple-500/20 text-purple-300')}
                {payTab('nyax', '⚡ NYAX (10% off)', 'border-amber-500/40 bg-amber-500/20 text-amber-300')}
              </div>
            </div>

            {/* Total Summary */}
            <div className={`p-3 ${PANEL} flex justify-between items-center`}>
              <div>
                <span className="text-sm font-semibold text-white">{activePlanObj.name}</span>
                {payMethod === 'nyax' && <span className="block text-xs text-amber-400">10% NYAX Discount applied</span>}
              </div>
              <span className="text-2xl font-semibold text-cyan-400">${finalPrice.toFixed(2)} USD</span>
            </div>

            {/* PayPal */}
            {payMethod === 'paypal' && (
              <div className="p-4 bg-gray-700/30 border border-blue-500/30 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                    <span className="text-lg">💳</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-400">PayPal & Card Payment</h4>
                    <p className="text-xs text-gray-400">Complete payment securely with PayPal or Credit/Debit Card</p>
                  </div>
                </div>

                {!userEmail.trim() || !userEmail.includes('@') ? (
                  <p className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
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

            {/* Connect Wallet (ETH) */}
            {payMethod === 'eth' && (
              <div className="p-4 bg-gray-700/30 border border-cyan-500/30 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-cyan-300">Connect Wallet & Pay</h4>
                    <p className="text-xs text-gray-400">Pay directly on Ethereum Mainnet</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-gray-800/70 px-2 py-1 rounded">
                    ~{(finalPrice / (ethPrice || 3200)).toFixed(4)} ETH
                  </span>
                </div>

                {!isConnected ? (
                  <div className="text-center py-4 bg-black/30 rounded-lg border border-gray-700/40 space-y-2">
                    <p className="text-xs text-gray-400">Connect your Web3 wallet (MetaMask, Coinbase, WalletConnect) to pay:</p>
                    <div className="flex justify-center">
                      <ConnectWalletButton />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs">
                      <span className="text-gray-400">Connected Wallet:</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        ● {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connected'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleWalletPay}
                      disabled={walletPaying}
                      className={`w-full py-3 ${BTN_PRIMARY}`}
                    >
                      {walletPaying ? 'Sending On-Chain Payment...' : `⚡ Pay $${finalPrice.toFixed(2)} with Connected Wallet`}
                    </button>
                  </div>
                )}

                <details className="text-xs text-gray-400 pt-1">
                  <summary className="cursor-pointer font-medium text-gray-400 hover:text-white">
                    Or send manually to Treasury address & paste TXID ▾
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-black/40 rounded border border-gray-700/40 text-[11px] truncate">{RECEIVER_ADDRESS}</code>
                      <button type="button" onClick={() => copyAddr(RECEIVER_ADDRESS)} className="px-2.5 py-1.5 bg-gray-600/50 hover:bg-gray-600/70 text-xs rounded text-white">
                        {copiedReceiver ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <input
                      placeholder="0x... (paste your transaction hash here)"
                      value={cryptoTxHash}
                      onChange={(e) => setCryptoTxHash(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                </details>
              </div>
            )}

            {/* Solana */}
            {payMethod === 'sol' && (
              <div className="p-4 bg-gray-700/30 border border-purple-500/30 rounded-lg space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-purple-300">Solana Payment</span>
                  <span className="font-mono text-white">~{(finalPrice / (solPrice || 180)).toFixed(3)} SOL</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-black/40 rounded border border-gray-700/40 text-[11px] truncate">{SOLANA_RECEIVER}</code>
                  <button type="button" onClick={() => copyAddr(SOLANA_RECEIVER)} className="px-2.5 py-1.5 bg-gray-600/50 hover:bg-gray-600/70 rounded text-white">
                    {copiedReceiver ? '✓' : 'Copy'}
                  </button>
                </div>
                <input
                  placeholder="Enter Solana transaction signature..."
                  value={cryptoTxHash}
                  onChange={(e) => setCryptoTxHash(e.target.value)}
                  className={INPUT}
                />
              </div>
            )}

            {/* NYAX */}
            {payMethod === 'nyax' && (
              <div className="p-4 bg-gray-700/30 border border-amber-500/30 rounded-lg space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-amber-300">NYAX Token (10% Discount)</span>
                  <span className="font-mono text-white">${(finalPrice * 0.9).toFixed(2)} USD in NYAX</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-black/40 rounded border border-gray-700/40 text-[11px] truncate">{RECEIVER_ADDRESS}</code>
                  <button type="button" onClick={() => copyAddr(RECEIVER_ADDRESS)} className="px-2.5 py-1.5 bg-gray-600/50 hover:bg-gray-600/70 rounded text-white">
                    {copiedReceiver ? '✓' : 'Copy'}
                  </button>
                </div>
                <input
                  placeholder="0x... (paste your transaction hash here)"
                  value={cryptoTxHash}
                  onChange={(e) => setCryptoTxHash(e.target.value)}
                  className={INPUT}
                />
              </div>
            )}

            {formError && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-medium">{formError}</div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-700/20">
              <button type="button" onClick={() => setModalStep(2)} className={BTN_GHOST}>← Back</button>
              {payMethod !== 'paypal' && (
                <button type="button" onClick={() => handlePayAndSubmit()} disabled={isSubmitting} className={BTN_PRIMARY}>
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
            <h3 className="text-2xl font-semibold text-white">Story submitted for moderation!</h3>
            <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
              Thank you! Your submission is now in our moderation queue and marked as <b>“Pending review”</b>.
              Our editors verify the payment and accuracy, and you will receive an email as soon as it goes live!
            </p>
            <button onClick={onClose} className={BTN_PRIMARY}>
              Back to News Hub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}