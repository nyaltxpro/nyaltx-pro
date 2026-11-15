'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';

const SubmitNewsModal = dynamic(
  () => import('@/components/NewsHub/SubmitNewsModal').then(module => module.default),
  { ssr: false }
);

type PublishingPlan = 'feed' | 'slider';

const plans: {
  id: PublishingPlan;
  number: string;
  name: string;
  price: string;
  nyaxPrice: string;
  description: string;
  features: string[];
  featured?: boolean;
}[] = [
  {
    id: 'feed',
    number: '01',
    name: 'Direct Distribution',
    price: '$199',
    nyaxPrice: '$159.20 with NYAX',
    description:
      'Publish your story on NYALTX with distribution to our News Hub, RSS feed, newsletter, and social channels.',
    features: [
      'Unlimited word count',
      'News Hub publication after editorial review',
      'RSS feed and weekly newsletter inclusion',
      'Promotion on NYALTX social channels',
      'Editorial review and headline help',
    ],
  },
  {
    id: 'slider',
    number: '02',
    name: 'Full Service',
    price: '$499',
    nyaxPrice: '$399.20 with NYAX',
    description:
      'Get hands-on editorial support and distribution for your press release across NYALTX channels.',
    features: [
      'Everything in Direct Distribution',
      'Full-service release preparation',
      'News Hub, RSS feed, and newsletter inclusion',
      'Promotion on NYALTX social channels',
      'Editorial review and headline help',
    ],
    featured: true,
  },
];

