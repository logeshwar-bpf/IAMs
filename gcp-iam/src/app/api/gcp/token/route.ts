import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';

export const revalidate = 0;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const token = process.env.GCP_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ configured: false, valid: false });
  }

  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
    if (!res.ok) {
      return NextResponse.json({
        configured: true,
        valid: false,
        error: 'Token expired or invalid',
      });
    }

    return NextResponse.json({
      configured: true,
      valid: true,
    });
  } catch (error) {
    return NextResponse.json({ configured: true, valid: false, error: 'Token test failed' });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { token } = await req.json();
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const cleanToken = token.trim();

    if (/[\r\n]/.test(cleanToken)) {
      return NextResponse.json({ error: 'Invalid token format: newline characters not allowed' }, { status: 400 });
    }

    // 1. Update runtime environment variable
    process.env.GCP_ACCESS_TOKEN = cleanToken;

    // 2. Persist to .env.local file
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      let content = '';
      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
      }

      if (content.includes('GCP_ACCESS_TOKEN=')) {
        content = content.replace(/GCP_ACCESS_TOKEN=.*/g, `GCP_ACCESS_TOKEN=${cleanToken}`);
      } else {
        content += `\nGCP_ACCESS_TOKEN=${cleanToken}\n`;
      }

      fs.writeFileSync(envPath, content, 'utf8');
    } catch (fsErr) {
      console.warn('Could not write token to .env.local:', fsErr);
    }

    // 3. Test token against Google OAuth tokeninfo
    const testRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${cleanToken}`);
    const testData = await testRes.json();

    if (!testRes.ok) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: 'Token saved to .env.local, but Google API returned expired/invalid token status.',
        error: testData.error_description || 'Invalid token',
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      message: 'GCP Access Token saved and verified successfully live!',
      expiresIn: testData.expires_in,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update token' }, { status: 500 });
  }
}
