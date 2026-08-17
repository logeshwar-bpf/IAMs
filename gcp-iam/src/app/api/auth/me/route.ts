import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    // Fallback check in Authorization header
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const jwtToVerify = token || bearerToken;

    if (!jwtToVerify) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await verifyJWT(jwtToVerify);

    if (!user) {
      return NextResponse.json({ authenticated: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    const gcpTokenConfigured = Boolean(process.env.GCP_ACCESS_TOKEN);

    return NextResponse.json({
      authenticated: true,
      user,
      gcpTokenConfigured,
      gcpTokenPreview: process.env.GCP_ACCESS_TOKEN
        ? `${process.env.GCP_ACCESS_TOKEN.substring(0, 14)}...`
        : null,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: 'Authentication check failed' }, { status: 500 });
  }
}
