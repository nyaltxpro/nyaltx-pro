import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: { absolute: 'Race to Liberty: NYALTX Community Campaign' },
  description:
    'Join the NYALTX Race to Liberty and see how the community competes, participates, and earns across the ecosystem.',
  alternates: {
    canonical: 'https://www.nyaltx.pro/race-to-liberty',
  },
  openGraph: {
    title: 'Race to Liberty: NYALTX Community Campaign',
    description:
      'Join the NYALTX Race to Liberty and see how the community competes, participates, and earns across the ecosystem.',
    url: 'https://www.nyaltx.pro/race-to-liberty',
    siteName: 'NYALTX',
    type: 'website',
  },
};

export default function RaceToLibertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
