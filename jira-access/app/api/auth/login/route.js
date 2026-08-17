import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jira.internal';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (email.toLowerCase().trim() !== adminEmail.toLowerCase() || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = {
      email: adminEmail,
      name: 'Provisioning Admin',
      role: 'System Master Admin',
      lastLogin: new Date().toISOString(),
    };

    const response = NextResponse.json({ success: true, user });

    response.cookies.set({
      name: 'jira_session',
      value: JSON.stringify({ user, ts: Date.now() }),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
