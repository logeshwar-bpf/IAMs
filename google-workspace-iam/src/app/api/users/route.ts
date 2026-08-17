import { NextRequest, NextResponse } from 'next/server';
import { googleAdminClient } from '@/lib/google-admin-client';
import { ServiceName } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const suspended = searchParams.get('suspended') !== null ? searchParams.get('suspended') === 'true' : undefined;
    const service = (searchParams.get('service') as ServiceName) || undefined;
    const serviceState = searchParams.get('serviceState') !== null ? searchParams.get('serviceState') === 'true' : undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await googleAdminClient.getUsers({
      search,
      suspended,
      service,
      serviceState,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { givenName, familyName, primaryEmail, services } = body;

    if (!givenName || !familyName || !primaryEmail) {
      return NextResponse.json(
        { error: 'First name, Last name, and Primary Email are required' },
        { status: 400 }
      );
    }

    const newUser = await googleAdminClient.createUser({
      givenName,
      familyName,
      primaryEmail,
      services,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}
