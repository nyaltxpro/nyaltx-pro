import PublicHeader from '@/components/PublicHeader';
import { promises as fs } from 'fs';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import path from 'path';
import './page.css';

type CTA = {
    label?: string;
    href?: string;
};

type CardBenefit = {
    text?: string;
};

type FloatingCard = {
    image?: string;
    alt?: string;
    width?: number;
    height?: number;
};

type GovernaContent = {
    slug?: string;
    title?: string;
    description?: string;
    nav?: {
        brandText?: string;
        brandHref?: string;
        ctaText?: string;
        ctaHref?: string;
    };
    hero?: {
        eyebrow?: string;
        heading?: string;
        highlight?: string;
        description?: string;
        primaryCta?: CTA;
        secondaryCta?: CTA;
        floatingCards?: FloatingCard[];
    };
    comparisonSection?: {
        title?: string;
        withGovernance?: {
            title?: string;
            icon?: string;
            benefits?: CardBenefit[];
        };
        withoutGovernance?: {
            title?: string;
            icon?: string;
            benefits?: CardBenefit[];
        };
    };
    ctaSection?: {
        title?: string;
        subtitle?: string;
        primaryCta?: CTA;
        secondaryCta?: CTA;
    };
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        twitterTitle?: string;
        twitterDescription?: string;
        ogImage?: string;
    };
};

const FALLBACK_CONTENT: GovernaContent = {
    slug: 'governa',
    title: 'Governa Pro | Institutional Blockchain Governance',
    description:
        'Governa Pro delivers transparent, investor-ready on-chain governance with institutional workflows, secure voting, and compliance reporting.',
    nav: {
        brandText: 'governa.pro',
        brandHref: '/',
        ctaText: 'Get Started',
        ctaHref: '/dashboard/governance'
    },
    hero: {
        eyebrow: 'Institutional Governance',
        heading: 'Institutional Blockchain Governance Made Simple',
        highlight: 'Transparent. Auditable. Investor Ready.',
        description: 'Transform your protocol with transparent, efficient governance that attracts investors and empowers your community.',
        primaryCta: { label: 'Schedule Demo', href: '/contact' },
        secondaryCta: { label: 'Explore Platform', href: '/dashboard/governance' },
        floatingCards: [
            { image: '/nyaltxpro.png', alt: 'Governa Pro', width: 80, height: 60 },
            { image: '/nyaltxpro.png', alt: 'Governa Pro', width: 200, height: 60 },
            { image: '/nyaltxpro.png', alt: 'Governa Pro', width: 160, height: 60 },
            { image: '/nyaltxpro.png', alt: 'Governa Pro', width: 60, height: 60 }
        ]
    },
    comparisonSection: {
        title: 'Why Governance Matters',
        withGovernance: {
            title: 'With Governance',
            icon: '✓',
            benefits: [
                { text: 'Attract institutional investors with transparent decision-making processes' },
                { text: 'Build community trust through democratic participation and voting rights' },
                { text: 'Increase token utility and holder engagement with governance powers' },
                { text: 'Demonstrate regulatory compliance through documented governance structures' },
                { text: 'Enable rapid protocol evolution through community-driven improvements' },
                { text: 'Create accountability with on-chain voting records and transparency' },
                { text: 'Distribute decision-making power to reduce centralization risks' }
            ]
        },
        withoutGovernance: {
            title: 'Without Governance',
            icon: '✕',
            benefits: [
                { text: 'Limited investor visibility into decision-making and protocol direction' },
                { text: 'No community engagement or voice in critical protocol decisions' },
                { text: 'Centralized control creates single points of failure and trust issues' },
                { text: 'Difficulty attracting serious institutional capital without transparency' },
                { text: 'Slow adaptation to market changes without community input' },
                { text: 'Reduced token utility leading to lower holder retention' },
                { text: 'Perception of being centralized undermines blockchain principles' }
            ]
        }
    },
    ctaSection: {
        title: 'Ready to Elevate Your Protocol?',
        subtitle: 'Join leading institutions implementing transparent blockchain governance',
        primaryCta: { label: 'Start Your Governance Journey', href: '/contact' }
    },
    seo: {
        metaTitle: 'Governa Pro | Institutional Blockchain Governance',
        metaDescription:
            'Modern on-chain governance infrastructure for protocols that need transparent decision-making and investor confidence.',
        twitterTitle: 'Governa Pro | Institutional Blockchain Governance',
        twitterDescription:
            'Modern on-chain governance infrastructure for protocols that need transparent decision-making and investor confidence.',
        ogImage: '/images/og/governa.png'
    }
};

export const metadata: Metadata = {
    title: FALLBACK_CONTENT.seo?.metaTitle ?? FALLBACK_CONTENT.title,
    description: FALLBACK_CONTENT.seo?.metaDescription ?? FALLBACK_CONTENT.description,
    metadataBase: new URL('https://nyaltx.com/governa'),
    openGraph: {
        title: FALLBACK_CONTENT.seo?.metaTitle ?? FALLBACK_CONTENT.title ?? 'Governa Pro',
        description:
            FALLBACK_CONTENT.seo?.metaDescription ??
            'Transform your protocol with transparent, efficient governance that attracts investors and empowers communities.',
        url: 'https://nyaltx.com/governa',
        siteName: 'Governa Pro',
        images: FALLBACK_CONTENT.seo?.ogImage ? [FALLBACK_CONTENT.seo.ogImage] : undefined,
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: FALLBACK_CONTENT.seo?.twitterTitle ?? FALLBACK_CONTENT.title ?? 'Governa Pro',
        description:
            FALLBACK_CONTENT.seo?.twitterDescription ??
            'Modern on-chain governance infrastructure for protocols that need transparent decision-making and investor confidence.'
    }
};

