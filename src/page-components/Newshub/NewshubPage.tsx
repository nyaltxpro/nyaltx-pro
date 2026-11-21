'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toReliableIpfsUrl } from '@/utils/ipfsUpload';

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
  planName?: string;
  sourceUrl?: string;
  isSyndicated?: boolean;
}

export interface NewshubInitialData {
  banners?: BannerSlide[];
  articles?: Article[];
  categories?: string[];
  pagination?: { total: number; page: number; pages: number };
}

// ─── Constants ──────────────────────────────────────────────────────────────

const GRADS = [
  'linear-gradient(135deg,#0e7490,#06b6d4)',
  'linear-gradient(135deg,#4c1d95,#8b5cf6)',
  'linear-gradient(135deg,#9a3412,#f59e0b)',
  'linear-gradient(135deg,#14532d,#22c55e)',
  'linear-gradient(135deg,#1e293b,#475569)',
];

const CATEGORIES = ['All', 'NYAX', 'Solana', 'Ethereum', 'DeFi', 'Blockchain', 'Other'];

const RSS_URL = 'https://www.nyaltx.pro/rss.xml';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slideBackground(slide: BannerSlide, withOverlay = true): string {
  const reliableImg = slide.imageUrl ? toReliableIpfsUrl(slide.imageUrl) : '';
  if (reliableImg) {
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
    if (url) return `url(${url}) center/contain no-repeat`;
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

export default function NewshubPage({ initialData }: { initialData?: NewshubInitialData }) {
  const router = useRouter();
  // Data state
  const [banners, setBanners] = useState<BannerSlide[]>(initialData?.banners ?? []);
  const [articles, setArticles] = useState<Article[]>(initialData?.articles ?? []);
  const [categories, setCategories] = useState<string[]>(initialData?.categories ?? CATEGORIES);
  const [pagination, setPagination] = useState(
    initialData?.pagination ?? { total: 0, page: 1, pages: 1 }
  );
  const [loading, setLoading] = useState(initialData === undefined);
  const [feedLoading, setFeedLoading] = useState(false);

  // Slider
  const [curSlide, setCurSlide] = useState(0);
  const sliderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filter
  const [selectedCat, setSelectedCat] = useState('All');

  // RSS & Newsletter
  const [rssCopied, setRssCopied] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [newsletterMsgType, setNewsletterMsgType] = useState<'success' | 'error'>('success');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async (cat: string, page: number, append = false) => {
    try {
      if (!append && initialData === undefined) setLoading(true);
      setFeedLoading(true);

      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (cat !== 'All') params.set('category', cat);

      const res = await fetch(`/api/newshub?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch Newshub data');
      const data = await res.json();

      if (!append) {
        setBanners(data.banners || []);
        setArticles(data.articles || []);
        setCurSlide(0);
      } else {
        setArticles(prev => [...prev, ...(data.articles || [])]);
      }

      if (data.categories?.length) setCategories(data.categories);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      console.error('Newshub fetch error:', err);
    } finally {
      setLoading(false);
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear any obsolete local submission storage to prevent stale pending items
    try {
      localStorage.removeItem('nyaltx_news_submissions');
    } catch {}

    // Check hash for auto-open
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#submit-news' || hash === '#submit-press') {
        router.replace('/newshub/submit');
      }
    }
    if (initialData === undefined) fetchData('All', 1);
  }, [fetchData, initialData, router]);

  // Category change → reset feed
  const initialCategoryLoad = useRef(true);
  useEffect(() => {
    if (initialCategoryLoad.current) {
      initialCategoryLoad.current = false;
      return;
    }
    setArticles([]);
    setPagination({ total: 0, page: 1, pages: 1 });
    fetchData(selectedCat, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCat]);

  // ─── Slider auto-rotate ──────────────────────────────────────────────────

  const stopSlider = useCallback(() => {
    if (sliderTimerRef.current) {
      clearInterval(sliderTimerRef.current);
      sliderTimerRef.current = null;
    }
  }, []);

  const startSlider = useCallback(() => {
    stopSlider();
    if (banners.length > 1) {
      sliderTimerRef.current = setInterval(() => {
        setCurSlide(prev => (prev + 1) % banners.length);
      }, 6000);
    }
  }, [banners.length, stopSlider]);

  useEffect(() => {
    startSlider();
    return stopSlider;
  }, [startSlider, stopSlider]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const prevSlide = () => {
    stopSlider();
    setCurSlide(prev => (prev - 1 + banners.length) % banners.length);
    setTimeout(startSlider, 100);
  };

  const nextSlide = () => {
    stopSlider();
    setCurSlide(prev => (prev + 1) % banners.length);
    setTimeout(startSlider, 100);
  };

  const goToSlide = (i: number) => {
    stopSlider();
    setCurSlide(i);
    setTimeout(startSlider, 100);
  };

  const copyRss = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(RSS_URL)
        .then(() => {
          setRssCopied(true);
          setTimeout(() => setRssCopied(false), 2500);
        })
        .catch(() => alert('RSS URL:\n' + RSS_URL));
    } else {
      alert('RSS URL:\n' + RSS_URL);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterSubmitting) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.trim())) {
      setNewsletterMsgType('error');
      setNewsletterMsg('Enter a valid email address.');
      return;
    }

    setNewsletterSubmitting(true);
    setNewsletterMsg('');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Could not subscribe. Please try again.');
      }

      setNewsletterMsgType('success');
      setNewsletterMsg(result.message || 'Successfully subscribed.');
      if (result.message !== 'You are already subscribed.') setNewsletterEmail('');
      setTimeout(() => setNewsletterMsg(''), 4000);
    } catch (error) {
      setNewsletterMsgType('error');
      setNewsletterMsg(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  const loadMore = () => {
    if (pagination.page < pagination.pages && !feedLoading) {
      fetchData(selectedCat, pagination.page + 1, true);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="nh-root">
        <div className="nh-wrap">
          {/* ── HERO BANNER ──────────────────────────────────────────── */}
          <section className="nyb" aria-label="NYALTX News Hub">
            <Link
              href="/newshub/submit"
              className="nh-banner-link"
              aria-label="Submit news to NYALTX News Hub"
            >
              <img
                src="/nyaltx-news-hub-banner.png"
                alt="New York Alt Exchange NYALTX News Hub"
                className="nh-banner-image"
              />
            </Link>
          </section>

          {/* ── PAGE HEADER ──────────────────────────────────────────── */}
          <header className="nh-top">
            <div>
              <h1>News Hub</h1>
              <div className="nh-sub">
                Paid press releases &amp; sponsored news, curated by our editorial team.
              </div>
            </div>
            <div className="nh-row">
              <button className="nh-btn" onClick={copyRss} title="Copy RSS URL">
                {rssCopied ? '✓ Copied!' : '📡 RSS feed'}
              </button>
              <Link href="/newshub/submit" className="nh-btn nh-btn-pri">
                + Submit news
              </Link>
            </div>
          </header>

          {/* ── SLIDER ───────────────────────────────────────────────── */}
          {/* Only show slider if there are real banners from admin or featured paid articles */}
          {!loading && banners.length > 0 && (
            <section className="nh-slider" aria-label="Featured banners">
              <div className="nh-track" style={{ transform: `translateX(-${curSlide * 100}%)` }}>
                {banners.map((slide, idx) => {
                  const target = slide.linkUrl?.trim();
                  const isExternal = target?.startsWith('http');
                  const slideEl = (
                    <div className="nh-slide" style={{ background: slideBackground(slide) }}>
                      <span className={`nh-tag${slide.isSponsored ? ' sp' : ''}`}>
                        {(slide.category || 'NYAX').toUpperCase()}
                      </span>
                      <h2>{slide.title}</h2>
                      {slide.description && <p>{slide.description}</p>}
                    </div>
                  );
                  return (
                    <div key={slide._id ?? idx} className="nh-slide-wrapper">
                      {target && target !== '#' && target !== '' ? (
                        isExternal ? (
                          <a
                            href={target}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nh-slide-link"
                          >
                            {slideEl}
                          </a>
                        ) : (
                          <Link href={target} className="nh-slide-link">
                            {slideEl}
                          </Link>
                        )
                      ) : (
                        slideEl
                      )}
                    </div>
                  );
                })}
              </div>

              {banners.length > 1 && (
                <>
                  <button className="nh-arrow nh-arrow-l" onClick={prevSlide} aria-label="Previous">
                    ‹
                  </button>
                  <button className="nh-arrow nh-arrow-r" onClick={nextSlide} aria-label="Next">
                    ›
                  </button>
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
                </>
              )}
            </section>
          )}

          {/* Slider loading skeleton */}
          {loading && (
            <div
              className="nh-skeleton"
              style={{
                width: '100%',
                aspectRatio: '8/3',
                minHeight: 230,
                borderRadius: 16,
                marginBottom: 24,
              }}
            />
          )}

          {/* ── MAIN GRID ────────────────────────────────────────────── */}
          <div className="nh-grid">
            {/* Feed */}
            <main>
              {/* Category chips */}
              <div className="nh-category-bar">
                <div>
                  <span className="nh-kicker">Browse by topic</span>
                  <h2 className="nh-category-title">Explore the feed</h2>
                </div>
                <div className="nh-chips" role="group" aria-label="Filter news by category">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`nh-chip${cat === selectedCat ? ' on' : ''}`}
                      onClick={() => setSelectedCat(cat)}
                      aria-pressed={cat === selectedCat}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Articles feed */}
              <div>
                <div className="nh-feed-heading">
                  <div>
                    <span className="nh-kicker">From NYALTX and trusted sources</span>
                    <h2>{selectedCat === 'All' ? 'Latest stories' : `${selectedCat} stories`}</h2>
                  </div>
                  {!loading && <span className="nh-result-count">{pagination.total} stories</span>}
                </div>
                {loading || (feedLoading && articles.length === 0) ? (
                  <div className="nh-cards">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="nh-skeleton nh-card-skeleton" />
                    ))}
                  </div>
                ) : articles.length === 0 ? (
                  <div className="nh-side" style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                      No news available right now
                    </div>
                    <div style={{ color: 'var(--nh-muted)', fontSize: 14, marginBottom: 20 }}>
                      {selectedCat === 'All'
                        ? 'Please check back soon, or submit a story for review.'
                        : `No ${selectedCat} articles are available right now. Try another category or submit your own.`}
                    </div>
                    <Link href="/newshub/submit" className="nh-btn nh-btn-pri">
                      + Submit your news
                    </Link>
                  </div>
                ) : (
                  <div className="nh-cards">
                    {articles.map(art => (
                      <article key={art._id} className="nh-card">
                        <div
                          className="nh-card-cover"
                          style={{ background: articleThumbnail(art) }}
                        >
                          <span className={`nh-card-type${art.type === 'pr' ? ' pr' : ''}`}>
                            {art.isSyndicated
                              ? 'RSS'
                              : art.type === 'pr'
                                ? 'Press release'
                                : 'Sponsored'}
                          </span>
                        </div>
                        <div className="nh-card-content">
                          <div className="nh-card-meta">
                            <span className="nh-card-category">
                              {art.category || art.tags?.[0] || 'NYAX'}
                            </span>
                            <span>{relativeDate(art.publishedAt || art.createdAt)}</span>
                          </div>
                          <h3>
                            {art.isSyndicated && art.sourceUrl ? (
                              <a
                                href={art.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="nh-article-link"
                              >
                                {art.title}
                              </a>
                            ) : art.slug ? (
                              <Link href={`/news/${art.slug}`} className="nh-article-link">
                                {art.title}
                              </Link>
                            ) : (
                              art.title
                            )}
                          </h3>
                          <p>
                            {art.excerpt ||
                              'Read the latest update from the digital asset and tokenization ecosystem.'}
                          </p>
                          <div className="nh-card-footer">
                            <span>{art.author || 'NYALTX'}</span>
                            {art.isSyndicated && art.sourceUrl ? (
                              <a
                                href={art.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="nh-read-link"
                              >
                                Read story <span aria-hidden="true">↗</span>
                              </a>
                            ) : art.slug ? (
                              <Link href={`/news/${art.slug}`} className="nh-read-link">
                                Read story <span aria-hidden="true">→</span>
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {/* Load more */}
                {!loading && articles.length > 0 && pagination.page < pagination.pages && (
                  <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 12 }}>
                    <button className="nh-btn" onClick={loadMore} disabled={feedLoading}>
                      {feedLoading
                        ? 'Loading…'
                        : `Load more (${pagination.total - articles.length} more)`}
                    </button>
                  </div>
                )}
              </div>
            </main>

            {/* ── SIDEBAR ─────────────────────────────────────────────── */}
            <aside>
              {/* CTA card */}
              <div className="nh-side nh-cta">
                <h4>Got news? Get seen.</h4>
                <p>
                  Publish your press release or sponsored story to the NYALTX feed and reach
                  thousands of crypto readers.
                </p>
                <Link
                  href="/newshub/submit"
                  className="nh-btn"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Submit a story
                </Link>
                <div style={{ marginTop: 10, fontSize: 12, color: '#023038', opacity: 0.75 }}>
                  From $199 · Direct Distribution &amp; Full Service plans
                </div>
              </div>

              {/* RSS */}
              <div className="nh-side">
                <h4>📡 Subscribe via RSS</h4>
                <code style={{ cursor: 'pointer' }} onClick={copyRss} title="Click to copy RSS URL">
                  {RSS_URL}
                </code>
                <button
                  className="nh-btn"
                  style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
                  onClick={copyRss}
                >
                  {rssCopied ? '✓ Copied!' : 'Copy RSS URL'}
                </button>
                <div className="nh-note" style={{ marginTop: 8 }}>
                  Filters:&nbsp;
                  <code style={{ display: 'inline', padding: '1px 5px', fontSize: 11 }}>
                    ?tag=nyax
                  </code>
                  &nbsp;
                  <code style={{ display: 'inline', padding: '1px 5px', fontSize: 11 }}>
                    ?tag=btc
                  </code>
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
                    onChange={e => {
                      setNewsletterEmail(e.target.value);
                      setNewsletterMsg('');
                    }}
                    className="nh-input"
                    aria-label="Newsletter email"
                    disabled={newsletterSubmitting}
                  />
                  <button
                    type="submit"
                    className="nh-btn nh-btn-pri"
                    style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
                    disabled={newsletterSubmitting}
                  >
                    {newsletterSubmitting ? 'Subscribing…' : 'Subscribe'}
                  </button>
                </form>
                {newsletterMsg && (
                  <div
                    role={newsletterMsgType === 'error' ? 'alert' : 'status'}
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: newsletterMsgType === 'error' ? '#fca5a5' : '#22d3ee',
                    }}
                  >
                    {newsletterMsg}
                  </div>
                )}
              </div>

              {/* How it works */}
              <div className="nh-side">
                <h4>How it works</h4>
                <ol
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    fontSize: 13,
                    color: 'var(--nh-muted)',
                    lineHeight: 1.7,
                  }}
                >
                  <li>Submit your news or press release</li>
                  <li>Select a plan ($199 or $499)</li>
                  <li>Complete payment securely</li>
                  <li>Editorial team reviews &amp; approves</li>
                  <li>Your story goes live here 🎉</li>
                </ol>
              </div>

              {/* Sources */}
              <div className="nh-side">
                <h4>Sources</h4>
                <div className="nh-muted" style={{ fontSize: 13 }}>
                  NYAX team · NYALTX Learn · Paid community submissions · Verified press releases
                </div>
              </div>
            </aside>
          </div>

          {/* Footer note */}
          <div className="nh-disclaimer">
            <p>
              NYALTX News Hub features syndicated headlines from trusted news sources alongside
              approved paid press releases and sponsored stories. Paid submissions are reviewed
              before going live. RSS feed available at{' '}
              <a href={RSS_URL} style={{ color: '#06b6d4' }}>
                {RSS_URL}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
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
    background: var(--nh-bg);
    color: var(--nh-text);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    min-height: 60vh;
  }
  .nh-wrap { max-width: 1120px; margin: 0 auto; padding: 24px 16px; }

  /* ─── Hero ─── */
  .nyb {
    position: relative; overflow: hidden; border-radius: 20px;
    aspect-ratio: 2000 / 451; margin-bottom: 24px; color: #fff;
    background: #07182f;
    box-shadow: 0 10px 32px rgba(0,0,0,.5);
  }
  .nh-banner-link { position: absolute; inset: 0; z-index: 5; display: block; }
  .nh-banner-image { display: block; width: 100%; height: 100%; object-fit: cover; }
  .nh-net { position: absolute; inset: 0; width: 100%; height: 100%; }
  .nh-sk  { position: absolute; right: 0; bottom: 0; height: 88%; width: auto; max-width: 78%; }
  .nh-tk  {
    position: absolute; top: 0; left: 0; right: 0; height: 32px;
    background: rgba(2,10,24,.65); backdrop-filter: blur(6px);
    overflow: hidden; z-index: 3; border-bottom: 1px solid rgba(255,255,255,.14);
    font-size: 11px; font-weight: 700; letter-spacing: .12em; white-space: nowrap;
  }
  .nh-tk div { display: inline-block; padding-left: 100%; line-height: 32px; animation: nh-mq 32s linear infinite; }
  .nh-tk i   { color: #fbbf24; font-style: normal; margin: 0 12px; }
  @keyframes nh-mq { to { transform: translateX(-100%); } }
  .nh-txt    { position: relative; z-index: 2; padding: 48px 24px 0; max-width: 560px; }
  .nh-eyebrow{ font-size: 11px; font-weight: 800; letter-spacing: .28em; color: #fde68a; text-transform: uppercase; }
  .nyb h2    { margin: 8px 0 8px; font-size: 38px; line-height: 1.05; letter-spacing: -.01em; font-weight: 800; }
  .nyb h2 span{ color: #67e8f9; }
  .nyb p     { margin: 0; font-size: 15px; opacity: .94; max-width: 440px; line-height: 1.4; }
  .nh-pl     { animation: nh-pl 2.4s ease-in-out infinite alternate; }
  .nh-pl:nth-child(2n) { animation-delay: .8s; }
  .nh-pl:nth-child(3n) { animation-delay: 1.6s; }
  @keyframes nh-pl { from { opacity: .35; } to { opacity: 1; } }
  .nh-submit-cta {
    position: absolute; left: 24px; bottom: 22px; z-index: 3;
    box-shadow: 0 6px 20px rgba(6,182,212,.5);
  }
  @media(max-width:560px) { .nyb h2 { font-size: 27px; } .nh-sk { opacity: .4; max-width: 100%; } }

  /* ─── Buttons ─── */
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

  /* ─── Header ─── */
  .nh-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
  .nh-top h1 { margin: 0; font-size: 26px; font-weight: 700; }
  .nh-sub    { color: var(--nh-muted); font-size: 14px; margin-top: 2px; }

  /* ─── Slider ─── */
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
  .nh-slide p  { margin: 0 0 10px; max-width: 620px; font-size: 14px; opacity: .92; text-shadow: 0 1px 4px rgba(0,0,0,.6); }
  .nh-tag { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .05em; padding: 4px 9px; border-radius: 99px; background: rgba(255,255,255,.2); backdrop-filter: blur(4px); width: max-content; margin-bottom: 6px; }
  .nh-tag.sp { background: #facc15; color: #422006; font-weight: 800; }
  .nh-dots { position: absolute; right: 20px; bottom: 16px; display: flex; gap: 6px; z-index: 5; }
  .nh-dot { width: 9px; height: 9px; border-radius: 99px; background: rgba(255,255,255,.4); border: 0; padding: 0; cursor: pointer; transition: all .2s; }
  .nh-dot.on { background: #fff; width: 22px; }
  .nh-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,.45); color: #fff; border: 1px solid rgba(255,255,255,.1); width: 40px; height: 40px; border-radius: 99px; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; transition: background .2s; z-index: 5; }
  .nh-arrow:hover { background: rgba(6,182,212,.8); }
  .nh-arrow-l { left: 12px; } .nh-arrow-r { right: 12px; }

  /* ─── Grid ─── */
  .nh-grid { display: grid; grid-template-columns: 1fr 310px; gap: 20px; }
  @media(max-width:860px) { .nh-grid { grid-template-columns: 1fr; } }

  /* ─── Chips ─── */
  .nh-category-bar { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; padding: 16px 0; border-bottom: 1px solid var(--nh-border); }
  .nh-kicker { color: var(--nh-accent); font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
  .nh-category-title { margin: 4px 0 0; font-size: 19px; font-weight: 750; letter-spacing: -.02em; }
  .nh-chips { display: flex; max-width: 100%; gap: 7px; overflow-x: auto; padding: 2px 0 5px; scrollbar-width: thin; }
  .nh-chip { white-space: nowrap; border: 1px solid var(--nh-border); background: var(--nh-card); color: var(--nh-muted); padding: 7px 13px; border-radius: 99px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all .2s; }
  .nh-chip:hover { border-color: var(--nh-accent); color: var(--nh-text); }
  .nh-chip.on { background: var(--nh-accent); border-color: var(--nh-accent); color: var(--nh-accent-ink); font-weight: 700; }
  .nh-chip:focus-visible, .nh-btn:focus-visible, .nh-arrow:focus-visible, .nh-dot:focus-visible { outline: 2px solid #67e8f9; outline-offset: 3px; }

  /* ─── Article cards ─── */
  .nh-feed-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin: 0 0 14px; }
  .nh-feed-heading h2 { margin: 4px 0 0; font-size: 23px; font-weight: 750; letter-spacing: -.025em; }
  .nh-result-count { color: var(--nh-muted); font-size: 12px; }
  .nh-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .nh-card { display: flex; min-width: 0; flex-direction: column; overflow: hidden; border: 1px solid var(--nh-border); border-radius: 16px; background: linear-gradient(160deg, #111b2a, #0d1420); transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
  .nh-card:hover { transform: translateY(-3px); border-color: rgba(6,182,212,.55); box-shadow: 0 14px 36px rgba(0,0,0,.24); }
  .nh-card-cover { position: relative; aspect-ratio: 16/9; width: 100%; background-position: center; background-size: contain; background-repeat: no-repeat; background-color: #090f18; border-bottom: 1px solid var(--nh-border); }
  .nh-card-type { position: absolute; top: 11px; left: 11px; border: 1px solid rgba(255,255,255,.14); border-radius: 999px; background: rgba(7,11,18,.78); padding: 5px 9px; color: #d7f8fc; font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; backdrop-filter: blur(8px); }
  .nh-card-type.pr { background: rgba(6,95,70,.85); color: #d1fae5; }
  .nh-card-content { display: flex; flex: 1; flex-direction: column; padding: 15px; }
  .nh-card-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 9px; color: var(--nh-muted); font-size: 11px; }
  .nh-card-category { max-width: 65%; overflow: hidden; border-radius: 6px; background: var(--nh-soft); padding: 4px 8px; color: #67e8f9; font-size: 10px; font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
  .nh-card h3 { margin: 0 0 8px; font-size: 16px; font-weight: 700; line-height: 1.4; letter-spacing: -.01em; }
  .nh-card p { display: -webkit-box; overflow: hidden; margin: 0 0 15px; color: var(--nh-muted); font-size: 13px; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
  .nh-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; border-top: 1px solid rgba(255,255,255,.07); padding-top: 12px; color: var(--nh-muted); font-size: 11px; }
  .nh-card-footer > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nh-read-link { flex: none; color: #67e8f9; font-size: 12px; font-weight: 700; text-decoration: none; }
  .nh-read-link:hover { color: #a5f3fc; }
  .nh-card-skeleton { min-height: 320px; border-radius: 16px; }
  .nh-article-link { color: var(--nh-text); text-decoration: none; }
  .nh-article-link:hover { color: var(--nh-accent); }
  .nh-muted { color: var(--nh-muted); }
  @media(max-width:620px) { .nh-cards { grid-template-columns: 1fr; } .nh-category-bar { align-items: flex-start; } .nh-card-cover { aspect-ratio: 16/8.5; } }

  /* ─── Sidebar ─── */
  .nh-side { background: var(--nh-card); border: 1px solid var(--nh-border); border-radius: 14px; padding: 16px; margin-bottom: 16px; }
  .nh-side h4 { margin: 0 0 8px; font-size: 15px; font-weight: 700; }
  .nh-side code { display: block; background: var(--nh-bg); border: 1px solid var(--nh-border); padding: 8px 10px; border-radius: 8px; font-size: 12px; word-break: break-all; color: var(--nh-accent); margin-bottom: 6px; }
  .nh-cta { background: linear-gradient(135deg,#0891b2,#06b6d4 60%,#22d3ee); color: #023038; border: 0; box-shadow: 0 8px 20px rgba(6,182,212,.3); }
  .nh-cta h4 { color: #023038; font-size: 17px; }
  .nh-cta p  { font-size: 13px; margin: 0 0 12px; font-weight: 500; color: #023038; }
  .nh-cta .nh-btn { background: #023038; color: #fff; border: 0; }
  .nh-cta .nh-btn:hover { background: #044b57; }

  /* ─── Input ─── */
  .nh-input { width: 100%; background: var(--nh-bg); color: var(--nh-text); border: 1px solid var(--nh-border); border-radius: 10px; padding: 10px 12px; font-size: 14px; box-sizing: border-box; outline: none; }
  .nh-input:focus { border-color: var(--nh-accent); }
  .nh-note { font-size: 12px; color: var(--nh-muted); margin-top: 8px; line-height: 1.4; }

  /* ─── Skeleton ─── */
  .nh-skeleton { background: linear-gradient(90deg,var(--nh-card) 25%,#1a2535 50%,var(--nh-card) 75%); background-size: 400% 100%; animation: nh-shimmer 1.4s ease-in-out infinite; border: 1px solid var(--nh-border); }
  @keyframes nh-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

  /* ─── Disclaimer ─── */
  .nh-disclaimer { border-top: 1px solid var(--nh-border); padding: 24px 0 32px; margin-top: 36px; color: var(--nh-muted); font-size: 12px; line-height: 1.6; text-align: center; }
`;
