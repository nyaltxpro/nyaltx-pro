import { pageMetadata } from '@/lib/pageMetadata';
import DisclaimerContent from './DisclaimerContent';

export const metadata = pageMetadata(
  'Disclaimer | NYALTX',
  'Important notice that NYALTX content is for information only and is not financial, legal, or investment advice. Read before acting on any content.',
  '/disclaimer',
);

export default function DisclaimerPage() {
  return <DisclaimerContent />;
}
