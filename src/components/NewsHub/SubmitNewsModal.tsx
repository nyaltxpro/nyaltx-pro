'use client';

import ConnectWalletButton from '@/components/ConnectWalletButton';
import PayPalCheckout from '@/components/PayPalCheckout';
import { NEWS_PAYPAL_CRYPTO_DRAFT_KEY, type NewsPayPalCryptoDraft } from '@/lib/newsCryptoDraft';
import { isPaidNewsCategory, PAID_NEWS_CATEGORIES } from '@/lib/paidNewsCategories';
import { getNYAXPriceUSD } from '@/utils/nyaxPriceApi';
import { calculateNewsPrice, NEWS_NYAX_DISCOUNT } from '@/lib/newsPricing';
import { USDC_NYAX_RECEIVER } from '@/lib/paymentAddresses';
import { useAppKit } from '@reown/appkit/react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { FaCheck, FaNewspaper, FaSpinner, FaTimes, FaUpload } from 'react-icons/fa';
import { erc20Abi, isAddress, parseUnits } from 'viem';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';

export interface SubmitNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'news' | 'pr';
  initialPlan?: string;
  enableTestPlan?: boolean;
  onSuccess?: (item: any) => void;
}

type PayMethod = 'paypal' | 'usdc' | 'nyax';
type WalletMethod = Exclude<PayMethod, 'paypal'>;

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

export interface PlanItem {
  id: string;
  name: string;
  badge: string;
  price: number;
  priceLabel: string;
  ctaText: string;
  desc: string;
  features: string[];
}

const PUBLISH_PLANS: PlanItem[] = [
  {
    id: 'feed',
    badge: 'NEWS PUBLISHING',
    name: 'News Publishing',
    price: 99,
    priceLabel: 'flat rate per release',
    ctaText: 'Publish Your News',
    desc: 'Get your company news published and discoverable on the NYALTX News Hub.',
    features: [
      'Full article published on NYALTX News Hub',
      'Inclusion in the live industry news feed',
      'Company logo and featured image',
      'Links to your website and social channels',
      'Dedicated, shareable article URL',
      'SEO-friendly article page',
    ],
  },
  {
    id: 'slider',
    badge: 'PREMIUM VISIBILITY & DISTRIBUTION',
    name: 'News Publishing & Distribution',
    price: 199,
    priceLabel: 'per release',
    ctaText: 'Get Featured',
    desc: 'Amplify your announcement with featured placement and additional promotional distribution.',
    features: [
      'Everything in News Publishing',
      '7-day featured placement on the News Hub',
      'Priority visibility above standard news',
      'Inclusion in the NYALTX newsletter',
      'Promotion across NYALTX social channels',
      'Custom-branded promotional graphic',
      'Article editing and headline optimization',
      'Featured company spotlight',
      'Scheduled publication option',
    ],
  },
];

const NEWS_TEST_PLAN: PlanItem = {
  id: 'test',
  badge: 'TEST PLAN',
  name: 'Checkout Flow Test',
  price: 1,
  priceLabel: 'temporary test release',
  ctaText: 'Test Checkout',
  desc: 'A temporary $1 plan for testing the full news submission and checkout flow.',
  features: [
    'Complete the standard submission and checkout steps',
    'Test submission remains subject to moderation',
  ],
};

const PLANS_CONFIG: Record<'news' | 'pr', PlanItem[]> = {
  news: PUBLISH_PLANS,
  pr: PUBLISH_PLANS,
};

/* ---------- Payment configuration ---------- */
const DEFAULT_NYAX: `0x${string}` = '0x5eed5621b92be4473f99bacac27deb57d9';
const DEFAULT_USDC: `0x${string}` = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

const NYAX_TOKEN =
  (process.env.NEXT_PUBLIC_NYAX_TOKEN_ADDRESS as `0x${string}` | undefined) ?? DEFAULT_NYAX;
