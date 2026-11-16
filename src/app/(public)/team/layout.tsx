import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: { absolute: 'NYALTX Team: Leaders Behind the Exchange' },
  description:
    'Meet the founders, advisors, and specialists building NYALTX and its tokenized securities platform.',
  alternates: {
    canonical: 'https://www.nyaltx.pro/team',
  },
  openGraph: {
    title: 'NYALTX Team: Leaders Behind the Exchange',
    description:
      'Meet the founders, advisors, and specialists building NYALTX and its tokenized securities platform.',
    url: 'https://www.nyaltx.pro/team',
    siteName: 'NYALTX',
    type: 'website',
  },
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
