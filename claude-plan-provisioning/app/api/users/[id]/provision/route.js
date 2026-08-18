import { NextResponse } from 'next/server';
import { updateUserPlan } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { newPlan, seats, billingCycle, notes } = body;

    if (!newPlan) {
      return NextResponse.json({ error: 'newPlan is required' }, { status: 400 });
    }

    const adminUser = auth.user?.username || 'admin';
    const result = await updateUserPlan({
      userId: id,
      newPlan,
      seats,
      billingCycle,
      adminUser,
      notes
    });

    return NextResponse.json({ success: true, user: result.user, auditLog: result.auditLog });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 400 });
  }
}
