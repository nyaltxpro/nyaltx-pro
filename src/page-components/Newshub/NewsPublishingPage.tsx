'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { NEWS_PAYPAL_CRYPTO_DRAFT_KEY } from '@/lib/newsCryptoDraft';
import { useEffect, useState } from 'react';

const SubmitNewsModal = dynamic(
  () => import('@/components/NewsHub/SubmitNewsModal').then(module => module.default),
  { ssr: false }
);

type PublishingPlan = 'feed' | 'slider' | 'test';

const plans: {
  id: PublishingPlan;
  number: string;
  label: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
}[] = [
  {
    id: 'feed',
    number: '01',
    label: 'Publish',
    name: 'News Release',
    price: '$99',
    description: 'Publish your announcement on NYALTX News Hub.',
    features: [
      'Dedicated article page',
      'Company logo and featured image',
      'Company links and shareable URL',
    ],
  },
  {
    id: 'slider',
    number: '02',
    label: 'Featured Visibility',
    name: 'Featured News Release',
    price: '$199',
    description: 'Give your announcement additional exposure on NYALTX.',
    features: [
      'Everything in News Release',
      'Seven days of featured placement',
      'Branded social promotional graphic and NYALTX social posts',
    ],
    featured: true,
  },
];

export default function NewsPublishingPage({
  openModalOnLoad = false,
  initialPlan = 'feed',
  enableTestPlan = false,
}: {
  openModalOnLoad?: boolean;
  initialPlan?: PublishingPlan;
  enableTestPlan?: boolean;
}) {
  const [selectedPlan, setSelectedPlan] = useState<PublishingPlan>(initialPlan);
  const [modalOpen, setModalOpen] = useState(openModalOnLoad);

  useEffect(() => {
    const hasCryptoReturn = new URLSearchParams(window.location.search).has('paypalCryptoStatus');
    let hasSavedDraft = false;
    try {
      hasSavedDraft = Boolean(sessionStorage.getItem(NEWS_PAYPAL_CRYPTO_DRAFT_KEY));
    } catch (error) {
      console.error('Could not restore the pending news payment draft:', error);
    }

    if (hasCryptoReturn || hasSavedDraft) setModalOpen(true);
  }, []);

  const openSubmitModal = (plan: PublishingPlan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const closeSubmitModal = () => {
    try {
      const savedDraft = sessionStorage.getItem(NEWS_PAYPAL_CRYPTO_DRAFT_KEY);
      if (!savedDraft || !JSON.parse(savedDraft)?.paymentId) {
        sessionStorage.removeItem(NEWS_PAYPAL_CRYPTO_DRAFT_KEY);
      }
    } catch (error) {
      console.error('Could not clear the abandoned news payment draft:', error);
    }
    setModalOpen(false);
  };

  return (
    <main className="nps-page">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .nps-page{--navy:#e6edf6;--blue:#00b8d8;--green:#00b8d8;--ink:#e6edf6;--muted:#8a99ad;--line:rgba(255,255,255,.1);background:#070b12;color:var(--ink);font:16px/1.6 Arial,sans-serif;min-height:100vh}
            .nps-page *{box-sizing:border-box}
            .nps-wrap{max-width:1180px;margin:0 auto;padding:0 28px}
            .nps-nav{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;padding:22px 0}
            .nps-brand{color:#f8fafc;font-size:25px;font-weight:800;letter-spacing:-1px;text-decoration:none}
            .nps-brand span{color:#00b8d8}
            .nps-brand small{display:block;color:#8a99ad;font-size:10px;letter-spacing:2px}
            .nps-links{display:flex;align-items:center;gap:25px;flex-wrap:wrap;font-size:14px;font-weight:700}
            .nps-links a{color:#00b8d8;text-decoration:none}
            .nps-btn{display:inline-flex;justify-content:center;align-items:center;border:1px solid transparent;border-radius:8px;background:#00b8d8;color:#fff!important;cursor:pointer;font:inherit;font-weight:700;padding:12px 20px;text-align:center;text-decoration:none;transition:filter .2s,transform .2s}
            .nps-btn:hover{filter:brightness(1.12);transform:translateY(-1px)}
            .nps-btn-outline{background:rgba(15,22,35,.75);border-color:#334155;color:#e6edf6!important}
            .nps-btn-outline:hover{background:#172235}
            .nps-btn-small{font-size:13px;padding:10px 14px}
            .nps-hero{background:linear-gradient(115deg,rgba(15,22,35,.88),rgba(7,11,18,.64) 75%);border-block:1px solid #1e293b;padding:66px 0}
            .nps-hero-grid{display:grid;grid-template-columns:1.3fr .7fr;gap:60px;align-items:center}
            .nps-eyebrow{color:#22d3ee;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
            .nps-page h1,.nps-page h2,.nps-page h3,.nps-page p{margin:0}
            .nps-page h1{background:linear-gradient(90deg,#00b8d8,#a5f3fc);background-clip:text;color:transparent;font-size:clamp(36px,5vw,62px);letter-spacing:-2.5px;line-height:1.07;margin:16px 0 20px}
            .nps-page h2{color:#f8fafc;font-size:34px;letter-spacing:-1px;line-height:1.2;margin:8px 0 12px}
            .nps-page h3{color:#f1f5f9;font-size:23px;line-height:1.2}
            .nps-lead{color:#b6c2d2;font-size:19px;max-width:650px}
            .nps-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
            .nps-hero-card{background:linear-gradient(145deg,rgba(15,22,35,.96),rgba(10,17,29,.92));border:1px solid #263449;border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.25);padding:28px}
            .nps-hero-card p{border-bottom:1px solid #1e293b;padding:14px 0}
            .nps-hero-card p:last-child{border:0}
            .nps-check{color:#22d3ee;font-weight:700;margin-right:8px}
            .nps-section{padding:62px 0}
            .nps-muted{color:var(--muted)}
            .nps-subhead{max-width:750px}
            .nps-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:28px}
            .nps-card{background:linear-gradient(150deg,#0f1623,#0b1220);border:1px solid #263449;border-radius:14px;display:flex;flex-direction:column;padding:25px}
            .nps-card-featured{border:2px solid #06b6d4}
            .nps-card-tag{color:#67e8f9;font-size:11px;font-weight:700;letter-spacing:1.4px;margin-bottom:12px;text-transform:uppercase}
            .nps-card p{color:#a7b3c5;font-size:14px;margin:12px 0 18px}
            .nps-card-price{color:#f8fafc;font-size:26px;font-weight:800;letter-spacing:-.5px;margin-top:14px}
            .nps-card-price small{color:var(--muted);font-size:13px;font-weight:400}
            .nps-card ul{flex:1;list-style:none;margin:10px 0 20px;padding:0}
            .nps-card li{border-top:1px solid #1e293b;font-size:14px;padding:8px 0 8px 22px;position:relative}
            .nps-card li:before{color:#22d3ee;content:'✓';font-weight:700;left:0;position:absolute}
            .nps-card-actions{margin-top:auto}
            .nps-notice{color:var(--muted);font-size:13px;margin-top:22px}
            .nps-campaign{border:1px solid #263449;border-radius:14px;background:linear-gradient(145deg,rgba(15,22,35,.96),rgba(10,17,29,.92));margin-top:28px;padding:28px}
            .nps-campaign h2{margin-bottom:10px}
            .nps-campaign p{color:#b6c2d2;max-width:820px}
            .nps-band{background:linear-gradient(120deg,rgba(15,22,35,.9),rgba(9,15,26,.94));border-block:1px solid #1e293b}
            .nps-plans{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:28px}
            .nps-plan{background:linear-gradient(150deg,#0f1623,#0b1220);border:1px solid #263449;border-radius:14px;display:flex;flex-direction:column;padding:25px}
            .nps-plan-featured{border:2px solid #06b6d4;box-shadow:0 8px 34px rgba(6,182,212,.12)}
            .nps-plan-tag{color:#67e8f9;font-size:11px;font-weight:700;letter-spacing:1.4px;margin-bottom:12px;text-transform:uppercase}
            .nps-price{color:#f8fafc;font-size:46px;font-weight:800;letter-spacing:-2px;line-height:1.2;margin-top:18px}
            .nps-price small{color:var(--muted);font-size:14px;font-weight:400;letter-spacing:0}
            .nps-discount{color:#67e8f9;font-size:13px;font-weight:700;margin:4px 0 16px}
            .nps-description{color:#a7b3c5;font-size:14px;min-height:68px}
            .nps-plan ul{flex:1;list-style:none;margin:18px 0 24px;padding:0}
            .nps-plan li{border-top:1px solid #1e293b;font-size:14px;padding:8px 0 8px 22px;position:relative}
            .nps-plan li:before{color:#22d3ee;content:'✓';font-weight:700;left:0;position:absolute}
            .nps-footer{background:#070b12;border-top:1px solid var(--line);color:#fff;font-size:13px;padding:28px 0}
            .nps-footer a{color:#00b8d8;text-decoration:none}
            @media(max-width:800px){.nps-wrap{padding:0 18px}.nps-hero{padding:42px 0}.nps-hero-grid,.nps-cards,.nps-plans{grid-template-columns:1fr}.nps-hero-grid{gap:25px}.nps-section{padding:42px 0}.nps-description{min-height:0}.nps-links{gap:12px}}
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
            <a href="#news">News</a>
            <a href="#projects">Projects</a>
            <a href="#media">Media</a>
            <a href="#roadshows">Roadshows</a>
            <button className="nps-btn" onClick={() => openSubmitModal('feed')} type="button">
              Submit your news
            </button>
          </div>
        </nav>
      </header>

      <section className="nps-hero">
        <div className="nps-wrap nps-hero-grid">
          <div>
            <div className="nps-eyebrow">Corporate Visibility &amp; Media Solutions</div>
            <h1>
              Your story deserves
              <br />
              more than a headline.
            </h1>
            <p className="nps-lead">
              Reach fintech, digital asset and capital markets audiences through news publishing,
              project discovery, executive interviews, advertising and investor events.
            </p>
            <div className="nps-actions">
              <a className="nps-btn" href="#news">
                Explore packages
              </a>
              <a className="nps-btn nps-btn-outline" href="#media">
                Media services
              </a>
            </div>
          </div>
          <aside className="nps-hero-card">
            <div className="nps-eyebrow">Visibility across the NYALTX ecosystem</div>
            <p>
              <span className="nps-check">01</span>News publishing
            </p>
            <p>
              <span className="nps-check">02</span>Project discovery
            </p>
            <p>
              <span className="nps-check">03</span>Fintech media &amp; advertising
            </p>
            <p>
              <span className="nps-check">04</span>Corporate roadshows
            </p>
          </aside>
        </div>
      </section>

      <section className="nps-section" id="news">
        <div className="nps-wrap">
          <div className="nps-eyebrow">01 / News Hub</div>
          <h2>Publish your news. Expand your visibility.</h2>
          <p className="nps-muted nps-subhead">
            Straightforward, one-time publishing options for corporate announcements, product
            launches and industry updates.
          </p>
          <div className="nps-plans">
            {plans.map(plan => (
              <article
                className={`nps-plan${plan.featured ? ' nps-plan-featured' : ''}`}
                key={plan.id}
              >
                <div className="nps-plan-tag">
                  {plan.number} / {plan.label}
                </div>
                <h3>{plan.name}</h3>
                <div className="nps-price">
                  {plan.price}
                  <small> / release</small>
                </div>
                <p className="nps-description">{plan.description}</p>
                <ul>
                  {plan.features.map(feature => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <div className="nps-actions">
                  <button
                    className="nps-btn"
                    onClick={() => openSubmitModal(plan.id)}
                    type="button"
                  >
                    {plan.id === 'feed' ? 'Publish Your News — $99' : 'Get Featured — $199'}
                  </button>
                  <a className="nps-btn nps-btn-outline" href="https://www.nyaltx.pro/news-hub">
                    View News Hub
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nps-section nps-band" id="projects">
        <div className="nps-wrap">
          <div className="nps-eyebrow">02 / Project Discovery</div>
          <h2>Build a stronger NYALTX presence.</h2>
          <p className="nps-muted nps-subhead">
            Project profiles and optional Race to Liberty promotional placements. News and media
            purchases do not require membership.
          </p>
          <div className="nps-cards">
            <article className="nps-card">
              <div className="nps-card-tag">Project Profile</div>
              <h3>NYALTX Pro</h3>
              <div className="nps-card-price">
                $199 <small>/ year</small>
              </div>
              <p>Establish a dedicated project presence with profile details, links and video.</p>
              <div className="nps-card-actions">
                <Link className="nps-btn nps-btn-small" href="/pricing">
                  Explore membership
                </Link>
              </div>
            </article>
            <article className="nps-card">
              <div className="nps-card-tag">Race to Liberty</div>
              <h3>Speed Boat</h3>
              <div className="nps-card-price">$199</div>
              <p>Entry-level project visibility with a defined promotional placement period.</p>
              <div className="nps-card-actions">
                <Link className="nps-btn nps-btn-small" href="/pricing">
                  Explore placement
                </Link>
              </div>
            </article>
            <article className="nps-card nps-card-featured">
              <div className="nps-card-tag">Race to Liberty</div>
              <h3>Helicopter / Submarine</h3>
              <div className="nps-card-price">$349–$599</div>
              <p>Extended project promotion and premium visibility options.</p>
              <div className="nps-card-actions">
                <Link className="nps-btn nps-btn-small" href="/pricing">
                  Compare options
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="nps-section" id="media">
        <div className="nps-wrap">
          <div className="nps-eyebrow">03 / Fintech Media &amp; Advertising</div>
          <h2>Take your story beyond the news feed.</h2>
          <p className="nps-muted nps-subhead">
            Professional media services powered by Corporate Roadshow. Packages are customized to
            your company&apos;s objectives and distribution needs.
          </p>
          <div className="nps-cards">
            <article className="nps-card">
              <div className="nps-card-tag">Advertising</div>
              <h3>Dashboard Banner</h3>
              <div className="nps-card-price">
                $750 <small>/ month</small>
              </div>
              <p>Prominent branded advertising on the NYALTX dashboard, subject to availability.</p>
              <div className="nps-card-actions">
                <a
                  className="nps-btn nps-btn-small"
                  href="mailto:info@corporateroadshow.com?subject=NYALTX%20Banner%20Inquiry"
                >
                  Request details
                </a>
              </div>
            </article>
            <article className="nps-card">
              <div className="nps-card-tag">Executive Interview</div>
              <h3>Podcast Silver</h3>
              <div className="nps-card-price">$3,500</div>
              <p>
                Executive interview on Off Road with Frank Ferraro, with audio distribution on major
                podcast platforms.
              </p>
              <div className="nps-card-actions">
                <a
                  className="nps-btn nps-btn-small"
                  href="mailto:info@corporateroadshow.com?subject=Podcast%20Silver%20Inquiry"
                >
                  Request details
                </a>
              </div>
            </article>
            <article className="nps-card nps-card-featured">
              <div className="nps-card-tag">Integrated Media</div>
              <h3>Podcast Gold</h3>
              <div className="nps-card-price">$7,500</div>
              <p>
                Expanded podcast and video production, short-form clips and branded media assets.
              </p>
              <div className="nps-card-actions">
                <a
                  className="nps-btn nps-btn-small"
                  href="mailto:info@corporateroadshow.com?subject=Podcast%20Gold%20Inquiry"
                >
                  Request details
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="nps-section nps-band" id="roadshows">
        <div className="nps-wrap">
          <div className="nps-eyebrow">04 / Corporate Roadshow</div>
          <h2>Investor events &amp; premium media campaigns.</h2>
          <p className="nps-muted nps-subhead">
            Customized programs for companies seeking deeper storytelling, investor-facing events or
            large-scale media exposure.
          </p>
          <div className="nps-cards">
            <article className="nps-card">
              <div className="nps-card-tag">Events</div>
              <h3>Live Roadshows</h3>
              <div className="nps-card-price">From $15,000</div>
              <p>Corporate presentations, event production and investor-focused programming.</p>
              <div className="nps-card-actions">
                <a
                  className="nps-btn nps-btn-small"
                  href="mailto:info@corporateroadshow.com?subject=Live%20Roadshow%20Inquiry"
                >
                  Request proposal
                </a>
              </div>
            </article>
          </div>
          <div className="nps-campaign">
            <div className="nps-card-tag">Custom Media Campaigns</div>
            <h2>One company story. Multiple channels.</h2>
            <p>
              Combine a news release, executive interview, branded video and dashboard advertising
              into a coordinated visibility campaign.
            </p>
            <div className="nps-actions">
              <a
                className="nps-btn"
                href="mailto:info@corporateroadshow.com?subject=Custom%20Media%20Campaign"
              >
                Discuss a campaign
              </a>
            </div>
          </div>
          <p className="nps-notice">
            Concept preview only. Prices and package details are illustrative and subject to
            confirmation. Distribution is limited to the channels specified for each service;
            third-party newswire pickup, readership, investment outcomes and search ranking are not
            guaranteed. Inquiry links are placeholders to be configured before launch.
          </p>
        </div>
      </section>

      <footer className="nps-footer">
        <div className="nps-wrap">
          NYALTX · New York Alt Exchange &nbsp; | &nbsp; Media services powered by Corporate
          Roadshow
        </div>
      </footer>

      {modalOpen && (
        <SubmitNewsModal
          isOpen={modalOpen}
          initialType="news"
          initialPlan={selectedPlan}
          enableTestPlan={enableTestPlan}
          onClose={closeSubmitModal}
        />
      )}
    </main>
  );
}
