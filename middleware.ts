import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_jwt';

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
  matcher: ['/adminpanel/:path*'],
};
