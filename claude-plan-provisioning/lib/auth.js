import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET || 'claude-plan-provisioning-secret-key-2026';

export function generateToken(username) {
  return jwt.sign(
    { username, role: 'admin' },
    SECRET,
    { expiresIn: '8h' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
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
