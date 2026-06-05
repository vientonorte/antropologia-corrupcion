import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getUpload } from '@/lib/db/uploads';
import { createCommitQueueEntry, updateCommitStatus } from '@/lib/db/commit-queue';
import { commitCaptureToRepo } from '@/lib/git/corpus-writer';

const CommitRequestSchema = z.object({
  uploadId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = CommitRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { uploadId } = parsed.data;
    const upload = getUpload(uploadId);

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }
    if (upload.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (upload.estadoCodificacion === 'pendiente') {
      return NextResponse.json(
        { error: 'La captura aún no tiene análisis. Ejecuta el análisis primero.' },
        { status: 422 },
      );
    }

    const queueEntry = createCommitQueueEntry(uploadId);

    try {
      const commitHash = await commitCaptureToRepo(upload);
      updateCommitStatus(queueEntry.id, 'committed', commitHash);
      return NextResponse.json({ success: true, commitHash, queueId: queueEntry.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Git commit failed';
      updateCommitStatus(queueEntry.id, 'error', undefined, msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  } catch (error) {
    console.error('Commit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
