import { NextResponse } from 'next/server';
import { verifySessionToken } from './lib/auth';

export async function middleware(request) {
  // If requesting api routes (other than /api/auth/login)
  if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth/login')) {
    const token = request.cookies.get('jira_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }
    const verified = await verifySessionToken(token);
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired session' }, { status: 401 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
