'use client'

import React from 'react';
import PublicHeader from '@/components/PublicHeader';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <PublicHeader />

      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_-100px,rgba(56,189,248,0.12),rgba(67,56,202,0)_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_80%_10%,rgba(99,102,241,0.18),rgba(14,165,233,0)_60%)]" />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start gap-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
            <FiLock className="h-4 w-4 text-cyan-300" />
            <span>Privacy First</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">Privacy Policy</span>
          </h1>
          <p className="max-w-3xl text-white/70">Learn how we handle your data, protect your privacy, and respect your preferences.</p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 blur-[10px]" />

          <div className="relative p-6 md:p-10">
            <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed">
              <h2 className="text-2xl font-semibold mt-2 mb-4">1. Information We Collect</h2>
              <p className="mb-4">We collect minimal data required to operate and improve our services. This may include usage metrics, device information, and cookie preferences. We do not sell personal data.</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Information</h2>
              <p className="mb-4">Data is used to maintain service quality, detect abuse, and enhance user experience. We apply industry-standard security practices.</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Cookies & Preferences</h2>
              <p className="mb-4">See the Cookie Settings page to control how cookies are used. Essential cookies are required for core functionality.</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Third‑Party Services</h2>
              <p className="mb-4">We may integrate with third‑party providers (e.g., analytics) that process data under their own policies. We select partners with strong security practices.</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
              <p className="mb-4">You can request access, correction, or deletion of your data where applicable. Contact us for privacy inquiries.</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Updates</h2>
              <p className="mb-4">We may update this policy. Material changes will be communicated via the website.</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
