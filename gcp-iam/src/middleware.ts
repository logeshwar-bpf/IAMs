import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    return new TextEncoder().encode('gcp-iam-dev-secret-key-2026-only-for-local-testing');
  }
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude public auth API endpoints
  if (
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/google') ||
    pathname.startsWith('/api/auth/logout')
  ) {
    return NextResponse.next();
  }

  // Protect all other /api/* routes with cryptographic JWT signature verification as defense-in-depth
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Session token missing' }, { status: 401 });
    }

    try {
      const secretKey = getSecretKey();
      await jwtVerify(token, secretKey);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired session token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
