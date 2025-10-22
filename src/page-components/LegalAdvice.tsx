'use client';

import PublicHeader from '@/components/PublicHeader';
import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';
import { useTina } from 'tinacms/dist/react';
import type { LegalAdviceQuery } from '../../tina/__generated__/types';

interface LegalAdviceClientProps {
    data: LegalAdviceQuery;
    variables: object;
    query: string;
}

export default function LegalAdviceClient(props: LegalAdviceClientProps) {
    const { data } = useTina<LegalAdviceQuery>(props);
    const pageContent = data?.legalAdvice;

    type ContentSection = {
        id?: string | null;
        heading?: string | null;
        type?: string | null;
        paragraphs?: (string | null)[] | null;
    };

    const heroBadgeText = pageContent?.hero?.badge?.text ?? 'Compliance & Transparency';
    const heroTitleText = pageContent?.hero?.title?.text ?? 'NYALTX Legal Advice';
    const heroGradient = pageContent?.hero?.title?.gradient ?? 'from-cyan-300 via-sky-400 to-indigo-400';
    const heroDescription = pageContent?.hero?.description ?? 'Important legal notices regarding information usage and investment risk.';

    const defaultSections: ContentSection[] = [
        {
            id: 'legal-disclaimer',
            heading: 'Legal Disclaimer',
            type: 'warning',
            paragraphs: [
                'All the contents of our Website and those to which its hyperlinks refer, as well as those that may result from applications, forums, blogs, social network accounts and other platforms associated with NYALTX are intended solely to provide its users with general information and in no case are aimed at the marketing of specific products. We cannot guarantee the accuracy of the data published or the accuracy and timeliness of such data.',
                'The publication of information by NYALTX in no case involves or should be interpreted as financial, legal or any other kind of advice regarding the opportunity to invest in the markets and products to which it refers. Any use or exploitation that users may make of the information provided will be at their own risk.',
                'The user interested in investing must carry out his own research and analysis, reviewing and verifying such data and contents, before relying on them. The commercial transactions referred to in the information constitute a very high risk activity, which may entail serious losses for the investor, and therefore the investor should seek appropriate advice before making any decision.',
                'Nothing on our Web Page constitutes or should be considered an invitation or an offer to carry out acts of investment.'
            ]
        }
    ];

    const sections: ContentSection[] = pageContent?.content?.sections?.length
        ? pageContent.content.sections
        : defaultSections;

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
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
                        <FiShield className="h-4 w-4 text-cyan-300" />
                        <span>{heroBadgeText}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        <span className={`bg-gradient-to-r ${heroGradient} bg-clip-text text-transparent`}>
                            {heroTitleText}
                        </span>
                    </h1>
                    <p className="max-w-3xl text-white/70">{heroDescription}</p>
                </motion.div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-4 pb-20 space-y-8">
                {sections.map((section, index) => {
                    if (!section) return null;

                    const paragraphs = section.paragraphs?.filter(Boolean) as string[] | undefined;

                    return (
                        <motion.div
                            key={section.id ?? `section-${index}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.05 + index * 0.05 }}
                            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-10"
                        >
                            {section.heading && (
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                                    {section.heading}
                                </h2>
                            )}
                            {paragraphs && paragraphs.length > 0 && (
                                <div className="space-y-4 text-white/80 leading-relaxed">
                                    {paragraphs.map((paragraph, paragraphIndex) => (
                                        <p key={`${section.id ?? index}-paragraph-${paragraphIndex}`}>{paragraph}</p>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </main>
        </div>
    );
}
