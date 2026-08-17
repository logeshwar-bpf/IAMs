import { NextResponse } from 'next/server';
import { googleAdminClient } from '@/lib/google-admin-client';

export async function GET() {
  try {
    const logs = await googleAdminClient.getDriftLogs();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch drift logs' }, { status: 500 });
  }
}
