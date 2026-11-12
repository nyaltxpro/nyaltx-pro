import fs from 'fs/promises';
import path from 'path';

export interface LandingPageSeo {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.nyaltx.pro';

const FALLBACK_SEO: LandingPageSeo = {
  title: 'NYALTX | Digital Markets & Tokenized Securities Discovery Platform',
  description:
    'Discover digital markets, tokenized securities, and project visibility on NYALTX — connecting DeFi discovery with tokenized stock market data.',
  keywords:
    'NYALTX, digital markets, tokenized securities, xStocks, DeFi discovery, capital markets, blockchain, Governa, NYAX',
  ogImage: `${baseUrl}/og-image.png`,
  canonical: baseUrl,
};

export async function getLandingPageSeo(): Promise<LandingPageSeo> {
  try {
    const contentPath = path.join(process.cwd(), 'content', 'landing', 'home.json');
    const raw = await fs.readFile(contentPath, 'utf8');
    const data = JSON.parse(raw);
    const seo = data?.seo ?? {};

    return {
      title: seo.metaTitle || FALLBACK_SEO.title,
      description: seo.metaDescription || FALLBACK_SEO.description,
      keywords: seo.keywords || FALLBACK_SEO.keywords,
      ogImage: seo.ogImage || FALLBACK_SEO.ogImage,
      canonical: seo.canonical || FALLBACK_SEO.canonical,
    };
  } catch (error) {
    console.error('Failed to load landing page SEO data:', error);
    return FALLBACK_SEO;
  }
}
