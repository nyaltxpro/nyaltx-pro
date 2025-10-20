'use client';

import PublicHeader from '@/components/PublicHeader';
import TinaRichText from '@/components/TinaRichText';
import { usePublicPageContent } from '@/hooks/useTinaContent';
import { motion } from 'framer-motion';
import { FiCpu, FiTarget, FiUsers } from 'react-icons/fi';

export default function AboutUs() {
  const { content, loading, error } = usePublicPageContent('about-us');

  // Fallback content if Tina CMS is not available
  const fallbackContent = {
    hero: {
      title: "Building the future of DeFi UX",
      subtitle: "We make crypto trading accessible, transparent, and efficient with data-driven aggregation and a design-first approach."
    },
    content: {
      type: "root" as const,
      children: [
        {
          type: "element" as const,
          tag: "section",
          props: { className: "mission-section" },
          children: [
            {
              type: "element" as const,
              tag: "h2",
              children: [{ type: "text" as const, text: "Our Mission" }]
            },
            {
              type: "element" as const,
              tag: "p",
              children: [{ 
                type: "text" as const, 
                text: "At NYALTX, we're on a mission to make cryptocurrency trading accessible, transparent, and efficient for everyone. We believe in the power of decentralized finance to transform the global economy and create new opportunities for people worldwide." 
              }]
            },
            {
              type: "element" as const,
              tag: "p",
              children: [{ 
                type: "text" as const, 
                text: "Our platform aggregates data from multiple decentralized exchanges to provide you with the best possible trading experience, ensuring you always get the best rates and lowest fees when swapping your digital assets." 
              }]
            }
          ]
        },
        {
          type: "element" as const,
          tag: "section",
          props: { className: "technology-section" },
          children: [
            {
              type: "element" as const,
              tag: "h2",
              children: [{ type: "text" as const, text: "Our Technology" }]
            },
            {
              type: "element" as const,
              tag: "p",
              children: [{ 
                type: "text" as const, 
                text: "NYALTX leverages cutting-edge blockchain technology to provide a seamless trading experience across multiple chains and protocols. Our platform integrates with leading DEXs including Uniswap, SushiSwap, PancakeSwap, and more to ensure you always get the best rates." 
              }]
            },
            {
              type: "element" as const,
              tag: "p",
              children: [{ 
                type: "text" as const, 
                text: "We're committed to security, transparency, and continuous improvement. Our smart contract integrations are regularly audited, and we're constantly working to add new features and support for additional chains and protocols." 
              }]
            }
          ]
        },
        {
          type: "element" as const,
          tag: "section",
          props: { className: "contact-section" },
          children: [
            {
              type: "element" as const,
              tag: "h2",
              children: [{ type: "text" as const, text: "Contact Us" }]
            },
            {
              type: "element" as const,
              tag: "p",
              children: [{ 
                type: "text" as const, 
                text: "Have questions, suggestions, or just want to say hello? We'd love to hear from you!" 
              }]
            },
            {
              type: "element" as const,
              tag: "p",
              children: [{ type: "text" as const, text: "Email: info@nyaltx.com" }]
            }
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
              {pageContent.hero?.title || "Building the future of DeFi UX"}
            </span>
          </h1>
          <p className="max-w-3xl text-white/70">
            {pageContent.hero?.subtitle || "We make crypto trading accessible, transparent, and efficient with data-driven aggregation and a design-first approach."}
          </p>
        </motion.div>
      </section>

      <main className="container mx-auto px-4 pb-20 space-y-8">
        {pageContent.content && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <TinaRichText content={pageContent.content} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
