"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, animate, useInView } from 'framer-motion';
// Using named icons from @web3icons/react
import type { Variants } from 'framer-motion';
import PublicHeader from '@/components/PublicHeader';
import Faq from '@/components/Faq';
import { ExchangeIcon ,NetworkIcon,TokenIcon,WalletIcon } from '@web3icons/react'
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function Page() {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      {/* 1) Hero */}
      <motion.section className="relative overflow-hidden" variants={container} initial="hidden" animate="show">
        {/* Web3 aurora + grid background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute top-40 right-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_95%,rgba(255,255,255,0.04)_95%,rgba(255,255,255,0.04)_100%),linear-gradient(to_bottom,transparent_0,transparent_95%,rgba(255,255,255,0.04)_95%,rgba(255,255,255,0.04)_100%)] bg-[length:22px_22px] opacity-30" />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
            <motion.div className="max-w-3xl" variants={fadeUp}>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
                Discover. Track. Grow your token with NYALTX
              </h1>
              <p className="mt-4 text-gray-300/90 max-w-2xl">
                Real-time insights, curated listings, and promotional placements to help your project reach more holders across chains.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard" className="rounded-full bg-cyan-500/90 px-5 py-2.5 font-medium text-black hover:bg-cyan-400 transition-colors">
                  Explore Dashboard
                </Link>
                <Link href="/pricing" className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 font-medium text-white hover:bg-white/10 transition-colors">
                  View Pricing
                </Link>
              </div>
              {/* Chains / badges */}
              <div className="mt-6 flex items-center gap-3 text-xs text-gray-400">
                <span className="px-2 py-1 rounded-full border border-white/10 bg-black/30">EVM • Multi-chain</span>
                <span className="px-2 py-1 rounded-full border border-white/10 bg-black/30">Web3-native</span>
              </div>
            </motion.div>
            <motion.div className="flex justify-center md:justify-center" variants={scaleIn}>
              <div className="relative">
                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 blur-2xl" />
                <Image
                  src="/hero2.png"
                  alt="NYALTX Logo"
                  width={500}
                  height={500}
                  priority
                  className="relative h-auto w-[580px]   "
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 2.5) Chains / partners marquee */}
      <motion.section className="mx-auto max-w-7xl px-6 py-10" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        {/* <motion.p className="text-center text-sm text-gray-400 mb-4" variants={fadeUp}>Trusted by builders across chains</motion.p> */}
        <div className="relative overflow-hidden">
          <div className="flex items-center gap-10 animate-[marquee_28s_linear_infinite] opacity-80 hover:opacity-100">
            {["Ethereum","Polygon","Optimism","Base","Arbitrum","Scroll","Fantom","Linea","Mantle"].map((name, i) => (
              <div key={i} className="flex items-center gap-2 min-w-[110px]">
                <CryptoIcon name={name} size={28} />
                <span className="text-xs text-gray-300/80">{name}</span>
              </div>
            ))}
            {["Ethereum","Polygon","Optimism","Base","Arbitrum","Scroll","Fantom","Linea","Mantle"].map((name, i) => (
              <div key={`dup-${i}`} className="flex items-center gap-2 min-w-[110px]">
                <CryptoIcon name={name} size={28} />
                <span className="text-xs text-gray-300/80">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        `}</style>
      </motion.section>

      {/* 2) Stats band */}
      <motion.section className="border-y border-white/10 bg-white/[0.03] backdrop-blur" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm" variants={fadeUp}>
          <Stat label="Networks" value={132} />
          <Stat label="Dexes" value={21586} />
          <Stat label="Pools" value={19440364} />
          <Stat label="Tokens" value={29055602} />
          <Stat label="Next token burn" value={18973} suffix=" NYAX" highlight />
        </motion.div>
      </motion.section>

      {/* 3) Features */}
      <motion.section className="mx-auto max-w-7xl px-6 py-16 md:py-20" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400" variants={fadeUp}>Why NYALTX</motion.h2>
        <motion.p className="mt-2 text-gray-300/90 max-w-2xl" variants={fadeUp}>A modern stack for token discovery, analytics, and promotion.</motion.p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={scaleIn}>
            <Feature
              title="Multi-chain coverage"
              desc="Follow activity across popular EVM networks and beyond, with fast updates."
            />
          </motion.div>
          <motion.div variants={scaleIn}>
            <Feature
              title="Promotional placements"
              desc="Race to Liberty campaign placements, podcast mentions, and homepage features."
            />
          </motion.div>
          <motion.div variants={scaleIn}>
            <Feature
              title="Flexible payments"
              desc="Pay with cards (Stripe), ETH, or NYAX with a 20% discount on token payments."
            />
          </motion.div>
        </div>
      </motion.section>

      {/* 3.3) Popular assets */}
      {/* <motion.section className="mx-auto max-w-7xl px-6 py-16 md:py-20" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400" variants={fadeUp}>Popular assets</motion.h2>
        <motion.p className="mt-2 text-gray-300/90 max-w-2xl" variants={fadeUp}>Top tokens supported out of the box.</motion.p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {['Bitcoin','Ethereum','USDC','USDT','DAI','Solana'].map((name, i) => (
            <motion.div key={i} variants={scaleIn} className="group relative border border-white/10 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 backdrop-blur-md flex flex-col items-center justify-center gap-2 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.35)]">
              <CryptoIcon name={name} kind="token" size={36} />
              <div className="text-xs text-gray-300/90">{name}</div>
              <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/15 transition-colors" />
            </motion.div>
          ))}
        </div>
      </motion.section> */}

      {/* 3.4) Popular wallets */}
      <motion.section className="mx-auto max-w-7xl px-6 py-10" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400" variants={fadeUp}>Popular wallets</motion.h2>
        <motion.p className="mt-2 text-gray-300/90 max-w-2xl" variants={fadeUp}>Connect seamlessly with leading wallets.</motion.p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            'MetaMask',
            'Coinbase Wallet',
            'Trust Wallet',
            'Rainbow',
            'Phantom',
            'OKX Wallet',
          ].map((name, i) => (
            <motion.div key={i} variants={scaleIn} className="group relative border border-white/10 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] p-4 backdrop-blur-md flex flex-col items-center justify-center gap-2 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.35)]">
              <WalletIcon name={name} variant="branded" size="36" />
              <div className="text-xs text-gray-300/90">{name}</div>
              <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/15 transition-colors" />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 4) How it works */}
      <motion.section className="mx-auto max-w-7xl px-6 py-16 md:py-20" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.h2 className="text-2xl md:text-3xl font-bold" variants={fadeUp}>How it works</motion.h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={fadeUp}><Step index={1} title="Sign up for NYALTX Pro" desc="Create your Pro account to unlock listings and placements." /></motion.div>
          <motion.div variants={fadeUp}><Step index={2} title="Choose a tier" desc="Pick Paddle, Motor, or Helicopter depending on your goals." /></motion.div>
          <motion.div variants={fadeUp}><Step index={3} title="Track and grow" desc="Monitor stats, engage with holders, and scale your reach." /></motion.div>
        </div>
      </motion.section>

      {/* 4.5) Testimonials */}
      <motion.section className="mx-auto max-w-7xl px-6 py-16 md:py-20" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400" variants={fadeUp}>What builders say</motion.h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{
            q: 'NYALTX helped us boost discovery during launch week.', a: '— Team Atlas'
          }, {
            q: 'The Race to Liberty brought real traffic and holders.', a: '— Liberty Labs'
          }, {
            q: 'Smooth UX and flexible payments — exactly what we needed.', a: '— DeltaX'
          }].map((t, i) => (
            <motion.div key={i} variants={scaleIn} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
              <p className="text-gray-200">“{t.q}”</p>
              <p className="mt-3 text-sm text-gray-400">{t.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 4.8) FAQ */}
      <motion.section className="mx-auto max-w-7xl px-6 py-10" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.h2 className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400" variants={fadeUp}>FAQ</motion.h2>
        <Faq className="bg-white/[0.03] border border-white/10" />
      </motion.section>

      {/* 4.9) Ecosystem integrations */}
      <motion.section className="mx-auto max-w-7xl px-6 py-16 md:py-20" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400" variants={fadeUp}>Ecosystem integrations</motion.h2>
        <motion.p className="mt-2 text-gray-300/90 max-w-2xl" variants={fadeUp}>We surface pricing and pairs data from leading DEXs and networks.</motion.p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { name: 'Uniswap', fallback: 'uniswap', label: 'Uniswap' },
            { name: 'Binance', fallback: 'binance', label: 'Binance' },
            { name: 'Sushi Swap', fallback: 'sushiswap', label: 'Sushi Swap' },
            { name: 'Pancake Swap', fallback: 'pancakeswap', label: 'PancakeSwap' },
            { name: 'Gate Io', fallback: 'raydium', label: 'Gate Io' },
            { name: 'Crypto.com', fallback: 'base', label: 'Crypto.com' },
          ].map((it, i) => (
            <motion.div key={i} variants={scaleIn} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] p-4 backdrop-blur text-center">
              <div className="flex flex-col items-center gap-2">
                <CryptoIcon name={it.name} size={36} kind={'exchange'} fallback={it.fallback} />
                <span className="text-xs text-gray-300/80">{it.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 4.95) Built for Web3 */}
      <motion.section className="mx-auto max-w-7xl px-6 py-16 md:py-20" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400" variants={fadeUp}>Built for Web3</motion.h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { t: 'Non-custodial', d: 'You keep control. Connect your wallet and transact directly on-chain.' },
            { t: 'Multi-network', d: 'Ethereum-first with expanding L2 and multi-chain coverage.' },
            { t: 'Dev-friendly', d: 'Modular architecture and API pathways planned for partners.' }
          ].map((x, i) => (
            <motion.div key={i} variants={scaleIn} className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] p-5 backdrop-blur-md">
              <div className="text-lg font-semibold">{x.t}</div>
              <p className="mt-1 text-gray-300/90 text-sm">{x.d}</p>
              <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/15 transition-colors" />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 5) Final CTA */}
      <motion.section className="mx-auto max-w-7xl px-6 py-16 md:py-20" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" variants={scaleIn}>
          <div>
            <h3 className="text-xl md:text-2xl font-semibold">Ready to get visibility?</h3>
            <p className="text-gray-300">Start with NYALTX Pro, then choose a promotional tier that fits your roadmap.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/pro-signup" className="rounded-lg bg-white px-4 py-2 font-medium text-black hover:opacity-90">Get NYALTX Pro</Link>
            <Link href="/pricing" className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-500">See Pricing</Link>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}

function CryptoIcon({ name, size = 32, fallback, kind }: { name: string; size?: number; fallback?: string; kind?: 'token' | 'network' | 'exchange' }) {
  const n = name.trim();
  const lower = n.toLowerCase();

  // Heuristics to choose the right icon type if not provided
  const exchanges = new Set(['uniswap', 'uniswap v2', 'uniswap v3', 'sushi', 'sushiswap', 'pancake', 'pancakeswap', 'raydium', '1inch']);
  const networks = new Set(['ethereum', 'polygon', 'optimism', 'base', 'arbitrum', 'scroll', 'fantom', 'linea', 'mantle', 'solana']);
  const tokens = new Set(['bitcoin', 'eth', 'ethereum', 'usdc', 'usdt', 'dai', 'solana', 'sol', 'matic', 'arb']);

  const type: 'token' | 'network' | 'exchange' = kind
    ? kind
    : exchanges.has(lower)
      ? 'exchange'
      : networks.has(lower)
        ? 'network'
        : 'token';

  try {
    if (type === 'exchange') return <ExchangeIcon name={n} variant="branded" size={String(size)} />;
    if (type === 'network') return <NetworkIcon name={n} variant="branded" size={String(size)} />;
    return <TokenIcon name={n} variant="branded" size={String(size)} />;
  } catch {}

  // Fallback to local svg asset if component not found
  const fallbackSrc = `/${(fallback || name).toLowerCase()}.svg`;
  return <Image src={fallbackSrc} alt={name} width={size} height={size} className="opacity-90" />;
}

function Stat({ label, value, suffix = '', highlight }: { label: string; value: number; suffix?: string; highlight?: boolean }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });
  const [display, setDisplay] = React.useState('0');
  const [color, setColor] = React.useState<string | undefined>(undefined);

  const formatNumber = (n: number) => n.toLocaleString();

  React.useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      onUpdate: latest => setDisplay(formatNumber(Math.floor(latest)))
    });
    const colorAnim = animate('#9ca3af', '#ffffff', {
      duration: 1.5,
      onUpdate: latest => setColor(latest as string)
    });
    return () => {
      controls.stop();
      colorAnim.stop();
    };
  }, [inView, value]);

  return (
    <div ref={ref} className="p-1">
      <span className="text-gray-400 text-xs">{label}</span>
      <div className="mt-1 text-2xl md:text-3xl font-extrabold" style={{ color: color }}>
        <span className={`${highlight ? 'text-cyan-400' : ''}`}>{display}{suffix}</span>
      </div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] p-5 backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.35)]">
      <div className="text-lg font-semibold">{title}</div>
      <p className="mt-1 text-gray-300/90 text-sm">{desc}</p>
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/15 transition-colors" />
    </div>
  );
}

function Step({ index, title, desc }: { index: number; title: string; desc: string }) {
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.35)]">
      <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-black text-sm font-bold">{index}</div>
      <div className="mt-2 text-lg font-semibold">{title}</div>
      <p className="mt-1 text-gray-300/90 text-sm">{desc}</p>
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/15 transition-colors" />
    </div>
  );
}
