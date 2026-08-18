import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const user = getUserById(id);
    if (!user) {
      return NextResponse.json({ error: `User with ID ${id} not found` }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
