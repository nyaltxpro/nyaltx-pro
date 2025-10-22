'use client';

import { useMemo } from 'react';
import { useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import PublicHeader from '@/components/PublicHeader';

interface PrivacyPolicyProps {
    tinaData: any;
}

type TinaRichText = any;

const convertMarkdownStringToRichText = (markdown: string): TinaRichText => {
    const doc: TinaRichText = { type: 'doc', content: [] };
    const lines = markdown.split(/\r?\n/);

    let currentParagraph: string[] = [];
    let currentList: string[] = [];

    const flushParagraph = () => {
        if (!currentParagraph.length) return;
        doc.content.push({
            type: 'paragraph',
            content: [
                {
                    type: 'text',
                    text: currentParagraph.join(' '),
                },
            ],
        });
        currentParagraph = [];
    };

    const flushList = () => {
        if (!currentList.length) return;
        doc.content.push({
            type: 'bulletList',
            content: currentList.map((item) => ({
                type: 'listItem',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: item,
                            },
                        ],
                    },
                ],
            })),
        });
        currentList = [];
    };

    lines.forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed) {
            flushParagraph();
            flushList();
            return;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
            flushParagraph();
            flushList();
            const level = Math.min(6, headingMatch[1].length);
            const text = headingMatch[2];
            doc.content.push({
                type: 'heading',
                attrs: { level },
                content: [
                    {
                        type: 'text',
                        text,
                    },
                ],
            });
            return;
        }

        if (/^[\u2022\-\*•]/.test(trimmed)) {
            flushParagraph();
            currentList.push(trimmed.replace(/^[\u2022\-\*•\s\t]+/, ''));
            return;
        }

        currentParagraph.push(trimmed);
    });

    flushParagraph();
    flushList();

    if (!doc.content.length) {
        return {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: markdown,
                        },
                    ],
                },
            ],
        };
    }

    return doc;
};

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ tinaData }) => {
    const { data }: any = useTina(tinaData);

    const pageData = (data?.privacyPolicy ?? data) || {};
    const hero = pageData.hero;
    const heroStyle = hero?.backgroundImage
        ? {
              backgroundImage: `url(${hero.backgroundImage})`,
          }
        : undefined;

    const richTextContent: TinaRichText | null = useMemo(() => {
        if (!pageData.content) return null;
        if (typeof pageData.content === 'object') return pageData.content as TinaRichText;
        if (typeof pageData.content === 'string') return convertMarkdownStringToRichText(pageData.content);
        return null;
    }, [pageData.content]);

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <PublicHeader />

            {hero ? (
                <section
                    className="relative isolate overflow-hidden border-b border-white/10 bg-slate-900/70 bg-cover bg-center"
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
                    <div className="prose prose-invert max-w-none prose-headings:text-cyan-400 prose-a:text-cyan-300 prose-strong:text-cyan-200">
                        {richTextContent ? (
                            <TinaMarkdown content={richTextContent} />
                        ) : null}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
