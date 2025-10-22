'use client';

import PublicHeader from '@/components/PublicHeader';
import { motion } from 'framer-motion';
import * as Icons from 'react-icons/fi';
import { useTina } from 'tinacms/dist/react';
import type { AboutUsQuery } from '../../tina/__generated__/types';

interface AboutUsClientProps {
  data: AboutUsQuery;
  variables: object;
  query: string;
}

export default function AboutUsClient(props: AboutUsClientProps) {
  const { data } = useTina<AboutUsQuery>(props);
  const pageContent: any = data?.aboutUs;

  // Dynamically get icon components
  const getIcon = (iconName: string | null | undefined) => {
    if (!iconName) return null;
    return (Icons as any)[iconName] || null;
  };

  const HeroIcon = getIcon(pageContent?.hero?.badge?.icon);

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <PublicHeader />

      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_-100px,rgba(56,189,248,0.12),rgba(67,56,202,0)_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_80%_10%,rgba(99,102,241,0.18),rgba(14,165,233,0)_60%)]" />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start gap-4"
        >
          {/* Badge */}
          {pageContent?.hero?.badge && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
              {HeroIcon && <HeroIcon className="h-4 w-4 text-cyan-300" />}
              <span>{pageContent.hero.badge.text}</span>
            </div>
          )}

          {/* Title with Gradient */}
          {pageContent?.hero?.title && (
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              <span className={`bg-gradient-to-r ${pageContent.hero.title.gradient} bg-clip-text text-transparent`}>
                {pageContent.hero.title.text}
              </span>
            </h1>
          )}

          {/* Description */}
          {pageContent?.hero?.description && (
            <p className="max-w-3xl text-white/70">
              {pageContent.hero.description}
            </p>
          )}
        </motion.div>
      </section>

      {/* Main Content Sections */}
      <main className="container mx-auto px-4 pb-20 space-y-8">
        {pageContent?.content?.sections?.map((section: any, index: number) => {
          const SectionIcon = getIcon(section.icon);

          return (
            <motion.div
              key={section.id || index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 * (index + 1) }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute -inset-px rounded-2xl blur-[10px]" />

              <div className="relative p-6 md:p-10">
                {/* Section Header */}
                {section.title && (
                  <div className="mb-6 inline-flex items-center gap-2 text-sm">
                    {SectionIcon && <SectionIcon className="h-5 w-5 text-cyan-300" />}
                    <h2 className="text-2xl font-semibold">{section.title}</h2>
                  </div>
                )}

                {/* Section Paragraphs */}
                {section.paragraphs?.map((paragraph: string, pIndex: number) => (
                  <p
                    key={pIndex}
                    className={`text-white/80 leading-relaxed ${pIndex < section.paragraphs.length - 1 ? 'mb-4' : ''}`}
                  >
                    {paragraph}
                  </p>
                ))}

                {/* Contact Information (if exists) */}
                {section.contactInfo && section.contactInfo.length > 0 && (
                  <div className="flex flex-col space-y-2 text-white/80 mt-4">
                    {section.contactInfo.map((contact: any, cIndex: number) => (
                      <p key={cIndex}>
                        <span className="font-semibold">{contact.label}:</span> {contact.value}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </main>
    </div>
  );
}