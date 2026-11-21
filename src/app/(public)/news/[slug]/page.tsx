import PublicHeader from '@/components/PublicHeader';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PUBLIC_NEWS_FILTER } from '@/lib/publicNewsQuery';
import NewsArticle from '../../../../components/NewsArticle';

const NEWS_METADATA_OVERRIDES: Record<string, { title: string; description: string }> = {
  'new-blockchain-platform-launches-medium-for-alt-coins-and-investors': {
    title: 'New Blockchain Platform Connects Alt Coins and Investors',
    description:
      'NYALTX launches a new medium where alt coin projects meet investors. Read what the platform offers and who it serves.',
  },
  'new-alt-coin-platform-collaborates-with-centralized-exchange': {
    title: 'Alt Coin Platform Partners With Centralized Exchange',
    description:
      'Read how NYALTX teams up with a centralized exchange to widen access for alt coin projects and traders.',
  },
  'blockchain-platform-launches-medium-for-binance-smart-chain-bep-20-alt-coins': {
    title: 'New Platform Launches for BEP-20 Alt Coins on BSC',
    description:
      'NYALTX introduces a dedicated medium for Binance Smart Chain BEP-20 alt coins. See what it means for BSC projects.',
  },
  'new-york-alt-exchange-nyaltx-and-nyax-token-officially-listed-on-coinmarketcap': {
    title: 'NYALTX and NYAX Token Listed on CoinMarketCap',
    description:
      'NYALTX and the NYAX token are now live on CoinMarketCap. Read the announcement and what the listing means for holders.',
  },
  'nyaltx-market-outlook-why-tokenization-could-weather-the-broader-market-correction': {
    title: 'Market Outlook: Can Tokenization Survive a Correction?',
    description:
      'NYALTX analyzes why tokenized assets may hold up better during a broad market correction, and where the risks remain.',
  },
};

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

    // Find the published article by slug or ObjectId
    const query: any = {
      ...PUBLIC_NEWS_FILTER,
      $or: [{ slug }]
    };
    if (ObjectId.isValid(slug)) {
      query.$or.push({ _id: new ObjectId(slug) });
    }

    const newsArticle = await collection.findOne(query);

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

  const override = NEWS_METADATA_OVERRIDES[params.slug];
  const title = override?.title ?? `${article.title} - NYALTX News`;
  const description = override?.description ?? article.excerpt;

  return {
    metadataBase: new URL('https://www.nyaltx.pro'),
    title: { absolute: title },
    description,
    keywords: article.tags.join(', '),
    alternates: {
      canonical: `https://www.nyaltx.pro/news/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.nyaltx.pro/news/${params.slug}`,
      siteName: 'NYALTX',
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
      ] : [
        {
          url: 'https://www.nyaltx.pro/og-image.png',
          width: 1200,
          height: 630,
          alt: 'NYALTX News',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nyaltx',
      title,
      description,
      images: article.featuredImage ? [article.featuredImage] : ['https://www.nyaltx.pro/og-image.png'],
    },
  };
}

export default async function NewsArticlePage({ params }: { params: { slug: string } }) {
  const article = await getNewsArticle(params.slug);

  if (!article) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PublicHeader />
      <NewsArticle article={article} />
    </div>
  );
}
