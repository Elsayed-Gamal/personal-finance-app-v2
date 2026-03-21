import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === '/transactions') {
    const url = request.nextUrl.clone();
    let changed = false;

    if (!searchParams.has('page')) {
      url.searchParams.set('page', '1');
      changed = true;
    }
    if (!searchParams.has('sort')) {
      url.searchParams.set('sort', 'date_desc');
      changed = true;
    }
    if (!searchParams.has('category')) {
      url.searchParams.set('category', 'all');
      changed = true;
    }

    if (changed) return NextResponse.redirect(new URL(url));
  }
}

export const config = {
  matcher: '/transactions',
};
