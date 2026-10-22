'use client';

import { stockProfilePath, underlyingFromTvWidgetSymbol } from '@/lib/tradingViewSymbol';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/** When TradingView ticker tape lands with ?tvwidgetsymbol=, send user to our stock profile. */
export default function TvWidgetSymbolRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const underlying = underlyingFromTvWidgetSymbol(searchParams.get('tvwidgetsymbol'));
    if (!underlying) return;
    router.replace(stockProfilePath(underlying));
  }, [router, searchParams]);

  return null;
}
