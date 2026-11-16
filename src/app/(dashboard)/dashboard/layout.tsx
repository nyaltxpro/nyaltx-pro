import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/pageMetadata';
import { headers } from 'next/headers';
import DashboardChrome from './DashboardChrome';

const SITE_ORIGIN = 'https://www.nyaltx.pro';
const PAGE_METADATA: Record<string, { title: string; description: string }> = {
  '/dashboard': {
    title: 'NYALTX Dashboard: Live Digital Market Overview',
    description:
      'Monitor crypto prices, tokenized securities, trending assets, and news from a single NYALTX dashboard.',
  },
  '/dashboard/tokenized-securities': {
    title: 'Tokenized Securities and xStocks Prices',
    description:
      'View live prices and performance for tokenized stocks and xStocks, with market data built for on-chain investors.',
  },
  '/dashboard/trade': {
    title: 'Trade Tokenized Securities and Altcoins',
    description:
      'Open the NYALTX trading view to follow market activity and trade tokenized securities and altcoins from one screen.',
  },
  '/dashboard/trending': {
    title: 'Trending Crypto and Tokenized Assets Today',
    description:
      'See which tokens and tokenized stocks are gaining traction right now, ranked by trading activity and price movement.',
  },
  '/dashboard/leaderboard': {
    title: 'Top Projects Leaderboard: Crypto Rankings',
    description:
      'Compare top-ranked crypto projects on the NYALTX leaderboard by community votes, trading volume, and growth.',
  },
  '/dashboard/swap': {
    title: 'Token Swap: Exchange Crypto Assets on NYALTX',
    description:
      'Swap supported tokens directly from your wallet with the NYALTX swap tool, with rates shown before you confirm.',
  },
  '/dashboard/news': {
    title: 'Live Crypto News Feed Inside NYALTX Dashboard',
    description:
      'Stay on top of crypto and tokenization headlines without leaving your NYALTX dashboard.',
  },
};

/** Path-only self-canonical. Ignores anything that is not a dashboard path. */
function selfCanonical(pathname: string | null): string | null {
  if (!pathname || !pathname.startsWith('/dashboard')) return null;
  if (pathname.includes('://') || pathname.includes('..') || pathname.includes('\\')) return null;

  const path = pathname.split('?')[0]?.split('#')[0] || '';
  if (!path.startsWith('/dashboard')) return null;

  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  return `${SITE_ORIGIN}${normalized}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname');
  const canonical = selfCanonical(pathname);
  if (!canonical) return {};

  const normalizedPath = pathname!.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const page = PAGE_METADATA[normalizedPath];
  if (page) {
    return {
      ...pageMetadata(page.title, page.description, normalizedPath),
      alternates: { canonical },
    };
  }

  return {
    alternates: { canonical },
  };
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardChrome>{children}</DashboardChrome>;
}
