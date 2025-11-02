'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    FiDownload,
    FiExternalLink,
    FiHome,
    FiMail,
    FiMenu,
    FiSend,
    FiTwitter,
    FiX
} from 'react-icons/fi';

export default function WhitepaperPage() {
    const [activeSection, setActiveSection] = useState('introduction');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const sections = [
        { id: 'introduction', title: 'Introduction', level: 0 },
        { id: 'executive-summary', title: 'Executive Summary', level: 0 },
        { id: 'vision-mission', title: 'Vision & Mission', level: 0 },
        { id: 'vision', title: 'Vision', level: 1 },
        { id: 'mission', title: 'Mission', level: 1 },
        { id: 'market-opportunity', title: 'Market Opportunity', level: 0 },
        { id: 'platform-overview', title: 'Platform Overview', level: 0 },
        { id: 'crypto-profiles', title: 'Crypto Profiles', level: 1 },
        { id: 'embedded-trading', title: 'Embedded Trading', level: 1 },
        { id: 'token-generator', title: 'Token Generator', level: 1 },
        { id: 'nyax-token', title: 'The NYAX Token', level: 0 },
        { id: 'payment-token', title: 'Payment Token', level: 1 },
        { id: 'governance', title: 'Governance', level: 1 },
        { id: 'staking-rewards', title: 'Staking & Rewards', level: 1 },
        { id: 'tokenomics', title: 'Tokenomics', level: 0 },
        { id: 'token-details', title: 'Token Details', level: 1 },
        { id: 'allocation', title: 'Allocation', level: 1 },
        { id: 'revenue-model', title: 'Revenue Model', level: 1 },
        { id: 'competitive-advantage', title: 'Competitive Advantage', level: 0 },
        { id: 'roadmap', title: 'Roadmap', level: 0 },
        { id: 'phase-1', title: 'Phase 1 - Launch (2025)', level: 1 },
        { id: 'phase-2', title: 'Phase 2 - Growth (2025)', level: 1 },
        { id: 'phase-3', title: 'Phase 3 - Expansion (2026)', level: 1 },
        { id: 'phase-4', title: 'Phase 4 - Scaling (2026+)', level: 1 },
        { id: 'conclusion', title: 'Conclusion', level: 0 },
        { id: 'contact', title: 'Contact Information', level: 0 },
    ];

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
        setSidebarOpen(false);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Auto-update active section based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections.map(section => ({
                id: section.id,
                element: document.getElementById(section.id),
            })).filter(item => item.element);

            const currentSection = sectionElements.find(({ element }) => {
                if (!element) return false;
                const rect = element.getBoundingClientRect();
                return rect.top <= 100 && rect.bottom > 100;
            });

            if (currentSection) {
                setActiveSection(currentSection.id);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sections]);

    return (
        <div className="min-h-screen bg-inherit text-gray-900">
            {/* GitBook-style Header */}
            <header className="sticky top-0 z-50 bg-inherit   shadow-sm">
                <div className="flex items-center justify-between px-4 h-16">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2  rounded-md"
                        >
                            {sidebarOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
                        </button>
                        <Link href="/" className="flex items-center gap-2 text-gray-900 hover:text-blue-600">
                            <FiHome className="h-5 w-5" />
                            <span className="font-semibold">NYALTX</span>
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="font-medium">Whitepaper</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            <FiDownload className="h-4 w-4" />
                            PDF
                        </button>
                        <Link
                            href="https://nyaltx.com"
                            target="_blank"
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <FiExternalLink className="h-4 w-4" />
                            Platform
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* GitBook-style Sidebar */}
                <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 fixed lg:static top-16 left-0 z-40 w-80 h-[calc(100vh-4rem)] bg-gray-50 border-r border-gray-200 overflow-y-auto transition-transform duration-200 ease-in-out`}>
                    <div className="p-6">
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-gray-900 mb-2">NYALTX Whitepaper</h1>
                            <p className="text-sm text-gray-600">Powered by the NYAX Token</p>
                        </div>

                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${section.level === 1 ? 'ml-4' : ''
                                        } ${activeSection === section.id
                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    {section.title}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 top-16 bg-black bg-opacity-50 z-30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* GitBook-style Content */}
                <main className="flex-1 min-h-[calc(100vh-4rem)] bg-white">
                    <div className="max-w-4xl mx-auto px-6 py-8 lg:px-12 lg:py-12">
                        <article className="prose prose-lg max-w-none">

                            {/* Introduction */}
                            <section id="introduction" className="mb-16">
                                <h1 className="text-4xl font-bold text-gray-900 mb-6">NYALTX Whitepaper</h1>
                                <p className="text-xl text-gray-600 mb-8">
                                    New York Alt Exchange - Powered by the NYAX Token
                                </p>
                                <p className="text-gray-700 leading-relaxed">
                                    Welcome to the comprehensive technical documentation for NYALTX, a revolutionary decentralized finance (DeFi) platform
                                    designed to transform how crypto projects gain visibility, liquidity, and growth opportunities in the Web3 ecosystem.
                                </p>
                            </section>

                            {/* Executive Summary */}
                            <section id="executive-summary" className="mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Executive Summary</h2>
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
                                    <p className="text-blue-800 font-medium">
                                        NYALTX represents the next evolution in decentralized finance infrastructure,
                                        combining traditional financial tools with cutting-edge blockchain technology.
                                    </p>
                                </div>
                                <ul className="space-y-4 text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                        <span><strong>NYALT Exchange (NYALTX.com)</strong> is a decentralized finance (DeFi) hub designed to give crypto projects visibility, liquidity, and growth opportunities.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                        <span>Unlike traditional data aggregators, NYALT integrates project profiles, embedded trading, token creation, and community engagement tools—all powered by the <strong>NYAX token</strong>.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                        <span><strong>NYAX is more than a currency.</strong> It is the fuel of the ecosystem, supporting payments, staking rewards, governance, marketing, and real-world access to investor networks.</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Vision & Mission */}
                            <section id="vision-mission" className="mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Vision & Mission</h2>

                                <div id="vision" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Vision</h3>
                                    <div className="bg-green-50 border-l-4 border-green-400 p-6">
                                        <p className="text-green-800">
                                            To become the leading Web3 ecosystem where projects gain visibility, investors access transparent data and liquidity, and communities are rewarded for engagement.
                                        </p>
                                    </div>
                                </div>

                                <div id="mission" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Mission</h3>
                                    <div className="bg-purple-50 border-l-4 border-purple-400 p-6">
                                        <p className="text-purple-800">
                                            To empower projects and investors with tools that combine DeFi trading, marketing, and social interaction—backed by a sustainable token economy.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Market Opportunity */}
                            <section id="market-opportunity" className="mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Market Opportunity</h2>
                                <div className="grid md:grid-cols-2 gap-8 mb-6">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">18,000+</div>
                                        <p className="text-gray-700">Active tokens competing for visibility across fragmented markets</p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <div className="text-3xl font-bold text-green-600 mb-2">Trillions</div>
                                        <p className="text-gray-700">In annual DeFi trading volume, but most platforms lack project storytelling tools</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-4">
                                    Most platforms offer analytics but do not provide profile-driven, community-first visibility.
                                </p>
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                                    <p className="text-yellow-800 font-medium">
                                        <strong>NYALTX fills this gap</strong> with a project + investor marketing ecosystem, monetizing not just trading, but also attention and engagement.
                                    </p>
                                </div>
                            </section>

                            {/* Platform Overview */}
                            <section id="platform-overview" className="mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Platform Overview</h2>

                                <div id="crypto-profiles" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Crypto Profiles</h3>
                                    <p className="text-gray-700 mb-4">
                                        Customizable pages with charts, social links, news, and videos that give projects a professional presence.
                                    </p>
                                </div>

                                <div id="embedded-trading" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Embedded Trading</h3>
                                    <p className="text-gray-700 mb-4">
                                        Non-custodial swaps via Uniswap integration, allowing seamless trading directly from project profiles.
                                    </p>
                                </div>

                                <div id="token-generator" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Token Generator</h3>
                                    <p className="text-gray-700 mb-4">
                                        Simple token creation with liquidity fees, making it easy for projects to launch their tokens.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        <h4 className="font-semibold text-blue-800 mb-2">Profile Upgrades</h4>
                                        <p className="text-blue-700 text-sm">Paid in NYAX/ETH for boosted visibility</p>
                                    </div>
                                    <div className="bg-green-50 p-6 rounded-lg">
                                        <h4 className="font-semibold text-green-800 mb-2">Advertising Marketplace</h4>
                                        <p className="text-green-700 text-sm">Sponsored listings and promotions</p>
                                    </div>
                                    <div className="bg-purple-50 p-6 rounded-lg">
                                        <h4 className="font-semibold text-purple-800 mb-2">Venture Network Events</h4>
                                        <p className="text-purple-700 text-sm">Access to digital + real-world investor meetups</p>
                                    </div>
                                </div>
                            </section>

                            {/* The NYAX Token */}
                            <section id="nyax-token" className="mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">The NYAX Token</h2>

                                <div id="payment-token" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Payment Token</h3>
                                    <p className="text-gray-700 mb-4">
                                        NYAX serves as the primary payment method for platform services, offering discounts and exclusive features.
                                    </p>
                                </div>

                                <div id="governance" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Governance</h3>
                                    <p className="text-gray-700 mb-4">
                                        Token holders participate in platform governance, voting on key decisions and feature implementations.
                                    </p>
                                </div>

                                <div id="staking-rewards" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Staking & Rewards</h3>
                                    <p className="text-gray-700 mb-4">
                                        Stake NYAX tokens to earn rewards and access premium platform features.
                                    </p>
                                </div>
                            </section>

                            {/* Tokenomics */}
                            <section id="tokenomics" className="mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Tokenomics</h2>

                                <div id="token-details" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Token Details</h3>
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <ul className="space-y-2 text-gray-700">
                                            <li><strong>Name:</strong> NYAX Token</li>
                                            <li><strong>Symbol:</strong> NYAX</li>
                                            <li><strong>Total Supply:</strong> 1,000,000,000 NYAX</li>
                                            <li><strong>Blockchain:</strong> Ethereum (ERC-20)</li>
                                        </ul>
                                    </div>
                                </div>

                                <div id="allocation" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Allocation</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">40%</div>
                                            <p className="text-blue-800">Community & Ecosystem</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">25%</div>
                                            <p className="text-green-800">Team & Development</p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">20%</div>
                                            <p className="text-purple-800">Marketing & Partnerships</p>
                                        </div>
                                        <div className="bg-orange-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-orange-600">15%</div>
                                            <p className="text-orange-800">Reserve & Liquidity</p>
                                        </div>
                                    </div>
                                </div>

                                <div id="revenue-model" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Revenue Model</h3>
                                    <ul className="space-y-3 text-gray-700">
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                            <span>Platform fees from token generation and trading</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                            <span>Premium profile upgrades and advertising</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                            <span>Venture network event access fees</span>
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* Competitive Advantage */}
                            <section id="competitive-advantage" className="mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Competitive Advantage</h2>
                                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-6 mb-6">
                                    <p className="text-indigo-800 font-medium">
                                        NYALTX combines the best of DeFi trading, social media marketing, and venture networking in one integrated platform.
                                    </p>
                                </div>
                                <ul className="space-y-4 text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                                        <span><strong>Integrated Ecosystem:</strong> Unlike competitors who focus on single features, NYALTX provides end-to-end project lifecycle support</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                                        <span><strong>Community-First:</strong> Built-in social features and gamification drive organic engagement</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                                        <span><strong>Real-World Connections:</strong> Bridge between digital assets and traditional venture networks</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Roadmap */}
                            <section id="roadmap" className="mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Roadmap</h2>

                                <div id="phase-1" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Phase 1 - Launch (2025)</h3>
                                    <ul className="space-y-2 text-gray-700 ml-6">
                                        <li>• Platform launch with core features</li>
                                        <li>• NYAX token generation and distribution</li>
                                        <li>• Initial project onboarding</li>
                                    </ul>
                                </div>

                                <div id="phase-2" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Phase 2 - Growth (2025)</h3>
                                    <ul className="space-y-2 text-gray-700 ml-6">
                                        <li>• Token generator with fee structure</li>
                                        <li>• Staking pools and rewards system</li>
                                        <li>• Enhanced trading features</li>
                                    </ul>
                                </div>

                                <div id="phase-3" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Phase 3 - Expansion (2026)</h3>
                                    <ul className="space-y-2 text-gray-700 ml-6">
                                        <li>• Global venture network events</li>
                                        <li>• Merchandise and physical products</li>
                                        <li>• Cross-chain integration</li>
                                    </ul>
                                </div>

                                <div id="phase-4" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Phase 4 - Scaling (2026+)</h3>
                                    <ul className="space-y-2 text-gray-700 ml-6">
                                        <li>• Advanced analytics and AI features</li>
                                        <li>• Strategic partnerships and integrations</li>
                                        <li>• Global marketing campaigns</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Conclusion */}
                            <section id="conclusion" className="mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Conclusion</h2>
                                <div className="bg-gray-50 p-8 rounded-lg">
                                    <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                        NYALTX represents a paradigm shift in how crypto projects approach marketing, community building, and investor relations.
                                        By combining DeFi infrastructure with social engagement tools and real-world networking opportunities, we're creating
                                        a comprehensive ecosystem that serves the entire crypto project lifecycle.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        The NYAX token serves as the foundation of this ecosystem, incentivizing participation, governance, and long-term
                                        platform growth. Join us in building the future of decentralized project marketing and community engagement.
                                    </p>
                                </div>
                            </section>

                            {/* Contact Information */}
                            <section id="contact" className="mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Get in Touch</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <FiMail className="h-5 w-5 text-blue-600" />
                                                <a href="mailto:info@nyaltx.com" className="text-blue-600 hover:underline">
                                                    info@nyaltx.com
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FiExternalLink className="h-5 w-5 text-blue-600" />
                                                <a href="https://nyaltx.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    https://nyaltx.com
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Follow Us</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <FiTwitter className="h-5 w-5 text-blue-600" />
                                                <a href="https://x.com/nyaltx" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    @nyaltx
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FiSend className="h-5 w-5 text-blue-600" />
                                                <a href="https://t.me/nyaltx" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    Telegram
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </article>
                    </div>
                </main>
            </div>
        </div>
    );
}
