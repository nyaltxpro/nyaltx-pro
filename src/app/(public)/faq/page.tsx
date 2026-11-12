import FAQPage from '@/components/FAQPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.com'),
  title: 'Frequently Asked Questions (FAQ) | NYALTX',
  description:
    'Find answers to common questions about NYALTX, tokenized securities, token listings, Race to Liberty, and digital markets.',
  alternates: {
    canonical: 'https://www.nyaltx.com/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | NYALTX',
    description:
      'Find answers to common questions about NYALTX, tokenized securities, token listings, and digital markets.',
    url: 'https://www.nyaltx.com/faq',
    siteName: 'NYALTX',
    type: 'website',
  },
};

export default function FAQ() {
  return <FAQPage />;
}
