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
        ? {
            backgroundImage: `url(${hero.backgroundImage})`,
        }
        : undefined;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <PublicHeader />

            {hero ? (
                <section
                    className="relative isolate overflow-hidden border-b border-white/10 bg-slate-900/70"
                    style={heroStyle}
                >
                    <span className="absolute inset-0 bg-slate-900/70" aria-hidden />
                    <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center sm:py-28 lg:py-32">
                        <h1 className="text-3xl font-bold tracking-tight text-cyan-400 sm:text-4xl lg:text-5xl">
                            {hero.title}
                        </h1>
                        {hero.subtitle ? (
                            <p className="mt-6 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
                                {hero.subtitle}
                            </p>
                        ) : null}
                    </div>
                </section>
            ) : null}

            <section className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16 lg:py-20">
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-lg shadow-cyan-500/5 sm:p-10">
                    <div className="prose prose-invert max-w-none prose-headings:text-cyan-400 prose-a:text-cyan-300">
                        {typeof pageData.content === 'object' ? (
                            <TinaMarkdown content={pageData.content} />
                        ) : (
                            <p className="whitespace-pre-line text-slate-200">{pageData.content}</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
