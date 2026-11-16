import FAQPage from '@/components/FAQPage';
import type { Metadata } from 'next';
import faqContent from '../../../../content/faq/faq-data.json';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: { absolute: 'NYALTX FAQ: Answers on Tokens, Trading and Listings' },
  description:
    'Get quick answers about the NYAX token, tokenized securities, trading, and how to list a project on NYALTX.',
  alternates: {
    canonical: 'https://www.nyaltx.pro/faq',
  },
  openGraph: {
    title: 'NYALTX FAQ: Answers on Tokens, Trading and Listings',
    description:
      'Get quick answers about the NYAX token, tokenized securities, trading, and how to list a project on NYALTX.',
    url: 'https://www.nyaltx.pro/faq',
    siteName: 'NYALTX',
    type: 'website',
  },
};

export default function FAQ() {
  return <FAQPage initialContent={faqContent} />;
}
