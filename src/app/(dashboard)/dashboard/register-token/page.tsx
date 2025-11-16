import RegisterTokenContent from '@/page-components/RegisterToken';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Your Token – Create a Project Profile on NYALTX',
  description:
    'Add your project to NYALTX.pro and create a clean, informative token profile with links, details, and updates your community can easily find.',
  openGraph: {
    title: 'Submit Your Token – Create a Project Profile on NYALTX',
    description:
      'Add your project to NYALTX.pro and create a clean, informative token profile with links, details, and updates your community can easily find.',
    type: 'website',
  },
};

export default function RegisterTokenPage() {
  return <RegisterTokenContent />;
}