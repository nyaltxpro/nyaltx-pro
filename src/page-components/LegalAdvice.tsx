'use client';

import PublicHeader from '@/components/PublicHeader';
import { motion } from 'framer-motion';
import * as Icons from 'react-icons/fi';
import { useTina } from 'tinacms/dist/react';
import type { LegalAdviceQuery } from '../../tina/__generated__/types';

interface LegalAdviceClientProps {
    data: LegalAdviceQuery;
    variables: object;
    query: string;
}

export default function LegalAdviceClient(props: LegalAdviceClientProps) {
    const { data } = useTina<LegalAdviceQuery>(props);
    const pageContent: any = data?.legalAdvice;

    // Dynamically get the icon component
    const IconComponent = pageContent?.hero?.badge?.icon
        ? (Icons as any)[pageContent.hero.badge.icon]
        : Icons.FiShield;

    return (
        <div className="min-h-screen bg-inherit text-white">
            <PublicHeader />

            {/* Hero Section */}
            <section className="container mx-auto px-4 pt-16 pb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-start gap-4"
                >
                    {/* Badge */}
                    {pageContent?.hero?.badge && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
                            <IconComponent className="h-4 w-4 text-cyan-300" />
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
                {pageContent?.content?.sections?.map((section: any, index: number) => (
                    <motion.div
                        key={section.id || index}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className={`
                            relative overflow-hidden rounded-2xl border backdrop-blur-xl p-6 md:p-10
                            ${section.type === 'warning'
                                ? 'border-red-500/20 bg-red-500/5'
                                : 'border-white/10 bg-white/5'
                            }
                        `}
                    >
                        {/* Section ID as visual label if needed */}
                        {section.id && section.type === 'warning' && (
                            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300 uppercase tracking-wider">
                                {section.id}
                            </div>
                        )}

                        {/* Paragraphs */}
                        <div className="space-y-4">
                            {section.paragraphs?.map((paragraph: string, pIndex: number) => (
                                <p
                                    key={pIndex}
                                    className="text-white/80 leading-relaxed"
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </main>

            {/* SEO Metadata (handled in page/layout) */}
        </div>
    );
}