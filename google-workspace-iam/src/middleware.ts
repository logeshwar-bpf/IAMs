import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const authResult = await verifyAuth(request);

    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
