'use client';

import PublicHeader from '@/components/PublicHeader';
import TinaRichText from '@/components/TinaRichText';
import { usePublicPageContent } from '@/hooks/useTinaContent';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';

export default function PrivacyPolicyPage() {
  const { content, loading, error } = usePublicPageContent('privacy-policy');

  // Fallback content using existing JSON structure
  const fallbackContent = {
    hero: {
      title: "Privacy Policy",
      subtitle: "Learn how we handle your data, protect your privacy, and respect your preferences."
    },
    content: {
      type: "doc" as const,
      content: [
        {
          type: "paragraph" as const,
          content: [{ type: "text" as const, text: "Last updated: January 1, 2024" }]
        },
        {
          type: "heading" as const,
          attrs: { level: 2 },
          content: [{ type: "text" as const, text: "Information We Collect" }]
        },
        {
          type: "paragraph" as const,
          content: [{ 
            type: "text" as const, 
            text: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include:" 
          }]
        },
        {
          type: "bulletList" as const,
          content: [
            {
              type: "listItem" as const,
              content: [{ 
                type: "paragraph" as const, 
                content: [{ type: "text" as const, text: "Wallet addresses and transaction data" }] 
              }]
            },
            {
              type: "listItem" as const,
              content: [{ 
                type: "paragraph" as const, 
                content: [{ type: "text" as const, text: "Usage data and analytics" }] 
              }]
            },
            {
              type: "listItem" as const,
              content: [{ 
                type: "paragraph" as const, 
                content: [{ type: "text" as const, text: "Communication preferences" }] 
              }]
            }
          ]
        },
        {
          type: "heading" as const,
          attrs: { level: 2 },
          content: [{ type: "text" as const, text: "How We Use Your Information" }]
        },
        {
          type: "paragraph" as const,
          content: [{ 
            type: "text" as const, 
            text: "We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you about your account and our services." 
          }]
        },
        {
          type: "heading" as const,
          attrs: { level: 2 },
          content: [{ type: "text" as const, text: "Data Security" }]
        },
        {
          type: "paragraph" as const,
          content: [{ 
            type: "text" as const, 
            text: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction." 
          }]
        },
        {
          type: "heading" as const,
          attrs: { level: 2 },
          content: [{ type: "text" as const, text: "Contact Us" }]
        },
        {
          type: "paragraph" as const,
          content: [{ 
            type: "text" as const, 
            text: "If you have any questions about this Privacy Policy, please contact us at privacy@nyaltx.pro." 
          }]
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
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              {pageContent.hero?.title || "Privacy Policy"}
            </span>
          </h1>
          <p className="max-w-3xl text-white/70">
            {pageContent.hero?.subtitle || "Learn how we handle your data, protect your privacy, and respect your preferences."}
          </p>
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
          <div className="pointer-events-none absolute -inset-px rounded-2xl  blur-[10px]" />

          <div className="relative p-6 md:p-10">
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
}
