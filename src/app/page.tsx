import { getLandingPageSeo } from '@/lib/landingSeo';
import LandingPage from '@/page-components/LandingPage';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getLandingPageSeo();

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
      url: seo.canonical,
    },
    twitter: {
      card: seo.ogImage ? 'summary_large_image' : 'summary',
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
    alternates: {
      canonical: seo.canonical,
    },
  };
}

export default function Page() {
  return <LandingPage />;
}
