import TokenizedSecurities from '@/page-components/TokenizedSecurities';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: { absolute: 'Tokenized Securities and xStocks Prices' },
  description:
    'View live prices and performance for tokenized stocks and xStocks, with market data built for on-chain investors.',
};

export default function TokenizedSecuritiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#00d4aa]" />
        </div>
      }
    >
      <TokenizedSecurities />
    </Suspense>
  );
}
