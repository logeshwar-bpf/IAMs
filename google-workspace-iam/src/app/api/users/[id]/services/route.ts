import { NextRequest, NextResponse } from 'next/server';
import { googleAdminClient } from '@/lib/google-admin-client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const ALLOWED_SERVICES = ['gmail', 'drive', 'calendar', 'meet', 'chat', 'gemini'];
    const services: Record<string, boolean> = {};
    for (const key of ALLOWED_SERVICES) {
      if (key in body && typeof body[key] === 'boolean') {
        services[key] = body[key];
      }
    }
    const updated = await googleAdminClient.updateUserServices(id, services);
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user services' }, { status: 500 });
  }
}
