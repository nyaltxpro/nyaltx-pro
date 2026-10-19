import TokenizedSecurities from '@/page-components/TokenizedSecurities';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tokenized Securities – NYALTX',
  description:
    'Live market-data board comparing traditional equity references with tokenized xStock quotes on NYALTX.',
};

export default function TokenizedSecuritiesPage() {
  return <TokenizedSecurities />;
}
