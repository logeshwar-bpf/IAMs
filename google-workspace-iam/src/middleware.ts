import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    const cookie = request.cookies.get('gws_session')?.value;
    const apiKey = process.env.API_KEY || 'gws-secret-api-key-2026';

    const hasValidKey = authHeader === `Bearer ${apiKey}` || authHeader === apiKey;
    const hasValidCookie = Boolean(cookie);

    if (!hasValidKey && !hasValidCookie && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
