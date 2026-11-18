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
            .nps-cards-wide{grid-template-columns:1fr}
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
            .nps-card-with-visual{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.75fr);align-items:stretch;gap:22px}
            .nps-card-copy{display:flex;flex-direction:column}
            .nps-card-visual{align-self:stretch;margin:0;overflow:hidden;border:1px solid #263449;border-radius:10px;background:#050914}
            .nps-card-visual img{display:block;width:100%;height:100%;object-fit:cover}
            .nps-notice{color:var(--muted);font-size:13px;margin-top:22px}
            .nps-campaign{border:1px solid #263449;border-radius:14px;background:linear-gradient(145deg,rgba(15,22,35,.96),rgba(10,17,29,.92));margin-top:28px;padding:28px}
            .nps-campaign h2{margin-bottom:10px}
            .nps-campaign p{color:#b6c2d2;max-width:820px}
            .nps-media-visual{margin-top:28px;overflow:hidden;border:1px solid #263449;border-radius:14px;background:#050914}
            .nps-media-visual img{display:block;width:100%;height:auto}
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
            @media(max-width:800px){.nps-wrap{padding:0 18px}.nps-hero{padding:42px 0}.nps-hero-grid,.nps-cards,.nps-plans,.nps-card-with-visual{grid-template-columns:1fr}.nps-hero-grid{gap:25px}.nps-section{padding:42px 0}.nps-description{min-height:0}.nps-links{gap:12px}.nps-card-visual{min-height:220px}}
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
              Publish corporate announcements, product launches and industry updates across NYALTX.
            </p>
            <div className="nps-actions">
              <a className="nps-btn" href="#news">
                Explore packages
              </a>
            </div>
          </div>
          <aside className="nps-hero-card">
            <div className="nps-eyebrow">Visibility across the NYALTX ecosystem</div>
            <p>
              <span className="nps-check">01</span>News publishing
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
