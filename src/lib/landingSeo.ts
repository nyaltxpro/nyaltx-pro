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
  title: 'NYALTX | Crypto Token Tracker & DeFi Platform',
  description:
    'Discover, track, and grow your crypto tokens with NYALTX. Real-time insights, curated listings, and gamified promotion across multiple blockchains.',
  keywords:
    'crypto, cryptocurrency, token tracker, DeFi, meme tokens, blockchain, Ethereum, trading, gamification, Race to Liberty, NYAX',
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
