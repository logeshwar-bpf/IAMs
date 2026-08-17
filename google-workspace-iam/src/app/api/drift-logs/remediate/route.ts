import { NextRequest, NextResponse } from 'next/server';
import { googleAdminClient } from '@/lib/google-admin-client';

export async function POST(request: NextRequest) {
  try {
    const { driftId } = await request.json();
    if (!driftId) {
      return NextResponse.json({ error: 'driftId is required' }, { status: 400 });
    }

    const item = await googleAdminClient.remediateDrift(driftId);
    if (!item) {
      return NextResponse.json({ error: 'Drift item not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to remediate drift' }, { status: 500 });
  }
}
