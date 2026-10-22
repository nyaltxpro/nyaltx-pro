import { stockProfilePath, underlyingFromTvWidgetSymbol } from '@/lib/tradingViewSymbol';
import { redirect } from 'next/navigation';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** TradingView ticker tape lands here with ?tvwidgetsymbol= — jump straight to stock profile. */
export default async function TickerGoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params.tvwidgetsymbol;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const underlying = underlyingFromTvWidgetSymbol(value);

  if (underlying) {
    redirect(stockProfilePath(underlying));
  }

  redirect('/dashboard/tokenized-securities');
}
