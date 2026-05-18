import { getDatabase } from './init';
import { v4 as uuidv4 } from 'uuid';

export type ChallengeType = 'registration' | 'authentication';

export interface ChallengeRecord {
  id: string;
  challenge: string;
  challengeType: ChallengeType;
  userId: string | null;
  createdAt: number;
  expiresAt: number;
}

const CHALLENGE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export function createChallenge(
  challenge: string,
  type: ChallengeType,
  userId?: string,
): ChallengeRecord {
  const db = getDatabase();
  const now = Date.now();
  const expiresAt = now + CHALLENGE_EXPIRY_MS;
  const id = uuidv4();

  const stmt = db.prepare(`
    INSERT INTO challenges (id, challenge, challenge_type, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, challenge, type, userId || null, now, expiresAt);

  return {
    id,
    challenge,
    challengeType: type,
    userId: userId || null,
    createdAt: now,
    expiresAt,
  };
}

export function getChallenge(id: string): ChallengeRecord | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM challenges WHERE id = ? AND expires_at > ?');
  const row = stmt.get(id, Date.now()) as Record<string, unknown> | undefined;

  if (!row) return null;

  return {
    id: row.id as string,
    challenge: row.challenge as string,
    challengeType: row.challenge_type as ChallengeType,
    userId: (row.user_id as string) || null,
    createdAt: row.created_at as number,
    expiresAt: row.expires_at as number,
  };
}

export function deleteChallenge(id: string): void {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM challenges WHERE id = ?');
  stmt.run(id);
}

export function cleanupExpiredChallenges(): void {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM challenges WHERE expires_at < ?');
  stmt.run(Date.now());
}
