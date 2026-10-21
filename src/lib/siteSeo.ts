import fs from 'fs/promises';
import path from 'path';
import type { Metadata } from 'next';

export type SiteSeoSettings = {
  title: string;
  description: string;
  keywords?: string;
  authors?: string;
  creator?: string;
  publisher?: string;
  siteName?: string;
  ogImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.nyaltx.pro';

export const FALLBACK_SITE_SEO: SiteSeoSettings = {
  title: 'NYALTX | Digital Markets & Tokenized Securities Discovery Platform',
  description:
    'Discover digital markets, tokenized securities, and project visibility on NYALTX — connecting DeFi discovery with tokenized stock market data.',
  keywords:
    'NYALTX, digital markets, tokenized securities, xStocks, DeFi discovery, capital markets, blockchain, Governa, NYAX',
  authors: 'NYALTX Team',
  creator: 'NYALTX Team',
  publisher: 'NYALTX',
  siteName: 'NYALTX',
  ogImage: '/og-image.png',
  twitterSite: '@nyaltx',
  twitterCreator: '@nyaltx',
};

function toAbsoluteUrl(src?: string | null): string {
  if (!src) return `${baseUrl}/og-image.png`;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `${baseUrl}${src.startsWith('/') ? src : `/${src}`}`;
}

export async function getSiteSeoSettings(): Promise<SiteSeoSettings> {
  try {
    const contentPath = path.join(process.cwd(), 'content', 'site-settings', 'seo.json');
    const raw = await fs.readFile(contentPath, 'utf8');
    const data = JSON.parse(raw) as Partial<SiteSeoSettings>;

    return {
      title: data.title?.trim() || FALLBACK_SITE_SEO.title,
      description: data.description?.trim() || FALLBACK_SITE_SEO.description,
      keywords: data.keywords?.trim() || FALLBACK_SITE_SEO.keywords,
      authors: data.authors?.trim() || FALLBACK_SITE_SEO.authors,
      creator: data.creator?.trim() || FALLBACK_SITE_SEO.creator,
      publisher: data.publisher?.trim() || FALLBACK_SITE_SEO.publisher,
      siteName: data.siteName?.trim() || FALLBACK_SITE_SEO.siteName,
      ogImage: data.ogImage || FALLBACK_SITE_SEO.ogImage,
      twitterSite: data.twitterSite?.trim() || FALLBACK_SITE_SEO.twitterSite,
      twitterCreator: data.twitterCreator?.trim() || FALLBACK_SITE_SEO.twitterCreator,
    };
  } catch (error) {
    console.error('Failed to load site SEO settings:', error);
    return FALLBACK_SITE_SEO;
  }
}

export async function buildRootMetadata(): Promise<Metadata> {
  const seo = await getSiteSeoSettings();
  const ogImage = toAbsoluteUrl(seo.ogImage);
  const metadataBase = new URL(baseUrl);

  return {
    metadataBase,
    alternates: {
      canonical: baseUrl,
    },
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    authors: seo.authors ? [{ name: seo.authors }] : undefined,
    creator: seo.creator,
    publisher: seo.publisher,
    robots: 'index, follow',
    icons: {
      icon: ogImage,
      shortcut: ogImage,
      apple: ogImage,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: baseUrl,
      siteName: seo.siteName || 'NYALTX',
      title: seo.title,
      description: seo.description,
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: seo.siteName || 'NYALTX',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: seo.twitterSite,
      creator: seo.twitterCreator,
      title: seo.title,
      description: seo.description,
      images: [ogImage],
    },
    manifest: '/manifest.json',
  };
}
