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
  views?: number;
}

export interface NewshubInitialData {
  banners?: BannerSlide[];
  articles?: Article[];
  trendingArticles?: Article[];
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

function articleTopic(article: Article): string {
  return article.category || article.tags?.[0] || 'NYALTX';
}

function articleMatchesTopic(article: Article, topic: string): boolean {
  const normalizedTopic = topic.trim().toLowerCase();
  return [article.category, ...(article.tags || [])].some(
    value => value?.trim().toLowerCase() === normalizedTopic
  );
}

function articleTimestamp(article: Article): number {
  const timestamp = new Date(article.publishedAt || article.createdAt || 0).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
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

function DiscoveryStory({ article, rank }: { article: Article; rank?: number }) {
  const imageUrl = articleThumbnail(article);

  return (
    <article className="nh-discovery-card">
      <ArticleLink
        article={article}
        className="nh-discovery-image"
        ariaLabel={`Read ${article.title}`}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={article.title} loading="lazy" />
        ) : (
          <span
            className="nh-discovery-image-fallback"
            style={{ background: GRADS[(article.coverColor ?? 0) % GRADS.length] }}
          />
        )}
      </ArticleLink>
      <div className="nh-discovery-copy">
        <span className="nh-discovery-topic">{articleTopic(article)}</span>
        <h3>
          {rank !== undefined && <span className="nh-discovery-rank">{rank}.</span>}
          <ArticleLink
            article={article}
            className="nh-article-link"
            ariaLabel={`Read ${article.title}`}
          >
            {article.title}
          </ArticleLink>
        </h3>
        <div className="nh-discovery-byline">
          <span>{article.author || 'NYALTX'}</span>
          <span aria-hidden="true">·</span>
          <span>{relativeDate(article.publishedAt || article.createdAt)}</span>
          {article.views !== undefined && article.views > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>{article.views.toLocaleString()} reads</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewshubPage({ initialData }: { initialData?: NewshubInitialData }) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  // Data state
  const [banners, setBanners] = useState<BannerSlide[]>(initialData?.banners ?? []);
  const [articles, setArticles] = useState<Article[]>(initialData?.articles ?? []);
  const [trendingFeed, setTrendingFeed] = useState<Article[]>(
    initialData?.trendingArticles ?? []
  );
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
        if (data.trendingArticles) setTrendingFeed(data.trendingArticles);
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
  const trendingArticles = trendingFeed.length
    ? trendingFeed
    : [...articles]
        .sort(
          (a, b) =>
            (b.views ?? 0) - (a.views ?? 0) || articleTimestamp(b) - articleTimestamp(a)
        )
        .slice(0, 4);
  const recommendationTopics = new Set<string>();
  const recommendedArticles = articles
    .filter(article => {
      const topic = articleTopic(article).trim().toLowerCase();
      if (recommendationTopics.has(topic)) return false;
      recommendationTopics.add(topic);
      return true;
    })
    .slice(0, 4);
  const topicSections = categories
    .filter(topic => topic.toLowerCase() !== 'all')
    .map(topic => ({
      topic,
      articles: articles.filter(article => articleMatchesTopic(article, topic)).slice(0, 3),
    }))
    .filter(section => section.articles.length > 0)
    .sort((a, b) => b.articles.length - a.articles.length)
    .slice(0, 3);
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
              <Link href="/newshub/submit" className="nh-btn nh-btn-pri nh-submit-btn">
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
                  <div className="nh-empty-state" style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                      No news available right now
                    </div>
                    <div style={{ color: 'var(--nh-muted)', fontSize: 14, marginBottom: 20 }}>
                      {selectedCat === 'All'
                        ? 'Please check back soon, or submit a story for review.'
                        : `No ${selectedCat} articles are available right now. Try another category or submit your own.`}
                    </div>
                    <Link href="/newshub/submit" className="nh-btn nh-btn-pri nh-submit-btn">
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
              {!loading && selectedCat === 'All' && articles.length > 0 && (
                <section className="nh-discovery" aria-label="More news">
                  <div className="nh-discovery-pair">
                    <section className="nh-discovery-module" aria-labelledby="nh-recommended-title">
                      <div className="nh-discovery-heading">
                        <div>
                          <span className="nh-kicker">Across the feed</span>
                          <h2 id="nh-recommended-title">Recommended</h2>
                        </div>
                      </div>
                      <div className="nh-discovery-list">
                        {recommendedArticles.map(article => (
                          <DiscoveryStory key={`recommended-${article._id}`} article={article} />
                        ))}
                      </div>
                    </section>

                    <section className="nh-discovery-module" aria-labelledby="nh-trending-title">
                      <div className="nh-discovery-heading">
                        <div>
                          <span className="nh-kicker">
                            {trendingArticles.some(article => (article.views ?? 0) > 0)
                              ? 'Most read'
                              : 'Recently published'}
                          </span>
                          <h2 id="nh-trending-title">Trending posts</h2>
                        </div>
                      </div>
                      <div className="nh-discovery-list">
                        {trendingArticles.map((article, index) => (
                          <DiscoveryStory
                            key={`trending-${article._id}`}
                            article={article}
                            rank={index + 1}
                          />
                        ))}
                      </div>
                    </section>
                  </div>

                  {topicSections.length > 0 && (
                    <div className="nh-topic-sections" aria-label="Latest by topic">
                      {topicSections.map(section => (
                        <section
                          key={section.topic}
                          className="nh-topic-section"
                          aria-label={`Latest from ${section.topic}`}
                        >
                          <div className="nh-discovery-heading">
                            <div>
                              <span className="nh-kicker">Latest from</span>
                              <h2>{section.topic}</h2>
                            </div>
                            <button
                              type="button"
                              className="nh-topic-link"
                              onClick={() => setSelectedCat(section.topic)}
                            >
                              View topic <FiArrowRight aria-hidden="true" />
                            </button>
                          </div>
                          <div className="nh-topic-list">
                            {section.articles.map(article => (
                              <DiscoveryStory
                                key={`${section.topic}-${article._id}`}
                                article={article}
                              />
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </main>

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
    --nh-accent: #22d3ee;
    --nh-accent-ink: #023038;
    --nh-soft: #08222b;
    background: var(--nh-bg);
    color: var(--nh-text);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    min-height: 60vh;
  }
  .nh-wrap { max-width: 1120px; margin: 0 auto; padding: 12px 8px; }

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
  .nh-btn-pri:hover { background: #67e8f9; }
  .nh-submit-btn { width: fit-content; padding: 8px 24px; border: 0; border-radius: 0; background: #6366f1; color: #fff; font-weight: 500; box-shadow: 3px 3px 0 #000; transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease; }
  .nh-submit-btn:hover { transform: translate(3px, 3px); box-shadow: none; background: #4f46e5; }
  .nh-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

  /* ─── Header ─── */
  .nh-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
  .nh-top > div:first-child { padding: 8px 0; }
  .nh-top h1 { display: flex; align-items: baseline; gap: .16em; margin: 0; font-size: clamp(30px, 4vw, 42px); font-weight: 600; line-height: .95; letter-spacing: -.06em; }
  .nh-top h1 span { color: #71717a; font-family: Georgia, Cambria, "Times New Roman", serif; font-weight: 300; font-style: italic; letter-spacing: -.04em; }
  .nh-top h1 em { color: #fff; font-style: italic; font-weight: 600; }
  .nh-sub    { color: var(--nh-muted); font-size: 13px; margin-top: 5px; }

  /* ─── Editorial lead ─── */
  .nh-news-lead { margin-bottom: 20px; }
  .nh-trending { display: flex; min-width: 0; align-items: stretch; gap: 14px; margin-bottom: 14px; border-top: 1px solid var(--nh-border); border-bottom: 1px solid var(--nh-border); }
  .nh-trending-label { display: flex; flex: none; align-items: center; background: #06b6d4; padding: 0 12px; color: #023038; font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
  .nh-trending-list { display: flex; min-width: 0; gap: 20px; overflow-x: auto; padding: 10px 0; scrollbar-width: thin; }
  .nh-trending-story { display: flex; min-width: 190px; max-width: 260px; flex-direction: column; justify-content: center; gap: 3px; border-right: 1px solid var(--nh-border); padding-right: 16px; color: inherit; text-decoration: none; }
  .nh-trending-story span { color: #67e8f9; font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
  .nh-trending-story strong { overflow: hidden; font-family: Georgia, Cambria, "Times New Roman", serif; font-size: 13px; font-weight: 600; line-height: 1.3; text-overflow: ellipsis; }
  .nh-trending-story:hover strong { color: #67e8f9; }
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
  .nh-lead-category, .nh-side-story-copy > span { display: inline-flex; background: #22d3ee; padding: 4px 8px; color: #023038; font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
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
  .nh-slide-copy { position: relative; z-index: 3; width: fit-content; max-width: min(760px, 100%); padding: 14px 18px; border: 1px solid rgba(255,255,255,.16); border-radius: 12px; background: rgba(7,11,18,.68); box-shadow: 0 10px 30px rgba(0,0,0,.24); backdrop-filter: blur(14px) saturate(135%); -webkit-backdrop-filter: blur(14px) saturate(135%); }
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
  .nh-grid { display: grid; grid-template-columns: minmax(0, 1fr); }

  /* ─── Chips ─── */
  .nh-category-bar { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; padding: 10px 0; border-bottom: 1px solid var(--nh-border); }
  .nh-kicker { color: var(--nh-accent); font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
  .nh-category-title { margin: 4px 0 0; font-size: 19px; font-weight: 750; letter-spacing: -.02em; }
  .nh-chips { display: flex; max-width: 100%; gap: 7px; overflow-x: auto; padding: 2px 0 5px; scrollbar-width: thin; }
  .nh-chip { position: relative; flex: 0 0 auto; white-space: nowrap; border: 1px solid transparent; background: transparent; color: var(--nh-muted); padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: color .2s; }
  .nh-chip:hover { color: var(--nh-text); }
  .nh-chip.on { color: #fff; }
  .nh-chip-label { position: relative; z-index: 1; }
  .nh-chip-indicator { position: absolute; inset: 0; z-index: 0; border-radius: 8px; background: linear-gradient(90deg, #0891b2, #06b6d4 60%, #22d3ee); }
  .nh-chip:focus-visible, .nh-btn:focus-visible, .nh-arrow:focus-visible, .nh-dot:focus-visible, .nh-topic-link:focus-visible { outline: 2px solid #67e8f9; outline-offset: 3px; }

  /* ─── Article cards ─── */
  .nh-discovery { display: flex; flex-direction: column; gap: 30px; margin-top: 32px; }
  .nh-discovery-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
  .nh-discovery-module, .nh-topic-section { min-width: 0; border-top: 1px solid var(--nh-border); padding-top: 14px; }
  .nh-discovery-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
  .nh-discovery-heading h2 { margin: 4px 0 0; font-family: Georgia, Cambria, "Times New Roman", serif; font-size: 22px; font-weight: 500; letter-spacing: -.03em; }
  .nh-discovery-list { display: grid; gap: 14px; }
  .nh-discovery-card { display: grid; min-width: 0; grid-template-columns: 104px minmax(0, 1fr); align-items: center; gap: 12px; }
  .nh-discovery-image { display: block; aspect-ratio: 4/3; overflow: hidden; border-radius: 8px; background: #090f18; }
  .nh-discovery-image > img, .nh-discovery-image-fallback { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .3s ease; }
  .nh-discovery-image:hover > img { transform: scale(1.04); }
  .nh-discovery-copy { min-width: 0; }
  .nh-discovery-topic { display: block; margin-bottom: 4px; color: #67e8f9; font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
  .nh-discovery-copy h3 { display: -webkit-box; overflow: hidden; margin: 0; font-family: Georgia, Cambria, "Times New Roman", serif; font-size: 15px; font-weight: 500; line-height: 1.3; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
  .nh-discovery-rank { margin-right: 5px; color: #67e8f9; font-family: system-ui, sans-serif; font-size: 12px; font-weight: 700; }
  .nh-discovery-byline { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; color: var(--nh-muted); font-size: 10px; }
  .nh-topic-sections { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
  .nh-topic-list { display: grid; gap: 14px; }
  .nh-topic-list .nh-discovery-card { grid-template-columns: 88px minmax(0, 1fr); }
  .nh-topic-link { display: inline-flex; flex: none; align-items: center; gap: 5px; border: 0; background: transparent; padding: 4px 0; color: #67e8f9; cursor: pointer; font-size: 11px; font-weight: 600; }
  .nh-topic-link:hover { color: #a5f3fc; }
  .nh-feed-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin: 0 0 10px; }
  .nh-feed-heading h2 { margin: 4px 0 0; font-family: Georgia, Cambria, "Times New Roman", serif; font-size: 22px; font-weight: 500; letter-spacing: -.03em; }
  .nh-result-count { color: var(--nh-muted); font-size: 12px; }
  .nh-cards { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-auto-flow: dense; gap: 14px; }
  .nh-bento-card { display: flex; min-width: 0; grid-column: span 6; flex-direction: column; overflow: hidden; border: 1px solid var(--nh-border); border-radius: 10px; background: var(--nh-card); padding: 12px; transition: border-color .2s ease, background-color .2s ease; }
  .nh-bento-card:hover { background: #111c2c; }
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
  .nh-editorial-tags span { border: 1px solid var(--nh-border); border-radius: 999px; padding: 3px 8px; color: var(--nh-muted); font-size: 10px; font-weight: 600; }
  .nh-bento-content h3 { margin: 0; font-family: Georgia, Cambria, "Times New Roman", serif; font-size: 18px; font-weight: 500; line-height: 1.3; letter-spacing: -.02em; }
  .nh-bento-featured .nh-bento-content h3 { font-size: 23px; }
  .nh-bento-content p { display: -webkit-box; overflow: hidden; margin: 10px 0 0; color: var(--nh-muted); font-size: 13px; line-height: 1.6; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
  .nh-editorial-byline { display: flex; align-items: center; gap: 10px; margin-top: 14px; color: var(--nh-muted); font-size: 11px; }
  .nh-editorial-read { margin-top: auto; padding-top: 16px; }
  .nh-editorial-read .nh-read-link { display: inline-flex; align-items: center; gap: 7px; color: #67e8f9; font-size: 12px; font-weight: 600; text-decoration: none; }
  .nh-editorial-read .nh-read-link:hover { text-decoration: underline; }
  .nh-read-link { flex: none; color: #67e8f9; font-size: 12px; font-weight: 700; text-decoration: none; }
  .nh-read-link:hover { color: #a5f3fc; }
  .nh-card-skeleton { min-height: 250px; grid-column: span 6; border-radius: 12px; }
  .nh-article-link { color: var(--nh-text); text-decoration: none; }
  .nh-article-link:hover { color: var(--nh-accent); }
  .nh-muted { color: var(--nh-muted); }
  @media(max-width:860px) { .nh-topic-sections { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media(max-width:620px) { .nh-discovery-pair, .nh-topic-sections { grid-template-columns: 1fr; } .nh-discovery-card, .nh-topic-list .nh-discovery-card { grid-template-columns: 84px minmax(0, 1fr); } .nh-discovery-heading h2 { font-size: 20px; } }
  @media(max-width:860px) { .nh-feature-grid { grid-template-columns: minmax(0, 1.65fr) minmax(220px, 1fr); } .nh-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } .nh-bento-featured, .nh-bento-compact, .nh-bento-standard { grid-column: span 1; } .nh-bento-featured .nh-bento-image { aspect-ratio: 16/9; } }
  @media(max-width:620px) { .nh-wrap { padding: 8px 6px; } .nh-category-bar { align-items: flex-start; } .nh-feature-grid, .nh-feature-grid:not(.has-side) { grid-template-columns: 1fr; } .nh-feature-primary .nh-slider, .nh-lead-story { height: clamp(320px, 82vw, 420px); min-height: 320px; } .nh-feature-secondary { min-height: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: 165px; } .nh-cards { grid-template-columns: 1fr; } .nh-bento-card, .nh-card-skeleton { grid-column: span 1; } .nh-bento-featured .nh-bento-content h3 { font-size: 19px; } }

  .nh-empty-state { margin-bottom: 12px; border: 1px solid var(--nh-border); border-radius: 12px; background: var(--nh-card); }

  /* ─── Skeleton ─── */
  .nh-skeleton { background: linear-gradient(90deg,var(--nh-card) 25%,#1a2535 50%,var(--nh-card) 75%); background-size: 400% 100%; animation: nh-shimmer 1.4s ease-in-out infinite; border: 1px solid var(--nh-border); }
  @keyframes nh-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

  /* ─── Disclaimer ─── */
  .nh-disclaimer { border-top: 1px solid var(--nh-border); padding: 24px 0 32px; margin-top: 36px; color: var(--nh-muted); font-size: 12px; line-height: 1.6; text-align: center; }
`;
