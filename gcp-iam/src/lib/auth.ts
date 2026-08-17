import crypto from 'crypto';
import util from 'util';
import { SignJWT, jwtVerify } from 'jose';

const pbkdf2Async = util.promisify(crypto.pbkdf2);

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    return new TextEncoder().encode('gcp-iam-dev-secret-key-2026-only-for-local-testing');
  }
  return new TextEncoder().encode(secret);
}

export type UserRole = 'ADMIN' | 'MEMBER';

export interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  picture?: string;
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const derivedKey = await pbkdf2Async(password, salt, 10000, 64, 'sha512');
  return derivedKey.toString('hex');
}

export async function verifyPassword(password: string, expectedHash: string, salt: string): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  if (hash.length !== expectedHash.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
  } catch {
    return false;
  }
}

// Pre-computed user database with per-user random salts and hashed passwords (no plain-text literals committed)
export const MOCK_USERS: Record<string, { name: string; passwordHash: string; salt: string; role: UserRole }> = {
  'logeshwar2525@gmail.com': {
    name: 'Logeshwar (GCP Admin Owner)',
    salt: process.env.ADMIN_PASSWORD_SALT || '2126a6021d6efef62f1824e0e0692ebe',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '0373b2a24df3eaf802a3625f072bbf1dcb0017923a8c3660eca6ae6f3d7a5afbe1702dee44b6b09956bd8d4662afe678c203dda5bbaf44f600d682e7bbc438dc',
    role: 'ADMIN',
  },
  'logeshwar2424@gmail.com': {
    name: 'Logeshwar (GCP Viewer Member)',
    salt: process.env.MEMBER_PASSWORD_SALT || '51012b9c8367c64dbb518b0ca5391d64',
    passwordHash: process.env.MEMBER_PASSWORD_HASH || 'f0783d45cb5e4b27d03878b403b05a99bc8bdecf174798a177d3f904a1dd06670888a2ef087020c2e4b766f3306b266352d7635eb2d87cea1f1075b0208dc39f',
    role: 'MEMBER',
  },
  '1092945188165-compute@developer.gserviceaccount.com': {
    name: 'Compute Engine Service Account',
    salt: process.env.SA_PASSWORD_SALT || 'f48085a2aed52dd6ac84c8f2c6f02499',
    passwordHash: process.env.SA_PASSWORD_HASH || '44e9ef62250a2d327a90c17e7f90eaa78da8fe64765f497ea021fffff9d3d3204e1a016c455aad175243f7cdfd22acf68159469d670e027417a93afe05d62613',
    role: 'MEMBER',
  },
};

export const mockUsers = MOCK_USERS;

export function getRoleForEmail(email: string): UserRole {
  const user = MOCK_USERS[email.toLowerCase().trim()];
  if (user) return user.role;
  return 'MEMBER';
}

export async function signJWT(payload: UserSession): Promise<string> {
  const secretKey = getJwtSecret();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}

export const signSessionToken = signJWT;

export async function verifyJWT(token: string): Promise<UserSession | null> {
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as UserSession;
  } catch (error) {
    return null;
  }
}

export const verifySessionToken = verifyJWT;

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) return null;
    return await verifySessionToken(token);
  } catch (error) {
    return null;
  }
}
