import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { countAllUsers, listAllCredentials } from '@/lib/db/credentials';
import { getUploadStats } from '@/lib/db/uploads';
import { getDatabase } from '@/lib/db/init';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const db = getDatabase();

  // Commit queue stats
  const queueRows = db.prepare(
    'SELECT status, COUNT(*) as count FROM commit_queue GROUP BY status',
  ).all() as Array<{ status: string; count: number }>;

  const commitQueue = { pending: 0, committed: 0, synced: 0, error: 0 };
  for (const row of queueRows) {
    if (row.status in commitQueue) {
      commitQueue[row.status as keyof typeof commitQueue] = row.count;
    }
  }

  return NextResponse.json({
    usuarios: countAllUsers(),
    credentials: listAllCredentials(),
    uploads: getUploadStats(),
    commitQueue,
  });
}
