'use client';

import PublicHeader from '@/components/PublicHeader';
import { getNYAXPriceUSD } from '@/utils/nyaxPriceApi';
import { useAppKit } from '@reown/appkit/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AnimatePresence, motion } from 'motion/react';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { useTina } from 'tinacms/dist/react';
import { erc20Abi, parseEther, parseUnits } from 'viem';
import { useAccount, useSendTransaction, useSwitchChain, useWriteContract } from 'wagmi';
import { USDC_NYAX_RECEIVER } from '@/lib/paymentAddresses';

// Payment configuration
const DEFAULT_RECEIVER: `0x${string}` = '0x81bA7b98E49014Bff22F811E9405640bC2B39cC0';
const DEFAULT_NYAX: `0x${string}` = '0x5eed5621b92be4473f99bacac27deb57d9'; // NYAX on Ethereum
const DEFAULT_SOL: `0x${string}` =
  (process.env.NEXT_PUBLIC_SOL_TOKEN_ADDRESS as `0x${string}` | undefined) ??
  ('0xD31a59c85aE9D8edEFeC411D448f90841571b89c' as `0x${string}`);

const RECEIVER =
  (process.env.NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS as `0x${string}` | undefined) ??
  DEFAULT_RECEIVER;
const NYAX_TOKEN =
  (process.env.NEXT_PUBLIC_NYAX_TOKEN_ADDRESS as `0x${string}` | undefined) ?? DEFAULT_NYAX;
const SOL_TOKEN = DEFAULT_SOL;
const PAYMENT_CHAIN_ID = process.env.NEXT_PUBLIC_PAYMENT_CHAIN_ID
  ? Number(process.env.NEXT_PUBLIC_PAYMENT_CHAIN_ID)
  : 1;
const FALLBACK_ETH_PRICE = process.env.NEXT_PUBLIC_FALLBACK_ETH_PRICE
  ? Number(process.env.NEXT_PUBLIC_FALLBACK_ETH_PRICE)
  : 3000;

function useIsPro() {
  const [isPro, setIsPro] = useState<boolean>(false);
  useEffect(() => {
    try {
      const value = document.cookie
        .split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('nyaltx_pro='));
      const hasProCookie = !!value && value.split('=')[1] === '1';
      const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      setIsPro(hasProCookie || isLocalhost);
    } catch {
      setIsPro(false);
    }
  }, []);
  return isPro;
}

async function fetchETHPriceUSD(): Promise<number> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      const v = data?.ethereum?.usd;
      if (typeof v === 'number' && v > 0) return v;
    }
  } catch {}

  try {
    const res = await fetch(
      'https://api.dexscreener.com/latest/dex/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      const pairs = Array.isArray(data?.pairs) ? data.pairs : [];
      if (pairs.length) {
        const best = pairs.reduce((a: any, b: any) =>
          Number(a?.liquidity?.usd || 0) > Number(b?.liquidity?.usd || 0) ? a : b
        );
        const price = parseFloat(best?.priceUsd);
        if (!Number.isNaN(price) && price > 0) return price;
      }
    }
  } catch {}

  try {
    const res = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const price = parseFloat(data?.data?.amount);
      if (!Number.isNaN(price) && price > 0) return price;
    }
  } catch {}

  return 0;
}

