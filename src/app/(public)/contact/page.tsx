import ContactPage from '@/components/ContactPage';
import type { Metadata } from 'next';
import contactContent from '../../../../content/contact/contact-data.json';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyaltx.pro'),
  title: { absolute: 'Contact NYALTX: Support and Partnership Inquiries' },
  description:
    'Reach the NYALTX team for support, listing questions, media requests, or partnership proposals.',
  alternates: {
    canonical: 'https://www.nyaltx.pro/contact',
  },
  openGraph: {
    title: 'Contact NYALTX: Support and Partnership Inquiries',
    description:
      'Reach the NYALTX team for support, listing questions, media requests, or partnership proposals.',
    url: 'https://www.nyaltx.pro/contact',
    siteName: 'NYALTX',
    type: 'website',
  },
};

export default function Contact() {
  return <ContactPage initialContent={contactContent} />;
}