export default function NewsPublishingPage() {
  const [selectedPlan, setSelectedPlan] = useState<PublishingPlan>('feed');
  const [modalOpen, setModalOpen] = useState(false);

  const openSubmitModal = (plan: PublishingPlan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <main className="nps-page">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .nps-page{--navy:#142f52;--blue:#1457a0;--green:#087b65;--ink:#23364b;--muted:#617389;--line:#dce5ee;background:#fff;color:var(--ink);font:16px/1.6 Arial,sans-serif;min-height:100vh}
            .nps-page *{box-sizing:border-box}
            .nps-wrap{max-width:1180px;margin:0 auto;padding:0 28px}
            .nps-nav{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;padding:22px 0}
            .nps-brand{color:var(--navy);font-size:25px;font-weight:800;letter-spacing:-1px;text-decoration:none}
            .nps-brand span{color:var(--green)}
            .nps-brand small{display:block;color:#64768a;font-size:10px;letter-spacing:2px}
            .nps-links{display:flex;align-items:center;gap:25px;flex-wrap:wrap;font-size:14px;font-weight:700}
            .nps-links a{color:var(--blue);text-decoration:none}
            .nps-btn{display:inline-flex;justify-content:center;align-items:center;border:1px solid transparent;border-radius:7px;background:var(--blue);color:#fff!important;cursor:pointer;font:inherit;font-weight:700;padding:12px 20px;text-align:center;text-decoration:none;transition:background .2s,transform .2s}
            .nps-btn:hover{background:#103f76;transform:translateY(-1px)}
            .nps-btn-outline{background:#fff;border-color:#c9d7e6;color:var(--blue)!important}
            .nps-btn-outline:hover{background:#f3f7fc}
            .nps-hero{background:linear-gradient(115deg,#f3f7fc,#fff 75%);border-block:1px solid #e0e8f0;padding:66px 0}
            .nps-hero-grid{display:grid;grid-template-columns:1.3fr .7fr;gap:60px;align-items:center}
            .nps-eyebrow{color:var(--green);font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
            .nps-page h1,.nps-page h2,.nps-page h3,.nps-page p{margin:0}
            .nps-page h1{color:var(--navy);font-size:clamp(36px,5vw,62px);letter-spacing:-2.5px;line-height:1.07;margin:16px 0 20px}
            .nps-page h2{color:var(--navy);font-size:34px;letter-spacing:-1px;line-height:1.2;margin:8px 0 12px}
            .nps-page h3{color:var(--navy);font-size:23px;line-height:1.2}
            .nps-lead{color:#52677e;font-size:19px;max-width:650px}
            .nps-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
            .nps-hero-card{background:#fff;border:1px solid #dce6ef;border-radius:12px;box-shadow:0 12px 40px #183e6510;padding:28px}
            .nps-hero-card p{border-bottom:1px solid #e5ebf1;padding:14px 0}
            .nps-hero-card p:last-child{border:0}
            .nps-check{color:var(--green);font-weight:700;margin-right:8px}
            .nps-section{padding:62px 0}
            .nps-muted{color:var(--muted)}
            .nps-subhead{max-width:750px}
            .nps-channels{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:26px}
            .nps-channels div{border-left:3px solid #0b947b;padding-left:15px}
            .nps-channels strong{color:var(--navy);display:block}
            .nps-channels p{color:var(--muted);font-size:14px;margin-top:5px}
            .nps-notice{color:var(--muted);font-size:13px;margin-top:15px}
            .nps-band{background:#f4f8fc;border-block:1px solid #e1e9f1}
            .nps-plans{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:28px}
            .nps-plan{background:#fff;border:1px solid #d6e1ec;border-radius:12px;display:flex;flex-direction:column;padding:25px}
            .nps-plan-featured{border:2px solid var(--blue);box-shadow:0 8px 30px #1557a012}
            .nps-plan-tag{color:var(--green);font-size:11px;font-weight:700;letter-spacing:1.4px;margin-bottom:12px;text-transform:uppercase}
            .nps-price{color:var(--navy);font-size:46px;font-weight:800;letter-spacing:-2px;line-height:1.2;margin-top:18px}
            .nps-price small{color:var(--muted);font-size:14px;font-weight:400;letter-spacing:0}
            .nps-discount{color:var(--green);font-size:13px;font-weight:700;margin:4px 0 16px}
            .nps-description{color:var(--muted);font-size:14px;min-height:68px}
            .nps-plan ul{flex:1;list-style:none;margin:18px 0 24px;padding:0}
            .nps-plan li{border-top:1px solid #edf1f5;font-size:14px;padding:8px 0 8px 22px;position:relative}
            .nps-plan li:before{color:var(--green);content:'✓';font-weight:700;left:0;position:absolute}
            .nps-footer{border-top:1px solid var(--line);color:var(--muted);font-size:13px;padding:28px 0}
            .nps-footer a{color:var(--blue);text-decoration:none}
            @media(max-width:800px){.nps-wrap{padding:0 18px}.nps-hero{padding:42px 0}.nps-hero-grid,.nps-channels,.nps-plans{grid-template-columns:1fr}.nps-hero-grid{gap:25px}.nps-section{padding:42px 0}.nps-description{min-height:0}.nps-links{gap:12px}}
          `,
        }}
      />

      <header className="nps-wrap">
        <nav className="nps-nav" aria-label="Publishing navigation">
          <Link className="nps-brand" href="/newshub">
            NYALTX <span>News Hub</span>
            <small>NEW YORK ALT EXCHANGE</small>
          </Link>
          <div className="nps-links">
            <a href="#distribution">Distribution</a>
            <a href="#packages">Packages</a>
            <a className="nps-btn" href="#packages">
              Submit your news
            </a>
          </div>
        </nav>
      </header>

      <section className="nps-hero">
        <div className="nps-wrap nps-hero-grid">
          <div>
            <div className="nps-eyebrow">News publishing &amp; digital media</div>
            <h1>
              Your news.
              <br />
              Beyond the headline.
            </h1>
            <p className="nps-lead">
              Publish your company announcements, press releases, and industry updates. Reach the
              digital asset and blockchain community with a publishing package built around real
              visibility.
            </p>
            <div className="nps-actions">
              <a className="nps-btn" href="#packages">
                View publishing packages
              </a>
              <Link className="nps-btn nps-btn-outline" href="/newshub">
                Explore News Hub
              </Link>
            </div>
          </div>
          <aside className="nps-hero-card">
            <div className="nps-eyebrow">One submission. More visibility.</div>
            <p><span className="nps-check">✓</span>Dedicated news article with your branding</p>
            <p><span className="nps-check">✓</span>RSS feed and newsletter inclusion</p>
            <p><span className="nps-check">✓</span>Promotion on NYALTX social channels</p>
            <p><span className="nps-check">✓</span>Packages starting at $199</p>
          </aside>
        </div>
      </section>

      <section className="nps-section" id="distribution">
        <div className="nps-wrap">
          <div className="nps-eyebrow">Distribution &amp; exposure</div>
          <h2>Where your news goes</h2>
          <p className="nps-muted nps-subhead">
            Every package starts with publication on NYALTX News Hub. Distribution through our RSS
            feed, newsletter, and social channels is included, with editorial review for every
            submission.
          </p>
          <div className="nps-channels">
            <div>
              <strong>NYALTX News Hub</strong>
              <p>Dedicated article page with company branding and links.</p>
            </div>
            <div>
              <strong>RSS and newsletter</strong>
              <p>Approved stories are included in our RSS feed and weekly newsletter.</p>
            </div>
            <div>
              <strong>NYALTX social channels</strong>
              <p>Promotion on NYALTX social channels with each publishing package.</p>
            </div>
          </div>
          <p className="nps-notice">
            All submissions are subject to editorial review. Distribution does not guarantee
            third-party newswire pickup, search ranking, readership, or investment results.
          </p>
        </div>
      </section>

      <section className="nps-section nps-band" id="packages">
        <div className="nps-wrap">
          <div className="nps-eyebrow">Publishing packages</div>
          <h2>Choose your level of visibility.</h2>
          <p className="nps-muted">
            One-time pricing. Pay with PayPal, USDC, or NYAX. Save 20% when you pay with NYAX.
          </p>
          <p className="nps-notice">All submissions are subject to editorial review.</p>
          <div className="nps-plans">
            {plans.map(plan => (
              <article
                className={`nps-plan${plan.featured ? ' nps-plan-featured' : ''}`}
                key={plan.id}
              >
                <div className="nps-plan-tag">{plan.number} / {plan.name}</div>
                <h3>{plan.name}</h3>
                <div className="nps-price">
                  {plan.price}
                  <small> / release</small>
                </div>
                <div className="nps-discount">{plan.nyaxPrice}</div>
                <p className="nps-description">{plan.description}</p>
                <ul>
                  {plan.features.map(feature => <li key={feature}>{feature}</li>)}
                </ul>
                <button className="nps-btn" onClick={() => openSubmitModal(plan.id)} type="button">
                  {plan.id === 'feed' ? 'Start Direct Distribution' : 'Start Full Service'}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="nps-footer">
        <div className="nps-wrap">
          NYALTX News Hub · New York Alt Exchange · <Link href="/newshub">Visit News Hub</Link>
        </div>
      </footer>

      {modalOpen && (
        <SubmitNewsModal
          isOpen={modalOpen}
          initialType="news"
          initialPlan={selectedPlan}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  );
}