export const PricingPage = ({ tinaData }: any) => {
  const { data }: any = useTina(tinaData);

  const content = data?.pricing;
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [previousCarouselIndex, setPreviousCarouselIndex] = useState(0);

  const { isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const isPro = useIsPro();
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [nyaxPrice, setNyaxPrice] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inquiryService, setInquiryService] = useState<{
    id: string;
    name: string;
    price: string;
  } | null>(null);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    companyName: '',
    email: '',
    state: '',
    city: '',
    message: '',
  });
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const { open } = useAppKit();
  const router = useRouter();

  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const mediaCarouselSlides = [
    content?.fintechMedia?.distributionImage
      ? {
          src: content.fintechMedia.distributionImage,
          title: 'Podcast distribution channels',
        }
      : null,
    ...(content?.fintechMedia?.plans ?? []).map((plan: any) =>
      plan.image ? { src: plan.image, title: plan.name } : null
    ),
    ...(content?.corporateRoadshow?.plans ?? []).map((plan: any) =>
      plan.image ? { src: plan.image, title: plan.name } : null
    ),
  ].filter((slide): slide is { src: string; title: string } => Boolean(slide?.src));

  const changeCarouselSlide = (direction: -1 | 1) => {
    if (mediaCarouselSlides.length < 2) return;
    const nextIndex =
      (carouselIndex + direction + mediaCarouselSlides.length) % mediaCarouselSlides.length;
    setPreviousCarouselIndex(carouselIndex);
    setCarouselIndex(nextIndex);
  };

  const openInquiry = (id: string, name: string, price: string) => {
    setInquiryService({ id, name, price });
    setInquiryError(null);
    setInquirySuccess(false);
  };

  const closeInquiry = () => {
    if (inquirySubmitting) return;
    setInquiryService(null);
    setInquiryForm({ name: '', companyName: '', email: '', state: '', city: '', message: '' });
    setInquiryError(null);
    setInquirySuccess(false);
  };

  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inquiryService || inquirySubmitting) return;

    setInquirySubmitting(true);
    setInquiryError(null);
    try {
      const response = await fetch('/api/pricing-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inquiryForm, serviceId: inquiryService.id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.error || 'Could not submit your inquiry. Please try again.');
      setInquirySuccess(true);
    } catch (submitError) {
      setInquiryError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not submit your inquiry. Please try again.'
      );
    } finally {
      setInquirySubmitting(false);
    }
  };

  useEffect(() => {
    fetchETHPriceUSD()
      .then(setEthPrice)
      .catch(() => setEthPrice(null));

    getNYAXPriceUSD()
      .then(setNyaxPrice)
      .catch(() => setNyaxPrice(null));
  }, []);

  const computeEthAmount = useCallback(
    (usd: number) => {
      const ref =
        ethPrice && ethPrice > 0 ? ethPrice : FALLBACK_ETH_PRICE > 0 ? FALLBACK_ETH_PRICE : null;
      if (!ref) return null;
      return usd / ref;
    },
    [ethPrice]
  );

  const computeNyaxAmount = useCallback(
    (usd: number) => {
      const discountedUSD = usd * 0.8;
      const nyaxPriceUSD = nyaxPrice && nyaxPrice > 0 ? nyaxPrice : 1.0;
      return discountedUSD / nyaxPriceUSD;
    },
    [nyaxPrice]
  );

  const handlePayETH = useCallback(
    async (tierId: string, priceUSD: number) => {
      if (!RECEIVER) {
        setError('Receiver address not configured');
        return;
      }
      if (!isConnected) {
        try {
          open({ view: 'Connect' });
        } catch {}
        return;
      }
      if (PAYMENT_CHAIN_ID && chain?.id !== PAYMENT_CHAIN_ID) {
        try {
          await switchChainAsync({ chainId: PAYMENT_CHAIN_ID });
        } catch {
          setError('Please switch to the correct chain to pay');
          return;
        }
      }
      let ethAmt = computeEthAmount(priceUSD);
      if (!ethAmt) {
        try {
          const latest = await fetchETHPriceUSD();
          setEthPrice(latest);
          ethAmt = latest > 0 ? priceUSD / latest : null;
        } catch {}
      }
      if (!ethAmt) {
        if (FALLBACK_ETH_PRICE > 0) {
          ethAmt = priceUSD / FALLBACK_ETH_PRICE;
        } else {
          setError('Unable to compute ETH amount. Please try again in a moment.');
          return;
        }
      }

      setError(null);
      setBusy(tierId + ':eth');
      try {
        const hash = await sendTransactionAsync({
          to: RECEIVER,
          value: parseEther(ethAmt.toFixed(6)),
        });
        console.log('ETH payment tx:', hash);
      } catch (e: any) {
        setError(e?.shortMessage || e?.message || 'ETH payment failed');
      } finally {
        setBusy(null);
      }
    },
    [chain?.id, computeEthAmount, isConnected, sendTransactionAsync]
  );

  const handlePayNYAX = useCallback(
    async (tierId: string, priceUSD: number) => {
      if (!RECEIVER || !NYAX_TOKEN) {
        setError('Configuration error');
        return;
      }
      if (!isConnected) {
        try {
          open({ view: 'Connect' });
        } catch {}
        return;
      }
      if (PAYMENT_CHAIN_ID && chain?.id !== PAYMENT_CHAIN_ID) {
        try {
          await switchChainAsync({ chainId: PAYMENT_CHAIN_ID });
        } catch {
          setError('Please switch to the correct chain to pay');
          return;
        }
      }

      let nyaxAmount = computeNyaxAmount(priceUSD);
      if (!nyaxAmount) {
        try {
          const freshNyaxPrice = await getNYAXPriceUSD();
          if (freshNyaxPrice && freshNyaxPrice > 0) {
            setNyaxPrice(freshNyaxPrice);
            const discountedUSD = priceUSD * 0.8;
            nyaxAmount = discountedUSD / freshNyaxPrice;
          } else {
            nyaxAmount = priceUSD * 0.8;
          }
        } catch {
          nyaxAmount = priceUSD * 0.8;
        }
      }

      setError(null);
      setBusy(tierId + ':nyax');
      try {
        const value = parseUnits(nyaxAmount.toFixed(6), 18);
        const hash = await writeContractAsync({
          abi: erc20Abi,
          address: NYAX_TOKEN,
          functionName: 'transfer',
          args: [USDC_NYAX_RECEIVER, value],
        });
        console.log('NYAX payment tx:', hash);
      } catch (e: any) {
        setError(e?.shortMessage || e?.message || 'NYAX payment failed');
      } finally {
        setBusy(null);
      }
    },
    [chain?.id, isConnected, writeContractAsync, computeNyaxAmount]
  );

  const handlePaySOL = useCallback(
    async (tierId: string, priceUSD: number) => {
      if (!RECEIVER || !SOL_TOKEN) {
        setError('Configuration error');
        return;
      }
      if (!isConnected) {
        try {
          open({ view: 'Connect' });
        } catch {}
        return;
      }
      if (PAYMENT_CHAIN_ID && chain?.id !== PAYMENT_CHAIN_ID) {
        try {
          await switchChainAsync({ chainId: PAYMENT_CHAIN_ID });
        } catch {
          setError('Please switch to the correct chain to pay');
          return;
        }
      }

      setError(null);
      setBusy(tierId + ':sol');
      try {
        const value = parseUnits(priceUSD.toFixed(2), 9);
        const hash = await writeContractAsync({
          abi: erc20Abi,
          address: SOL_TOKEN,
          functionName: 'transfer',
          args: [RECEIVER, value],
        });
        console.log('SOL payment tx:', hash);
      } catch (e: any) {
        setError(e?.shortMessage || e?.message || 'SOL payment failed');
      } finally {
        setBusy(null);
      }
    },
    [chain?.id, isConnected, writeContractAsync]
  );

  return (
    <>
      <PublicHeader />
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          {/* Hero Section */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              {content?.hero?.eyebrow && (
                <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-cyan-300">
                  {content.hero.eyebrow}
                </p>
              )}
              <h1
                className="my-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {content?.hero?.title || 'Corporate Visibility & Media'}
              </h1>
              <p
                className="text-gray-300 mt-4 max-w-2xl text-sm md:text-lg leading-relaxed"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
                dangerouslySetInnerHTML={{
                  __html: (content?.hero?.description || '').replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="text-cyan-400">$1</strong>'
                  ),
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              {chain?.name && (
                <span className="text-xs px-3 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-medium backdrop-blur-sm">
                  {chain.name}
                </span>
              )}
            </div>
          </div>

          {mediaCarouselSlides.length > 0 && (
            <section
              aria-label="Media services showcase"
              className="relative mb-12 h-[50vw] min-h-[320px] max-h-[580px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
            >
              <AnimatePresence
                initial={false}
                custom={carouselIndex > previousCarouselIndex ? 1 : -1}
              >
                <motion.div
                  key={`backdrop-${mediaCarouselSlides[carouselIndex % mediaCarouselSlides.length].src}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.42 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
                  style={{
                    backgroundImage: `url("${mediaCarouselSlides[carouselIndex % mediaCarouselSlides.length].src}")`,
                  }}
                  aria-hidden="true"
                />
              </AnimatePresence>
              <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/75 via-black/10 to-black/20 backdrop-blur-md" />
              <AnimatePresence
                initial={false}
                custom={carouselIndex > previousCarouselIndex ? 1 : -1}
              >
                <motion.div
                  key={mediaCarouselSlides[carouselIndex % mediaCarouselSlides.length].src}
                  initial={{
                    x: carouselIndex > previousCarouselIndex ? '100%' : '-100%',
                    opacity: 0,
                  }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: carouselIndex > previousCarouselIndex ? '-100%' : '100%', opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className="absolute inset-0 z-[2]"
                >
                  <Image
                    src={mediaCarouselSlides[carouselIndex % mediaCarouselSlides.length].src}
                    alt={mediaCarouselSlides[carouselIndex % mediaCarouselSlides.length].title}
                    fill
                    priority={carouselIndex === 0}
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    className="object-contain p-8 sm:p-12"
                  />
                </motion.div>
              </AnimatePresence>
              <button
                type="button"
                onClick={() => changeCarouselSlide(-1)}
                aria-label="Previous media image"
                className="absolute left-0 top-0 z-[4] flex h-full w-12 items-center justify-center bg-black/25 text-2xl text-white transition-colors hover:bg-black/50 sm:w-16"
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => changeCarouselSlide(1)}
                aria-label="Next media image"
                className="absolute right-0 top-0 z-[4] flex h-full w-12 items-center justify-center bg-black/25 text-2xl text-white transition-colors hover:bg-black/50 sm:w-16"
              >
                <FiChevronRight />
              </button>
              <div className="absolute bottom-4 left-14 right-14 z-[5] flex items-end justify-between gap-4 sm:bottom-6 sm:left-20 sm:right-20">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h2
                    key={`title-${mediaCarouselSlides[carouselIndex % mediaCarouselSlides.length].src}`}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-lg sm:px-4 sm:text-xl"
                  >
                    {mediaCarouselSlides[carouselIndex % mediaCarouselSlides.length].title}
                  </motion.h2>
                </AnimatePresence>
                <div className="flex shrink-0 items-center gap-1.5">
                  {mediaCarouselSlides.map((slide, index) => (
                    <button
                      key={slide.src}
                      type="button"
                      onClick={() => {
                        setPreviousCarouselIndex(carouselIndex);
                        setCarouselIndex(index);
                      }}
                      aria-label={`Show ${slide.title}`}
                      aria-current={index === carouselIndex ? 'true' : undefined}
                      className={`h-2.5 rounded-full transition-all ${
                        index === carouselIndex
                          ? 'w-7 bg-white'
                          : 'w-2.5 bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* News Publishing Section */}
          <section aria-labelledby="news-publishing" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
              <h2
                id="news-publishing"
                className="text-3xl font-bold text-white"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {content?.newsPublishing?.sectionTitle}
              </h2>
            </div>
            <p
              className="text-gray-300 mb-6 max-w-3xl"
              style={{
                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
            >
              {content?.newsPublishing?.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content?.newsPublishing?.plans?.map((plan: any) => (
                <article
                  key={plan.id}
                  className="group relative flex min-h-[360px] w-full flex-col rounded-xl border border-slate-300 bg-white p-6 text-slate-950 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl"
                >
                  {plan.isPopular && (
                    <span className="absolute right-5 top-5 rounded-full bg-indigo-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                      {plan.popularBadge}
                    </span>
                  )}
                  <h3
                    className="mb-2 pr-24 text-2xl font-bold text-slate-950"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    {plan.name}
                  </h3>
                  <div
                    className="mb-4 text-5xl font-bold tracking-tight text-cyan-700"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    ${plan.priceUSD}
                    <span className="text-sm font-normal text-slate-500"> / release</span>
                  </div>
                  <p className="mb-5 text-slate-600">{plan.description}</p>
                  <ul className="mb-6 list-none space-y-2 pl-0 text-sm text-slate-700">
                    {plan.features?.map((feature: any, idx: number) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="h-4 w-4 shrink-0 text-cyan-700" aria-hidden="true" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => router.push(plan.ctaLink)}
                    className="mt-auto w-full rounded-lg bg-slate-950 py-4 font-semibold uppercase text-white transition-colors hover:bg-cyan-800"
                  >
                    {plan.ctaText}
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Media Packages */}
          <section aria-labelledby="fintech-media" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
              <h2
                id="fintech-media"
                className="text-3xl font-bold text-white"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {content?.fintechMedia?.sectionTitle}
              </h2>
            </div>
            <h3
              className="text-2xl font-semibold text-white mb-3"
              style={{
                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
            >
              {content?.fintechMedia?.title}
            </h3>
            <p
              className="text-gray-300 mb-6 max-w-3xl"
              style={{
                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
            >
              {content?.fintechMedia?.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content?.fintechMedia?.plans?.map((plan: any) => (
                <article
                  key={plan.id}
                  className="relative flex min-h-[380px] flex-col overflow-hidden rounded-xl border border-slate-300 bg-white text-slate-950 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl"
                >
                  {plan.image && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-slate-200">
                      <Image
                        src={plan.image}
                        alt={plan.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-grow p-8">
                    {plan.tag && (
                      <span className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-800">
                        {plan.tag}
                      </span>
                    )}
                    <h3
                      className="mb-2 text-2xl font-bold text-slate-950"
                      style={{
                        fontFamily:
                          'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                      }}
                    >
                      {plan.name}
                    </h3>
                    <div className="mb-4 text-4xl font-bold tracking-tight text-cyan-700">
                      {plan.price}
                    </div>
                    <p className="mb-5 text-slate-600">{plan.description}</p>
                    {plan.features?.length > 0 && (
                      <ul className="mb-6 list-none space-y-2 pl-0 text-sm text-slate-700">
                        {plan.features.map((feature: any, idx: number) => (
                          <li key={idx} className="flex items-center gap-3">
                            <Check className="h-4 w-4 shrink-0 text-cyan-700" aria-hidden="true" />
                            <span>{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      onClick={() => openInquiry(plan.id, plan.name, plan.price)}
                      className="mt-auto w-full rounded-lg bg-slate-950 py-4 text-center font-semibold uppercase text-white transition-colors hover:bg-cyan-800"
                    >
                      {plan.ctaText}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Roadshows & TV */}
          <section aria-labelledby="corporate-roadshow" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
              <h2
                id="corporate-roadshow"
                className="text-3xl font-bold text-white"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {content?.corporateRoadshow?.sectionTitle}
              </h2>
            </div>
            <h3
              className="text-2xl font-semibold text-white mb-3"
              style={{
                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
            >
              {content?.corporateRoadshow?.title}
            </h3>
            <p
              className="text-gray-300 mb-6 max-w-3xl"
              style={{
                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
            >
              {content?.corporateRoadshow?.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content?.corporateRoadshow?.plans?.map((plan: any) => (
                <article
                  key={plan.id}
                  className="relative flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-slate-300 bg-white text-slate-950 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl"
                >
                  {plan.image && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-slate-200">
                      <Image
                        src={plan.image}
                        alt={plan.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-grow p-6">
                    {plan.tag && (
                      <span className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-800">
                        {plan.tag}
                      </span>
                    )}
                    <h3
                      className="mb-2 text-xl font-bold text-slate-950"
                      style={{
                        fontFamily:
                          'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                      }}
                    >
                      {plan.name}
                    </h3>
                    <div className="mb-4 text-3xl font-bold tracking-tight text-cyan-700">
                      {plan.price}
                    </div>
                    <p className="mb-6 flex-grow text-sm text-slate-600">{plan.description}</p>
                    <button
                      type="button"
                      onClick={() => openInquiry(plan.id, plan.name, plan.price)}
                      className="mt-auto w-full rounded-lg bg-slate-950 py-4 text-center font-semibold uppercase text-white transition-colors hover:bg-cyan-800"
                    >
                      {plan.ctaText}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {content?.corporateRoadshow?.campaign && (
              <div className="mt-8 rounded-xl border border-slate-300 bg-white p-8 text-slate-950 shadow-sm">
                {content.corporateRoadshow.campaign.tag && (
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">
                    {content.corporateRoadshow.campaign.tag}
                  </span>
                )}
                <h3 className="mb-3 mt-2 text-2xl font-bold text-slate-950">
                  {content.corporateRoadshow.campaign.title}
                </h3>
                <p className="mb-6 max-w-3xl text-slate-600">
                  {content.corporateRoadshow.campaign.description}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    openInquiry(
                      'custom-media-campaign',
                      content.corporateRoadshow.campaign.title || 'Custom Media Campaign',
                      'Custom proposal'
                    )
                  }
                  className="inline-flex rounded-lg bg-slate-950 px-6 py-4 font-semibold uppercase text-white transition-colors hover:bg-cyan-800"
                >
                  {content.corporateRoadshow.campaign.ctaText}
                </button>
              </div>
            )}
          </section>

          {/* NyaltxPro Section */}
          <section aria-labelledby="nyaltxpro" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
              <h2
                id="nyaltxpro"
                className="text-3xl font-bold text-white"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {content?.nyaltxPro?.sectionTitle}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group relative flex min-h-[400px] flex-col rounded-xl border border-slate-300 bg-white p-8 text-slate-950 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl">
                <span className="absolute right-6 top-5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                  {content?.nyaltxPro?.badge}
                </span>
                <h3
                  className="mb-2 pr-20 text-2xl font-bold text-slate-950"
                  style={{
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {content?.nyaltxPro?.title}
                </h3>
                <p
                  className="mb-6 text-base text-slate-600"
                  style={{
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {content?.nyaltxPro?.description}
                </p>
                <div className="mb-6">
                  <div
                    className="text-5xl font-bold tracking-tight text-cyan-700"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    ${content?.nyaltxPro?.price}
                    <span className="ml-2 text-sm font-medium text-slate-500">/ year</span>
                  </div>
                </div>
                <ul
                  className="mb-6 list-none space-y-2 pl-0 text-sm text-slate-700"
                  style={{
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {content?.nyaltxPro?.features?.map((feature: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="h-4 w-4 shrink-0 text-cyan-700" aria-hidden="true" />
                      <span
                        dangerouslySetInnerHTML={{
                          __html: feature.text
                            .replace(/—/g, '<span class="text-slate-500 text-xs"> — ')
                            .replace(/default video/g, 'default video</span>'),
                        }}
                      />
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col gap-3">
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/register-token?redirect=pricing/checkout/nyaltxpro&method=paypal`
                      )
                    }
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 text-sm sm:text-base to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a9.124 9.124 0 0 1-.077.437c-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287z" />
                      </svg>
                      Pay ${content?.nyaltxPro?.price} with PayPal
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/register-token?redirect=pricing/checkout/nyaltxpro&method=eth`
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-slate-800 transition-all hover:border-indigo-400 hover:bg-indigo-50 sm:text-base"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Image src="/crypto-icons/color/eth.svg" width={16} height={16} alt="eth" />
                      Pay with ETH
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/register-token?redirect=pricing/checkout/nyaltxpro&method=sol`
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 font-medium text-slate-800 transition-all hover:border-emerald-400 hover:bg-emerald-50"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Image src="/crypto-icons/color/sol.svg" width={16} height={16} alt="sol" />
                      Pay with SOL
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/register-token?redirect=pricing/checkout/nyaltxpro&method=nyax`
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-slate-800 transition-all hover:border-cyan-400 hover:bg-cyan-50 sm:text-base"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Image src="/logo.png" width={16} height={16} alt="nyax" />
                      Pay ${Math.round(content?.nyaltxPro?.price * 0.8)} with NYAX (20% off)
                    </span>
                  </button>
                </div>
                {isPro && (
                  <div
                    className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    {typeof window !== 'undefined' &&
                    (window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1')
                      ? '🚀 Development Mode: Race to Liberty unlocked! '
                      : content?.nyaltxPro?.proMessage.split('Upgrade to Race to Liberty')[0]}
                    <a href="#race" className="underline hover:text-cyan-700 transition-colors">
                      Upgrade to Race to Liberty
                    </a>
                    .
                  </div>
                )}
              </div>

              {/* Race to Liberty banner — image editable in Tina (NyaltxPro → Race to Liberty Banner Image) */}
              <div className="relative min-h-[400px] border border-white/10 rounded-2xl overflow-hidden bg-gray-800/20 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-500">
                <Image
                  src={content?.nyaltxPro?.bannerImage || '/banner23.png'}
                  alt={content?.nyaltxPro?.bannerTitle || 'Race to Liberty'}
                  fill
                  className="object-contain opacity-90"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div
                    className="text-white text-2xl font-bold mb-2"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    {content?.nyaltxPro?.bannerTitle}
                  </div>
                  <p
                    className="text-gray-200 text-base leading-relaxed"
                    style={{
                      fontFamily:
                        'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    {content?.nyaltxPro?.bannerDescription}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Race to Liberty Section */}
          <section id="race" aria-labelledby="race-title" className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="race-title"
                className="text-2xl font-bold text-white"
                style={{
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {content?.raceToLiberty?.sectionTitle}
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-md border border-red-500 bg-red-900/30 text-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content?.raceToLiberty?.tiers?.map((t: any, idx: number) => {
                const ethAmt = ethPrice ? computeEthAmount(t.priceUSD) : null;
                const nyaxAmount = computeNyaxAmount(t.priceUSD);
                const nyaxUSD = t.priceUSD * 0.8;
                return (
                  <div
                    key={t.id}
                    className="group relative flex min-h-[440px] flex-col rounded-xl border border-slate-300 bg-white p-6 text-slate-950 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl"
                  >
                    {t.isPopular && (
                      <span className="absolute right-4 top-4 rounded-full bg-indigo-600 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                        {t.popularBadge}
                      </span>
                    )}
                    <h2
                      className="mb-1 pr-20 text-xl font-bold text-slate-950"
                      style={{
                        fontFamily:
                          'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                      }}
                    >
                      {t.name}
                    </h2>
                    <p
                      className="mb-4 text-sm text-slate-600"
                      style={{
                        fontFamily:
                          'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                      }}
                    >
                      {t.description}
                    </p>
                    <div className="mb-4">
                      <div
                        className="text-4xl font-bold tracking-tight text-cyan-700"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        ${t.priceUSD.toLocaleString()}
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <Image
                            src="/crypto-icons/color/eth.svg"
                            alt="ETH"
                            width={20}
                            height={20}
                            className="opacity-60"
                          />
                          <span>ETH est.: {ethAmt ? `${ethAmt.toFixed(5)} ETH` : '—'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image
                            src="/crypto-icons/color/sol.svg"
                            alt="SOL"
                            width={20}
                            height={20}
                            className="opacity-60"
                          />
                          <span>SOL: ${t.priceUSD.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image
                            src="/logo.png"
                            alt="NYAX"
                            width={20}
                            height={20}
                            className="opacity-60"
                          />
                          <span>
                            NYAX:{' '}
                            {nyaxAmount
                              ? `${nyaxAmount.toFixed(2)} NYAX`
                              : `${nyaxUSD.toFixed(2)} USD`}{' '}
                            (−20%)
                          </span>
                        </div>
                      </div>
                    </div>
                    <ul
                      className="mb-4 list-none space-y-2 pl-0 text-sm text-slate-700"
                      style={{
                        fontFamily:
                          'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                      }}
                    >
                      {t.features?.map((feature: any, fIdx: number) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700"
                            aria-hidden="true"
                          />
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>

                    {error && busy?.startsWith(t.id) && (
                      <div className="text-red-400 text-sm mb-2">{error}</div>
                    )}

                    <div className="mt-auto flex flex-col gap-2">
                      <button
                        onClick={() => router.push(`/pricing/race-to-liberty/${t.id}`)}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium hover:from-cyan-700 hover:to-indigo-700 disabled:opacity-50 transition-all transform hover:scale-105"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        <span className="inline-flex items-center gap-2">{t.buttonText}</span>
                      </button>
                      <div
                        className="mt-2 text-center text-xs text-slate-500"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        {t.buttonSubtext}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Boost Packs Section */}
          <section id="boost-packs" aria-labelledby="boost-packs-title" className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  id="boost-packs-title"
                  className="text-2xl font-bold text-white"
                  style={{
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {content?.boostPacks?.sectionTitle}
                </h2>
                <p
                  className="text-gray-300 mt-2"
                  style={{
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {content?.boostPacks?.description}
                </p>
                <p
                  className="text-sm text-cyan-400 mt-1"
                  style={{
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  {content?.boostPacks?.subDescription}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {content?.boostPacks?.packs?.map((pack: any, idx: number) => {
                const ethAmt = ethPrice ? computeEthAmount(pack.priceUSD) : null;
                const nyaxAmount = computeNyaxAmount(pack.priceUSD);
                const nyaxUSD = pack.priceUSD * 0.8;
                return (
                  <div
                    key={pack.id}
                    className="group relative flex min-h-[380px] flex-col rounded-xl border border-slate-300 bg-white p-6 text-slate-950 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl"
                  >
                    {pack.isPopular && (
                      <span className="absolute right-4 top-4 rounded-full bg-indigo-600 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                        {pack.popularBadge}
                      </span>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{pack.icon}</span>
                      <h3
                        className="text-lg font-semibold"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        {pack.name}
                      </h3>
                    </div>

                    <div className="mb-4">
                      <div
                        className="text-2xl font-bold text-cyan-700"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        {pack.points} pts
                      </div>
                      <div
                        className="text-4xl font-bold tracking-tight text-slate-950"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        ${pack.priceUSD.toLocaleString()}
                      </div>
                    </div>

                    <p
                      className="mb-4 flex-grow text-sm text-slate-600"
                      style={{
                        fontFamily:
                          'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                      }}
                    >
                      {pack.description}
                    </p>

                    <div className="mb-4 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/crypto-icons/color/eth.svg"
                          alt="ETH"
                          width={16}
                          height={16}
                          className="opacity-60"
                        />
                        <span>ETH: {ethAmt ? `${ethAmt.toFixed(5)} ETH` : '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image
                          src="/crypto-icons/color/usdc.svg"
                          alt="USDC"
                          width={16}
                          height={16}
                          className="opacity-60"
                        />
                        <span>USDC: ${pack.priceUSD.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image
                          src="/logo.png"
                          alt="NYAX"
                          width={16}
                          height={16}
                          className="opacity-60"
                        />
                        <span>
                          NYAX:{' '}
                          {nyaxAmount
                            ? `${nyaxAmount.toFixed(2)} NYAX`
                            : `${nyaxUSD.toFixed(2)} USD`}{' '}
                          + bonus pts
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-2">
                      <button
                        disabled={busy !== null}
                        onClick={() => router.push(`/pricing/boost-pack/${pack.id}`)}
                        className="w-full rounded-lg bg-slate-950 py-4 font-semibold uppercase text-white transition-colors hover:bg-cyan-800 disabled:opacity-50"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        {pack.buttonText}
                      </button>

                      <div
                        className="text-center text-xs text-slate-500"
                        style={{
                          fontFamily:
                            'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        {pack.buttonSubtext}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <div
            className="mt-10 text-sm text-gray-400"
            style={{
              fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            }}
          >
            <p>{content?.footer?.paymentMethods}</p>
            <p className="mt-1">{content?.footer?.technicalNote}</p>
            {content?.footer?.networkFees && <p className="mt-1">{content.footer.networkFees}</p>}
            <p className="mt-1">{content?.footer?.paypalNote}</p>
          </div>
        </div>
      </div>
      {inquiryService && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget) closeInquiry();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pricing-inquiry-title"
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101a29] p-6 text-white shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={closeInquiry}
              aria-label="Close inquiry form"
              className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            {inquirySuccess ? (
              <div className="py-8 text-center">
                <h2 id="pricing-inquiry-title" className="mb-3 text-2xl font-semibold">
                  Request received
                </h2>
                <p className="mb-6 text-gray-300">
                  Thank you. Our media team will contact you about {inquiryService.name}.
                </p>
                <button
                  type="button"
                  onClick={closeInquiry}
                  className="rounded-lg bg-cyan-600 px-5 py-2.5 font-semibold hover:bg-cyan-500"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Media inquiry
                </p>
                <h2 id="pricing-inquiry-title" className="mb-1 pr-8 text-2xl font-semibold">
                  {inquiryService.name}
                </h2>
                <p className="mb-6 text-gray-400">{inquiryService.price}</p>
                <form onSubmit={submitInquiry} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm text-gray-300">
                      Full name *
                      <input
                        required
                        maxLength={120}
                        autoComplete="name"
                        value={inquiryForm.name}
                        onChange={event =>
                          setInquiryForm({ ...inquiryForm, name: event.target.value })
                        }
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="block text-sm text-gray-300">
                      Company / project name *
                      <input
                        required
                        maxLength={160}
                        autoComplete="organization"
                        value={inquiryForm.companyName}
                        onChange={event =>
                          setInquiryForm({ ...inquiryForm, companyName: event.target.value })
                        }
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="block text-sm text-gray-300 sm:col-span-2">
                      Contact email *
                      <input
                        required
                        type="email"
                        maxLength={254}
                        autoComplete="email"
                        value={inquiryForm.email}
                        onChange={event =>
                          setInquiryForm({ ...inquiryForm, email: event.target.value })
                        }
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="block text-sm text-gray-300">
                      City *
                      <input
                        required
                        maxLength={100}
                        autoComplete="address-level2"
                        value={inquiryForm.city}
                        onChange={event =>
                          setInquiryForm({ ...inquiryForm, city: event.target.value })
                        }
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="block text-sm text-gray-300">
                      State / region *
                      <input
                        required
                        maxLength={100}
                        autoComplete="address-level1"
                        value={inquiryForm.state}
                        onChange={event =>
                          setInquiryForm({ ...inquiryForm, state: event.target.value })
                        }
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                  </div>
                  <label className="block text-sm text-gray-300">
                    What would you like to discuss? (optional)
                    <textarea
                      maxLength={2000}
                      rows={3}
                      value={inquiryForm.message}
                      onChange={event =>
                        setInquiryForm({ ...inquiryForm, message: event.target.value })
                      }
                      className="mt-1.5 w-full resize-y rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                    />
                  </label>
                  {inquiryError && (
                    <p role="alert" className="text-sm text-red-300">
                      {inquiryError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-5 py-3 font-semibold transition hover:from-cyan-500 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {inquirySubmitting ? 'Submitting…' : 'Send inquiry'}
                  </button>
                  <p className="text-xs text-gray-500">
                    Your details will be shared with our media team so they can follow up on your
                    request.
                  </p>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
};
