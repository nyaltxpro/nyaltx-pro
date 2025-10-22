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

    // Access the actual legalAdvice object
    const pageContent = data?.legalAdvice ?? {
        tagline: "Your Trusted Legal Partner",
        title: "Legal Advice & Compliance",
        description:
            "We provide comprehensive legal guidance to help you navigate regulatory and compliance issues in DeFi and cryptocurrency trading.",
        body: {
            type: "root" as const,
            children: [
                {
                    type: "element" as const,
                    tag: "section",
                    props: {},
                    children: [
                        {
                            type: "element" as const,
                            tag: "p",
                            children: [
                                {
                                    type: "text" as const,
                                    text: "At NYALTX, we ensure our platform and users comply with the latest regulations in cryptocurrency trading. Our team of legal experts provides guidance on compliance, contracts, and dispute resolution."
                                }
                            ]
                        },
                        {
                            type: "element" as const,
                            tag: "p",
                            children: [
                                {
                                    type: "text" as const,
                                    text: "We actively monitor regulatory changes across multiple jurisdictions and provide proactive advice to ensure that our users and the platform operate within the law."
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        sections: []
    };

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
                        <span>{pageContent.tagline}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                            {pageContent.title}
                        </span>
                    </h1>
                    <p className="max-w-3xl text-white/70">{pageContent.description}</p>
                </motion.div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-4 pb-20 space-y-8">
                {pageContent.body && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-10"
                    >
                        {pageContent.body}
                    </motion.div>
                )}

                {/* {pageContent?.sections?.map((sec:any, i:any) => (
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
                ))} */}
            </main>
        </div>
    );
}
