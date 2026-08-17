import { NextResponse } from 'next/server';
import { getRoleForEmail, signJWT, UserRole } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Google ID token is required' },
        { status: 400 }
      );
    }

    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!googleRes.ok) {
      return NextResponse.json(
        { error: 'Invalid Google ID token' },
        { status: 401 }
      );
    }

    const tokenInfo = await googleRes.json();

    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (!expectedClientId) {
      return NextResponse.json(
        { error: 'GOOGLE_CLIENT_ID environment variable is not configured on server' },
        { status: 500 }
      );
    }

    if (tokenInfo.aud !== expectedClientId) {
      return NextResponse.json(
        { error: 'ID token client ID mismatch' },
        { status: 401 }
      );
    }

    const isEmailVerified = tokenInfo.email_verified === true || tokenInfo.email_verified === 'true';
    if (!isEmailVerified || !tokenInfo.email) {
      return NextResponse.json(
        { error: 'Unverified Google email' },
        { status: 401 }
      );
    }

    const verifiedEmail = tokenInfo.email.toLowerCase().trim();
    const verifiedName = tokenInfo.name || tokenInfo.email.split('@')[0];
    const targetRole: UserRole = getRoleForEmail(verifiedEmail);
    const targetName = verifiedName || (targetRole === 'ADMIN' ? 'Logeshwar (GCP Admin)' : 'GCP IAM Member');

    const sessionPayload = {
      id: `usr_g_${Date.now()}`,
      email: verifiedEmail,
      name: targetName,
      role: targetRole,
      provider: 'google' as const,
      picture: `https://lh3.googleusercontent.com/a/default-user`,
    };

    const token = await signJWT(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    response.cookies.set({
      name: 'session_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Google OAuth failed' }, { status: 500 });
  }
}
