import type { Metadata } from 'next'

import './pages.css'

export const metadata: Metadata = {
    title: 'Governa Pro | Institutional Blockchain Governance',
    description:
        'Governa Pro delivers transparent, investor-ready on-chain governance with institutional workflows, secure voting, and compliance reporting.',
    metadataBase: new URL('https://nyaltx.com/governa'),
    openGraph: {
        title: 'Institutional Blockchain Governance Made Simple | Governa Pro',
        description:
            'Transform your protocol with transparent, efficient governance that attracts investors and empowers communities.',
        url: 'https://nyaltx.com/governa',
        siteName: 'Governa Pro',
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Governa Pro | Institutional Blockchain Governance',
        description:
            'Modern on-chain governance infrastructure for protocols that need transparent decision-making and investor confidence.'
    }
}

const page = () => {
    return (
        <>

            <body>
                <div className="container">
                    <nav>
                        <div className="logo">governa.pro</div>
                        <button className="cta-button">Get Started</button>
                    </nav>

                    <section className="hero">
                        <div className="floating-cards">
                            <div className="float-card"></div>
                            <div className="float-card"></div>
                            <div className="float-card"></div>
                            <div className="float-card"></div>
                        </div>
                        <h1>Institutional Blockchain<br />Governance Made Simple</h1>
                        <p>Transform your protocol with transparent, efficient governance that attracts investors and empowers your community</p>
                        <button className="cta-button">Schedule Demo</button>
                    </section>
                </div>

                <section className="comparison-section">
                    <div className="container">
                        <h2 className="section-title">Why Governance Matters</h2>

                        <div className="comparison-grid">
                            <div className="comparison-card with-governance">
                                <div className="card-header">
                                    <div className="icon with-icon">✓</div>
                                    <h3 className="card-title">With Governance</h3>
                                </div>
                                <ul className="benefit-list">
                                    <li className="benefit-item">Attract institutional investors with transparent decision-making processes</li>
                                    <li className="benefit-item">Build community trust through democratic participation and voting rights</li>
                                    <li className="benefit-item">Increase token utility and holder engagement with governance powers</li>
                                    <li className="benefit-item">Demonstrate regulatory compliance through documented governance structures</li>
                                    <li className="benefit-item">Enable rapid protocol evolution through community-driven improvements</li>
                                    <li className="benefit-item">Create accountability with on-chain voting records and transparency</li>
                                    <li className="benefit-item">Distribute decision-making power to reduce centralization risks</li>
                                </ul>
                            </div>

                            <div className="comparison-card without-governance">
                                <div className="card-header">
                                    <div className="icon without-icon">✕</div>
                                    <h3 className="card-title">Without Governance</h3>
                                </div>
                                <ul className="benefit-list">
                                    <li className="benefit-item">Limited investor visibility into decision-making and protocol direction</li>
                                    <li className="benefit-item">No community engagement or voice in critical protocol decisions</li>
                                    <li className="benefit-item">Centralized control creates single points of failure and trust issues</li>
                                    <li className="benefit-item">Difficulty attracting serious institutional capital without transparency</li>
                                    <li className="benefit-item">Slow adaptation to market changes without community input</li>
                                    <li className="benefit-item">Reduced token utility leading to lower holder retention</li>
                                    <li className="benefit-item">Perception of being centralized undermines blockchain principles</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <div className="container">
                        <h2>Ready to Elevate Your Protocol?</h2>
                        <p>Join leading institutions implementing transparent blockchain governance</p>
                        <button className="cta-button">Start Your Governance Journey</button>
                    </div>
                </section>
            </body>
        </>
    )
}

export default page
