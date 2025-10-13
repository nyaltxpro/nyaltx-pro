import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicHeader from '@/components/PublicHeader';
import NewsArticle from '../../../../components/NewsArticle';

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

async function getNewsArticle(slug: string): Promise<NewsData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/news/${slug}`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.news;
  } catch (error) {
    console.error('Error fetching news article:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getNewsArticle(params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found - NYALTX News',
      description: 'The requested news article could not be found.',
    };
  }

  return {
    title: `${article.title} - NYALTX News`,
    description: article.excerpt,
    keywords: article.tags.join(', '),
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      images: article.featuredImage ? [
        {
          url: article.featuredImage,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  };
}

export default async function NewsArticlePage({ params }: { params: { slug: string } }) {
  const article = await getNewsArticle(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />
      <NewsArticle article={article} />
    </div>
  );
}
