import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith('/adminpanel');
  const isLoginRoute = pathname === '/adminpanel/login';

  if (!isAdminRoute) return NextResponse.next();

  const isAuthed = Boolean(req.cookies.get('admin_jwt')?.value);

  // If not authed and trying to access any adminpanel route except login -> redirect to login
  if (!isAuthed && !isLoginRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/adminpanel/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If authed and tries to access login -> redirect to /adminpanel
  if (isAuthed && isLoginRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/adminpanel';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/adminpanel/:path*'],
};
