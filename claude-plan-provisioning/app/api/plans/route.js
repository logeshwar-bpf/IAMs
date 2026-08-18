import { NextResponse } from 'next/server';
import { getPlans } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = getPlans();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
