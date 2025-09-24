'use client'

import React from 'react';
import PublicHeader from '@/components/PublicHeader';
import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';

const LegalAdvice = () => {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <PublicHeader />

      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_-100px,rgba(56,189,248,0.12),rgba(67,56,202,0)_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_80%_10%,rgba(99,102,241,0.18),rgba(14,165,233,0)_60%)]" />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start gap-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
            <FiShield className="h-4 w-4 text-cyan-300" />
            <span>Compliance & Transparency</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              NYALTX Legal Advice
            </span>
          </h1>
          <p className="max-w-3xl text-white/70">
            Important legal notices regarding information usage and investment risk.
          </p>
        </motion.div>
      </section>

      {/* Content Card */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 blur-[10px]" />

          <div className="relative p-6 md:p-10">
            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-300 ring-1 ring-cyan-500/30">Updated</span>
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-indigo-300 ring-1 ring-indigo-500/30">Legal</span>
            </div>

            <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed">
           <p>All the contents of our Website and those to which its hyperlinks refer, as well as those that may result from applications, forums, blogs, social network accounts and other platforms associated with NYALTX are intended solely to provide its users with general information and in no case are aimed at the marketing of specific products. We cannot guarantee the accuracy of the data published or the accuracy and timeliness of such data. The publication of information by NYALTX  in no case involves or should be interpreted as financial, legal or any other kind of advice regarding the opportunity to invest in the markets and products to which it refers. Any use or exploitation that users may make of the information provided will be at their own risk. The user interested in investing must carry out his own research and analysis, reviewing and verifying such data and contents, before relying on them. The commercial transactions referred to in the information constitute a very high risk activity, which may entail serious losses for the investor, and therefore the investor should seek appropriate advice before making any decision. Nothing on our Web Page constitutes or should be considered an invitation or an offer to carry out acts of investment.
           </p> 
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LegalAdvice;

