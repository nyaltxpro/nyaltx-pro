import { cryptoBaseFromTvWidgetSymbol, tokenTradePath } from '@/lib/tradingViewSymbol';
import { redirect } from 'next/navigation';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * TradingView digital-assets ticker lands here with ?tvwidgetsymbol=BINANCE:BTCUSDT
 * and we send the user to the token trade/profile page.
 */
export default async function DigitalAssetTickerGoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params.tvwidgetsymbol ?? params.symbol ?? params.base;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const base = cryptoBaseFromTvWidgetSymbol(value ?? null);

  redirect(base ? tokenTradePath(base) : '/dashboard/trade');
}
