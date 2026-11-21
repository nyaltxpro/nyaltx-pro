'use client';

import Faq from '@/components/Faq';
import PublicHeader from '@/components/PublicHeader';
import { useLandingPageContent } from '@/hooks/useTinaContent';
import {
    ExchangeIcon,
    NetworkIcon,
    TokenIcon,
    WalletIcon,
} from '@web3icons/react/dynamic';
import type { Variants } from 'framer-motion';
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useReducedMotion,
} from 'framer-motion';
import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Layers3,
    Megaphone,
    Network,
    ShieldCheck,
    Sparkles,
    Wallet,
    type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.97 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const sectionHeadingClass =
    'mx-auto max-w-3xl text-center font-sans text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[0.98] tracking-[-0.06em] text-white';
const MotionLink = motion(Link);

interface LandingPageProps {
    initialContent?: any;
    data?: any;
}

export default function LandingPage(props?: LandingPageProps) {
    const serverContent = props?.initialContent || props?.data?.landing || null;
    const { content: landingContent, loading, error } = useLandingPageContent(serverContent);
    const shouldReduceMotion = useReducedMotion();
    const scrollRevealProps = shouldReduceMotion
        ? {}
        : { initial: 'hidden' as const, whileInView: 'show' as const };

    if (loading && !landingContent) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (error && !landingContent) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Failed to load content</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const configuredTestimonials = landingContent?.testimonials?.items as
        (LandingTestimonial | null | undefined)[] | null | undefined;
    const testimonialItems = configuredTestimonials?.filter(
        (testimonial): testimonial is LandingTestimonial =>
            Boolean(testimonial?.quote && testimonial.author)
    ) ?? [
        {
            quote: 'NYALTX helped us boost discovery during launch week.',
            author: 'Team Atlas',
        },
        {
            quote: 'The Race to Liberty brought real traffic and holders.',
            author: 'Liberty Labs',
        },
        {
            quote: 'Smooth UX and flexible payments — exactly what we needed.',
            author: 'DeltaX',
        },
    ];
    const heroTitle = landingContent?.hero?.title || 'Discover. Track. Explore the Future of Digital Markets.';
    const heroTitleParts =
        heroTitle.match(/[^.!?]+[.!?]?/g)?.map(part => part.trim()).filter(Boolean) ?? [heroTitle];
    const heroTitleLead = heroTitleParts.slice(0, -1).join(' ');
    const heroTitleEmphasis = heroTitleParts.at(-1) || heroTitle;

    return (
        <div className="min-h-screen">
            {/* 1) Hero */}
            <motion.section
                className="relative overflow-hidden min-h-[70vh] md:min-h-[78vh] flex flex-col"
                variants={container}
                initial={shouldReduceMotion ? false : 'hidden'}
                animate="show"
            >
                <PublicHeader />
                <div className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-24 md:py-32 lg:py-36">
                    <div className="grid w-full grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-14">
                        <motion.div className="max-w-3xl overflow-visible" variants={fadeUp}>
                            <h1 className="max-w-3xl font-sans text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[0.9] tracking-[-0.06em] [word-spacing:-0.08em] text-white">
                                {heroTitleLead && (
                                    <span className="block font-serif font-extralight italic tracking-[-0.04em] text-slate-200">
                                        {heroTitleLead}
                                    </span>
                                )}
                                <span className="mt-2 block font-semibold italic">{heroTitleEmphasis}</span>
                            </h1>
                            <p className="mt-6 text-xs text-gray-300/90 max-w-2xl leading-relaxed sm:text-sm">
                                {landingContent?.hero?.subtitle || 'Real-time insights, curated listings, and promotional placements to help your project reach more holders across chains.'}
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <MotionLink
                                    href={landingContent?.hero?.ctaLink || '/dashboard'}
                                    className="rounded-full bg-cyan-500/90 px-5 py-2.5 font-semibold tracking-tight text-white hover:bg-cyan-400 transition-colors"
                                    whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }}
                                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                                >
                                    {landingContent?.hero?.ctaText || 'Explore Dashboard'}
                                </MotionLink>
                                <MotionLink
                                    href="/pricing"
                                    className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 font-semibold tracking-tight text-white hover:bg-white/10 transition-colors"
                                    whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }}
                                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                                >
                                    View Pricing
                                </MotionLink>
                            </div>
                        </motion.div>
                        <motion.div className="flex justify-center md:justify-center" variants={scaleIn}>
                            <div className="relative">
                                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 blur-2xl" />
                                <Image
                                    src={landingContent?.hero?.backgroundImage || '/hero2.png'}
                                    alt="NYALTX Logo"
                                    width={300}
                                    height={300}
                                    priority
                                    className="relative h-auto w-[580px]"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            <motion.section
                className="overflow-hidden"
                variants={container}
                {...scrollRevealProps}
                viewport={{ once: true, amount: 0.2 }}
            >
                <NetworkLogoCarousel />
            </motion.section>

            <motion.section
                className="mx-auto max-w-7xl px-6 py-10 text-slate-100"
                variants={container}
                {...scrollRevealProps}
                viewport={{ once: true, amount: 0.2 }}
            >
                <StatsShowcase
                    title={landingContent?.stats?.title || 'Platform insights at a glance'}
                    items={
                        landingContent?.stats?.items?.length
                            ? landingContent.stats.items
                            : [
                                  { value: '132', label: 'Networks' },
                                  { value: '21,586', label: 'DEXs' },
                                  { value: '19,440,364', label: 'Pools' },
                                  { value: '29,055,602', label: 'Tokens' },
                              ]
                    }
                />
            </motion.section>

            <motion.section
                className="mx-auto max-w-7xl px-6 py-16 md:py-20"
                variants={container}
                {...scrollRevealProps}
                viewport={{ once: true, amount: 0.2 }}
            >
                <motion.h2
                    className={sectionHeadingClass}
                    variants={fadeUp}
                >
                    {landingContent?.features?.title || 'Why NYALTX'}
                </motion.h2>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {landingContent?.features?.items?.slice(0, 3).map((feature, index) => (
                        <motion.div key={index} variants={scaleIn}>
                            <Feature
                                title={feature.title}
                                desc={feature.description}
                                icon={feature.icon}
                            />
                        </motion.div>
                    )) || (
                            <>
                                <motion.div variants={scaleIn}>
                                    <Feature
                                        title="Multi-chain coverage"
                                        desc="Follow activity across popular EVM networks and beyond, with fast updates."
                                    />
                                </motion.div>
                                <motion.div variants={scaleIn}>
                                    <Feature
                                        title="Promotional placements"
                                        desc="Race to Liberty campaign placements, podcast mentions, and homepage features."
                                    />
                                </motion.div>
                                <motion.div variants={scaleIn}>
                                    <Feature
                                        title="Flexible payments"
                                        desc="Pay with cards (Stripe), ETH, or NYAX with a 20% discount on token payments."
                                    />
                                </motion.div>
                            </>
                        )}
                </div>
            </motion.section>

            <motion.section
                className="mx-auto max-w-7xl px-6 py-10"
                variants={container}
                {...scrollRevealProps}
                viewport={{ once: true, amount: 0.2 }}
            >
                <motion.h2
                    className={sectionHeadingClass}
                    variants={fadeUp}
                >
                    Popular wallets
                </motion.h2>
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {[
                        'MetaMask',
                        'Coinbase Wallet',
                        'Trust Wallet',
                        'Rainbow',
                        'Phantom',
                        'OKX Wallet',
                    ].map((name, i) => (
                        <motion.div
                            key={i}
                            variants={scaleIn}
                        >
                            <LandingCard>
                                <WalletIcon name={name} variant="branded" size="36" />
                                <div className="text-sm text-slate-200">{name}</div>
                            </LandingCard>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            <motion.section
                className="mx-auto max-w-7xl px-6 py-16 md:py-20"
                variants={container}
                {...scrollRevealProps}
                viewport={{ once: true, amount: 0.2 }}
            >
                <motion.h2 className={sectionHeadingClass} variants={fadeUp}>
                    How it works
                </motion.h2>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div variants={fadeUp}>
                        <Step
                            index={1}
                            title="Sign up for NYALTX Pro"
                            desc="Create your Pro account to unlock listings and placements."
                        />
                    </motion.div>
                    <motion.div variants={fadeUp}>
                        <Step
                            index={2}
                            title="Choose a tier"
                            desc="Pick Paddle, Motor, or Helicopter depending on your goals."
                        />
                    </motion.div>
                    <motion.div variants={fadeUp}>
                        <Step
                            index={3}
                            title="Track and grow"
                            desc="Monitor stats, engage with holders, and scale your reach."
                        />
                    </motion.div>
                </div>
            </motion.section>

            <motion.section
                className="mx-auto max-w-7xl px-6 py-16 md:py-20"
                variants={container}
                {...scrollRevealProps}
                viewport={{ once: true, amount: 0.2 }}
            >
                <motion.h2
                    className={sectionHeadingClass}
                    variants={fadeUp}
                >
                    {landingContent?.testimonials?.title || 'What builders say'}
                </motion.h2>
                <StaggerTestimonials items={testimonialItems} />
            </motion.section>

            <motion.section
                className="mx-auto max-w-7xl px-6 py-10"
                variants={container}
                {...scrollRevealProps}
                viewport={{ once: true, amount: 0.2 }}
            >
                <Faq variant="landing" />
            </motion.section>

            <motion.section
                className="mx-auto max-w-7xl px-6 py-16 md:py-20"
                variants={container}
                {...scrollRevealProps}
                viewport={{ once: true, amount: 0.2 }}
            >
                <motion.h2
                    className={sectionHeadingClass}
                    variants={fadeUp}
                >
                    Ecosystem integrations
                </motion.h2>
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {[
                        { name: 'Uniswap', fallback: 'uniswap', label: 'Uniswap' },
                        { name: 'Binance', fallback: 'binance', label: 'Binance' },
                        { name: 'Sushi Swap', fallback: 'sushiswap', label: 'Sushi Swap' },
                        { name: 'Pancake Swap', fallback: 'pancakeswap', label: 'PancakeSwap' },
                        { name: 'Gate Io', fallback: 'raydium', label: 'Gate Io' },
                        { name: 'Crypto.com', fallback: 'base', label: 'Crypto.com' },
                    ].map((it, i) => (
                        <motion.div
                            key={i}
                            variants={scaleIn}
                        >
                            <LandingCard>
                                <CryptoIcon name={it.name} size={36} kind={'exchange'} fallback={it.fallback} />
                                <span className="text-sm text-slate-200">{it.label}</span>
                            </LandingCard>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            <motion.section
                className="mx-auto max-w-7xl px-6 py-16 md:py-20"
                variants={container}
                {...scrollRevealProps}
                viewport={{ once: true, amount: 0.2 }}
            >
                <motion.h2
                    className={sectionHeadingClass}
                    variants={fadeUp}
                >
                    Built for Web3
                </motion.h2>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            t: 'Non-custodial',
                            d: 'You keep control. Connect your wallet and transact directly on-chain.',
                        },
                        {
                            t: 'Multi-network',
                            d: 'Ethereum-first with expanding L2 and multi-chain coverage.',
                        },
                        {
                            t: 'Dev-friendly',
                            d: 'Modular architecture and API pathways planned for partners.',
                        },
                    ].map((x, i) => (
                        <motion.div
                            key={i}
                            variants={scaleIn}
                        >
                            <LandingCard>
                                <div className="text-lg font-semibold">{x.t}</div>
                                <p className="text-gray-300/90 text-sm">{x.d}</p>
                            </LandingCard>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            <motion.section
                className="mx-auto max-w-7xl px-6 py-16 md:py-20"
                variants={container}
                {...scrollRevealProps}
                viewport={{ once: true, amount: 0.2 }}
            >
                <motion.div
                    className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    variants={scaleIn}
                >
                    <div>
                        <h3 className="text-xl md:text-2xl font-semibold">Ready to get visibility?</h3>
                        <p className="text-gray-300">
                            Start with NYALTX Pro, then choose a promotional tier that fits your roadmap.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/pricing"
                            className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-500"
                        >
                            See Pricing
                        </Link>
                    </div>
                </motion.div>
            </motion.section>
        </div>
    );
}

function TestimonialAvatar({ author, src }: { author: string; src?: string | null }) {
    const [imageFailed, setImageFailed] = React.useState(false);
    const initials =
        author
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase() || '?';
    const escapedInitials = initials.replace(/[&<>"']/g, character => {
        const entities: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;',
        };
        return entities[character];
    });
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0891b2"/><stop offset="1" stop-color="#3730a3"/></linearGradient></defs><circle cx="32" cy="32" r="32" fill="url(#bg)"/><text x="32" y="41" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="24" font-weight="700">${escapedInitials}</text></svg>`;
    const imageSrc =
        src && !imageFailed
            ? src
            : `data:image/svg+xml,${encodeURIComponent(fallbackSvg)}`;

    return (
        <img
            src={imageSrc}
            alt={author}
            onError={() => setImageFailed(true)}
            className="mb-4 h-12 w-12 rounded-full border border-white/20 object-cover object-top"
        />
    );
}

interface LandingTestimonial {
    quote: string;
    author: string;
    role?: string | null;
    avatar?: string | null;
}

function StaggerTestimonials({ items }: { items: LandingTestimonial[] }) {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [cardSize, setCardSize] = React.useState(290);
    const count = items.length;

    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 640px)');
        const updateCardSize = () => setCardSize(mediaQuery.matches ? 365 : 290);

        updateCardSize();
        mediaQuery.addEventListener('change', updateCardSize);
        return () => mediaQuery.removeEventListener('change', updateCardSize);
    }, []);

    if (!count) return null;

    const move = (offset: number) => {
        setActiveIndex(current => (current + offset + count) % count);
    };

    return (
        <div className="relative mt-8 h-[560px] w-full overflow-hidden sm:h-[600px]">
            {items.map((testimonial, index) => {
                const relativeIndex = (index - activeIndex + count) % count;
                const position = relativeIndex > count / 2 ? relativeIndex - count : relativeIndex;
                const isActive = position === 0;

                return (
                    <motion.button
                        key={`${testimonial.author}-${index}`}
                        type="button"
                        aria-label={`Show testimonial by ${testimonial.author}`}
                        aria-pressed={isActive}
                        onClick={() => move(position)}
                        className={`absolute left-1/2 top-1/2 overflow-hidden border-2 p-6 text-left transition-colors duration-500 sm:p-8 ${
                            isActive
                                ? 'z-10 border-cyan-300/70 bg-gradient-to-br from-cyan-700 to-blue-900 text-white'
                                : 'z-0 border-white/10 bg-slate-900/95 text-slate-200'
                        }`}
                        style={{
                            clipPath:
                                'polygon(40px 0%, calc(100% - 40px) 0%, 100% 40px, 100% 100%, 40px 100%, 0 100%, 0 0)',
                        }}
                        animate={{
                            width: cardSize,
                            height: cardSize,
                            x: `calc(-50% + ${position * (cardSize / 1.5)}px)`,
                            y: `calc(-50% + ${isActive ? -48 : position % 2 ? 14 : -14}px)`,
                            rotate: isActive ? 0 : position % 2 ? 2.5 : -2.5,
                            boxShadow: isActive
                                ? '0 12px 32px rgba(8, 145, 178, 0.3)'
                                : '0 8px 24px rgba(0, 0, 0, 0.3)',
                        }}
                        transition={{
                            type: 'spring',
                            mass: 2,
                            stiffness: 350,
                            damping: 42,
                        }}
                    >
                        <div className="flex h-full flex-col">
                            <TestimonialAvatar
                                author={testimonial.author}
                                src={testimonial.avatar}
                            />
                            <p className="line-clamp-5 text-sm leading-6 sm:text-base">
                                “{testimonial.quote}”
                            </p>
                            <div className="mt-auto pt-4">
                                <p
                                    className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-100'}`}
                                >
                                    — {testimonial.author}
                                </p>
                                {testimonial.role && (
                                    <p
                                        className={`mt-1 text-xs ${isActive ? 'text-cyan-100/80' : 'text-slate-400'}`}
                                    >
                                        {testimonial.role}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.button>
                );
            })}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-3">
                <button
                    type="button"
                    aria-label="Previous testimonial"
                    onClick={() => move(-1)}
                    className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-slate-900/90 text-slate-100 transition hover:border-cyan-300/60 hover:bg-cyan-950"
                >
                    <ChevronLeft aria-hidden="true" size={22} />
                </button>
                <button
                    type="button"
                    aria-label="Next testimonial"
                    onClick={() => move(1)}
                    className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-slate-900/90 text-slate-100 transition hover:border-cyan-300/60 hover:bg-cyan-950"
                >
                    <ChevronRight aria-hidden="true" size={22} />
                </button>
            </div>
        </div>
    );
}

function CryptoIcon({
    name,
    size = 32,
    fallback,
    kind,
}: {
    name: string;
    size?: number;
    fallback?: string;
    kind?: 'token' | 'network' | 'exchange';
}) {
    const n = name.trim();
    const lower = n.toLowerCase();

    const exchanges = new Set([
        'uniswap',
        'uniswap v2',
        'uniswap v3',
        'sushi',
        'sushiswap',
        'pancake',
        'pancakeswap',
        'raydium',
        '1inch',
    ]);
    const networks = new Set([
        'ethereum',
        'polygon',
        'optimism',
        'base',
        'arbitrum',
        'scroll',
        'fantom',
        'linea',
        'mantle',
        'solana',
    ]);
    const tokens = new Set([
        'bitcoin',
        'eth',
        'ethereum',
        'usdc',
        'usdt',
        'dai',
        'solana',
        'sol',
        'matic',
        'arb',
    ]);

    const type: 'token' | 'network' | 'exchange' = kind
        ? kind
        : exchanges.has(lower)
            ? 'exchange'
            : networks.has(lower)
                ? 'network'
                : 'token';

    try {
        if (type === 'exchange') return <ExchangeIcon name={n} variant="branded" size={String(size)} />;
        if (type === 'network') return <NetworkIcon name={n} variant="branded" size={String(size)} />;
        return <TokenIcon name={n} variant="branded" size={String(size)} />;
    } catch {
        // Ignore runtime icon errors and fallback to local asset.
    }

    const fallbackSrc = `/${(fallback || name).toLowerCase()}.svg`;
    return <Image src={fallbackSrc} alt={name} width={size} height={size} className="opacity-90" />;
}

const NETWORK_LOGOS = [
    'Ethereum',
    'Polygon',
    'Optimism',
    'Base',
    'Arbitrum',
    'Scroll',
    'Fantom',
    'Linea',
    'Mantle',
];

function NetworkLogoCarousel() {
    const shouldReduceMotion = useReducedMotion();
    const [hoveredLogo, setHoveredLogo] = React.useState<string | null>(null);
    const [trackWidth, setTrackWidth] = React.useState(0);
    const measureRef = React.useRef<HTMLDivElement | null>(null);
    const x = useMotionValue(0);

    React.useEffect(() => {
        const element = measureRef.current;
        if (!element) return;

        const measure = () => setTrackWidth(element.getBoundingClientRect().width);
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        measure();

        return () => observer.disconnect();
    }, []);

    useAnimationFrame((_, delta) => {
        if (shouldReduceMotion || hoveredLogo || !trackWidth) return;

        const next = x.get() - (delta / 1000) * 56;
        x.set(next <= -trackWidth ? next % trackWidth : next);
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
        >
            <motion.div style={{ x }} className="flex w-max">
                <div ref={measureRef} className="flex">
                    {NETWORK_LOGOS.map(name => (
                        <NetworkLogoCell
                            key={`primary-${name}`}
                            name={name}
                            hoveredLogo={hoveredLogo}
                            setHoveredLogo={setHoveredLogo}
                        />
                    ))}
                </div>
                <div className="flex" aria-hidden="true">
                    {NETWORK_LOGOS.map(name => (
                        <NetworkLogoCell
                            key={`duplicate-${name}`}
                            name={name}
                            hoveredLogo={hoveredLogo}
                            setHoveredLogo={setHoveredLogo}
                            duplicate
                        />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

function NetworkLogoCell({
    name,
    hoveredLogo,
    setHoveredLogo,
    duplicate = false,
}: {
    name: string;
    hoveredLogo: string | null;
    setHoveredLogo: React.Dispatch<React.SetStateAction<string | null>>;
    duplicate?: boolean;
}) {
    const isDimmed = hoveredLogo !== null && hoveredLogo !== name;

    return (
        <motion.button
            type="button"
            onPointerEnter={() => setHoveredLogo(name)}
            onPointerLeave={() =>
                setHoveredLogo(current => (current === name ? null : current))
            }
            onFocus={() => setHoveredLogo(name)}
            onBlur={() =>
                setHoveredLogo(current => (current === name ? null : current))
            }
            animate={{
                filter: isDimmed ? 'grayscale(1)' : 'grayscale(0)',
                opacity: isDimmed ? 0.48 : 1,
            }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex h-[72px] min-w-[148px] shrink-0 items-center justify-center px-5 md:h-[82px] md:min-w-[176px] md:px-7"
            aria-label={`${name} network`}
            aria-hidden={duplicate}
            tabIndex={duplicate ? -1 : 0}
        >
            <span className="flex items-center gap-3 whitespace-nowrap">
                <CryptoIcon name={name} size={40} kind="network" />
                <span className="text-sm font-semibold tracking-tight text-slate-200 md:text-base">
                    {name}
                </span>
            </span>
        </motion.button>
    );
}

interface LandingStat {
    value: string;
    label: string;
}

function StatsShowcase({ title, items }: { title: string; items: LandingStat[] }) {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const spring = { type: 'spring' as const, stiffness: 320, damping: 32 };
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div className="relative overflow-hidden" variants={fadeUp}>
            <div className="relative px-6 py-14 text-center sm:px-8 sm:py-16 md:px-10 md:py-[4.5rem]">
                <h2 className={`${sectionHeadingClass} mx-auto text-center`}>
                    {title}
                </h2>
            </div>
            <div
                className="relative grid grid-cols-2 md:grid-cols-4"
                onMouseLeave={() => setActiveIndex(0)}
            >
                {items.map((stat, index) => {
                    const isActive = index === activeIndex;

                    return (
                        <motion.button
                            key={`${stat.label}-${index}`}
                            type="button"
                            onMouseEnter={() => setActiveIndex(index)}
                            onFocus={() => setActiveIndex(index)}
                            onClick={() => setActiveIndex(index)}
                            aria-pressed={isActive}
                            whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className="relative overflow-hidden px-6 py-8 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-inset md:px-8 md:py-10"
                        >
                            {isActive && (
                                <>
                                    <motion.div
                                        layoutId="nyaltx-stats-left"
                                        transition={spring}
                                        className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent md:hidden"
                                    />
                                    <motion.div
                                        layoutId="nyaltx-stats-right"
                                        transition={spring}
                                        className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent md:hidden"
                                    />
                                    <motion.div
                                        layoutId="nyaltx-stats-top"
                                        transition={spring}
                                        className="absolute inset-x-0 top-0 hidden h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent md:block"
                                    />
                                    <motion.div
                                        layoutId="nyaltx-stats-bottom"
                                        transition={spring}
                                        className="absolute inset-x-0 bottom-0 hidden h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent md:block"
                                    />
                                </>
                            )}
                            <div className="relative flex min-h-[120px] flex-col items-center justify-center gap-2">
                                <span
                                    className={`text-[clamp(2.15rem,3.9vw,3.45rem)] leading-none tracking-[-0.07em] transition-colors duration-300 ${
                                        isActive ? 'text-white' : 'text-slate-500'
                                    }`}
                                >
                                    {stat.value}
                                </span>
                                <span
                                    className={`max-w-[13rem] text-[clamp(0.9rem,1.05vw,1.02rem)] leading-[1.32] tracking-[-0.04em] transition-colors duration-300 ${
                                        isActive ? 'text-slate-200' : 'text-slate-500'
                                    }`}
                                >
                                    {stat.label}
                                </span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}

function Feature({ title, desc, icon }: { title: string; desc: string; icon?: string }) {
    const Icon = getFeatureIcon(icon, title, desc);

    return (
        <LandingCard>
            <Icon aria-hidden="true" className="text-cyan-300" size={28} strokeWidth={1.75} />
            <div className="text-lg font-semibold">{title}</div>
            <p className="text-gray-300/90 text-sm">{desc}</p>
        </LandingCard>
    );
}

function getFeatureIcon(icon: string | undefined, title: string, desc: string): LucideIcon {
    switch (icon?.trim().toLowerCase()) {
        case 'network':
            return Network;
        case 'layers':
            return Layers3;
        case 'megaphone':
            return Megaphone;
        case 'wallet':
            return Wallet;
        case 'chart':
            return BarChart3;
        case 'shield':
            return ShieldCheck;
        case 'sparkles':
            return Sparkles;
    }

    const content = `${title} ${desc}`.toLowerCase();

    if (/network|chain/.test(content)) return Network;
    if (/promot|placement|campaign|marketing/.test(content)) return Megaphone;
    if (/payment|pay|wallet|card/.test(content)) return Wallet;
    if (/analytics|insight|track|monitor|stat/.test(content)) return BarChart3;
    if (/security|secure|protect|custod/.test(content)) return ShieldCheck;
    if (/multi|layer|ecosystem/.test(content)) return Layers3;

    return Sparkles;
}

function Step({ index, title, desc }: { index: number; title: string; desc: string }) {
    return (
        <LandingCard>
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-black text-sm font-bold">
                {index}
            </div>
            <div className="text-lg font-semibold">{title}</div>
            <p className="text-gray-300/90 text-sm">{desc}</p>
        </LandingCard>
    );
}

function LandingCard({ children }: { children: React.ReactNode }) {
    const shouldReduceMotion = useReducedMotion();
    const accentLineClass =
        'pointer-events-none absolute from-transparent via-cyan-400 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100';

    return (
        <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="group relative flex h-full min-h-[184px] flex-col items-center justify-center gap-2 overflow-hidden px-6 py-8 text-center"
        >
            <div
                aria-hidden="true"
                className={`${accentLineClass} inset-y-0 left-0 w-px bg-gradient-to-b md:hidden`}
            />
            <div
                aria-hidden="true"
                className={`${accentLineClass} inset-y-0 right-0 w-px bg-gradient-to-b md:hidden`}
            />
            <div
                aria-hidden="true"
                className={`${accentLineClass} inset-x-0 top-0 hidden h-px bg-gradient-to-r md:block`}
            />
            <div
                aria-hidden="true"
                className={`${accentLineClass} inset-x-0 bottom-0 hidden h-px bg-gradient-to-r md:block`}
            />
            <div className="relative flex flex-col items-center justify-center gap-2">
                {children}
            </div>
        </motion.div>
    );
}
