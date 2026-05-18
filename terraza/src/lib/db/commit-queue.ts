import { getDatabase } from './init';
import { v4 as uuidv4 } from 'uuid';

export type CommitStatus = 'pending' | 'committed' | 'synced' | 'error';

export interface CommitQueueRecord {
  id: string;
  uploadId: string;
  commitHash: string | null;
  status: CommitStatus;
  errorMessage: string | null;
  createdAt: number;
  updatedAt: number;
}

function rowToRecord(row: Record<string, unknown>): CommitQueueRecord {
  return {
    id: row.id as string,
    uploadId: row.upload_id as string,
    commitHash: (row.commit_hash as string) || null,
    status: row.status as CommitStatus,
    errorMessage: (row.error_message as string) || null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export function createCommitQueueEntry(uploadId: string): CommitQueueRecord {
  const db = getDatabase();
  const id = uuidv4();
  const now = Date.now();
  db.prepare(`
    INSERT INTO commit_queue (id, upload_id, status, created_at, updated_at)
    VALUES (?, ?, 'pending', ?, ?)
  `).run(id, uploadId, now, now);
  return { id, uploadId, commitHash: null, status: 'pending', errorMessage: null, createdAt: now, updatedAt: now };
}

export function updateCommitStatus(
  id: string,
  status: CommitStatus,
  commitHash?: string,
  errorMessage?: string,
): void {
  const db = getDatabase();
  db.prepare(`
    UPDATE commit_queue
    SET status = ?, commit_hash = ?, error_message = ?, updated_at = ?
    WHERE id = ?
  `).run(status, commitHash ?? null, errorMessage ?? null, Date.now(), id);
}

export function getPendingCommits(): CommitQueueRecord[] {
  const db = getDatabase();
  const rows = db.prepare(
    `SELECT * FROM commit_queue WHERE status IN ('pending', 'committed') ORDER BY created_at ASC`,
  ).all() as Record<string, unknown>[];
  return rows.map(rowToRecord);
}

export function getCommitQueueByUpload(uploadId: string): CommitQueueRecord | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM commit_queue WHERE upload_id = ? ORDER BY created_at DESC LIMIT 1').get(uploadId) as Record<string, unknown> | undefined;
  return row ? rowToRecord(row) : null;
}

export function getAllCommitQueue(limit = 50): CommitQueueRecord[] {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT * FROM commit_queue ORDER BY created_at DESC LIMIT ?',
  ).all(limit) as Record<string, unknown>[];
  return rows.map(rowToRecord);
}
