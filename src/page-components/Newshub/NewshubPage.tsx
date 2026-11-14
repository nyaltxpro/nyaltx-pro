'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { toReliableIpfsUrl } from '@/utils/ipfsUpload';

// Lazy-load the SubmitNewsModal (heavy – contains PayPal, wagmi, etc.)
const SubmitNewsModal = dynamic(
  () => import('@/components/NewsHub/SubmitNewsModal').then(m => ({ default: m.default })),
  { ssr: false }
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface BannerSlide {
  _id: string;
  title: string;
  description?: string;
  category: string;
  imageUrl?: string;
  gradientIndex?: number;
  linkUrl?: string;
  isSponsored?: boolean;
}

interface Article {
  _id: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  coverColor?: number;
  publishedAt?: string;
  createdAt?: string;
  author?: string;
  slug?: string;
  category?: string;
  tags?: string[];
  type?: string;
  isPaid?: boolean;
  plan?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const GRADS = [
  'linear-gradient(135deg,#0e7490,#06b6d4)',
  'linear-gradient(135deg,#4c1d95,#8b5cf6)',
  'linear-gradient(135deg,#9a3412,#f59e0b)',
  'linear-gradient(135deg,#14532d,#22c55e)',
  'linear-gradient(135deg,#1e293b,#475569)',
];

const CATEGORIES = [
  'All',
  'NYAX',
  'Bitcoin',
  'Ethereum',
  'DeFi',
  'Tokenized Stocks',
  'Community',
  'Press Releases',
];

const RSS_URL = 'https://www.nyaltx.pro/rss.xml';

// ─── Helper ──────────────────────────────────────────────────────────────────

function slideBackground(slide: BannerSlide, withOverlay = true): string {
  const hasImg = Boolean(slide.imageUrl);
  const reliableImg = hasImg ? toReliableIpfsUrl(slide.imageUrl) : '';
  if (hasImg && reliableImg) {
    const overlay = withOverlay
      ? 'linear-gradient(to top,rgba(2,6,12,0.88) 0%,rgba(2,6,12,0.18) 65%,rgba(2,6,12,0) 100%),'
      : '';
    return `${overlay}url(${reliableImg}) center/cover no-repeat`;
  }
  return GRADS[slide.gradientIndex ?? 0] ?? GRADS[0];
}

function articleThumbnail(art: Article): string {
  if (art.featuredImage) {
    const url = toReliableIpfsUrl(art.featuredImage);
    if (url) return `url(${url}) center/cover no-repeat`;
  }
  return GRADS[(art.coverColor ?? 0) % GRADS.length];
}

function relativeDate(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewshubPage() {
  // Data
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);

  // Slider
  const [curSlide, setCurSlide] = useState(0);
  const sliderRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filter
  const [selectedCat, setSelectedCat] = useState('All');

  // Modals
  const [submitOpen, setSubmitOpen] = useState(false);

  // RSS & Newsletter
  const [rssCopied, setRssCopied] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  // Local pending submissions (by user this session)
  const [localPending, setLocalPending] = useState<
    { title: string; category: string; summary: string; timestamp: number }[]
  >([]);

  // ─── Fetch data ─────────────────────────────────────────────────────────

  const fetchData = useCallback(async (cat: string, page: number) => {
    try {
      setFeedLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (cat !== 'All') params.set('category', cat);

      const res = await fetch(`/api/newshub?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch newshub data');
      const data = await res.json();

      if (page === 1) {
        setBanners(data.banners || []);
        setArticles(data.articles || []);
      } else {
        setArticles(prev => [...prev, ...(data.articles || [])]);
      }

      if (data.categories) setCategories(data.categories);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      console.error('Newshub fetch error:', err);
    } finally {
      setLoading(false);
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem('nyaltx_newshub_pending');
      if (stored) setLocalPending(JSON.parse(stored));
    } catch {}

    // Check hash for auto-open submit
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#submit-news' || hash === '#submit-press') {
        setSubmitOpen(true);
      }
    }

    fetchData('All', 1);
  }, [fetchData]);

  // Category change → reset to page 1
  useEffect(() => {
    setArticles([]);
    setPagination({ total: 0, page: 1, pages: 1 });
    fetchData(selectedCat, 1);
  }, [selectedCat, fetchData]);

  // ─── Slider auto-rotate ─────────────────────────────────────────────────

  const startSlider = useCallback(() => {
    if (sliderRef.current) clearInterval(sliderRef.current);
    if (banners.length > 1) {
      sliderRef.current = setInterval(() => {
        setCurSlide(prev => (prev + 1) % banners.length);
      }, 6000);
    }
  }, [banners.length]);

  const stopSlider = useCallback(() => {
    if (sliderRef.current) clearInterval(sliderRef.current);
  }, []);

  useEffect(() => {
    if (!submitOpen) startSlider();
    else stopSlider();
    return stopSlider;
  }, [banners.length, submitOpen, startSlider, stopSlider]);

  // ─── Handlers ───────────────────────────────────────────────────────────

  const prevSlide = () => {
    stopSlider();
    setCurSlide(prev => (prev - 1 + banners.length) % banners.length);
    startSlider();
  };

  const nextSlide = () => {
    stopSlider();
    setCurSlide(prev => (prev + 1) % banners.length);
    startSlider();
  };

  const goToSlide = (i: number) => {
    stopSlider();
    setCurSlide(i);
    startSlider();
  };

  const copyRss = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(RSS_URL).then(() => {
        setRssCopied(true);
        setTimeout(() => setRssCopied(false), 2500);
      });
    } else {
      alert('RSS URL:\n' + RSS_URL);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      setNewsletterMsg('Subscribed! Check your inbox.');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterMsg(''), 4000);
    } catch {
      setNewsletterMsg('Something went wrong. Please try again.');
    }
  };

  const handleSubmitSuccess = (item: any) => {
    if (item) {
      const pending = {
        title: item.title || 'Your submission',
        category: item.category || 'NYAX',
        summary: item.summary || '',
        timestamp: Date.now(),
      };
      const updated = [pending, ...localPending];
      setLocalPending(updated);
      try {
        localStorage.setItem('nyaltx_newshub_pending', JSON.stringify(updated));
      } catch {}
    }
  };

  const loadMore = () => {
    if (pagination.page < pagination.pages && !feedLoading) {
      fetchData(selectedCat, pagination.page + 1);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="nh-root">
        <div className="nh-wrap">
          {/* ── HERO BANNER ─────────────────────────────────────────── */}
          <section className="nyb" aria-label="NYALTX News Hub">
            {/* Grid SVG background */}
            <svg className="nh-net" viewBox="0 0 800 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs>
                <pattern id="nh-grd" width="26" height="26" patternUnits="userSpaceOnUse">
                  <path d="M26 0H0V26" fill="none" stroke="#fff" strokeOpacity={0.08} />
                </pattern>
                <g id="nh-cube">
                  <polygon points="0,-10 10,-5 0,0 -10,-5" fill="#a5f3fc" />
                  <polygon points="-10,-5 0,0 0,12 -10,7" fill="#0891b2" />
                  <polygon points="10,-5 0,0 0,12 10,7" fill="#0e7490" />
                </g>
              </defs>
              <rect width="800" height="260" fill="url(#nh-grd)" />
              <g stroke="#67e8f9" strokeOpacity={0.5} strokeWidth={1.2} fill="none">
                <path d="M430 70L520 45L610 90L700 60M610 90L560 150M610 90L660 170M700 60L740 130L660 170M430 70L480 120L560 150" />
              </g>
              <g fill="#22d3ee">
                <circle className="nh-pl" cx={430} cy={70} r={3.5} />
                <circle className="nh-pl" cx={480} cy={120} r={3.5} />
                <circle className="nh-pl" cx={560} cy={150} r={3.5} />
                <circle className="nh-pl" cx={660} cy={170} r={3.5} />
                <circle className="nh-pl" cx={740} cy={130} r={3.5} />
              </g>
              <use href="#nh-cube" transform="translate(520 45) scale(1.3)" />
              <use href="#nh-cube" transform="translate(610 90) scale(1.3)" />
              <use href="#nh-cube" transform="translate(700 60) scale(1.3)" />
            </svg>

            {/* NYC Skyline silhouette */}
            <svg className="nh-sk" viewBox="0 0 600 230" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
              <defs>
                <linearGradient id="nh-gld" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fde68a" />
                  <stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
                <pattern id="nh-win" width="9" height="12" patternUnits="userSpaceOnUse">
                  <rect x="2" y="3" width="3" height="4" fill="#fcd34d" opacity={0.8} />
                </pattern>
                <g id="nh-bld">
                  <rect x="20" y="130" width="50" height="100" /><rect x="80" y="100" width="40" height="130" />
                  <rect x="130" y="140" width="60" height="90" /><rect x="200" y="70" width="50" height="160" />
                  <rect x="260" y="110" width="45" height="120" /><rect x="318" y="80" width="54" height="150" />
                  <rect x="331" y="50" width="28" height="32" /><rect x="341" y="22" width="8" height="30" />
                  <rect x="385" y="105" width="55" height="125" /><rect x="450" y="78" width="45" height="152" />
                  <rect x="505" y="130" width="50" height="100" /><rect x="562" y="110" width="38" height="120" />
                </g>
                <clipPath id="nh-clp"><use href="#nh-bld" /></clipPath>
              </defs>
              <circle cx={470} cy={46} r={34} fill="url(#nh-gld)" stroke="#b45309" strokeWidth={3} />
              <circle cx={470} cy={46} r={26} fill="none" stroke="#b45309" strokeWidth={1.5} opacity={0.6} />
              <text x={470} y={58} textAnchor="middle" fontSize={34} fontWeight={800} fill="#92400e" fontFamily="Georgia,serif">N</text>
              <g fill="#0a1a33"><use href="#nh-bld" /></g>
              <rect width="600" height="230" fill="url(#nh-win)" clipPath="url(#nh-clp)" />
              <g fill="#16325c" stroke="#67e8f9" strokeOpacity={0.6}>
                <polygon points="52,170 115,140 178,170" />
                <rect x={52} y={170} width={126} height={8} />
                <rect x={48} y={214} width={134} height={16} />
              </g>
              <g fill="#e2e8f0">
                {[60, 80, 100, 121, 141, 161].map((x, i) => (
                  <rect key={i} x={x} y={180} width={9} height={34} />
                ))}
              </g>
            </svg>

            {/* Ticker tape */}
            <div className="nh-tk" aria-hidden="true">
              <div>
                NEW YORK ALT EXCHANGE<i>●</i>NYAX<i>●</i>BTC<i>●</i>ETH<i>●</i>SOL<i>●</i>DEFI<i>●</i>TOKENIZED STOCKS<i>●</i>PRESS RELEASES<i>●</i>ALT ASSETS<i>●</i>NEW YORK ALT EXCHANGE<i>●</i>NYAX<i>●</i>BTC<i>●</i>ETH<i>●</i>TOKENIZED STOCKS<i>●</i>
              </div>
            </div>

            {/* Hero text */}
            <div className="nh-txt">
              <div className="nh-eyebrow">NEW YORK ALT EXCHANGE</div>
              <h2>NYALTX <span>News Hub</span></h2>
              <p>Where Wall Street meets Web3: news, press releases and market stories for crypto and alt assets.</p>
            </div>

            <button className="nh-btn-pri nh-submit-cta" onClick={() => setSubmitOpen(true)}>
              + Submit news
            </button>
          </section>

          {/* ── PAGE HEADER ─────────────────────────────────────────── */}
          <header className="nh-top">
            <div>
              <h1>News Hub</h1>
              <div className="nh-sub">Crypto news, curated by the community.</div>
            </div>
            <div className="nh-row">
              <button className="nh-btn" onClick={copyRss} title="Copy RSS URL">
                {rssCopied ? '✓ Copied!' : '📡 RSS feed'}
              </button>
              <button className="nh-btn nh-btn-pri" onClick={() => setSubmitOpen(true)}>
                + Submit news
              </button>
            </div>
          </header>

          {/* ── SLIDER ──────────────────────────────────────────────── */}
          {!loading && banners.length > 0 && (
            <section className="nh-slider" aria-label="Featured news">
              <div
                className="nh-track"
                style={{ transform: `translateX(-${curSlide * 100}%)` }}
              >
                {banners.map((slide, idx) => {
                  const target = slide.linkUrl || '#';
                  const isExternal = target.startsWith('http');
                  const inner = (
                    <div
                      className="nh-slide"
                      style={{ background: slideBackground(slide) }}
                    >
                      <span className={`nh-tag${slide.isSponsored ? ' sp' : ''}`}>
                        {slide.category?.toUpperCase() || 'NYAX'}
                      </span>
                      <h2>{slide.title}</h2>
                      {slide.description && <p>{slide.description}</p>}
                    </div>
                  );

                  return (
                    <div key={idx} className="nh-slide-wrapper">
                      {target && target !== '#' ? (
                        isExternal ? (
                          <a href={target} target="_blank" rel="noopener noreferrer" className="nh-slide-link">
                            {inner}
                          </a>
                        ) : (
                          <Link href={target} className="nh-slide-link">
                            {inner}
                          </Link>
                        )
                      ) : inner}
                    </div>
                  );
                })}
              </div>

              <button className="nh-arrow nh-arrow-l" onClick={prevSlide} aria-label="Previous slide">‹</button>
              <button className="nh-arrow nh-arrow-r" onClick={nextSlide} aria-label="Next slide">›</button>

              <div className="nh-dots">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    className={`nh-dot${i === curSlide ? ' on' : ''}`}
                    onClick={() => goToSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Loading skeleton for slider */}
          {loading && (
            <div className="nh-slider nh-skeleton" style={{ aspectRatio: '8/3', minHeight: 230, borderRadius: 16, marginBottom: 24 }} />
          )}

          {/* ── MAIN GRID ───────────────────────────────────────────── */}
          <div className="nh-grid">
            {/* Feed */}
            <main>
              {/* Category chips */}
              <div className="nh-chips">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`nh-chip${cat === selectedCat ? ' on' : ''}`}
                    onClick={() => setSelectedCat(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Articles */}
              <div>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="nh-item nh-skeleton" style={{ height: 108, marginBottom: 12, borderRadius: 14 }} />
                  ))
                ) : articles.length === 0 ? (
                  <div className="nh-side" style={{ textAlign: 'center', padding: '40px 16px' }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📰</div>
                    <div style={{ color: 'var(--nh-muted)' }}>
                      {selectedCat === 'All'
                        ? 'No articles published yet. Be the first to submit news!'
                        : `No ${selectedCat} articles yet.`}
                    </div>
                  </div>
                ) : (
                  articles.map(art => (
                    <article key={art._id} className="nh-item">
                      <div className="nh-thumb" style={{ background: articleThumbnail(art) }} />
                      <div className="nh-article-body">
                        <div className="nh-meta">
                          {(art.isPaid || art.plan) && (
                            <span className="nh-badge nh-badge-paid">PAID</span>
                          )}
                          {art.type === 'pr' && (
                            <span className="nh-badge nh-badge-pr">PR</span>
                          )}
                          <span className="nh-badge">{art.category || art.tags?.[0] || 'NYAX'}</span>
                          {art.author && <span>{art.author}</span>}
                          <span>·</span>
                          <span>{relativeDate(art.publishedAt || art.createdAt)}</span>
                        </div>
                        <h3>
                          {art.slug ? (
                            <Link href={`/news/${art.slug}`} className="nh-article-link">
                              {art.title}
                            </Link>
                          ) : (
                            art.title
                          )}
                        </h3>
                        {art.excerpt && <p>{art.excerpt}</p>}
                      </div>
                    </article>
                  ))
                )}

                {/* Load more */}
                {!loading && pagination.page < pagination.pages && (
                  <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 12 }}>
                    <button
                      className="nh-btn"
                      onClick={loadMore}
                      disabled={feedLoading}
                    >
                      {feedLoading ? 'Loading…' : `Load more (${pagination.total - articles.length} remaining)`}
                    </button>
                  </div>
                )}
              </div>
            </main>

            {/* ── SIDEBAR ────────────────────────────────────────────── */}
            <aside>
              {/* CTA card */}
              <div className="nh-side nh-cta">
                <h4>Got news? Get seen.</h4>
                <p>Publish your story to the NYALTX feed or land a spot in the top banner slider.</p>
                <button className="nh-btn" onClick={() => setSubmitOpen(true)} style={{ width: '100%', justifyContent: 'center' }}>
                  Submit a story
                </button>
              </div>

              {/* RSS */}
              <div className="nh-side">
                <h4>📡 Subscribe via RSS</h4>
                <code
                  id="nh-rssurl"
                  style={{ cursor: 'pointer' }}
                  onClick={copyRss}
                  title="Click to copy RSS URL"
                >
                  {RSS_URL}
                </code>
                <button className="nh-btn" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }} onClick={copyRss}>
                  {rssCopied ? '✓ Copied!' : 'Copy RSS URL'}
                </button>
                <div className="nh-note" style={{ marginTop: 8 }}>
                  Filters:&nbsp;
                  <code style={{ display: 'inline', padding: '1px 5px', fontSize: 11 }}>?tag=nyax</code>&nbsp;
                  <code style={{ display: 'inline', padding: '1px 5px', fontSize: 11 }}>?tag=btc</code>
                </div>
              </div>

              {/* Newsletter */}
              <div className="nh-side">
                <h4>📬 Weekly newsletter</h4>
                <div className="nh-muted" style={{ marginBottom: 10, fontSize: 13 }}>
                  Get the week's top NYAX and crypto stories in your inbox.
                </div>
                <form onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    className="nh-input"
                    aria-label="Newsletter email"
                  />
                  <button
                    type="submit"
                    className="nh-btn nh-btn-pri"
                    style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
                  >
                    Subscribe
                  </button>
                </form>
                {newsletterMsg && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#22d3ee' }}>{newsletterMsg}</div>
                )}
              </div>

              {/* My submissions */}
              <div className="nh-side">
                <h4>📝 My submissions</h4>
                {localPending.length === 0 ? (
                  <div className="nh-muted" style={{ fontSize: 13 }}>
                    No submissions yet. Your stories and their status will show here.
                  </div>
                ) : (
                  localPending.map((sub, i) => (
                    <div key={i} style={{ marginBottom: 8, fontSize: 13 }}>
                      <span className="nh-badge nh-badge-pend">PENDING</span>{' '}
                      {sub.title}
                    </div>
                  ))
                )}
              </div>

              {/* Platform sources */}
              <div className="nh-side">
                <h4>Sources</h4>
                <div className="nh-muted" style={{ fontSize: 13 }}>
                  NYAX team · NYALTX Learn · Community submissions
                </div>
              </div>
            </aside>
          </div>

          {/* Footer note */}
          <div className="nh-disclaimer">
            <p>
              NYALTX News Hub features approved, community-submitted stories and official platform news.
              All paid submissions are reviewed by our editorial team before going live.
              RSS feed available at{' '}
              <a href={RSS_URL} style={{ color: '#06b6d4' }}>{RSS_URL}</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Submit News Modal */}
      {submitOpen && (
        <SubmitNewsModal
          isOpen={submitOpen}
          onClose={() => setSubmitOpen(false)}
          initialType="news"
          onSuccess={handleSubmitSuccess}
        />
      )}
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = `
  .nh-root {
    --nh-bg: #070b12;
    --nh-card: #0f1623;
    --nh-text: #e6edf6;
    --nh-muted: #8a99ad;
    --nh-border: #1e293b;
    --nh-accent: #06b6d4;
    --nh-accent-ink: #023038;
    --nh-soft: #08222b;
    --nh-danger: #e11d48;
    background: var(--nh-bg);
    color: var(--nh-text);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    min-height: 60vh;
  }

  .nh-wrap {
    max-width: 1120px;
    margin: 0 auto;
    padding: 24px 16px;
  }

  /* Hero */
  .nyb {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    min-height: 270px;
    margin-bottom: 24px;
    color: #fff;
    background: linear-gradient(180deg, #0a2a5c 0%, #1560a6 52%, #f59e0b 150%);
    box-shadow: 0 10px 32px rgba(0,0,0,0.5);
  }
  .nh-net { position: absolute; inset: 0; width: 100%; height: 100%; }
  .nh-sk { position: absolute; right: 0; bottom: 0; height: 88%; width: auto; max-width: 78%; }
  .nh-tk {
    position: absolute; top: 0; left: 0; right: 0;
    height: 32px; background: rgba(2,10,24,.65); backdrop-filter: blur(6px);
    overflow: hidden; z-index: 3; border-bottom: 1px solid rgba(255,255,255,.14);
    font-size: 11px; font-weight: 700; letter-spacing: .12em; white-space: nowrap;
  }
  .nh-tk div { display: inline-block; padding-left: 100%; line-height: 32px; animation: nh-mq 32s linear infinite; }
  .nh-tk i { color: #fbbf24; font-style: normal; margin: 0 12px; }
  @keyframes nh-mq { to { transform: translateX(-100%); } }
  .nh-txt { position: relative; z-index: 2; padding: 48px 24px 0; max-width: 560px; }
  .nh-eyebrow { font-size: 11px; font-weight: 800; letter-spacing: .28em; color: #fde68a; text-transform: uppercase; }
  .nyb h2 { margin: 8px 0 8px; font-size: 38px; line-height: 1.05; letter-spacing: -.01em; font-weight: 800; }
  .nyb h2 span { color: #67e8f9; }
  .nyb p { margin: 0; font-size: 15px; opacity: .94; max-width: 440px; line-height: 1.4; }
  .nh-pl { animation: nh-pl 2.4s ease-in-out infinite alternate; }
  .nh-pl:nth-child(2n) { animation-delay: .8s; }
  .nh-pl:nth-child(3n) { animation-delay: 1.6s; }
  @keyframes nh-pl { from { opacity: .35; } to { opacity: 1; } }
  .nh-submit-cta {
    position: absolute; left: 24px; bottom: 22px; z-index: 3;
    box-shadow: 0 6px 20px rgba(6,182,212,.5);
  }
  @media(max-width:560px) {
    .nyb h2 { font-size: 27px; }
    .nh-sk { opacity: .4; max-width: 100%; }
  }

  /* Buttons */
  .nh-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 15px; border-radius: 10px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: 1px solid var(--nh-border); background: var(--nh-card);
    color: var(--nh-text); transition: all .2s ease;
  }
  .nh-btn:hover { border-color: var(--nh-accent); }
  .nh-btn:disabled { opacity: .5; cursor: not-allowed; }
  .nh-btn-pri { background: var(--nh-accent); border-color: var(--nh-accent); color: var(--nh-accent-ink); }
  .nh-btn-pri:hover { background: #22d3ee; }
  .nh-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

  /* Header */
  .nh-top {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap; margin-bottom: 16px;
  }
  .nh-top h1 { margin: 0; font-size: 26px; font-weight: 700; }
  .nh-sub { color: var(--nh-muted); font-size: 14px; margin-top: 2px; }

  /* Slider */
  .nh-slider {
    position: relative; border-radius: 16px; overflow: hidden;
    border: 1px solid var(--nh-border); margin-bottom: 24px;
    box-shadow: 0 8px 24px rgba(0,0,0,.35);
  }
  .nh-track { display: flex; transition: transform .5s cubic-bezier(.4,0,.2,1); }
  .nh-slide-wrapper { min-width: 100%; }
  .nh-slide-link { display: block; text-decoration: none; color: inherit; }
  .nh-slide {
    min-width: 100%; aspect-ratio: 8/3; min-height: 230px;
    padding: 26px 32px; display: flex; flex-direction: column; justify-content: flex-end;
    color: #fff; background-position: center; background-size: cover;
  }
  .nh-slide h2 { margin: 6px 0; font-size: 25px; max-width: 680px; font-weight: 700; line-height: 1.2; text-shadow: 0 2px 8px rgba(0,0,0,.6); }
  .nh-slide p { margin: 0 0 10px; max-width: 620px; font-size: 14px; opacity: .92; text-shadow: 0 1px 4px rgba(0,0,0,.6); }
  .nh-tag {
    display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .05em;
    padding: 4px 9px; border-radius: 99px; background: rgba(255,255,255,.2);
    backdrop-filter: blur(4px); width: max-content; margin-bottom: 6px;
  }
  .nh-tag.sp { background: #facc15; color: #422006; font-weight: 800; }
  .nh-dots { position: absolute; right: 20px; bottom: 16px; display: flex; gap: 6px; z-index: 5; }
  .nh-dot {
    width: 9px; height: 9px; border-radius: 99px;
    background: rgba(255,255,255,.4); border: 0; padding: 0; cursor: pointer; transition: all .2s;
  }
  .nh-dot.on { background: #fff; width: 22px; }
  .nh-arrow {
    position: absolute; top: 50%; transform: translateY(-50%);
    background: rgba(0,0,0,.45); color: #fff; border: 1px solid rgba(255,255,255,.1);
    width: 40px; height: 40px; border-radius: 99px; cursor: pointer; font-size: 20px;
    display: flex; align-items: center; justify-content: center; transition: background .2s; z-index: 5;
  }
  .nh-arrow:hover { background: rgba(6,182,212,.8); }
  .nh-arrow-l { left: 12px; }
  .nh-arrow-r { right: 12px; }

  /* Grid */
  .nh-grid { display: grid; grid-template-columns: 1fr 310px; gap: 20px; }
  @media(max-width:860px) { .nh-grid { grid-template-columns: 1fr; } }

  /* Chips */
  .nh-chips { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 14px; }
  .nh-chip {
    white-space: nowrap; border: 1px solid var(--nh-border); background: var(--nh-card);
    color: var(--nh-muted); padding: 6px 14px; border-radius: 99px; cursor: pointer;
    font-size: 13px; font-weight: 500; transition: all .2s;
  }
  .nh-chip:hover { border-color: var(--nh-accent); color: var(--nh-text); }
  .nh-chip.on { background: var(--nh-accent); border-color: var(--nh-accent); color: var(--nh-accent-ink); font-weight: 700; }

  /* Article card */
  .nh-item {
    display: flex; gap: 14px; background: var(--nh-card);
    border: 1px solid var(--nh-border); border-radius: 14px; padding: 14px;
    margin-bottom: 12px; transition: transform .2s, border-color .2s;
  }
  .nh-item:hover { transform: translateY(-1px); border-color: rgba(6,182,212,.4); }
  .nh-thumb { width: 96px; height: 76px; border-radius: 10px; flex: none; background-position: center; background-size: cover; }
  .nh-article-body { flex: 1; min-width: 0; }
  .nh-item h3 { margin: 0 0 4px; font-size: 15px; font-weight: 600; line-height: 1.35; }
  .nh-item p { margin: 0; font-size: 13px; color: var(--nh-muted); line-height: 1.4; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
  .nh-article-link { color: var(--nh-text); text-decoration: none; }
  .nh-article-link:hover { color: var(--nh-accent); }
  .nh-meta { font-size: 12px; color: var(--nh-muted); margin-bottom: 4px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
  .nh-badge {
    font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 6px;
    background: var(--nh-soft); color: var(--nh-accent); letter-spacing: .04em;
  }
  .nh-badge-paid { background: #fef3c7; color: #92400e; }
  .nh-badge-pr { background: #dcfce7; color: #15803d; }
  .nh-badge-pend { background: #fef3c7; color: #92400e; }
  .nh-muted { color: var(--nh-muted); }

  /* Sidebar */
  .nh-side {
    background: var(--nh-card); border: 1px solid var(--nh-border);
    border-radius: 14px; padding: 16px; margin-bottom: 16px;
  }
  .nh-side h4 { margin: 0 0 8px; font-size: 15px; font-weight: 700; }
  .nh-side code {
    display: block; background: var(--nh-bg); border: 1px solid var(--nh-border);
    padding: 8px 10px; border-radius: 8px; font-size: 12px; word-break: break-all;
    color: var(--nh-accent); margin-bottom: 6px;
  }
  .nh-cta {
    background: linear-gradient(135deg, #0891b2, #06b6d4 60%, #22d3ee);
    color: #023038; border: 0; box-shadow: 0 8px 20px rgba(6,182,212,.3);
  }
  .nh-cta h4 { color: #023038; font-size: 17px; }
  .nh-cta p { font-size: 13px; margin: 0 0 12px; font-weight: 500; color: #023038; }
  .nh-cta .nh-btn { background: #023038; color: #fff; border: 0; }
  .nh-cta .nh-btn:hover { background: #044b57; }

  /* Input */
  .nh-input {
    width: 100%; background: var(--nh-bg); color: var(--nh-text);
    border: 1px solid var(--nh-border); border-radius: 10px;
    padding: 10px 12px; font-size: 14px; box-sizing: border-box; outline: none;
  }
  .nh-input:focus { border-color: var(--nh-accent); }
  .nh-note { font-size: 12px; color: var(--nh-muted); margin-top: 8px; line-height: 1.4; }

  /* Skeleton */
  .nh-skeleton {
    background: linear-gradient(90deg, var(--nh-card) 25%, #1a2535 50%, var(--nh-card) 75%);
    background-size: 400% 100%;
    animation: nh-shimmer 1.4s ease-in-out infinite;
    border: 1px solid var(--nh-border);
  }
  @keyframes nh-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

  /* Footer note */
  .nh-disclaimer {
    border-top: 1px solid var(--nh-border); padding: 24px 0 32px;
    margin-top: 36px; color: var(--nh-muted); font-size: 12px;
    line-height: 1.6; text-align: center;
  }
`;
