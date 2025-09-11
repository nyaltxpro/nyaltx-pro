'use client'

import React from 'react';
import PublicHeader from '@/components/PublicHeader';
import { motion } from 'framer-motion';
import { FiUsers } from 'react-icons/fi';

export default function TeamPage() {
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
            <FiUsers className="h-4 w-4 text-cyan-300" />
            <span>Meet the Builders</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">Our Team</span>
          </h1>
          <p className="max-w-3xl text-white/70">A diverse group of engineers, designers, and operators building the future of DeFi UX.</p>
        </motion.div>
      </section>

      {/* Team Grid */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 blur-[10px]" />
          <div className="relative p-6 md:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[{ name: 'Alex Chen', role: 'Co‑Founder & CEO', grad: 'from-blue-400 to-purple-500' },
                { name: 'Sarah Johnson', role: 'Co‑Founder & CTO', grad: 'from-green-400 to-blue-500' },
                { name: 'Michael Rodriguez', role: 'Head of Product', grad: 'from-purple-400 to-pink-500' },
                { name: 'Priya Patel', role: 'Lead Engineer', grad: 'from-cyan-400 to-indigo-500' },
                { name: 'Liam O’Connor', role: 'Protocol Research', grad: 'from-amber-400 to-rose-500' },
                { name: 'Noah Kim', role: 'Design Lead', grad: 'from-fuchsia-400 to-sky-500' }].map((m) => (
                <div key={m.name} className="rounded-lg p-5 text-center border border-white/10 bg-white/5">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden ring-1 ring-white/10">
                    <div className={`w-full h-full bg-gradient-to-br ${m.grad}`} />
                  </div>
                  <h3 className="font-semibold text-xl">{m.name}</h3>
                  <p className="text-white/70">{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
