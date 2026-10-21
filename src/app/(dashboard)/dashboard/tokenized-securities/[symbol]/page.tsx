import StockProfile from '@/page-components/StockProfile';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ symbol: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params;
  const ticker = decodeURIComponent(symbol || '').toUpperCase();
  return {
    title: `${ticker} Stock Profile – NYALTX`,
    description: `Charts, fundamentals, news, and market widgets for ${ticker} on NYALTX.`,
  };
}

export default async function StockProfilePage({ params }: PageProps) {
  const { symbol } = await params;
  const ticker = decodeURIComponent(symbol || '').toUpperCase();

  return <StockProfile symbol={ticker} />;
}
