'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaClock, FaUser, FaEye, FaTags, FaArrowRight } from 'react-icons/fa';

interface NewsArticle {
  _id: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt: string;
  author: string;
  slug: string;
  tags: string[];
  views: number;
}

interface NewsResponse {
  news: NewsArticle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function NewsGrid() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<NewsResponse['pagination'] | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, [currentPage, selectedTag]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9'
      });
      
      if (selectedTag) {
        params.append('tag', selectedTag);
      }

      const response = await fetch(`/api/news?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load news');
      
      const data: NewsResponse = await response.json();
      setNews(data.news);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    setCurrentPage(1);
  };

  const getAllTags = () => {
    const allTags = news.flatMap(article => article.tags);
    return [...new Set(allTags)];
  };

  if (loading && news.length === 0) {
    return (
      <div className="space-y-8">
        {/* Loading skeleton */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-800/50 rounded-2xl overflow-hidden">
                <div className="h-48 bg-gray-700/50"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700/50 rounded"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaTags className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Failed to Load News</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => loadNews()}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaTags className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No News Articles</h3>
        <p className="text-gray-400">Check back later for the latest updates and announcements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tag Filter */}
      {getAllTags().length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-400 mr-2">Filter by tag:</span>
          {getAllTags().map(tag => (
            <button
              key={tag}
              onClick={() => handleTagFilter(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                selectedTag === tag
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50 hover:text-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => handleTagFilter('')}
              className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* News Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {news.map((article, index) => (
          <article
            key={article._id}
            className="group relative bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden hover:border-gray-700/50 transition-all duration-300 hover:transform hover:scale-[1.02]"
          >
            {/* Featured Image */}
            <div className="relative h-48 overflow-hidden bg-gray-800/50">
              {article.featuredImage ? (
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 flex items-center justify-center">
                  <FaTags className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {/* Trending badge for first few items */}
              {index < 3 && (
                <div className="absolute top-3 left-3">
                  <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LATEST
                  </div>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Meta info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FaUser className="w-3 h-3" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FaClock className="w-3 h-3" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </div>

              {/* Title */}
              <Link
                href={`/news/${article.slug}`}
                className="block text-lg font-bold text-white hover:text-transparent hover:bg-gradient-to-r hover:from-cyan-400 hover:to-indigo-400 hover:bg-clip-text transition-all duration-300 mb-3 line-clamp-2"
              >
                {article.title}
              </Link>

              {/* Excerpt */}
              <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed mb-4">
                {article.excerpt}
              </p>

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-800/50 text-gray-400 text-xs rounded-full border border-gray-700/50"
                    >
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-800/50 text-gray-400 text-xs rounded-full border border-gray-700/50">
                      +{article.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaEye className="w-3 h-3" />
                  <span>{article.views} views</span>
                </div>
                <Link
                  href={`/news/${article.slug}`}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors group-hover:translate-x-1 duration-300"
                >
                  Read more
                  <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg border border-gray-700/50 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Previous
          </button>
          
          <div className="flex gap-1">
            {[...Array(pagination.pages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50 hover:text-gray-300'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
            disabled={currentPage === pagination.pages}
            className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg border border-gray-700/50 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next
          </button>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {loading && news.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsGrid;
