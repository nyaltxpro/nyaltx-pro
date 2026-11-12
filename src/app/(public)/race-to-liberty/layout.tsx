import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.com'),
  title: 'Race to Liberty | NYALTX Gamified Competition',
  description:
    'Join the Race to Liberty competition! Boost your token visibility with weekly marketing competitions, leaderboards, and boost multipliers on NYALTX.',
  alternates: {
    canonical: 'https://www.nyaltx.com/race-to-liberty',
  },
  openGraph: {
    title: 'Race to Liberty | NYALTX Gamified Competition',
    description:
      'Join the Race to Liberty competition! Boost your token visibility with weekly marketing competitions and leaderboards on NYALTX.',
    url: 'https://www.nyaltx.com/race-to-liberty',
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
