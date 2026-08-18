import { NextResponse } from 'next/server';
import { resolveDriftAlert } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const status = body.status || 'resolved';

    const alert = resolveDriftAlert(id, status);
    return NextResponse.json({ success: true, alert });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 400 });
  }
}
