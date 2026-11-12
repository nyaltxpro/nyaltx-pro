import ContactPage from '@/components/ContactPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.com'),
  title: 'Contact Us | NYALTX',
  description:
    'Get in touch with the NYALTX team for partnerships, token listings, press releases, or support.',
  alternates: {
    canonical: 'https://www.nyaltx.com/contact',
  },
  openGraph: {
    title: 'Contact Us | NYALTX',
    description:
      'Get in touch with the NYALTX team for partnerships, token listings, press releases, or support.',
    url: 'https://www.nyaltx.com/contact',
    siteName: 'NYALTX',
    type: 'website',
  },
};

export default function Contact() {
  return <ContactPage />;
}
