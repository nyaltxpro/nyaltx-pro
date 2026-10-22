import { stockProfilePath, underlyingFromTvWidgetSymbol } from '@/lib/tradingViewSymbol';
import { redirect } from 'next/navigation';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * TradingView ticker tape lands here with ?tvwidgetsymbol=EXCHANGE:SYMBOL
 * and we immediately send the user to our stock profile (no board flash).
 */
export default async function TickerGoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params.tvwidgetsymbol ?? params.symbol;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const underlying = underlyingFromTvWidgetSymbol(value ?? null);

  redirect(underlying ? stockProfilePath(underlying) : '/dashboard/tokenized-securities');
}
