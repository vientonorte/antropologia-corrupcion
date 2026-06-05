import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getPendingCommits, updateCommitStatus } from '@/lib/db/commit-queue';
import { getRemoteSyncStatus } from '@/lib/git/corpus-writer';
import { updateUploadStatus } from '@/lib/db/uploads';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pending = getPendingCommits();
    let remoteStatus = { ahead: 0, behind: 0 };

    try {
      remoteStatus = await getRemoteSyncStatus();
    } catch {
      // Corpus repo not configured or offline — return pending list only
    }

    // If remote is no longer ahead of our committed entries, mark them synced
    if (remoteStatus.ahead === 0 && pending.length > 0) {
      for (const entry of pending) {
        if (entry.status === 'committed') {
          updateCommitStatus(entry.id, 'synced');
          updateUploadStatus(entry.uploadId, 'verificado');
        }
      }
    }

    const updatedPending = getPendingCommits();

    return NextResponse.json({
      pending: updatedPending,
      remoteStatus,
    });
  } catch (error) {
    console.error('Sync status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
