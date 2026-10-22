import TvWidgetSymbolRedirect from '@/components/TvWidgetSymbolRedirect';
import TokenizedSecurities from '@/page-components/TokenizedSecurities';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Tokenized Securities – NYALTX',
  description:
    'Live market-data board comparing traditional equity references with tokenized xStock quotes on NYALTX.',
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
      <TvWidgetSymbolRedirect />
      <TokenizedSecurities />
    </Suspense>
  );
}
