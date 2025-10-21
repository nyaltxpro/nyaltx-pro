'use client';

import PublicHeader from '@/components/PublicHeader';
import TinaRichText from '@/components/TinaRichText';
import { usePublicPageContent } from '@/hooks/useTinaContent';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function VentureGroupPage() {
  const { content, loading } = usePublicPageContent('venture-group');

  const fallbackContent = {
    hero: {
      title: 'NYALTX Venture Group',
      subtitle:
        'We back crypto-native founders redefining decentralized markets through capital, advisory, and hands-on operating support.',
      backgroundImage: '/images/venture-group-hero.jpg',
    },
    content: {
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph' as const,
          content: [
            {
              type: 'text' as const,
              text: 'We partner with visionary builders creating new liquidity rails, consumer experiences, and infrastructure that expand the crypto economy.',
            },
          ],
        },
      ],
    },
  };

  const pageContent = content ?? fallbackContent;

  return (
    <div className="min-h-screen bg-inherit text-white">
      <PublicHeader />

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_-100px,rgba(14,165,233,0.25),rgba(14,165,233,0)_65%)]" />
          {pageContent.hero?.backgroundImage && (
            <div className="absolute inset-0">
              <Image
                src={pageContent.hero.backgroundImage}
                alt="Venture group background"
                fill
                className="object-cover opacity-10"
                priority
              />
            </div>
          )}
          <div className="relative container mx-auto px-4 py-20 max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
                <span>Venture Group</span>
              </div>
              <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  {pageContent.hero?.title}
                </span>
              </h1>
              {pageContent.hero?.subtitle && (
                <p className="mt-4 text-lg text-white/70">{pageContent.hero.subtitle}</p>
              )}
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed">
              {pageContent.content && <TinaRichText content={pageContent.content} />}
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
