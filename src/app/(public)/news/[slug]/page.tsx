import PublicHeader from '@/components/PublicHeader';
import { getDb } from '@/lib/mongodb';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
    console.log('Fetching article with slug:', slug);

    const db = await getDb();
    const collection = db.collection('corporate_news');

    // Check all articles with this slug for debugging
    const allMatchingArticles = await collection.find({ slug }).toArray();
    console.log('All articles with slug:', slug, allMatchingArticles.map(a => ({
      title: a.title,
      status: a.status,
      publishedAt: a.publishedAt,
      slug: a.slug
    })));

    // Find the published article
    const newsArticle = await collection.findOne({
      slug,
      status: 'published'
    });

    console.log('Published article found:', newsArticle ? 'YES' : 'NO');

    if (!newsArticle) {
      return null;
    }

    // Increment view count
    await collection.updateOne(
      { _id: newsArticle._id },
      { $inc: { views: 1 } }
    );

    return {
      _id: newsArticle._id.toString(),
      title: newsArticle.title,
      content: newsArticle.content,
      excerpt: newsArticle.excerpt,
      featuredImage: newsArticle.featuredImage,
      publishedAt: newsArticle.publishedAt,
      author: newsArticle.author,
      slug: newsArticle.slug,
      tags: newsArticle.tags || [],
      views: newsArticle.views || 0
    };
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
    <div className="min-h-screen  text-white">
      <PublicHeader />
      <NewsArticle article={article} />
    </div>
  );
}
