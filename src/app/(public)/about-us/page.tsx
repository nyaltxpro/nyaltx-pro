'use client';

import React from 'react';
import Image from 'next/image';
import PublicHeader from '@/components/PublicHeader';
import { motion } from 'framer-motion';
import { FiUsers, FiTarget, FiCpu } from 'react-icons/fi';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <PublicHeader />

      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_-100px,rgba(56,189,248,0.12),rgba(67,56,202,0)_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_80%_10%,rgba(99,102,241,0.18),rgba(14,165,233,0)_60%)]" />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start gap-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
            <FiUsers className="h-4 w-4 text-cyan-300" />
            <span>About NYALTX</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Building the future of DeFi UX
            </span>
          </h1>
          <p className="max-w-3xl text-white/70">
            We make crypto trading accessible, transparent, and efficient with data-driven aggregation and a design-first approach.
          </p>
        </motion.div>
      </section>

      <main className="container mx-auto px-4 pb-20 space-y-8">
        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 blur-[10px]" />
          <div className="relative p-6 md:p-10">
            <div className="mb-6 inline-flex items-center gap-2 text-sm">
              <FiTarget className="h-5 w-5 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Our Mission</h2>
            </div>
            <p className="mb-4">
              At NYALTX, we're on a mission to make cryptocurrency trading accessible, transparent, and efficient for everyone. 
              We believe in the power of decentralized finance to transform the global economy and create new opportunities for people worldwide.
            </p>
            <p>
              Our platform aggregates data from multiple decentralized exchanges to provide you with the best possible trading experience, 
              ensuring you always get the best rates and lowest fees when swapping your digital assets.
            </p>
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 blur-[10px]" />
          <div className="relative p-6 md:p-10">
            <div className="mb-6 inline-flex items-center gap-2 text-sm">
              <FiUsers className="h-5 w-5 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Our Team</h2>
            </div>
            <p className="mb-6">
              NYALTX was founded by a team of blockchain enthusiasts, developers, and financial experts who saw the need for a more 
              user-friendly approach to DeFi. Our diverse team brings together expertise from traditional finance, blockchain technology, 
              and user experience design.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-lg p-4 text-center border border-white/10 bg-white/5">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden ring-1 ring-white/10">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
                </div>
                <h3 className="font-semibold text-xl">Alex Chen</h3>
                <p className="text-white/70">Co-Founder & CEO</p>
              </div>
              <div className="rounded-lg p-4 text-center border border-white/10 bg-white/5">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden ring-1 ring-white/10">
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500" />
                </div>
                <h3 className="font-semibold text-xl">Sarah Johnson</h3>
                <p className="text-white/70">Co-Founder & CTO</p>
              </div>
              <div className="rounded-lg p-4 text-center border border-white/10 bg-white/5">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden ring-1 ring-white/10">
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500" />
                </div>
                <h3 className="font-semibold text-xl">Michael Rodriguez</h3>
                <p className="text-white/70">Head of Product</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Technology */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 blur-[10px]" />
          <div className="relative p-6 md:p-10">
            <div className="mb-6 inline-flex items-center gap-2 text-sm">
              <FiCpu className="h-5 w-5 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Our Technology</h2>
            </div>
            <p className="mb-4">
              NYALTX leverages cutting-edge blockchain technology to provide a seamless trading experience across multiple chains and protocols.
              Our platform integrates with leading DEXs including Uniswap, SushiSwap, PancakeSwap, and more to ensure you always get the best rates.
            </p>
            <p>
              We're committed to security, transparency, and continuous improvement. Our smart contract integrations are regularly audited,
              and we're constantly working to add new features and support for additional chains and protocols.
            </p>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 blur-[10px]" />
          <div className="relative p-6 md:p-10">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">Have questions, suggestions, or just want to say hello? We'd love to hear from you!</p>
            <div className="flex flex-col space-y-2 text-white/80">
              <p>
                <span className="font-semibold">Email:</span> hello@cryptic.finance
              </p>
              <p>
                <span className="font-semibold">Twitter:</span> @CrypticFinance
              </p>
              <p>
                <span className="font-semibold">Discord:</span> discord.gg/cryptic
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
