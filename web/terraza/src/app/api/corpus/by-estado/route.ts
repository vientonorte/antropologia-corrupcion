import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUploadsByUserId } from '@/lib/db/uploads';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const all = getUploadsByUserId(session.userId, 200);

    const grouped = {
      open: all.filter((u) => u.estadoCodificacion === 'open'),
      axial: all.filter((u) => u.estadoCodificacion === 'axial'),
      selective: all.filter((u) => u.estadoCodificacion === 'selective'),
      verificado: all.filter((u) => u.estadoCodificacion === 'verificado'),
    };

    return NextResponse.json({ grouped });
  } catch (error) {
    console.error('by-estado error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
