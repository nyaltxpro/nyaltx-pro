'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toReliableIpfsUrl } from '@/utils/ipfsUpload';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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

const bannerSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

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

function articleThumbnail(art: Article): string | null {
  if (art.featuredImage) {
    const url = toReliableIpfsUrl(art.featuredImage);
    if (url) return url;
  }
  return null;
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

function ArticleLink({
  article,
  className,
  ariaLabel,
  children,
}: {
  article: Article;
  className: string;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  if (article.isSyndicated && article.sourceUrl) {
    return (
      <a
        href={article.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }
  if (article.slug) {
    return (
      <Link href={`/news/${article.slug}`} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return <div className={className}>{children}</div>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewshubPage({ initialData }: { initialData?: NewshubInitialData }) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
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
  const [slideDirection, setSlideDirection] = useState(1);
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
        setSlideDirection(1);
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
        setSlideDirection(1);
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
    setSlideDirection(-1);
    setCurSlide(prev => (prev - 1 + banners.length) % banners.length);
    setTimeout(startSlider, 100);
  };

  const nextSlide = () => {
    stopSlider();
    setSlideDirection(1);
    setCurSlide(prev => (prev + 1) % banners.length);
    setTimeout(startSlider, 100);
  };

  const goToSlide = (i: number) => {
    stopSlider();
    setSlideDirection(i >= curSlide ? 1 : -1);
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
  const activeBanner = banners[curSlide];
  const activeBannerTarget = activeBanner?.linkUrl?.trim();
  const activeBannerIsExternal = activeBannerTarget?.startsWith('http') ?? false;
  const activeBannerImage = activeBanner?.imageUrl
    ? toReliableIpfsUrl(activeBanner.imageUrl) || null
    : null;
  const leadArticle = articles[0];
  const featuredSideArticles = articles.slice(activeBanner ? 0 : 1, activeBanner ? 2 : 3);
  const activeBannerContent = activeBanner ? (
    <div
      className="nh-slide"
      style={{
        background: activeBannerImage
          ? '#070b12'
          : slideBackground(activeBanner, false),
      }}
    >
      {activeBannerImage && (
        <>
          <div
            aria-hidden="true"
            className="nh-slide-backdrop"
            style={{ backgroundImage: `url("${activeBannerImage}")` }}
          />
          <img className="nh-slide-image" src={activeBannerImage} alt="" />
        </>
      )}
      <div aria-hidden="true" className="nh-slide-shade" />
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.4,
          delay: shouldReduceMotion ? 0 : 0.2,
        }}
        className="nh-slide-copy"
      >
        <span className={`nh-tag${activeBanner.isSponsored ? ' sp' : ''}`}>
          {(activeBanner.category || 'NYAX').toUpperCase()}
        </span>
        <h2>{activeBanner.title}</h2>
        {activeBanner.description && <p>{activeBanner.description}</p>}
      </motion.div>
    </div>
  ) : null;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="nh-root">
        <div className="nh-wrap">
          {/* ── PAGE HEADER ──────────────────────────────────────────── */}
          <header className="nh-top">
            <div>
              <h1>
                <span>News</span> <em>Hub</em>
              </h1>
              <div className="nh-sub">
                Paid press releases &amp; sponsored news, curated by our editorial team.
              </div>
            </div>
            <div className="nh-row">
              <Link href="/newshub/submit" className="nh-btn nh-btn-pri">
                + Submit news
              </Link>
            </div>
          </header>

          {!loading && (activeBanner || articles.length > 0) && (
            <section className="nh-news-lead" aria-label="Top stories">
              {articles.length > 0 && (
                <div className="nh-trending">
                  <span className="nh-trending-label">Trending</span>
                  <div className="nh-trending-list">
                    {articles.slice(0, 5).map(article => (
                      <ArticleLink
                        key={article._id}
                        article={article}
                        className="nh-trending-story"
                        ariaLabel={`Read ${article.title}`}
                      >
                        <span>{article.category || article.tags?.[0] || 'NYALTX'}</span>
                        <strong>{article.title}</strong>
                      </ArticleLink>
                    ))}
                  </div>
                </div>
              )}

              <div className={`nh-feature-grid${featuredSideArticles.length ? ' has-side' : ''}`}>
                <div className="nh-feature-primary">
                  {activeBanner ? (
                    <section className="nh-slider" aria-label="Featured banners">
                      <AnimatePresence initial={false} custom={slideDirection}>
                        <motion.div
                          key={activeBanner._id}
                          custom={slideDirection}
                          variants={bannerSlideVariants}
                          initial={shouldReduceMotion ? false : 'enter'}
                          animate="center"
                          exit={shouldReduceMotion ? undefined : 'exit'}
                          transition={{
                            duration: shouldReduceMotion ? 0 : 0.55,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="nh-slide-wrapper"
                        >
                          {activeBannerTarget && activeBannerTarget !== '#' ? (
                            activeBannerIsExternal ? (
                              <a
                                href={activeBannerTarget}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="nh-slide-link"
                              >
                                {activeBannerContent}
                              </a>
                            ) : (
                              <Link href={activeBannerTarget} className="nh-slide-link">
                                {activeBannerContent}
                              </Link>
                            )
                          ) : (
                            activeBannerContent
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {banners.length > 1 && (
                        <>
                          <button
                            className="nh-arrow nh-arrow-l"
                            onClick={prevSlide}
                            aria-label="Previous"
                          >
                            <FiChevronLeft aria-hidden="true" />
                          </button>
                          <button
                            className="nh-arrow nh-arrow-r"
                            onClick={nextSlide}
                            aria-label="Next"
                          >
                            <FiChevronRight aria-hidden="true" />
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
                  ) : (
                    leadArticle && (
                      <ArticleLink
                        article={leadArticle}
                        className="nh-lead-story"
                        ariaLabel={`Read ${leadArticle.title}`}
                      >
                        {articleThumbnail(leadArticle) ? (
                          <img
                            src={articleThumbnail(leadArticle) || ''}
                            alt={leadArticle.title}
                          />
                        ) : (
                          <div
                            className="nh-lead-story-fallback"
                            style={{
                              background:
                                GRADS[(leadArticle.coverColor ?? 0) % GRADS.length],
                            }}
                          />
                        )}
                        <div className="nh-lead-shade" />
                        <div className="nh-lead-copy">
                          <span className="nh-lead-category">
                            {leadArticle.category || leadArticle.tags?.[0] || 'NYALTX'}
                          </span>
                          <h2>{leadArticle.title}</h2>
                          <p>
                            {leadArticle.excerpt ||
                              'The latest news and updates from across digital markets.'}
                          </p>
                          <span className="nh-lead-byline">
                            {leadArticle.author || 'NYALTX'} ·{' '}
                            {relativeDate(leadArticle.publishedAt || leadArticle.createdAt)}
                          </span>
                        </div>
                      </ArticleLink>
                    )
                  )}
                </div>

                {featuredSideArticles.length > 0 && (
                  <div className="nh-feature-secondary">
                    {featuredSideArticles.map(article => (
                      <ArticleLink
                        key={article._id}
                        article={article}
                        className="nh-side-story"
                        ariaLabel={`Read ${article.title}`}
                      >
                        {articleThumbnail(article) ? (
                          <img
                            src={articleThumbnail(article) || ''}
                            alt={article.title}
                          />
                        ) : (
                          <div
                            className="nh-side-story-fallback"
                            style={{
                              background:
                                GRADS[(article.coverColor ?? 0) % GRADS.length],
                            }}
                          />
                        )}
                        <div className="nh-side-story-shade" />
                        <div className="nh-side-story-copy">
                          <span>{article.category || article.tags?.[0] || 'NYALTX'}</span>
                          <h2>{article.title}</h2>
                          <small>
                            {article.author || 'NYALTX'} ·{' '}
                            {relativeDate(article.publishedAt || article.createdAt)}
                          </small>
                        </div>
                      </ArticleLink>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {loading && (
            <div className="nh-feature-grid nh-feature-grid-loading" aria-hidden="true">
              <div className="nh-skeleton nh-lead-skeleton" />
              <div className="nh-feature-secondary">
                <div className="nh-skeleton nh-side-story-skeleton" />
                <div className="nh-skeleton nh-side-story-skeleton" />
              </div>
            </div>
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
                    <motion.button
                      key={cat}
                      type="button"
                      className={`nh-chip${cat === selectedCat ? ' on' : ''}`}
                      onClick={() => setSelectedCat(cat)}
                      aria-pressed={cat === selectedCat}
                    >
                      <span className="nh-chip-label">{cat}</span>
                      {cat === selectedCat && (
                        <motion.span
                          layoutId="newshub-category-pill"
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : { type: 'spring', duration: 0.5 }
                          }
                          className="nh-chip-indicator"
                        />
                      )}
                    </motion.button>
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
                  <MotionConfig
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            type: 'spring',
                            mass: 3,
                            stiffness: 400,
                            damping: 50,
                          }
                    }
                  >
                    <motion.div
                      initial={shouldReduceMotion ? false : 'initial'}
                      animate="animate"
                      transition={{ staggerChildren: shouldReduceMotion ? 0 : 0.05 }}
                      className="nh-cards"
                    >
                      {articles.map((art, index) => {
                        const externalUrl =
                          art.isSyndicated && art.sourceUrl ? art.sourceUrl : undefined;
                        const internalUrl =
                          !externalUrl && art.slug ? `/news/${art.slug}` : undefined;
                        const imageUrl = articleThumbnail(art);
                        const published = relativeDate(art.publishedAt || art.createdAt);
                        const spanClass =
                          index % 6 === 0
                            ? 'nh-bento-featured'
                            : index % 6 === 1
                              ? 'nh-bento-compact'
                              : 'nh-bento-standard';
                        const image = (
                          <div className="nh-bento-image">
                            {imageUrl ? (
                              <img src={imageUrl} alt={art.title} loading="lazy" />
                            ) : (
                              <div
                                className="nh-bento-image-fallback"
                                style={{
                                  background:
                                    GRADS[(art.coverColor ?? 0) % GRADS.length],
                                }}
                              />
                            )}
                            <span
                              className={`nh-card-type${art.type === 'pr' ? ' pr' : ''}`}
                            >
                              {art.isSyndicated
                                ? 'RSS'
                                : art.type === 'pr'
                                  ? 'Press release'
                                  : 'Sponsored'}
                            </span>
                          </div>
                        );

                        return (
                          <motion.article
                            key={art._id}
                            variants={{
                              initial: { scale: 0.94, y: 28, opacity: 0 },
                              animate: { scale: 1, y: 0, opacity: 1 },
                            }}
                            whileHover={
                              shouldReduceMotion ? undefined : { y: -4, borderColor: '#71717a' }
                            }
                            className={`nh-bento-card ${spanClass}`}
                          >
                            <div className="nh-bento-media">
                              {externalUrl ? (
                                <a
                                  href={externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Read ${art.title}`}
                                >
                                  {image}
                                </a>
                              ) : internalUrl ? (
                                <Link href={internalUrl} aria-label={`Read ${art.title}`}>
                                  {image}
                                </Link>
                              ) : (
                                image
                              )}
                            </div>
                            <div className="nh-bento-content">
                              <div className="nh-editorial-tags">
                                {[
                                  art.category || art.tags?.[0] || 'NYAX',
                                  ...(art.tags || []).filter(
                                    tag =>
                                      tag !== (art.category || art.tags?.[0] || 'NYAX')
                                  ),
                                ]
                                  .slice(0, 3)
                                  .map(tag => (
                                    <span key={tag}>{tag}</span>
                                  ))}
                              </div>
                              <h3>
                                {externalUrl ? (
                                  <a
                                    href={externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="nh-article-link"
                                  >
                                    {art.title}
                                  </a>
                                ) : internalUrl ? (
                                  <Link href={internalUrl} className="nh-article-link">
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
                              <div className="nh-editorial-byline">
                                <span>{art.author || 'NYALTX'}</span>
                                <span aria-hidden="true">·</span>
                                <span>{published}</span>
                              </div>
                              {(externalUrl || internalUrl) && (
                                <div className="nh-editorial-read">
                                  {externalUrl ? (
                                    <a
                                      href={externalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="nh-read-link"
                                    >
                                      Read story <FiArrowRight aria-hidden="true" />
                                    </a>
                                  ) : (
                                    internalUrl && (
                                      <Link href={internalUrl} className="nh-read-link">
                                        Read story <FiArrowRight aria-hidden="true" />
                                      </Link>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.article>
                        );
                      })}
                    </motion.div>
                  </MotionConfig>
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
    --nh-bg: #fff;
    --nh-card: #f8fafc;
    --nh-text: #18181b;
    --nh-muted: #71717a;
    --nh-border: #e4e4e7;
    --nh-accent: #e11d48;
    --nh-accent-ink: #fff;
    --nh-soft: #fff1f2;
    background: var(--nh-bg);
    color: var(--nh-text);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    min-height: 60vh;
  }
  .nh-wrap { max-width: 1120px; margin: 0 auto; padding: 24px 16px; }

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
  .nh-btn-pri:hover { background: #be123c; }
  .nh-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

  /* ─── Header ─── */
  .nh-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
  .nh-top h1 { display: flex; align-items: baseline; gap: .16em; margin: 0; font-size: clamp(30px, 4vw, 42px); font-weight: 600; line-height: .95; letter-spacing: -.06em; }
  .nh-top h1 span { color: #71717a; font-family: Georgia, Cambria, "Times New Roman", serif; font-weight: 300; font-style: italic; letter-spacing: -.04em; }
  .nh-top h1 em { color: #18181b; font-style: italic; font-weight: 600; }
  .nh-sub    { color: var(--nh-muted); font-size: 13px; margin-top: 5px; }

  /* ─── Editorial lead ─── */
  .nh-news-lead { margin-bottom: 20px; }
  .nh-trending { display: flex; min-width: 0; align-items: stretch; gap: 14px; margin-bottom: 14px; border-top: 1px solid var(--nh-border); border-bottom: 1px solid var(--nh-border); }
  .nh-trending-label { display: flex; flex: none; align-items: center; background: #e11d48; padding: 0 12px; color: #fff; font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
  .nh-trending-list { display: flex; min-width: 0; gap: 20px; overflow-x: auto; padding: 10px 0; scrollbar-width: thin; }
  .nh-trending-story { display: flex; min-width: 190px; max-width: 260px; flex-direction: column; justify-content: center; gap: 3px; border-right: 1px solid var(--nh-border); padding-right: 16px; color: inherit; text-decoration: none; }
  .nh-trending-story span { color: #be123c; font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
  .nh-trending-story strong { overflow: hidden; font-family: Georgia, Cambria, "Times New Roman", serif; font-size: 13px; font-weight: 600; line-height: 1.3; text-overflow: ellipsis; }
  .nh-trending-story:hover strong { color: #be123c; }
  .nh-feature-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(250px, 1fr); align-items: stretch; gap: 12px; }
  .nh-feature-grid:not(.has-side) { grid-template-columns: 1fr; }
  .nh-feature-primary { min-width: 0; min-height: 380px; }
  .nh-feature-primary .nh-slider, .nh-lead-story { height: clamp(380px, 36vw, 520px); min-height: 380px; }
  .nh-feature-primary .nh-slider { margin: 0; border-radius: 12px; }
  .nh-lead-story { position: relative; display: block; overflow: hidden; border: 1px solid var(--nh-border); border-radius: 12px; background: #090f18; color: #fff; text-decoration: none; }
  .nh-lead-story > img, .nh-lead-story-fallback { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .nh-lead-story-fallback { display: block; }
  .nh-lead-shade { position: absolute; inset: 0; background: linear-gradient(180deg,rgba(0,0,0,.03) 25%,rgba(0,0,0,.82) 100%); }
  .nh-lead-copy { position: absolute; right: 0; bottom: 0; left: 0; z-index: 1; padding: 20px 22px; }
  .nh-lead-category, .nh-side-story-copy > span { display: inline-flex; background: #e11d48; padding: 4px 8px; color: #fff; font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
  .nh-lead-copy h2 { max-width: 720px; margin: 8px 0; font-family: Georgia, Cambria, "Times New Roman", serif; font-size: clamp(24px, 3vw, 38px); font-weight: 600; line-height: 1.06; letter-spacing: -.035em; }
  .nh-lead-copy p { max-width: 620px; margin: 0 0 10px; color: rgba(255,255,255,.82); font-size: 13px; line-height: 1.5; }
  .nh-lead-byline { color: rgba(255,255,255,.74); font-size: 11px; }
  .nh-feature-secondary { display: grid; min-height: 380px; grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .nh-side-story { position: relative; display: block; min-height: 0; overflow: hidden; border: 1px solid var(--nh-border); border-radius: 12px; background: #090f18; color: #fff; text-decoration: none; }
  .nh-side-story > img, .nh-side-story-fallback { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .3s ease; }
  .nh-side-story:hover > img { transform: scale(1.04); }
  .nh-side-story-fallback { display: block; }
  .nh-side-story-shade { position: absolute; inset: 0; background: linear-gradient(180deg,rgba(0,0,0,.02) 10%,rgba(0,0,0,.83) 100%); }
  .nh-side-story-copy { position: absolute; right: 0; bottom: 0; left: 0; z-index: 1; padding: 12px; }
  .nh-side-story-copy h2 { display: -webkit-box; overflow: hidden; margin: 6px 0; font-family: Georgia, Cambria, "Times New Roman", serif; font-size: 17px; font-weight: 600; line-height: 1.16; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
  .nh-side-story-copy small { color: rgba(255,255,255,.72); font-size: 10px; }
  .nh-lead-skeleton { height: 100%; min-height: 380px; border-radius: 12px; }
  .nh-side-story-skeleton { min-height: 180px; border-radius: 12px; }

  /* ─── Featured carousel ─── */
  .nh-slider {
    position: relative; height: clamp(380px, 36vw, 520px); border-radius: 14px; overflow: hidden;
    border: 1px solid var(--nh-border); margin-bottom: 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,.35);
  }
  .nh-slide-wrapper { position: absolute; inset: 0; width: 100%; }
  .nh-slide-link { display: block; width: 100%; height: 100%; text-decoration: none; color: inherit; }
  .nh-slide {
    position: relative; width: 100%; height: 100%; padding: 26px 32px;
    display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden;
    color: #fff;
  }
  .nh-slide-backdrop { position: absolute; inset: -20px; background-position: center; background-size: cover; filter: blur(20px) brightness(.42); transform: scale(1.08); }
  .nh-slide-image { position: absolute; z-index: 1; left: 50%; top: 50%; width: calc(100% - 80px); max-width: 90%; height: 88%; object-fit: contain; transform: translate(-50%,-50%); }
  .nh-slide-shade { position: absolute; z-index: 2; inset: 0; background: linear-gradient(to top, rgba(2,6,12,.9), rgba(2,6,12,.12) 72%, transparent); }
  .nh-slide-copy { position: relative; z-index: 3; }
  .nh-slide h2 { margin: 6px 0; font-family: Georgia, Cambria, "Times New Roman", serif; font-size: clamp(24px, 3vw, 34px); max-width: 680px; font-weight: 500; line-height: 1.08; letter-spacing: -.035em; text-shadow: 0 2px 8px rgba(0,0,0,.6); }
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
  .nh-grid { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 18px; }
  @media(max-width:860px) { .nh-grid { grid-template-columns: 1fr; } }

  /* ─── Chips ─── */
  .nh-category-bar { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; padding: 10px 0; border-bottom: 1px solid var(--nh-border); }
  .nh-kicker { color: var(--nh-accent); font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
  .nh-category-title { margin: 4px 0 0; font-size: 19px; font-weight: 750; letter-spacing: -.02em; }
  .nh-chips { display: flex; max-width: 100%; gap: 7px; overflow-x: auto; padding: 2px 0 5px; scrollbar-width: thin; }
  .nh-chip { position: relative; flex: 0 0 auto; white-space: nowrap; border: 1px solid transparent; background: transparent; color: var(--nh-muted); padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: color .2s; }
  .nh-chip:hover { color: var(--nh-text); }
  .nh-chip.on { color: #fff; }
  .nh-chip-label { position: relative; z-index: 1; }
  .nh-chip-indicator { position: absolute; inset: 0; z-index: 0; border-radius: 8px; background: linear-gradient(90deg, #e11d48, #be123c); }
  .nh-chip:focus-visible, .nh-btn:focus-visible, .nh-arrow:focus-visible, .nh-dot:focus-visible { outline: 2px solid #67e8f9; outline-offset: 3px; }

  /* ─── Article cards ─── */
  .nh-feed-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin: 0 0 10px; }
  .nh-feed-heading h2 { margin: 4px 0 0; font-family: Georgia, Cambria, "Times New Roman", serif; font-size: 22px; font-weight: 500; letter-spacing: -.03em; }
  .nh-result-count { color: var(--nh-muted); font-size: 12px; }
  .nh-cards { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-auto-flow: dense; gap: 14px; }
  .nh-bento-card { display: flex; min-width: 0; grid-column: span 6; flex-direction: column; overflow: hidden; border: 1px solid #e4e4e7; border-radius: 10px; background: #fff; padding: 12px; transition: border-color .2s ease, background-color .2s ease; }
  .nh-bento-card:hover { background: #fafafa; }
  .nh-bento-featured { grid-column: span 8; }
  .nh-bento-compact { grid-column: span 4; }
  .nh-bento-standard { grid-column: span 6; }
  .nh-bento-media > a { display: block; color: inherit; }
  .nh-bento-image { position: relative; aspect-ratio: 16/9; width: 100%; overflow: hidden; border-radius: 8px; background: #090f18; }
  .nh-bento-featured .nh-bento-image { aspect-ratio: 16/8; }
  .nh-bento-image img, .nh-bento-image-fallback { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .3s ease, opacity .3s ease; }
  .nh-bento-card:hover .nh-bento-image img { transform: scale(1.035); opacity: .88; }
  .nh-card-type { position: absolute; top: 10px; left: 10px; z-index: 1; border: 1px solid rgba(255,255,255,.14); border-radius: 999px; background: rgba(7,11,18,.78); padding: 5px 9px; color: #d7f8fc; font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; backdrop-filter: blur(8px); }
  .nh-card-type.pr { background: rgba(6,95,70,.85); color: #d1fae5; }
  .nh-bento-content { display: flex; min-width: 0; flex: 1; flex-direction: column; padding-top: 12px; }
  .nh-editorial-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 11px; }
  .nh-editorial-tags span { border: 1px solid #e4e4e7; border-radius: 999px; padding: 3px 8px; color: #71717a; font-size: 10px; font-weight: 600; }
  .nh-bento-content h3 { margin: 0; font-family: Georgia, Cambria, "Times New Roman", serif; font-size: 18px; font-weight: 500; line-height: 1.3; letter-spacing: -.02em; }
  .nh-bento-featured .nh-bento-content h3 { font-size: 23px; }
  .nh-bento-content p { display: -webkit-box; overflow: hidden; margin: 10px 0 0; color: #71717a; font-size: 13px; line-height: 1.6; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
  .nh-editorial-byline { display: flex; align-items: center; gap: 10px; margin-top: 14px; color: #71717a; font-size: 11px; }
  .nh-editorial-read { margin-top: auto; padding-top: 16px; }
  .nh-editorial-read .nh-read-link { display: inline-flex; align-items: center; gap: 7px; color: #e11d48; font-size: 12px; font-weight: 600; text-decoration: none; }
  .nh-editorial-read .nh-read-link:hover { text-decoration: underline; }
  .nh-read-link { flex: none; color: #e11d48; font-size: 12px; font-weight: 700; text-decoration: none; }
  .nh-read-link:hover { color: #be123c; }
  .nh-card-skeleton { min-height: 250px; grid-column: span 6; border-radius: 12px; }
  .nh-article-link { color: var(--nh-text); text-decoration: none; }
  .nh-article-link:hover { color: var(--nh-accent); }
  .nh-muted { color: var(--nh-muted); }
  @media(max-width:860px) { .nh-feature-grid { grid-template-columns: minmax(0, 1.65fr) minmax(220px, 1fr); } .nh-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } .nh-bento-featured, .nh-bento-compact, .nh-bento-standard { grid-column: span 1; } .nh-bento-featured .nh-bento-image { aspect-ratio: 16/9; } }
  @media(max-width:620px) { .nh-wrap { padding: 20px 12px; } .nh-category-bar { align-items: flex-start; } .nh-feature-grid, .nh-feature-grid:not(.has-side) { grid-template-columns: 1fr; } .nh-feature-primary .nh-slider, .nh-lead-story { height: clamp(320px, 82vw, 420px); min-height: 320px; } .nh-feature-secondary { min-height: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: 165px; } .nh-cards { grid-template-columns: 1fr; } .nh-bento-card, .nh-card-skeleton { grid-column: span 1; } .nh-bento-featured .nh-bento-content h3 { font-size: 19px; } }

  /* ─── Sidebar ─── */
  .nh-side { background: var(--nh-card); border: 1px solid var(--nh-border); border-radius: 12px; padding: 12px; margin-bottom: 12px; }
  .nh-side h4 { margin: 0 0 8px; font-size: 15px; font-weight: 700; }
  .nh-side code { display: block; background: var(--nh-bg); border: 1px solid var(--nh-border); padding: 8px 10px; border-radius: 8px; font-size: 12px; word-break: break-all; color: var(--nh-accent); margin-bottom: 6px; }
  .nh-cta { background: linear-gradient(135deg,#e11d48,#be123c); color: #fff; border: 0; box-shadow: 0 8px 20px rgba(225,29,72,.2); }
  .nh-cta h4 { color: #fff; font-size: 17px; }
  .nh-cta p  { font-size: 13px; margin: 0 0 12px; font-weight: 500; color: rgba(255,255,255,.86); }
  .nh-cta .nh-btn { background: #fff; color: #18181b; border: 0; }
  .nh-cta .nh-btn:hover { background: #ffe4e6; }

  /* ─── Input ─── */
  .nh-input { width: 100%; background: var(--nh-bg); color: var(--nh-text); border: 1px solid var(--nh-border); border-radius: 10px; padding: 10px 12px; font-size: 14px; box-sizing: border-box; outline: none; }
  .nh-input:focus { border-color: var(--nh-accent); }
  .nh-note { font-size: 12px; color: var(--nh-muted); margin-top: 8px; line-height: 1.4; }

  /* ─── Skeleton ─── */
  .nh-skeleton { background: linear-gradient(90deg,var(--nh-card) 25%,#e4e4e7 50%,var(--nh-card) 75%); background-size: 400% 100%; animation: nh-shimmer 1.4s ease-in-out infinite; border: 1px solid var(--nh-border); }
  @keyframes nh-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

  /* ─── Disclaimer ─── */
  .nh-disclaimer { border-top: 1px solid var(--nh-border); padding: 24px 0 32px; margin-top: 36px; color: var(--nh-muted); font-size: 12px; line-height: 1.6; text-align: center; }
`;
