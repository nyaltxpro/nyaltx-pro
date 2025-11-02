'use client';

import { useEffect, useState } from 'react';
import PublicHeader from '../../../components/PublicHeader';

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
        <div className="min-h-screen bg-inherit text-white">
            {/* Public Header */}
            <PublicHeader />

            {/* GitBook-style Header */}


            <div className="flex">
                {/* GitBook-style Sidebar */}
                <aside className={`
                    fixed top-32 left-0 z-30 w-80 h-[calc(100vh-8rem)]  border-r border-gray-700 
                    transform transition-transform duration-300 ease-in-out overflow-y-auto
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:z-0 lg:h-[calc(100vh-8rem)]
                `}>
                    <div className="p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Table of Contents</h2>
                        </div>

                        <nav className="space-y-0.5">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={`
                                        block w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer
                                        ${activeSection === section.id
                                            ? 'bg-linear-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 font-medium border-l-2 border-cyan-400'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }
                                        ${section.level === 1 ? 'ml-4 text-xs' : ''}
                                    `}
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
                        className="lg:hidden fixed inset-0 top-32 bg-black bg-opacity-50 z-20"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1  min-h-screen">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                        <article className="max-w-none">

                            {/* Introduction */}
                            <section id="introduction" className="mb-8 sm:mb-12 scroll-mt-32">
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">NYALTX Whitepaper</h1>
                                <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
                                    New York Alt Exchange - Powered by the NYAX Token
                                </p>
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                                    Welcome to the comprehensive technical documentation for NYALTX, a revolutionary decentralized finance (DeFi) platform
                                    designed to transform how crypto projects gain visibility, liquidity, and growth opportunities in the Web3 ecosystem.
                                </p>
                            </section>

                            {/* Executive Summary */}
                            <section id="executive-summary" className="mb-8 sm:mb-12 scroll-mt-32">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Executive Summary</h2>
                                <div className="bg-linear-to-r from-cyan-500/10 to-blue-600/10 border-l-4 border-cyan-400 p-6 mb-6 rounded-r-lg">
                                    <p className="text-cyan-300 font-medium">
                                        NYALTX represents the next evolution in decentralized finance infrastructure,
                                        combining traditional financial tools with cutting-edge blockchain technology.
                                    </p>
                                </div>
                                <ul className="space-y-4 text-gray-300">
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0"></div>
                                        <span><strong className="text-white">NYALT Exchange (NYALTX.com)</strong> is a decentralized finance (DeFi) hub designed to give crypto projects visibility, liquidity, and growth opportunities.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0"></div>
                                        <span>Unlike traditional data aggregators, NYALT integrates project profiles, embedded trading, token creation, and community engagement tools—all powered by the <strong className="text-white">NYAX token</strong>.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0"></div>
                                        <span><strong className="text-white">NYAX is more than a currency.</strong> It is the fuel of the ecosystem, supporting payments, staking rewards, governance, marketing, and real-world access to investor networks.</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Vision & Mission */}
                            <section id="vision-mission" className="mb-8 sm:mb-12 scroll-mt-32">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Vision & Mission</h2>
                                <div id="vision" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Vision</h3>
                                    <div className="bg-linear-to-r from-green-500/10 to-emerald-600/10 border-l-4 border-green-400 p-6 rounded-r-lg">
                                        <p className="text-green-300">
                                            To become the leading Web3 ecosystem where projects gain visibility, investors access transparent data and liquidity, and communities are rewarded for engagement.
                                        </p>
                                    </div>
                                </div>

                                <div id="mission" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Mission</h3>
                                    <div className="bg-linear-to-r from-purple-500/10 to-violet-600/10 border-l-4 border-purple-400 p-6 rounded-r-lg">
                                        <p className="text-purple-300">
                                            To empower projects and investors with tools that combine DeFi trading, marketing, and social interaction—backed by a sustainable token economy.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Market Opportunity */}
                            <section id="market-opportunity" className="mb-8 sm:mb-12 scroll-mt-32">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Market Opportunity</h2>
                                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-6">
                                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                                        <div className="text-3xl font-bold text-cyan-400 mb-2">18,000+</div>
                                        <p className="text-gray-300">Active tokens competing for visibility across fragmented markets</p>
                                    </div>
                                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                                        <div className="text-3xl font-bold text-green-400 mb-2">Trillions</div>
                                        <p className="text-gray-300">In annual DeFi trading volume, but most platforms lack project storytelling tools</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 mb-4">
                                    Most platforms offer analytics but do not provide profile-driven, community-first visibility.
                                </p>
                                <p className="text-gray-300">
                                    <strong className="text-white">NYALTX fills this gap</strong> with a project + investor marketing ecosystem, monetizing not just trading, but also attention and engagement.
                                </p>
                            </section>

                            {/* Platform Overview */}
                            <section id="platform-overview" className="mb-8 sm:mb-12 scroll-mt-32">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Platform Overview</h2>

                                <div id="crypto-profiles" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Crypto Profiles</h3>
                                    <p className="text-gray-300 mb-4">
                                        Customizable project pages with integrated charts, social links, news feeds, and promotional videos.
                                    </p>
                                </div>

                                <div id="embedded-trading" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Embedded Trading</h3>
                                    <p className="text-gray-300 mb-4">
                                        Non-custodial swaps via Uniswap integration, allowing seamless trading directly from project profiles.
                                    </p>
                                </div>

                                <div id="token-generator" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Token Generator</h3>
                                    <p className="text-gray-300 mb-4">
                                        Simple token creation with liquidity fees, making it easy for projects to launch their tokens.
                                    </p>
                                </div>

                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    <div className="bg-linear-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/20 p-6 rounded-lg">
                                        <h4 className="font-semibold text-blue-300 mb-2">Profile Upgrades</h4>
                                        <p className="text-gray-300 text-sm">Paid in NYAX/ETH for boosted visibility</p>
                                    </div>
                                    <div className="bg-linear-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 p-6 rounded-lg">
                                        <h4 className="font-semibold text-green-300 mb-2">Advertising Marketplace</h4>
                                        <p className="text-gray-300 text-sm">Sponsored listings and promotions</p>
                                    </div>
                                    <div className="bg-linear-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/20 p-6 rounded-lg">
                                        <h4 className="font-semibold text-purple-300 mb-2">Venture Network Events</h4>
                                        <p className="text-gray-300 text-sm">Access to digital + real-world investor meetups</p>
                                    </div>
                                </div>
                            </section>

                            {/* The NYAX Token */}
                            <section id="nyax-token" className="mb-8 sm:mb-12 scroll-mt-32">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">The NYAX Token</h2>

                                <div id="payment-token" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Payment Token</h3>
                                    <p className="text-gray-300 mb-4">
                                        NYAX serves as the primary payment method for platform services, offering discounts and exclusive features.
                                    </p>
                                </div>

                                <div id="governance" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Governance</h3>
                                    <p className="text-gray-300 mb-4">
                                        Token holders participate in platform governance, voting on key decisions and feature implementations.
                                    </p>
                                </div>

                                <div id="staking-rewards" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Staking & Rewards</h3>
                                    <p className="text-gray-300 mb-4">
                                        Stake NYAX tokens to earn rewards and access premium platform features.
                                    </p>
                                </div>
                            </section>

                            {/* Tokenomics */}
                            <section id="tokenomics" className="mb-8 sm:mb-12 scroll-mt-32">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Tokenomics</h2>

                                <div id="token-details" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Token Details</h3>
                                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                                        <ul className="space-y-2 text-gray-300">
                                            <li><strong className="text-white">Name:</strong> NYAX Token</li>
                                            <li><strong className="text-white">Symbol:</strong> NYAX</li>
                                            <li><strong className="text-white">Total Supply:</strong> 1,000,000,000 NYAX</li>
                                            <li><strong className="text-white">Blockchain:</strong> Ethereum (ERC-20)</li>
                                        </ul>
                                    </div>
                                </div>

                                <div id="allocation" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Allocation</h3>
                                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="bg-linear-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/20 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-400">40%</div>
                                            <p className="text-blue-300">Community & Ecosystem</p>
                                        </div>
                                        <div className="bg-linear-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-green-400">25%</div>
                                            <p className="text-green-300">Team & Development</p>
                                        </div>
                                        <div className="bg-linear-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/20 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-400">20%</div>
                                            <p className="text-purple-300">Marketing & Partnerships</p>
                                        </div>
                                        <div className="bg-linear-to-br from-orange-500/10 to-amber-600/10 border border-orange-500/20 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-orange-400">15%</div>
                                            <p className="text-orange-300">Reserve & Liquidity</p>
                                        </div>
                                    </div>
                                </div>

                                <div id="revenue-model" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Revenue Model</h3>
                                    <ul className="space-y-3 text-gray-300">
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0"></div>
                                            <span>Platform fees from token generation and trading</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0"></div>
                                            <span>Premium profile upgrades and advertising</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0"></div>
                                            <span>Venture network event access fees</span>
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* Competitive Advantage */}
                            <section id="competitive-advantage" className="mb-8 sm:mb-12 scroll-mt-32">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Competitive Advantage</h2>
                                <div className="bg-linear-to-r from-indigo-500/10 to-purple-600/10 border-l-4 border-indigo-400 p-6 mb-6 rounded-r-lg">
                                    <p className="text-indigo-300 font-medium">
                                        NYALTX combines the best of DeFi trading, social media marketing, and venture networking in one integrated platform.
                                    </p>
                                </div>
                                <ul className="space-y-4 text-gray-300">
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                                        <span><strong className="text-white">Integrated Ecosystem:</strong> Unlike competitors who focus on single features, NYALTX provides end-to-end project lifecycle support</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                                        <span><strong className="text-white">Community-First:</strong> Built-in social features and gamification drive organic engagement</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                                        <span><strong className="text-white">Real-World Connections:</strong> Bridge between digital assets and traditional venture networks</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Roadmap */}
                            <section id="roadmap" className="mb-8 sm:mb-12 scroll-mt-32">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Roadmap</h2>

                                <div id="phase-1" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Phase 1 - Launch (2025)</h3>
                                    <ul className="space-y-2 text-gray-300 ml-6">
                                        <li>• Platform launch with core features</li>
                                        <li>• NYAX token generation and distribution</li>
                                        <li>• Initial project onboarding</li>
                                    </ul>
                                </div>

                                <div id="phase-2" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Phase 2 - Growth (2025)</h3>
                                    <ul className="space-y-2 text-gray-300 ml-6">
                                        <li>• Token generator with fee structure</li>
                                        <li>• Staking pools and rewards system</li>
                                        <li>• Enhanced trading features</li>
                                    </ul>
                                </div>

                                <div id="phase-3" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Phase 3 - Expansion (2026)</h3>
                                    <ul className="space-y-2 text-gray-300 ml-6">
                                        <li>• Global venture network events</li>
                                        <li>• Merchandise and physical products</li>
                                        <li>• Cross-chain integration</li>
                                    </ul>
                                </div>

                                <div id="phase-4" className="mb-8">
                                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Phase 4 - Scaling (2026+)</h3>
                                    <ul className="space-y-2 text-gray-300 ml-6">
                                        <li>• Advanced analytics and AI features</li>
                                        <li>• Strategic partnerships and integrations</li>
                                        <li>• Global marketing campaigns</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Conclusion */}
                            <section id="conclusion" className="mb-8 sm:mb-12 scroll-mt-32">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Conclusion</h2>
                                <div className="bg-gray-800 border border-gray-700 p-8 rounded-lg">
                                    <p className="text-gray-300 text-lg leading-relaxed mb-4">
                                        NYALTX represents a paradigm shift in how crypto projects approach marketing, community building, and investor relations.
                                        By combining DeFi infrastructure with social engagement tools and real-world networking opportunities, we're creating
                                        a comprehensive ecosystem that serves the entire crypto project lifecycle.
                                    </p>
                                    <p className="text-gray-300 leading-relaxed">
                                        The NYAX token serves as the foundation of this ecosystem, incentivizing participation, governance, and long-term
                                        platform growth. Join us in building the future of decentralized project marketing and community engagement.
                                    </p>
                                </div>
                            </section>



                        </article>
                    </div>
                </main>
            </div>
        </div>
    );
}
