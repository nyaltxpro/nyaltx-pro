'use client';

import Footer from '@/components/Footer';
import PublicHeader from '@/components/PublicHeader';
import { usePublicPageContent } from '@/hooks/useTinaContent';
import React from 'react';

interface PublicPageLayoutProps {
    slug: string;
    fallbackTitle?: string;
    fallbackContent?: React.ReactNode;
}

const PublicPageLayout: React.FC<PublicPageLayoutProps> = ({
    slug,
    fallbackTitle = 'Page Not Found',
    fallbackContent
}) => {
    const { content, loading, error } = usePublicPageContent(slug);

    if (loading) {
        return (
            <div className="min-h-screen  text-white">
                <PublicHeader />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error && !content) {
        return (
            <div className="min-h-screen  text-white">
                <PublicHeader />
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl font-bold mb-4">{fallbackTitle}</h1>
                        {fallbackContent || (
                            <p className="text-gray-400">
                                Sorry, we couldn't load this page. Please try again later.
                            </p>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            <PublicHeader />

            {/* Hero Section */}
            {content?.hero && (
                <section className="relative py-20 px-4">
                    {content.hero.backgroundImage && (
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-20"
                            style={{ backgroundImage: `url(${content.hero.backgroundImage})` }}
                        />
                    )}
                    <div className="relative container mx-auto max-w-4xl text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
                            {content.hero.title}
                        </h1>
                        {content.hero.subtitle && (
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                {content.hero.subtitle}
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* Content Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="prose prose-invert prose-lg max-w-none">
                        {content?.content && <TinaRichText content={content.content} />}
                    </div>
                </div>
            </section>

            {/* <Footer /> */}
        </div>
    );
};

// Simple rich text renderer for Tina content
const TinaRichText: React.FC<{ content: any }> = ({ content }) => {
    if (!content || !content.content) return null;

    const renderNode = (node: any, index: number) => {
        switch (node.type) {
            case 'heading':
                const level = node.attrs?.level || 2;
                const headingClasses = "font-bold mb-4 mt-8 first:mt-0";

                if (level === 1) {
                    return (
                        <h1 key={index} className={headingClasses}>
                            {node.content?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
                        </h1>
                    );
                } else if (level === 2) {
                    return (
                        <h2 key={index} className={headingClasses}>
                            {node.content?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
                        </h2>
                    );
                } else if (level === 3) {
                    return (
                        <h3 key={index} className={headingClasses}>
                            {node.content?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
                        </h3>
                    );
                } else if (level === 4) {
                    return (
                        <h4 key={index} className={headingClasses}>
                            {node.content?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
                        </h4>
                    );
                } else if (level === 5) {
                    return (
                        <h5 key={index} className={headingClasses}>
                            {node.content?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
                        </h5>
                    );
                } else {
                    return (
                        <h6 key={index} className={headingClasses}>
                            {node.content?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
                        </h6>
                    );
                }

            case 'paragraph':
                return (
                    <p key={index} className="mb-4 text-gray-300 leading-relaxed">
                        {node.content?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
                    </p>
                );

            case 'bulletList':
                return (
                    <ul key={index} className="list-disc list-inside mb-4 space-y-2">
                        {node.content?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
                    </ul>
                );

            case 'listItem':
                return (
                    <li key={index} className="text-gray-300">
                        {node.content?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
                    </li>
                );

            case 'text':
                let text = node.text || '';
                if (node.marks) {
                    node.marks.forEach((mark: any) => {
                        if (mark.type === 'bold') {
                            return <strong key={index} className="font-semibold text-white">{text}</strong>;
                        }
                        if (mark.type === 'italic') {
                            return <em key={index}>{text}</em>;
                        }
                    });
                }
                return text;

            default:
                return null;
        }
    };

    return (
        <div>
            {content.content.map((node: any, index: number) => renderNode(node, index))}
        </div>
    );
};

export default PublicPageLayout;
