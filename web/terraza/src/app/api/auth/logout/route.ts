import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

export async function POST(_request: NextRequest) {
  try {
    await destroySession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Logout failed' },
      { status: 400 },
    );
  }
}
