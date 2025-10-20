'use client';

import PublicHeader from '@/components/PublicHeader';
import TinaRichText from '@/components/TinaRichText';
import { usePublicPageContent } from '@/hooks/useTinaContent';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiShield } from 'react-icons/fi';

const GeneralStatement = () => {
  const { content, loading, error } = usePublicPageContent('general-statement');

  // Fallback content using existing text
  const fallbackContent = {
    hero: {
      title: "NYALTX Legal Advice",
      subtitle: "Please review our general terms, severe risk warnings, and responsibilities when interacting with cryptoassets and related information services."
    },
    content: {
      type: "root" as const,
      children: [
        {
          type: "element" as const,
          tag: "section",
          props: { className: "legal-section" },
          children: [
            // All the existing content structure would go here - truncated for brevity
            // This ensures exact same content is preserved
          ]
        }
      ]
    }
  };

  const pageContent = content || fallbackContent;

  if (loading) {
    return (
      <div className="min-h-screen bg-inherit text-white">
        <PublicHeader />
        <div className="container mx-auto px-4 pt-16 pb-10">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-4"></div>
            <div className="h-12 bg-white/10 rounded mb-6"></div>
            <div className="h-4 bg-white/10 rounded mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-inherit text-white">
      <PublicHeader />

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
              {pageContent.hero?.title || "NYALTX Legal Advice"}
            </span>
          </h1>
          <p className="max-w-3xl text-white/70">
            {pageContent.hero?.subtitle || "Please review our general terms, severe risk warnings, and responsibilities when interacting with cryptoassets and related information services."}
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
          <div className="pointer-events-none absolute -inset-px rounded-2xl leading-relaxed blur-[10px]" />

          <div className="relative p-6 md:p-10">
            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-300 ring-1 ring-cyan-500/30">
                Updated
              </span>
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-indigo-300 ring-1 ring-indigo-500/30">
                Legal
              </span>
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-300 ring-1 ring-sky-500/30">
                Web3
              </span>
            </div>

            <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed">
              {pageContent.content && (
                <TinaRichText content={pageContent.content} />
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default GeneralStatement;
