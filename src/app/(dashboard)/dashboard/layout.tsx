import type { Metadata } from 'next';
import { headers } from 'next/headers';
import DashboardChrome from './DashboardChrome';

const SITE_ORIGIN = 'https://www.nyaltx.pro';

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
  const canonical = selfCanonical(headerList.get('x-pathname'));
  if (!canonical) return {};

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
