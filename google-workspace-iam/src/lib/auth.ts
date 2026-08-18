import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

export interface UserSession {
  email: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
}

export function getApiKey(): string {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('API_KEY environment variable is required in production');
    }
    return 'gws-dev-api-key-2026-only-for-local-testing';
  }
  return apiKey;
}

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    return new TextEncoder().encode('gws-dev-jwt-secret-2026-only-for-local-testing');
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: UserSession): Promise<string> {
  const secretKey = getJwtSecret();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export async function verifyAuth(request: NextRequest): Promise<{ isValid: boolean; user?: UserSession; isApiKey?: boolean }> {
  try {
    const authHeader = request.headers.get('authorization');
    const validApiKey = getApiKey();

    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      if (token === validApiKey) {
        return { isValid: true, isApiKey: true };
      }
      // Also allow JWT bearer token
      const verifiedUser = await verifySessionToken(token);
      if (verifiedUser) {
        return { isValid: true, user: verifiedUser };
      }
    }

    const cookie = request.cookies.get('gws_session')?.value || request.cookies.get('session_token')?.value;
    if (cookie) {
      const verifiedUser = await verifySessionToken(cookie);
      if (verifiedUser) {
        return { isValid: true, user: verifiedUser };
      }
    }

    return { isValid: false };
  } catch (err) {
    return { isValid: false };
  }
}
