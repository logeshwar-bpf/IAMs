import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    return 'claude-plan-dev-secret-key-2026-only-for-local-testing';
  }
  return secret;
}

export function generateToken(username) {
  return jwt.sign(
    { username, role: 'admin' },
    getJwtSecret(),
    { expiresIn: '8h' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
