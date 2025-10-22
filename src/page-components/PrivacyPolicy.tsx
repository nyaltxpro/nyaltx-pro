'use client';

import PublicHeader from '@/components/PublicHeader';
import { useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

interface PrivacyPolicyProps {
    tinaData: any;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ tinaData }) => {
    const { data }: any = useTina(tinaData);

    const pageData = (data?.privacyPolicy ?? data) || {};
    const hero = pageData.hero;
    const heroStyle = hero?.backgroundImage
        ? { backgroundImage: `url(${hero.backgroundImage})` }
        : undefined;

    return (
        <div className="min-h-screen text-white">
            <PublicHeader />

            {hero && (
                <section
                    className="relative isolate overflow-hidden border-b border-white/10"
                    style={heroStyle}
                >
                    <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center sm:py-28 lg:py-32">
                        <h1 className="text-3xl font-bold tracking-tight text-cyan-400 sm:text-4xl lg:text-5xl">
                            {hero.title}
                        </h1>
                        {hero.subtitle && (
                            <p className="mt-6 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
                                {hero.subtitle}
                            </p>
                        )}
                    </div>
                </section>
            )}

            <section className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16 lg:py-20">
                <div className="rounded-2xl border border-white/10 p-6 shadow-lg shadow-cyan-500/5 sm:p-10">
                    <div className="prose prose-invert max-w-none prose-headings:text-cyan-400 prose-a:text-cyan-300">
                        {pageData.content && (
                            <TinaMarkdown
                                content={
                                    typeof pageData.content === 'string'
                                        ? { type: 'root', children: [{ type: 'p', children: [{ text: pageData.content }] }] }
                                        : pageData.content
                                }
                            />
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
