import { NextRequest, NextResponse } from 'next/server';
import { googleAdminClient } from '@/lib/google-admin-client';
import { BulkServiceRequest } from '@/lib/types';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: BulkServiceRequest = await request.json();
    const { userIds, orgUnitPath, services } = body;

    if ((!userIds || userIds.length === 0) && !orgUnitPath) {
      return NextResponse.json(
        { error: 'Either userIds array or orgUnitPath must be provided' },
        { status: 400 }
      );
    }

    if (!services || Object.keys(services).length === 0) {
      return NextResponse.json({ error: 'At least one service flag must be provided' }, { status: 400 });
    }

    const result = await googleAdminClient.bulkUpdateServices(userIds, orgUnitPath, services);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed bulk service update' }, { status: 500 });
  }
}
