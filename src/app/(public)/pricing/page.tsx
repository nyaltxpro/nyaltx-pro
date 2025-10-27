'use client';

import PublicHeader from '@/components/PublicHeader';
import { getNYAXPriceUSD } from '@/utils/nyaxPriceApi';
import { useAppKit } from '@reown/appkit/react';
import { TokenETH } from '@web3icons/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useTina } from 'tinacms/dist/react';
import { erc20Abi, parseEther, parseUnits } from 'viem';
import { useAccount, useSendTransaction, useSwitchChain, useWriteContract } from 'wagmi';
import { client } from '../../../../tina/__generated__/client';

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
  } catch { }

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
  } catch { }

  try {
    const res = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const price = parseFloat(data?.data?.amount);
      if (!Number.isNaN(price) && price > 0) return price;
    }
  } catch { }

  return 0;
}

export default function PricingPage(props: any) {
  // Use Tina CMS
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const content = data?.pricing || props.data?.pricing;

  const { isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const isPro = useIsPro();
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [nyaxPrice, setNyaxPrice] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { open } = useAppKit();
  const router = useRouter();

  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    fetchETHPriceUSD()
      .then(setEthPrice)
      .catch(() => setEthPrice(null));

    getNYAXPriceUSD()
      .then(setNyaxPrice)
      .catch(() => setNyaxPrice(null));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
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
        } catch { }
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
        } catch { }
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
        } catch { }
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
          args: [RECEIVER, value],
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
        } catch { }
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
              <h1 className="text-2xl md:text-7xl font-semibold tracking-tight bg-clip-text my-6 p-3 text-transparent bg-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {content?.hero?.title}
              </h1>
              <p className="text-gray-300 mt-4 max-w-2xl text-sm md:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }} dangerouslySetInnerHTML={{ __html: content?.hero?.description.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400">$1</strong>') }} />
            </div>
            <div className="flex items-center gap-3">
              {chain?.name && (
                <span className="text-xs px-3 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-medium backdrop-blur-sm">
                  {chain.name}
                </span>
              )}
            </div>
          </div>

          {/* NyaltxPro Section */}
          <section aria-labelledby="nyaltxpro" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
              <h2 id="nyaltxpro" className="text-3xl font-bold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                {content?.nyaltxPro?.sectionTitle}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group relative bg-gray-800/40 backdrop-blur-lg border border-gray-700/20 rounded-2xl p-8 shadow-2xl flex flex-col min-h-[400px] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_0_50px_-10px_rgba(6,182,212,0.5)] hover:border-cyan-500/30">
                <span className="absolute -top-3 right-6 text-xs uppercase tracking-wider px-3 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg">
                  {content?.nyaltxPro?.badge}
                </span>
                <h3 className="text-2xl font-semibold mb-2 text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {content?.nyaltxPro?.title}
                </h3>
                <p className="text-gray-300 text-base mb-6" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {content?.nyaltxPro?.description}
                </p>
                <div className="mb-6">
                  <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    ${content?.nyaltxPro?.price}
                  </div>
                </div>
                <ul className="text-sm text-gray-300 space-y-2 mb-6 list-none pl-0" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {content?.nyaltxPro?.features?.map((feature: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></span>
                      <span dangerouslySetInnerHTML={{ __html: feature.text.replace(/—/g, '<span class="text-gray-400 text-xs"> — ').replace(/default video/g, 'default video</span>') }} />
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col gap-3">
                  <button
                    onClick={() => router.push(`/dashboard/register-token?redirect=pricing/checkout/nyaltxpro&method=paypal`)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 text-sm sm:text-base to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a9.124 9.124 0 0 1-.077.437c-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287z" />
                      </svg>
                      Register Token & Pay ${content?.nyaltxPro?.price} with PayPal
                    </span>
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/register-token?redirect=pricing/checkout/nyaltxpro&method=eth`)}
                    className="w-full py-3 rounded-xl border text-sm sm:text-base border-gray-600/50 bg-gray-800/30 text-white font-light hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all duration-300"
                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Image src="/crypto-icons/color/eth.svg" width={16} height={16} alt="eth" />
                      Register Token & Pay ${content?.nyaltxPro?.price} with ETH
                    </span>
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/register-token?redirect=pricing/checkout/nyaltxpro&method=sol`)}
                    className="w-full py-3 rounded-xl border border-gray-600/50 bg-gray-800/30 text-white font-light hover:bg-emerald-600/20 hover:border-emerald-500/50 transition-all duration-300"
                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Image src="/crypto-icons/color/sol.svg" width={16} height={16} alt="sol" />
                      Register Token & Pay ${content?.nyaltxPro?.price} with SOL
                    </span>
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/register-token?redirect=pricing/checkout/nyaltxpro&method=nyax`)}
                    className="w-full py-3 rounded-xl border text-sm sm:text-base border-gray-600/50 bg-gray-800/30 text-white font-light hover:bg-cyan-600/20 hover:border-cyan-500/50 transition-all duration-300"
                    style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Image src="/logo.png" width={16} height={16} alt="nyax" />
                      Register Token & Pay ${Math.round(content?.nyaltxPro?.price * 0.8)} with NYAX (20% off)
                    </span>
                  </button>
                </div>
                {isPro && (
                  <div className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-sm text-cyan-300" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                      ? '🚀 Development Mode: Race to Liberty unlocked! '
                      : content?.nyaltxPro?.proMessage.split('Upgrade to Race to Liberty')[0]}
                    <a href="#race" className="underline hover:text-cyan-200 transition-colors">
                      Upgrade to Race to Liberty
                    </a>.
                  </div>
                )}
              </div>

              {/* Banner */}
              <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-gray-800/20 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-500">
                <Image src="/banner23.png" alt="Race to Liberty" fill className="object-contain opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-white text-2xl font-bold mb-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    {content?.nyaltxPro?.bannerTitle}
                  </div>
                  <p className="text-gray-200 text-base leading-relaxed" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    {content?.nyaltxPro?.bannerDescription}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Race to Liberty Section */}
          <section id="race" aria-labelledby="race-title" className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 id="race-title" className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
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
                    className={`group relative border border-white/10 rounded-2xl p-5 bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md flex flex-col min-h-[440px] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                    style={{ transitionDelay: mounted ? (`${idx * 80}ms` as any) : undefined }}
                  >
                    {t.isPopular && (
                      <span className="absolute -top-2 right-4 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-cyan-600 text-black font-bold shadow shadow-cyan-500/30">
                        {t.popularBadge}
                      </span>
                    )}
                    <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      {t.name}
                    </h2>
                    <p className="text-gray-400 text-sm mb-4" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      {t.description}
                    </p>
                    <div className="mb-4">
                      <div className="text-3xl font-bold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        ${t.priceUSD.toLocaleString()}
                      </div>
                      <div className="mt-1 grid grid-cols-1 gap-1 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <TokenETH />
                          <span>ETH est.: {ethAmt ? `${ethAmt.toFixed(5)} ETH` : '—'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image src="/crypto-icons/color/sol.svg" alt="SOL" width={20} height={20} className="opacity-60" />
                          <span>SOL: ${t.priceUSD.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image src="/logo.png" alt="NYAX" width={20} height={20} className="opacity-60" />
                          <span>NYAX: {nyaxAmount ? `${nyaxAmount.toFixed(2)} NYAX` : `${nyaxUSD.toFixed(2)} USD`} (−20%)</span>
                        </div>
                      </div>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1 mb-4 list-disc pl-5" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      {t.features?.map((feature: any, fIdx: number) => (
                        <li key={fIdx}>{feature.text}</li>
                      ))}
                    </ul>

                    {error && busy?.startsWith(t.id) && (
                      <div className="text-red-400 text-sm mb-2">{error}</div>
                    )}

                    <div className="mt-auto flex flex-col gap-2">
                      <button
                        onClick={() => router.push(`/pricing/race-to-liberty/${t.id}`)}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium hover:from-cyan-700 hover:to-indigo-700 disabled:opacity-50 transition-all transform hover:scale-105"
                        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                      >
                        <span className="inline-flex items-center gap-2">{t.buttonText}</span>
                      </button>
                      <div className="text-xs text-center text-gray-400 mt-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
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
                <h2 id="boost-packs-title" className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {content?.boostPacks?.sectionTitle}
                </h2>
                <p className="text-gray-300 mt-2" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {content?.boostPacks?.description}
                </p>
                <p className="text-sm text-cyan-400 mt-1" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
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
                    className={`group relative border border-white/10 rounded-2xl p-5 bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur-md flex flex-col min-h-[380px] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.4)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                    style={{ transitionDelay: mounted ? (`${idx * 100}ms` as any) : undefined }}
                  >
                    {pack.isPopular && (
                      <span className="absolute -top-2 right-4 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-600 text-black font-bold shadow shadow-emerald-500/30">
                        {pack.popularBadge}
                      </span>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{pack.icon}</span>
                      <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {pack.name}
                      </h3>
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-bold text-emerald-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {pack.points} pts
                      </div>
                      <div className="text-3xl font-bold" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        ${pack.priceUSD.toLocaleString()}
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 flex-grow" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      {pack.description}
                    </p>

                    <div className="mb-4 text-xs text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <TokenETH className="w-4 h-4" />
                        <span>ETH: {ethAmt ? `${ethAmt.toFixed(5)} ETH` : '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image src="/crypto-icons/color/usdt.svg" alt="USDC" width={16} height={16} className="opacity-60" />
                        <span>USDC: ${pack.priceUSD.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="NYAX" width={16} height={16} className="opacity-60" />
                        <span>NYAX: {nyaxAmount ? `${nyaxAmount.toFixed(2)} NYAX` : `${nyaxUSD.toFixed(2)} USD`} + bonus pts</span>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-2">
                      <button
                        disabled={busy !== null}
                        onClick={() => router.push(`/pricing/boost-pack/${pack.id}`)}
                        className="w-full py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
                      >
                        {pack.buttonText}
                      </button>

                      <div className="text-center text-xs text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        {pack.buttonSubtext}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <div className="mt-10 text-sm text-gray-400" style={{ fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            <p>{content?.footer?.paymentMethods}</p>
            <p className="mt-1">{content?.footer?.technicalNote}</p>
            <p className="mt-1">{content?.footer?.networkFees}</p>
            <p className="mt-1">{content?.footer?.paypalNote}</p>
          </div>
        </div>
      </div>
    </>
  );
}

// Server-side data fetching for Tina
export async function getStaticProps() {
  const tinaProps = await client.queries.pricing({ relativePath: 'pricing.json' });
  return {
    props: {
      ...tinaProps,
    },
  };
}