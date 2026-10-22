import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_jwt';

/** Strip EXCHANGE: prefix from TradingView tvwidgetsymbol. */
function underlyingFromTvWidgetSymbol(raw: string | null): string | null {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw).trim().toUpperCase();
  if (!decoded) return null;
  const colon = decoded.lastIndexOf(':');
  const symbol = colon >= 0 ? decoded.slice(colon + 1) : decoded;
  return symbol || null;
}

const QUOTE_SUFFIXES = ['USDT', 'USDC', 'BUSD', 'USD', 'PERP'];

function cryptoBaseFromTvWidgetSymbol(raw: string | null): string | null {
  const pair = underlyingFromTvWidgetSymbol(raw);
  if (!pair) return null;
  for (const quote of QUOTE_SUFFIXES) {
    if (pair.endsWith(quote) && pair.length > quote.length) {
      return pair.slice(0, -quote.length);
    }
  }
  return pair;
}

async function hasValidAdminSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return false;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });
    return payload.sub === 'admin' && payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // xStocks ticker → stock profile
  if (
    pathname === '/dashboard/tokenized-securities' ||
    pathname === '/dashboard/tokenized-securities/go'
  ) {
    const underlying = underlyingFromTvWidgetSymbol(
      req.nextUrl.searchParams.get('tvwidgetsymbol'),
    );
    if (underlying) {
      const url = req.nextUrl.clone();
      url.pathname = `/dashboard/tokenized-securities/${encodeURIComponent(underlying)}`;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  // Digital assets ticker → token trade/profile
  if (pathname === '/dashboard/trade/go' || pathname === '/dashboard/trending') {
    const base = cryptoBaseFromTvWidgetSymbol(req.nextUrl.searchParams.get('tvwidgetsymbol'));
    if (base) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard/trade';
      url.search = `?base=${encodeURIComponent(base)}`;
      return NextResponse.redirect(url);
    }
  }

  const isAdminRoute = pathname.startsWith('/adminpanel');
  const isLoginRoute = pathname === '/adminpanel/login';

  if (!isAdminRoute) return NextResponse.next();

  const isAuthed = await hasValidAdminSession(req);

  // Clear stale cookie so login page isn't blocked by an expired JWT
  if (!isAuthed && req.cookies.get(COOKIE_NAME)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = '/adminpanel/login';
    if (!isLoginRoute) {
      url.searchParams.set('from', pathname);
    }
    const res = NextResponse.redirect(url);
    res.cookies.set({
      name: COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  }

  if (!isAuthed && !isLoginRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/adminpanel/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthed && isLoginRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/adminpanel';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/adminpanel/:path*',
    '/dashboard/tokenized-securities',
    '/dashboard/tokenized-securities/go',
    '/dashboard/trade/go',
    '/dashboard/trending',
  ],
};
