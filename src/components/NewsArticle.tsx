'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaClock, FaUser, FaEye, FaTags, FaArrowLeft, FaShare, FaTwitter, FaLinkedin, FaCopy } from 'react-icons/fa';

interface NewsData {
  _id: string;
  title: string;
  content: string;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="relative">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-40 right-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Back to News */}
        <div className="mb-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to News
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-cyan-500/10 text-cyan-300 text-sm rounded-full border border-cyan-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <FaUser className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="w-4 h-4" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEye className="w-4 h-4" />
              <span>{article.views} views</span>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-sm text-gray-400 mr-2">Share:</span>
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-200"
            >
              <FaTwitter className="w-4 h-4" />
              <span className="text-sm">Twitter</span>
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-600/20 hover:bg-blue-600/20 transition-all duration-200"
            >
              <FaLinkedin className="w-4 h-4" />
              <span className="text-sm">LinkedIn</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500/10 text-gray-400 rounded-lg border border-gray-500/20 hover:bg-gray-500/20 transition-all duration-200"
            >
              <FaCopy className="w-4 h-4" />
              <span className="text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="relative mb-8 rounded-2xl overflow-hidden w-full" style={{ minHeight: '300px', maxHeight: '60vh' }}>
            <Image
              src={article.featuredImage}
              alt={article.title}
              width={800}
              height={400}
              className="w-full h-full object-cover"
              style={{ 
                minWidth: '400px', 
                minHeight: '300px',
                maxHeight: '60vh',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-lg prose-invert max-w-none">
          <div 
            className="text-gray-300 leading-relaxed space-y-6 article-content"
            dangerouslySetInnerHTML={{ 
              __html: article.content.replace(/\n/g, '<br />') 
            }}
          />
        </article>

        {/* Custom styles for article images */}
        <style jsx>{`
          .article-content :global(img) {
            min-width: 400px !important;
            min-height: 300px !important;
            width: 100% !important;
            height: auto !important;
            object-fit: cover !important;
            object-position: center !important;
            border-radius: 12px !important;
            margin: 24px 0 !important;
          }
          
          @media (max-width: 640px) {
            .article-content :global(img) {
              min-width: 100% !important;
              min-height: 200px !important;
            }
          }
        `}</style>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">About the Author</h3>
              <p className="text-gray-400">{article.author}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Share this article:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-200"
                  title="Share on Twitter"
                >
                  <FaTwitter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-2 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-600/20 hover:bg-blue-600/20 transition-all duration-200"
                  title="Share on LinkedIn"
                >
                  <FaLinkedin className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2 bg-gray-500/10 text-gray-400 rounded-lg border border-gray-500/20 hover:bg-gray-500/20 transition-all duration-200"
                  title="Copy link"
                >
                  <FaCopy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </footer>

        {/* Related Articles CTA */}
        <div className="mt-12 p-6 bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Stay Updated</h3>
          <p className="text-gray-400 mb-4">
            Don't miss out on the latest NYALTX news and updates
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-200"
          >
            <FaTags className="w-4 h-4" />
            View All News
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NewsArticle;
