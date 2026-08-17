import { NextResponse } from 'next/server';
import { MOCK_USERS, signJWT, UserRole, verifyPassword } from '@/lib/auth';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count: number;
  resetAt: number;
}

const failedAttempts = new Map<string, AttemptRecord>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

function isRateLimited(key: string): boolean {
  const record = failedAttempts.get(key);
  if (!record) return false;
  if (Date.now() > record.resetAt) {
    failedAttempts.delete(key);
    return false;
  }
  return record.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const record = failedAttempts.get(key);
  if (!record || now > record.resetAt) {
    failedAttempts.set(key, { count: 1, resetAt: now + LOCKOUT_WINDOW_MS });
  } else {
    record.count += 1;
  }
}

function resetFailedAttempts(key: string) {
  failedAttempts.delete(key);
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const clientIp = getClientIp(request);

    // Key rate limiting on IP + Email combo and IP-only throttling to prevent Account Lockout DoS
    const ipEmailKey = `${clientIp}:${cleanEmail}`;
    const ipOnlyKey = `${clientIp}:ip_only`;

    if (isRateLimited(ipEmailKey) || isRateLimited(ipOnlyKey)) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please try again after 15 minutes.' },
        { status: 429 }
      );
    }

    const existingUser = MOCK_USERS[cleanEmail];
    const isValid = existingUser ? await verifyPassword(password, existingUser.passwordHash, existingUser.salt) : false;

    if (!existingUser || !isValid) {
      recordFailedAttempt(ipEmailKey);
      recordFailedAttempt(ipOnlyKey);
      // Throttles invalid login attempts to slow down automated brute-force attacks (timing safety is handled by crypto.timingSafeEqual)
      await new Promise((res) => setTimeout(res, 500));
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    resetFailedAttempts(ipEmailKey);
    resetFailedAttempts(ipOnlyKey);

    const assignedRole: UserRole = existingUser.role;
    const userName = existingUser.name;

    const userSession = {
      email: cleanEmail,
      name: userName,
      role: assignedRole,
      picture: `https://lh3.googleusercontent.com/a/default-user`,
    };

    const token = await signJWT(userSession);

    const response = NextResponse.json({
      success: true,
      user: userSession,
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
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

