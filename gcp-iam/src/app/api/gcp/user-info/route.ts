import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.GCP_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ configured: false, tokenInfo: null });
  }

  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        configured: true,
        valid: false,
        error: data.error_description || 'Token expired or invalid',
      });
    }

    return NextResponse.json({
      configured: true,
      valid: true,
      tokenInfo: {
        expires_in: data.expires_in,
        scope: data.scope,
      },
    });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      valid: false,
      error: 'Token inspection failed',
    });
  }
}
