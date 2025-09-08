"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import PublicHeader from '@/components/PublicHeader';

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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <motion.div className="max-w-3xl" variants={fadeUp}>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Discover. Track. Grow your token with NYALTX
            </h1>
            <p className="mt-4 text-gray-300 max-w-2xl">
              Real-time insights, curated listings, and promotional placements to help your project reach more holders across chains.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-lg bg-cyan-500 px-5 py-2.5 font-medium text-black hover:bg-cyan-400">
                Explore Dashboard
              </Link>
              <Link href="/pricing" className="rounded-lg border border-gray-700 px-5 py-2.5 font-medium text-white hover:bg-gray-800">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* 2) Stats band */}
      <motion.section className="border-y border-gray-800 bg-black/30" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-sm" variants={fadeUp}>
          <Stat label="Networks" value="132" />
          <Stat label="Dexes" value="21,586" />
          <Stat label="Pools" value="19,440,364" />
          <Stat label="Tokens" value="29,055,602" />
          <Stat label="Next token burn" value="1,897,863 DXT" highlight />
        </motion.div>
      </motion.section>

      {/* 3) Features */}
      <motion.section className="mx-auto max-w-7xl px-6 py-16 md:py-20" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.h2 className="text-2xl md:text-3xl font-bold" variants={fadeUp}>Why NYALTX</motion.h2>
        <motion.p className="mt-2 text-gray-300 max-w-2xl" variants={fadeUp}>A modern stack for token discovery, analytics, and promotion.</motion.p>
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

      {/* 4) How it works */}
      <motion.section className="mx-auto max-w-7xl px-6 py-16 md:py-20" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.h2 className="text-2xl md:text-3xl font-bold" variants={fadeUp}>How it works</motion.h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={fadeUp}><Step index={1} title="Sign up for NYALTX Pro" desc="Create your Pro account to unlock listings and placements." /></motion.div>
          <motion.div variants={fadeUp}><Step index={2} title="Choose a tier" desc="Pick Paddle, Motor, or Helicopter depending on your goals." /></motion.div>
          <motion.div variants={fadeUp}><Step index={3} title="Track and grow" desc="Monitor stats, engage with holders, and scale your reach." /></motion.div>
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

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className={`text-lg font-semibold ${highlight ? 'text-primary' : ''}`}>{value}</span>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900/60 to-black/20 p-5">
      <div className="text-lg font-semibold">{title}</div>
      <p className="mt-1 text-gray-300 text-sm">{desc}</p>
    </div>
  );
}

function Step({ index, title, desc }: { index: number; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-black/30 p-5">
      <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-black text-sm font-bold">{index}</div>
      <div className="mt-2 text-lg font-semibold">{title}</div>
      <p className="mt-1 text-gray-300 text-sm">{desc}</p>
    </div>
  );
}
