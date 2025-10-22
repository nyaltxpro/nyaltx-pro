'use client';

import PublicHeader from '@/components/PublicHeader';
import TinaRichText from '@/components/TinaRichText';
import { motion } from 'framer-motion';
import { FiUsers } from 'react-icons/fi';
import { useTina } from 'tinacms/dist/react';
import type { AboutUsQuery } from '../../tina/__generated__/types';

interface AboutClientProps {
  data: AboutUsQuery;
  variables: object;
  query: string;
}

export default function AboutClient(props: AboutClientProps) {
  const { data } = useTina<AboutUsQuery>(props);

  // Access the actual aboutUs object
  const pageContent = data?.aboutUs ?? {
    hero: {
      title: "Building the future of DeFi UX",
      subtitle:
        "We make crypto trading accessible, transparent, and efficient with data-driven aggregation and a design-first approach.",
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
              children: [{ type: "text" as const, text: "Our Mission" }],
            },
            {
              type: "element" as const,
              tag: "p",
              children: [
                {
                  type: "text" as const,
                  text: "At NYALTX, we're on a mission to make cryptocurrency trading accessible, transparent, and efficient for everyone. We believe in the power of decentralized finance to transform the global economy and create new opportunities for people worldwide.",
                },
              ],
            },
            {
              type: "element" as const,
              tag: "p",
              children: [
                {
                  type: "text" as const,
                  text: "Our platform aggregates data from multiple decentralized exchanges to provide you with the best possible trading experience, ensuring you always get the best rates and lowest fees when swapping your digital assets.",
                },
              ],
            },
          ],
        },
        {
          type: "element" as const,
          tag: "section",
          props: { className: "technology-section" },
          children: [
            {
              type: "element" as const,
              tag: "h2",
              children: [{ type: "text" as const, text: "Our Technology" }],
            },
            {
              type: "element" as const,
              tag: "p",
              children: [
                {
                  type: "text" as const,
                  text: "NYALTX leverages cutting-edge blockchain technology to provide a seamless trading experience across multiple chains and protocols. Our platform integrates with leading DEXs including Uniswap, SushiSwap, PancakeSwap, and more to ensure you always get the best rates.",
                },
              ],
            },
            {
              type: "element" as const,
              tag: "p",
              children: [
                {
                  type: "text" as const,
                  text: "We're committed to security, transparency, and continuous improvement. Our smart contract integrations are regularly audited, and we're constantly working to add new features and support for additional chains and protocols.",
                },
              ],
            },
          ],
        },
      ],
    },
    sections: [],
  };

  return (
    <div className="min-h-screen bg-inherit text-white">
      <PublicHeader />

      {/* Hero Section */}
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
              {pageContent.hero?.title}
            </span>
          </h1>
          <p className="max-w-3xl text-white/70">{pageContent.hero?.subtitle}</p>
        </motion.div>
      </section>

      {/* Main Content */}
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

        {pageContent.sections?.map((sec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-10"
          >
            <h2 className="text-2xl font-semibold mb-4">{sec?.title}</h2>
            {sec?.content && <TinaRichText content={sec.content} />}
          </motion.div>
        ))}
      </main>
    </div>
  );
}
