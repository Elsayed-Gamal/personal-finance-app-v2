import { NextResponse } from 'next/server';
import { auth } from './app/_services/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // ── مش ADMIN → ممنوع يدخل /admin ──────────────────────
  // if (pathname.startsWith('/admin') && session?.user?.role !== 'ADMIN') {
  //   return NextResponse.redirect(new URL('/unauthorized', req.url));
  // }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/',
    '/transactions/:path*',
    '/budgets/:path*',
    '/pots/:path*',
    '/recurring-bills/:path*',
    '/admin/:path*',
    '/profile/:path*',
  ],
};
