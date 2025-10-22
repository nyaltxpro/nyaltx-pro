
"use client";

import PublicHeader from "@/components/PublicHeader";
import { useLegalAdvicePageContent } from "@/hooks/useTinaContent";
import { motion } from "framer-motion";
import { FiShield } from "react-icons/fi";
export default function LegalAdvicePage() {
  const { content: data, loading, error } = useLegalAdvicePageContent();

  if (loading) {
    return (
      <div className="min-h-screen bg-inherit text-white">
        <PublicHeader />
        <section className="container mx-auto px-4 pt-16 pb-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 rounded bg-white/10" />
            <div className="h-12 rounded bg-white/10" />
            <div className="h-4 rounded bg-white/10" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
          </div>
        </section>
      </div>
    );
  }

  if (error || !data?.legalAdvice) {
    return (
      <div className="min-h-screen bg-inherit text-white">
        <PublicHeader />
        <section className="container mx-auto px-4 pt-16 pb-10">
          <p className="text-white/70">Unable to load legal advice content right now. Please try again later.</p>
        </section>
      </div>
    );
  }

  const { tagline, title, description, body } = data.legalAdvice;

  return (
    <div className="min-h-screen bg-inherit text-white">
      <PublicHeader />
      <section className="container mx-auto px-4 pt-16 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start gap-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
            <FiShield className="h-4 w-4 text-cyan-300" />
            <span>{tagline}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          <p className="max-w-3xl text-white/70">{description}</p>
        </motion.div>
      </section>

      <section className="container mt-10 mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-10"
        >
          <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed whitespace-pre-line">
            {body}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
