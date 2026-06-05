import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUploadsByUserId } from '@/lib/db/uploads';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(searchParams.get('limit') ?? '50', 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 50;

    const uploads = getUploadsByUserId(session.userId, limit);

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json({ error: 'Failed to list uploads' }, { status: 500 });
  }
}
