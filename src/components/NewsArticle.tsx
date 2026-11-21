'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaClock,
  FaCopy,
  FaEye,
  FaLinkedin,
  FaTags,
  FaTwitter,
} from 'react-icons/fa';
import { toReliableIpfsUrl } from '@/utils/ipfsUpload';

interface NewsData {
  _id: string;
  title: string;
  content: string | { content: any };
  excerpt: string;
  featuredImage?: string;
  publishedAt: string;
  author: string;
  slug: string;
  tags: string[];
  views: number;
}

interface NewsArticleProps {
  article: NewsData;
}

function NewsArticle({ article }: NewsArticleProps) {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const authorName = article.author?.trim() || 'NYALTX';

  const articleContent = useMemo(() => {
    if (!article.content) return '';
    // For news articles, content should be HTML from Quill editor
    if (typeof article.content === 'string') {
      return article.content;
    }
    // If it's an object, try to extract content or stringify it
    if (typeof article.content === 'object' && article.content.content) {
      return String(article.content.content);
    }
    return String(article.content);
  }, [article.content]);

  const workingImageUrl = article.featuredImage ? toReliableIpfsUrl(article.featuredImage) : '';

  const formatDate = (dateString: string) => {
    if (!dateString || Number.isNaN(new Date(dateString).getTime())) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${article.title} - ${article.excerpt}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = (platform: 'twitter' | 'linkedin') => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400,noopener,noreferrer');
    }
  };

  return (
    <div className="article-detail min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-7 text-sm text-gray-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-cyan-300">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/newshub" className="transition-colors hover:text-cyan-300">
                News Hub
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-cyan-200">{article.tags[0] || 'Article'}</li>
          </ol>
        </nav>

        <header className="mb-7 border-b border-white/10 pb-6">
          {article.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="max-w-5xl font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 max-w-4xl text-base leading-relaxed text-gray-300 sm:text-lg">
              {article.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-gray-400">
            <span className="inline-flex items-center gap-2 font-semibold text-white">
              <span className="grid size-8 place-items-center rounded-full bg-white/10 font-serif text-sm uppercase text-cyan-200">
                {authorName.charAt(0)}
              </span>
              {authorName}
            </span>
            <span className="inline-flex items-center gap-2">
              <FaClock aria-hidden="true" />
              {formatDate(article.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-2">
              <FaEye aria-hidden="true" />
              {article.views.toLocaleString()} views
            </span>
          </div>
        </header>

        {workingImageUrl && (
          <figure className="featured-image-container relative mb-8 aspect-[16/8] overflow-hidden rounded-lg bg-gray-900/50">
            {!imageError ? (
              <img
                src={workingImageUrl}
                alt={article.title}
                className="h-full w-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="grid h-full place-items-center text-gray-500">
                <FaTags className="size-8" aria-hidden="true" />
              </div>
            )}
          </figure>
        )}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
          <article className="article-content min-w-0">
            <div dangerouslySetInnerHTML={{ __html: articleContent }} />

            {article.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-zinc-200 pt-5">
                {article.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          <aside className="space-y-5">
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-cyan-300">
                Share this story
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  aria-label="Share on X"
                  className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-colors hover:border-cyan-300/50 hover:text-cyan-200"
                >
                  <FaTwitter aria-hidden="true" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  aria-label="Share on LinkedIn"
                  className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-colors hover:border-cyan-300/50 hover:text-cyan-200"
                >
                  <FaLinkedin aria-hidden="true" />
                </button>
                <button
                  onClick={handleCopyLink}
                  aria-label={copied ? 'Link copied' : 'Copy article link'}
                  className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-colors hover:border-cyan-300/50 hover:text-cyan-200"
                >
                  <FaCopy aria-hidden="true" />
                </button>
              </div>
              <p aria-live="polite" className="mt-3 min-h-4 text-xs text-cyan-300">
                {copied ? 'Link copied to clipboard' : ''}
              </p>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-300">
                About the author
              </h2>
              <p className="mt-3 font-serif text-lg font-semibold text-white">
                {authorName}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Article contributor
              </p>
            </section>

            <Link
              href="/newshub"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-100"
            >
              <FaArrowLeft aria-hidden="true" />
              Back to all stories
            </Link>
          </aside>
        </div>

        <footer className="mt-12 border-t border-white/10 pt-6">
          <Link
            href="/newshub"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/50 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-400 hover:text-slate-950"
          >
            <FaTags aria-hidden="true" />
            More NYALTX news
          </Link>
        </footer>
      </main>

      <style jsx>{`
        .article-content {
          color: #d1d5db;
          font-size: 17px;
          line-height: 1.85;
          overflow-wrap: anywhere;
        }

        .article-content :global(p) {
          margin: 0 0 1.5rem;
        }

        .article-content :global(h2),
        .article-content :global(h3),
        .article-content :global(h4) {
          margin: 2rem 0 0.8rem;
          color: #fff;
          font-family: Georgia, Cambria, 'Times New Roman', serif;
          font-weight: 600;
          line-height: 1.2;
        }

        .article-content :global(h2) {
          font-size: 1.8rem;
        }

        .article-content :global(h3) {
          font-size: 1.45rem;
        }

        .article-content :global(blockquote) {
          margin: 2rem 0;
          border-left: 4px solid #22d3ee;
          padding: 0.25rem 0 0.25rem 1.25rem;
          color: #e2e8f0;
          font-family: Georgia, Cambria, 'Times New Roman', serif;
          font-size: 1.3rem;
          font-style: italic;
        }

        .article-content :global(img) {
          display: block;
          width: 100%;
          height: auto;
          max-height: 75vh;
          margin: 2rem auto;
          border-radius: 8px;
          object-fit: contain;
        }

        .article-content :global(a) {
          color: #67e8f9;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .article-content :global(ul),
        .article-content :global(ol) {
          margin: 0 0 1.5rem;
          padding-left: 1.5rem;
        }

        .article-content :global(li) {
          margin: 0.4rem 0;
          padding-left: 0.25rem;
        }

        @media (max-width: 640px) {
          .article-content {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default NewsArticle;
