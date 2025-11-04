'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaArrowLeft,
  FaTwitter,
  FaLinkedin,
  FaCopy,
  FaClock,
  FaUser,
  FaTag,
} from 'react-icons/fa';
import RichTextRenderer from '@/components/TinaRichText';
import type { SerializedBlogPost } from '@/lib/blogServer';

interface BlogArticleProps {
  post: SerializedBlogPost;
}

const formatPublishedDateTime = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.warn('Failed to format blog date', error);
    return dateString ?? '';
  }
};

const convertToWorkingIPFSUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.includes('gateway.pinata.cloud/ipfs/')) {
    const hash = url.split('gateway.pinata.cloud/ipfs/')[1];
    return `https://ipfs.io/ipfs/${hash}`;
  }
  return url;
};

const BlogArticle = ({ post }: BlogArticleProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(() => (typeof window !== 'undefined' ? window.location.href : ''), []);

  const workingImageUrl = useMemo(() => convertToWorkingIPFSUrl(post.featuredImage), [post.featuredImage]);
  const published = formatPublishedDateTime(post.publishedAt ?? undefined);
  const readingTime = useMemo(() => {
    if (post.readingTime) return post.readingTime;
    if (!post.content) return undefined;
    if (typeof post.content === 'string') {
      const words = post.content.split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(3, Math.round(words / 200));
      return `${minutes} min read`;
    }
    if (typeof post.content === 'object' && Array.isArray((post.content as any).content)) {
      const length = JSON.stringify(post.content).length;
      const minutes = Math.max(3, Math.round(length / 1200));
      return `${minutes} min read`;
    }
    return undefined;
  }, [post.content, post.readingTime]);

  const handleShare = (platform: 'twitter' | 'linkedin') => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(`${post.title ?? 'NYALTX Blog'}${post.excerpt ? ` - ${post.excerpt}` : ''}`);

    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    } as const;

    const shareLink = links[platform];
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link', error);
    }
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-6 top-40 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <FaArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
        </div>

        <header className="mb-10">
          {post.categories?.length ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {post.categories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200"
                >
                  <FaTag className="h-3 w-3" />
                  {category}
                </span>
              ))}
            </div>
          ) : null}

          <h1 className="text-3xl font-bold text-white md:text-5xl">
            <span className="bg-linear-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              {post.title}
            </span>
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/60">
            {post.author ? (
              <span className="inline-flex items-center gap-2">
                <FaUser className="h-4 w-4" />
                {post.author}
              </span>
            ) : null}
            {published ? (
              <span className="inline-flex items-center gap-2">
                <FaClock className="h-4 w-4" />
                {published}
              </span>
            ) : null}
            {readingTime ? <span>{readingTime}</span> : null}
          </div>

          {post.excerpt ? <p className="mt-4 text-lg text-white/65">{post.excerpt}</p> : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-white/60">Share</span>
            <button
              onClick={() => handleShare('twitter')}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-200 transition-colors hover:bg-blue-500/20"
            >
              <FaTwitter className="h-4 w-4" />
              Twitter
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-600/30 bg-blue-600/10 px-3 py-2 text-xs font-medium text-blue-200 transition-colors hover:bg-blue-600/20"
            >
              <FaLinkedin className="h-4 w-4" />
              LinkedIn
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10"
            >
              <FaCopy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </header>

        {workingImageUrl ? (
          <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/10" style={{ minHeight: '320px' }}>
            <Image
              src={workingImageUrl}
              alt={post.title ?? 'Blog featured image'}
              fill
              className="object-cover"
              unoptimized={workingImageUrl.includes('ipfs.io')}
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
          </div>
        ) : null}

        <article className="prose prose-invert prose-lg max-w-none">
          {post.content ? (
            <RichTextRenderer content={post.content} className="prose prose-invert prose-lg max-w-none" />
          ) : null}
        </article>

        {post.tags?.length ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/50">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <h3 className="text-xl font-semibold text-white">Keep exploring NYALTX</h3>
          <p className="mt-3 text-sm text-white/60">
            Stay in the loop with platform updates, token insights, and community spotlights.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/news"
              className="rounded-full bg-linear-to-r from-cyan-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Visit Newsroom
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle;