const getGovernaContent = async (): Promise<GovernaContent> => {
    try {
        const { tinaClient } = await import('@/lib/tinaClient');
        const { governa } = (tinaClient as unknown as {
            queries: { governa: (args: { relativePath: string }) => Promise<{ data?: { governa?: GovernaContent } }> };
        }).queries;
        const tinaData = await governa({ relativePath: 'governa.json' });
        return tinaData?.data?.governa ?? FALLBACK_CONTENT;
    } catch (error) {
        try {
            const filePath = path.join(process.cwd(), 'content', 'public-pages', 'governa.json');
            const fileContents = await fs.readFile(filePath, 'utf8');
            return JSON.parse(fileContents) as GovernaContent;
        } catch (fallbackError) {
            console.error('Failed to load Governa content:', fallbackError);
            return FALLBACK_CONTENT;
        }
    }
};

export default async function GovernaPage() {
    const content = await getGovernaContent();
    const hero = content.hero ?? FALLBACK_CONTENT.hero;
    const comparisonSection = content.comparisonSection ?? FALLBACK_CONTENT.comparisonSection;
    const ctaSection = content.ctaSection ?? FALLBACK_CONTENT.ctaSection;

    return (
        <div className='flex flex-col'>
            <PublicHeader />
            <main className="governa-page">

                <div className="container">

                    <nav>
                        {content.nav?.brandHref ? (
                            <Link href={content.nav.brandHref} className="logo">
                                {content.nav.brandText ?? FALLBACK_CONTENT.nav?.brandText}
                            </Link>
                        ) : (
                            <div className="logo">{content.nav?.brandText ?? FALLBACK_CONTENT.nav?.brandText}</div>
                        )}

                        {(content.nav?.ctaHref || FALLBACK_CONTENT.nav?.ctaHref) && (
                            <Link href={content.nav?.ctaHref ?? FALLBACK_CONTENT.nav!.ctaHref!} className="cta-button">
                                {content.nav?.ctaText ?? FALLBACK_CONTENT.nav?.ctaText ?? 'Get Started'}
                            </Link>
                        )}
                    </nav>

                    <section className="hero">
                        <div className="floating-cards">
                            {(hero?.floatingCards ?? []).map((card, index) => {
                                if (!card?.image) return null;
                                return (
                                    <div className="float-card" key={`${card.image}-${index}`}>
                                        <Image
                                            src={card.image}
                                            alt={card.alt ?? 'Governa Pro'}
                                            width={card.width ?? 100}
                                            height={card.height ?? 60}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        {hero?.eyebrow && <p className="text-sm uppercase tracking-[0.4em] text-gray-400 mb-4">{hero.eyebrow}</p>}
                        <h1 dangerouslySetInnerHTML={{ __html: hero?.heading?.replace(/\n/g, '<br />') ?? '' }} />
                        {hero?.description && <p>{hero.description}</p>}
                        <div className="flex gap-4 justify-center flex-wrap">
                            {hero?.primaryCta?.href && (
                                <Link href={hero.primaryCta.href} className="cta-button">
                                    {hero.primaryCta.label ?? 'Schedule Demo'}
                                </Link>
                            )}
                            {hero?.secondaryCta?.href && (
                                <Link href={hero.secondaryCta.href} className="cta-button" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)' }}>
                                    {hero.secondaryCta.label ?? 'Learn More'}
                                </Link>
                            )}
                        </div>
                    </section>
                </div>

                <section className="comparison-section">
                    <div className="container">
                        <h2 className="section-title">{comparisonSection?.title}</h2>

                        <div className="comparison-grid">
                            <div className="comparison-card with-governance">
                                <div className="card-header">
                                    <div className="icon with-icon">{comparisonSection?.withGovernance?.icon ?? '✓'}</div>
                                    <h3 className="card-title">{comparisonSection?.withGovernance?.title ?? 'With Governance'}</h3>
                                </div>
                                <ul className="benefit-list">
                                    {(comparisonSection?.withGovernance?.benefits ?? []).map((benefit, index) => (
                                        <li key={`with-benefit-${index}`} className="benefit-item">
                                            {benefit?.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="comparison-card without-governance">
                                <div className="card-header">
                                    <div className="icon without-icon">{comparisonSection?.withoutGovernance?.icon ?? '✕'}</div>
                                    <h3 className="card-title">{comparisonSection?.withoutGovernance?.title ?? 'Without Governance'}</h3>
                                </div>
                                <ul className="benefit-list">
                                    {(comparisonSection?.withoutGovernance?.benefits ?? []).map((benefit, index) => (
                                        <li key={`without-benefit-${index}`} className="benefit-item">
                                            {benefit?.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <div className="container">
                        <h2>{ctaSection?.title}</h2>
                        {ctaSection?.subtitle && <p>{ctaSection.subtitle}</p>}
                        {ctaSection?.primaryCta?.href && (
                            <Link href={ctaSection.primaryCta.href} className="cta-button">
                                {ctaSection.primaryCta.label ?? 'Start Your Governance Journey'}
                            </Link>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
