import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.com'),
  title: 'Meet the NYALTX Team | Leadership & Builders',
  description:
    'Meet the multidisciplinary crew of builders, traders, and storytellers behind the New York Alt Exchange (NYALTX).',
  alternates: {
    canonical: 'https://www.nyaltx.com/team',
  },
  openGraph: {
    title: 'Meet the NYALTX Team | Leadership & Builders',
    description:
      'Meet the multidisciplinary crew of builders, traders, and storytellers behind the New York Alt Exchange (NYALTX).',
    url: 'https://www.nyaltx.com/team',
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