const USDC_TOKEN = DEFAULT_USDC;
const PAYMENT_CHAIN_ID = 1;

const convertToWorkingIPFSUrl = (url: string) =>
  url.replace('https://gateway.pinata.cloud/ipfs/', 'https://ipfs.io/ipfs/');

const PayPalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a9.124 9.124 0 0 1-.077.437c-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287z" />
  </svg>
);

const LOGOS: Record<PayMethod, React.ReactNode> = {
  paypal: <PayPalIcon />,
  usdc: <Image src="/crypto-icons/color/usdc.svg" width={16} height={16} alt="USDC" />,
  nyax: <Image src="/logo.png" width={16} height={16} alt="NYAX" />
};

/* ---------- Animated stepper ---------- */
const STEP_LABELS = ['Write', 'Package', 'Pay', 'Done'];

const ModalStepper = ({ current }: { current: number }) => {
  const total = STEP_LABELS.length;
  const allDone = current === total;

  return (
    <div className="flex items-start justify-between mb-6">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const isDone = n < current || allDone;
        const isCurrent = n === current && !allDone;

        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <div
                  className={`w-9 h-9 flex items-center justify-center shrink-0 border-2 rounded-full font-semibold text-sm relative z-10 transition-colors duration-300 ${isDone
                    ? 'border-cyan-500 bg-cyan-500 text-black'
                    : isCurrent
                      ? 'border-cyan-500 bg-gray-800 text-cyan-300'
                      : 'border-gray-600 bg-gray-700/50 text-gray-500'
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {isDone ? (
                      <motion.span
                        key="check"
                        initial={{ rotate: 180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -180, opacity: 0 }}
                        transition={{ duration: 0.125 }}
                      >
                        <FaCheck className="w-3.5 h-3.5" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="num"
                        initial={{ rotate: 180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -180, opacity: 0 }}
                        transition={{ duration: 0.125 }}
                      >
                        {n}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {isCurrent && (
                  <div className="absolute z-0 -inset-1.5 bg-cyan-500/20 rounded-full animate-pulse" />
                )}
              </div>
              <span
                className={`text-[11px] font-medium transition-colors ${isDone || isCurrent ? 'text-cyan-300' : 'text-gray-500'
                  }`}
              >
                {label}
              </span>
            </div>

            {n !== total && (
              <div className="flex-1 mx-2 mt-4 h-1 rounded-full bg-gray-700/60 relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  initial={false}
                  animate={{ width: isDone ? '100%' : 0 }}
                  transition={{ ease: 'easeIn', duration: 0.3 }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function SubmitNewsModalCorporate({
  isOpen,
  onClose,
  initialType = 'news',
  initialPlan = 'feed',
  enableTestPlan = false,
  onSuccess
}: SubmitNewsModalProps) {
  const [modalStep, setModalStep] = useState(1);
  const [subType, setSubType] = useState<'news' | 'pr'>(initialType);
  const [plan, setPlan] = useState(initialPlan);
  const [payMethod, setPayMethod] = useState<PayMethod>('paypal');
  const [selectedSwatch] = useState(0);

  // Cover image (IPFS / external URL)
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
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [formError, setFormError] = useState('');
  const [cryptoTxHash, setCryptoTxHash] = useState('');
  const [copiedReceiver, setCopiedReceiver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSwitchingToEthereum, setIsSwitchingToEthereum] = useState(false);
  const [pendingPaypalPaymentId, setPendingPaypalPaymentId] = useState('');

  // Prices
  const [nyaxPrice, setNyaxPrice] = useState<number | null>(null);

  // Web3 hooks (same as pricing page)
  const { address: walletAddress, isConnected, chain } = useAccount();
  const { open: openAppKit } = useAppKit();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [walletPaying, setWalletPaying] = useState<WalletMethod | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    let savedDraft: NewsPayPalCryptoDraft | null = null;
    try {
      const saved = sessionStorage.getItem(NEWS_PAYPAL_CRYPTO_DRAFT_KEY);
      savedDraft = saved ? (JSON.parse(saved) as NewsPayPalCryptoDraft) : null;
    } catch (error) {
      console.error('Could not restore the pending news payment draft:', error);
    }

    const allowedPlans = (type: 'news' | 'pr') =>
      enableTestPlan ? [...PLANS_CONFIG[type], NEWS_TEST_PLAN] : PLANS_CONFIG[type];
    if (
      savedDraft &&
      typeof savedDraft.headline === 'string' &&
      typeof savedDraft.summary === 'string' &&
      typeof savedDraft.storyBody === 'string' &&
      typeof savedDraft.userEmail === 'string'
    ) {
      const restoredType = savedDraft.subType === 'pr' ? 'pr' : 'news';
      const restoredPlan = allowedPlans(restoredType).some(item => item.id === savedDraft?.plan)
        ? savedDraft.plan
        : initialPlan;
      const promoCode = typeof savedDraft.promoCode === 'string' ? savedDraft.promoCode : '';

      setSubType(restoredType);
      setPlan(restoredPlan);
      setPayMethod('paypal');
      setHeadline(savedDraft.headline);
      setCategory(isPaidNewsCategory(savedDraft.category) ? savedDraft.category : 'Other');
      setSourceLink(typeof savedDraft.sourceLink === 'string' ? savedDraft.sourceLink : '');
      setSummary(savedDraft.summary);
      setStoryBody(savedDraft.storyBody);
      setUserEmail(savedDraft.userEmail);
      setUploadedImg(typeof savedDraft.uploadedImg === 'string' ? savedDraft.uploadedImg : null);
      setPromoCodeInput(promoCode);
      setAppliedPromo(
        promoCode
          ? {
              code: promoCode,
              discountPercent: Number.isFinite(savedDraft.promoDiscountPercent)
                ? savedDraft.promoDiscountPercent
                : 0,
            }
          : null,
      );
      setPendingPaypalPaymentId(
        typeof savedDraft.paymentId === 'string' ? savedDraft.paymentId : '',
      );
      setModalStep(3);
      setFormError('');
      setImgError('');
      setImgSuccess('');
      setPromoError('');
      return;
    }

    setSubType(initialType);
    setPlan(initialPlan);
    setModalStep(1);
    setFormError('');
    setImgError('');
    setImgSuccess('');
    setPromoCodeInput('');
    setAppliedPromo(null);
    setPromoError('');
    setPendingPaypalPaymentId('');
  }, [enableTestPlan, initialPlan, initialType, isOpen]);

  useEffect(() => {
    if (modalStep === 1 && editorRef.current && editorRef.current.innerHTML !== storyBody) {
      editorRef.current.innerHTML = storyBody;
    }
  }, [modalStep, storyBody]);

  useEffect(() => {
    getNYAXPriceUSD().then(setNyaxPrice).catch(() => setNyaxPrice(null));
  }, []);

  if (!isOpen) return null;

  // Price calculations
  const currentPlans = enableTestPlan
    ? [...PLANS_CONFIG[subType], NEWS_TEST_PLAN]
    : PLANS_CONFIG[subType];
  const activePlanObj = currentPlans.find(p => p.id === plan) || currentPlans[0];
  const basePrice = activePlanObj.price;
  const finalPrice = calculateNewsPrice(
    basePrice,
    plan === 'test' ? 0 : appliedPromo?.discountPercent ?? 0,
    plan !== 'test' && payMethod === 'nyax'
  );

  const nyaxRef = nyaxPrice && nyaxPrice > 0 ? nyaxPrice : 1.0;
  const nyaxAmount = finalPrice / nyaxRef;
  const usdcAmount = finalPrice; // 1 USDC = $1.00 USD

  const validEmail = userEmail.trim().length > 0 && userEmail.includes('@');

  const applyPromoCode = async () => {
    const promoCode = promoCodeInput.trim().toUpperCase();
    if (!promoCode) {
      setPromoError('Enter a promo code.');
      setAppliedPromo(null);
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');
    try {
      const response = await fetch('/api/news/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCode, plan }),
      });
      const result = await response.json();
      if (!response.ok || !result.valid) {
        throw new Error(result.message || 'This promo code is invalid.');
      }

      setAppliedPromo({ code: result.code, discountPercent: result.discountPercent });
      setPromoCodeInput(result.code);
    } catch (error) {
      setAppliedPromo(null);
      setPromoError(error instanceof Error ? error.message : 'Could not validate promo code.');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const selectPlan = (nextPlan: string) => {
    setPlan(nextPlan);
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
  };

  /* ---------- IPFS image handling ---------- */
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

    const img = new window.Image();
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
        img.width < 1200 || img.height < 600
          ? `Image is ${img.width}×${img.height}. Recommended size is 1200×600 px (2:1 card ratio).`
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

  const saveNewsCryptoDraft = (paymentId?: string) => {
    const draft: NewsPayPalCryptoDraft = {
      subType,
      plan,
      headline,
      category,
      sourceLink,
      summary,
      storyBody: editorRef.current?.innerHTML || storyBody,
      userEmail,
      uploadedImg,
      promoCode: appliedPromo?.code || null,
      promoDiscountPercent: appliedPromo?.discountPercent ?? 0,
      ...(paymentId ? { paymentId } : {}),
    };
    sessionStorage.setItem(NEWS_PAYPAL_CRYPTO_DRAFT_KEY, JSON.stringify(draft));
  };

  /* ---------- Submit (runs only AFTER payment, like token registration) ---------- */
  const handlePayAndSubmit = async (paymentOverride?: {
    paymentMethod?: PayMethod;
    paymentId?: string;
    txHash?: string;
    walletAddress?: string;
    amount?: number;
  }) => {
    setIsSubmitting(true);
    setFormError('');

    if (!validEmail) {
      setFormError('Please enter a valid contact email address.');
      setIsSubmitting(false);
      return;
    }

    const currentPayMethod = paymentOverride?.paymentMethod || payMethod;
    if (currentPayMethod !== 'paypal' && !paymentOverride?.txHash && !cryptoTxHash.trim()) {
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
      author: subType === 'pr' ? 'Press Release' : 'NYALTX',
      email: userEmail.trim(),
      plan,
      planName: activePlanObj.name,
      paymentMethod: currentPayMethod,
      amount: chosenAmount,
      promoCode: plan === 'test' ? null : appliedPromo?.code || null,
      promoDiscount: plan === 'test' ? 0 : appliedPromo?.discountPercent ?? 0,
      txHash: paymentOverride?.txHash || (cryptoTxHash.trim() || null),
      paymentId: paymentOverride?.paymentId || null,
      walletAddress: paymentOverride?.walletAddress || null,
      paymentStatus: 'completed'
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

      try {
        sessionStorage.removeItem(NEWS_PAYPAL_CRYPTO_DRAFT_KEY);
      } catch (error) {
        console.error('Could not clear the completed news payment draft:', error);
      }
      setPendingPaypalPaymentId('');
      onSuccess?.(newLocalItem);
      setModalStep(4);
    } catch (err: any) {
      const base = err.message || 'Error submitting story. Please try again.';
      setFormError(
        paymentOverride?.txHash
          ? `Payment sent (tx ${paymentOverride.txHash.slice(0, 10)}...) but submission failed: ${base}. Click "Submit Story with TX Hash" to retry — do not pay again.`
          : paymentOverride?.paymentId
            ? `PayPal confirmed your payment, but the story submission failed: ${base}. Retry the submission below; you will not be charged again.`
            : base
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- On-chain EVM token payment ---------- */
  const payWithWallet = async (method: WalletMethod) => {
    if (!validEmail) {
      setFormError('Please enter your contact email address above first.');
      return;
    }
    if (!isConnected) {
      try {
        openAppKit({ view: 'Connect' });
      } catch { }
      return;
    }

    setWalletPaying(method);
    setFormError('');

    try {
      if (chain?.id !== PAYMENT_CHAIN_ID) {
        try {
          await switchChainAsync({ chainId: PAYMENT_CHAIN_ID });
        } catch (switchError) {
          const reason = switchError instanceof Error ? ` ${switchError.message}` : '';
          throw new Error(`Please switch to Ethereum Mainnet (ETH) to pay with ${method.toUpperCase()}.${reason}`);
        }
      }

      const token = method === 'nyax' ? NYAX_TOKEN : USDC_TOKEN;
      if (!isAddress(token)) {
        throw new Error(
          method === 'nyax'
            ? 'NYAX token address is not configured correctly (NEXT_PUBLIC_NYAX_TOKEN_ADDRESS).'
            : 'Ethereum Mainnet USDC token address is invalid.'
        );
      }

      const decimals = method === 'nyax' ? 18 : 6;
      const amount = method === 'nyax' ? nyaxAmount : usdcAmount;
      const txHash = await writeContractAsync({
        chainId: PAYMENT_CHAIN_ID,
        abi: erc20Abi,
        address: token,
        functionName: 'transfer',
        args: [USDC_NYAX_RECEIVER, parseUnits(amount.toFixed(method === 'nyax' ? 6 : 2), decimals)],
      });

      if (!txHash) throw new Error('Transaction was rejected or failed to broadcast.');

      setCryptoTxHash(txHash);
      await handlePayAndSubmit({
        paymentMethod: method,
        txHash,
        walletAddress: walletAddress || undefined,
        amount: finalPrice,
      });
    } catch (err: any) {
      console.error('Wallet payment failed:', err);
      setFormError(err?.shortMessage || err?.message || 'Wallet transaction failed. You can also send manually and paste the tx hash below.');
    } finally {
      setWalletPaying(null);
    }
  };

  const switchToEthereumMainnet = async () => {
    if (isSwitchingToEthereum) return;
    setFormError('');
    setIsSwitchingToEthereum(true);
    try {
      await switchChainAsync({ chainId: PAYMENT_CHAIN_ID });
    } catch (error) {
      const reason = error instanceof Error ? ` ${error.message}` : '';
      setFormError(`Couldn't switch your wallet to Ethereum Mainnet.${reason}`);
    } finally {
      setIsSwitchingToEthereum(false);
    }
  };

  const copyAddr = (addr: string) => {
    navigator.clipboard?.writeText(addr);
    setCopiedReceiver(true);
    setTimeout(() => setCopiedReceiver(false), 2000);
  };

  const payTab = (id: PayMethod, label: string, active: string) => (
    <button
      type="button"
      onClick={() => setPayMethod(id)}
      className={`p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-2 ${payMethod === id ? `${active} shadow-md` : 'border-gray-600/30 bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
        }`}
    >
      {LOGOS[id]}
      {label}
    </button>
  );

  /* Shared panel for USDC / NYAX (connect wallet -> pay -> auto submit) */
  const renderWalletPanel = (
    method: WalletMethod,
    cfg: { title: string; subtitle: string; border: string; titleColor: string; amountText: string; btnLabel: string }
  ) => {
    return (
      <div className={`p-4 bg-gray-700/30 border ${cfg.border} rounded-lg space-y-3`}>
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-800/60 rounded-lg flex items-center justify-center border border-gray-600/40">
              {method === 'usdc' && <Image src="/crypto-icons/color/usdc.svg" width={20} height={20} alt="USDC" />}
              {method === 'nyax' && <Image src="/logo.png" width={20} height={20} alt="NYAX" />}
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${cfg.titleColor}`}>{cfg.title}</h4>
              <p className="text-xs text-gray-400">{cfg.subtitle}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-white bg-gray-800/70 px-2 py-1 rounded whitespace-nowrap">
            {cfg.amountText}
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

            {chain?.id !== PAYMENT_CHAIN_ID ? (
              <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-xs text-amber-200">
                  Your wallet is on {chain?.name || 'another network'}. Switch to Ethereum Mainnet before starting payment.
                </p>
                <button
                  type="button"
                  onClick={() => void switchToEthereumMainnet()}
                  disabled={walletPaying !== null || isSwitchingToEthereum}
                  className="w-full rounded-lg border border-amber-400/40 bg-amber-500/20 px-3 py-2 text-sm font-semibold text-amber-100 transition-colors hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSwitchingToEthereum
                    ? 'Switching to Ethereum Mainnet...'
                    : chain?.id === undefined
                      ? 'Switch to Ethereum Mainnet'
                      : 'Switch Network to Ethereum'}
                </button>
              </div>
            ) : (
              <p className="rounded-lg border border-green-500/30 bg-green-500/10 p-2.5 text-xs text-green-300">
                Wallet is ready on Ethereum Mainnet. Your connected wallet address will stay the same.
              </p>
            )}

            <button
              type="button"
              onClick={() => payWithWallet(method)}
              disabled={
                walletPaying !== null ||
                isSwitchingToEthereum ||
                isSubmitting ||
                chain?.id !== PAYMENT_CHAIN_ID
              }
              className={`w-full py-3 ${BTN_PRIMARY}`}
            >
              {walletPaying === method ? (
                <span className="inline-flex items-center gap-2">
                  <FaSpinner className="w-4 h-4 animate-spin" /> Sending On-Chain Payment...
                </span>
              ) : (
                cfg.btnLabel
              )}
            </button>
          </div>
        )}

        <details className="text-xs text-gray-400 pt-1">
          <summary className="cursor-pointer font-medium text-gray-400 hover:text-white">
            Or send manually to Treasury address & paste TXID ▾
          </summary>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-black/40 rounded border border-gray-700/40 text-[11px] truncate">{USDC_NYAX_RECEIVER}</code>
              <button type="button" onClick={() => copyAddr(USDC_NYAX_RECEIVER)} className="px-2.5 py-1.5 bg-gray-600/50 hover:bg-gray-600/70 text-xs rounded text-white">
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
    );
  };

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

        {/* Animated stepper */}
        <ModalStepper current={modalStep} />

        {/* Step 1: Write */}
        {modalStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className={LABEL}>What are you submitting?</label>
              <select
                value={subType}
                onChange={(e) => {
                  setSubType(e.target.value as 'news' | 'pr');
                  selectPlan('feed');
                }}
                className={INPUT}
              >
                <option value="news">News Article</option>
                <option value="pr">Press Release</option>
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
                  {PAID_NEWS_CATEGORIES.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
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

            {/* Cover image — IPFS upload */}
            <div>
              <label className={LABEL}>Cover image (optional)</label>

              <div className={`mb-3 p-4 ${PANEL}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-cyan-300">Upload to IPFS</span>
                  <div className="flex-1 h-px bg-gray-600/50"></div>
                </div>
                <div className="mb-3 text-xs text-gray-400">
                  Use a 1200x600 px (2:1) image for best results. Images fit the card without cropping. Minimum 400x200 px; max 10MB; JPEG/PNG/GIF/WebP.
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
                  <div className="relative aspect-[2/1] w-full bg-gray-800/50 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImg}
                      alt="Cover image preview"
                      className="w-full h-full object-contain"
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
            <div className="text-center mb-1">
              <h4 className="text-xl font-bold text-white tracking-tight">Choose how you publish</h4>
              <p className="text-xs text-gray-400 mt-1">Select the distribution plan that fits your announcement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {currentPlans.map((p) => {
                const isSelected = plan === p.id;
                const isPopular = p.badge === 'MOST POPULAR';

                return (
                  <div
                    key={p.id}
                    onClick={() => selectPlan(p.id)}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                      isSelected
                        ? isPopular
                          ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/60 shadow-xl shadow-cyan-500/10'
                          : 'border-blue-400 bg-blue-950/40 ring-2 ring-blue-400/60 shadow-xl shadow-blue-500/10'
                        : isPopular
                          ? 'border-cyan-500/30 bg-gray-800/60 hover:border-cyan-500/60 hover:bg-gray-800/80'
                          : 'border-gray-700/60 bg-gray-800/40 hover:border-gray-600 hover:bg-gray-800/60'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 right-4 bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-lg tracking-wider">
                        ★ MOST POPULAR
                      </div>
                    )}

                    <div>
                      <div className="text-[11px] font-extrabold tracking-wider text-cyan-400 uppercase mb-1">
                        {p.badge}
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2">{p.name}</h3>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-extrabold text-white">${p.price}</span>
                        <span className="text-xs text-gray-400 font-medium">{p.priceLabel}</span>
                      </div>

                      {p.desc && (
                        <p className="text-xs text-gray-300 leading-relaxed mb-4 min-h-[36px]">
                          {p.desc}
                        </p>
                      )}

                      <div className="space-y-2.5 border-t border-gray-700/50 pt-4 mb-5">
                        {p.features?.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs text-gray-200">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span className="leading-tight">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectPlan(p.id);
                        setModalStep(3);
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95'
                          : 'bg-gray-700/70 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {p.ctaText} — ${p.price}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-700/20">
              <button type="button" onClick={() => setModalStep(1)} className={BTN_GHOST}>
                ← Back
              </button>
              <button type="button" onClick={() => setModalStep(3)} className={BTN_PRIMARY}>
                Continue to Payment (${activePlanObj.price}) →
              </button>
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

            {plan !== 'test' && (
              <div>
                <label className={LABEL}>Promo code</label>
                <div className="flex gap-2">
                  <input
                    value={promoCodeInput}
                    onChange={event => {
                      setPromoCodeInput(event.target.value.toUpperCase());
                      setAppliedPromo(null);
                      setPromoError('');
                    }}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void applyPromoCode();
                      }
                    }}
                    placeholder="Enter promo code"
                    className={`flex-1 ${INPUT}`}
                    maxLength={32}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => void applyPromoCode()}
                    disabled={isApplyingPromo || !promoCodeInput.trim()}
                    className={`${BTN_PRIMARY} whitespace-nowrap`}
                  >
                    {isApplyingPromo ? 'Checking...' : appliedPromo ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {promoError && <p role="alert" className="mt-2 text-xs text-red-300">{promoError}</p>}
                {appliedPromo && (
                  <p role="status" className="mt-2 text-xs text-green-300">
                    {appliedPromo.discountPercent}% discount applied. It stacks with the 20% NYAX discount when paying with NYAX.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className={LABEL}>Select Payment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {payTab('paypal', 'PayPal', 'border-blue-500/40 bg-blue-500/20 text-blue-300')}
                {payTab('usdc', 'USDC', 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300')}
                {payTab(
                  'nyax',
                  plan === 'test' ? 'NYAX' : 'NYAX (20% off)',
                  'border-amber-500/40 bg-amber-500/20 text-amber-300'
                )}
              </div>
            </div>

            {/* Total Summary */}
            <div className={`p-3 ${PANEL} flex justify-between items-center`}>
              <div>
                <span className="text-sm font-semibold text-white">{activePlanObj.name}</span>
                {payMethod === 'nyax' && plan !== 'test' && (
                  <span className="block text-xs text-amber-400">
                    {NEWS_NYAX_DISCOUNT * 100}% NYAX discount applied
                  </span>
                )}
                {appliedPromo && plan !== 'test' && (
                  <span className="block text-xs text-green-300">
                    {appliedPromo.code}: {appliedPromo.discountPercent}% off
                  </span>
                )}
              </div>
              <span className="text-2xl font-semibold text-cyan-400">${finalPrice.toFixed(2)} USD</span>
            </div>

            {/* PayPal */}
            {payMethod === 'paypal' && (
              <div className="p-4 bg-gray-700/30 border border-blue-500/30 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 text-blue-300">
                    <PayPalIcon />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-400">
                      PayPal & Card Payment
                    </h4>
                    <p className="text-xs text-gray-400">
                      Complete payment securely with PayPal or Credit/Debit Card
                    </p>
                  </div>
                </div>

                {pendingPaypalPaymentId ? (
                  <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <p role="status" className="text-xs text-emerald-200">
                      PayPal confirmed this payment. Submit the story again if the previous attempt
                      failed; this will not charge you again.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        void handlePayAndSubmit({
                          paymentMethod: 'paypal',
                          paymentId: pendingPaypalPaymentId,
                          amount: finalPrice,
                        })
                      }
                      disabled={isSubmitting}
                      className={BTN_PRIMARY}
                    >
                      {isSubmitting ? 'Submitting...' : 'Retry story submission'}
                    </button>
                  </div>
                ) : !validEmail ? (
                  <p className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    ⚠️ Please enter a valid contact email above to activate PayPal checkout buttons.
                  </p>
                ) : (
                  <div className="pt-2">
                    <PayPalCheckout
                      amount={finalPrice.toFixed(2)}
                      tier={`${subType}_${plan}`}
                      email={userEmail.trim()}
                      onBeforeCryptoRedirect={() => saveNewsCryptoDraft()}
                      onSuccess={(details: any) => {
                        const isCryptoPayment =
                          details?.paymentSource === 'paypal_crypto' || details?.payment_source?.crypto;
                        if (isCryptoPayment) {
                          try {
                            saveNewsCryptoDraft(details.id);
                          } catch (error) {
                            console.error('Could not save the verified PayPal crypto payment:', error);
                          }
                        }
                        setPendingPaypalPaymentId(details.id);
                        return handlePayAndSubmit({
                          paymentMethod: 'paypal',
                          paymentId: details.id,
                          amount: finalPrice
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

            {/* USDC */}
            {payMethod === 'usdc' &&
              renderWalletPanel('usdc', {
                title: 'Pay with USDC',
                subtitle: 'Ethereum Mainnet (ETH, chain ID 1) only',
                border: 'border-cyan-500/30',
                titleColor: 'text-cyan-300',
                amountText: `${usdcAmount.toFixed(2)} USDC`,
                btnLabel: `Pay ${usdcAmount.toFixed(2)} USDC ($${finalPrice.toFixed(2)})`
              })}

            {/* NYAX */}
            {payMethod === 'nyax' &&
              renderWalletPanel('nyax', {
                title: plan === 'test'
                  ? 'Pay with NYAX'
                  : `Pay with NYAX (${NEWS_NYAX_DISCOUNT * 100}% off)`,
                subtitle: 'Ethereum Mainnet (ETH, chain ID 1) only',
                border: 'border-amber-500/30',
                titleColor: 'text-amber-300',
                amountText: `~${nyaxAmount.toFixed(2)} NYAX`,
                btnLabel: `Pay ${nyaxAmount.toFixed(2)} NYAX ($${finalPrice.toFixed(2)})`
              })}

            {formError && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-medium">{formError}</div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-700/20">
              <button type="button" onClick={() => setModalStep(2)} className={BTN_GHOST}>← Back</button>
              {payMethod !== 'paypal' && (
                <button
                  type="button"
                  onClick={() => handlePayAndSubmit()}
                  disabled={isSubmitting || walletPaying !== null || !cryptoTxHash.trim()}
                  className={BTN_PRIMARY}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Story with TX Hash'}
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