import { getDatabase } from './init';
import { v4 as uuidv4 } from 'uuid';

export interface CredentialRecord {
  id: string;
  userId: string;
  userName: string;
  credentialId: Buffer;
  credentialPublicKey: Buffer;
  counter: number;
  transports: string | null;
  createdAt: number;
  updatedAt: number;
}

export function createCredential(
  userName: string,
  credentialId: Uint8Array,
  credentialPublicKey: Uint8Array,
  transports?: AuthenticatorTransport[],
): CredentialRecord {
  const db = getDatabase();
  const userId = uuidv4();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO credentials (
      id, user_id, user_name, credential_id, credential_public_key,
      counter, transports, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const credentialRecordId = uuidv4();
  stmt.run(
    credentialRecordId,
    userId,
    userName,
    Buffer.from(credentialId),
    Buffer.from(credentialPublicKey),
    0,
    transports ? JSON.stringify(transports) : null,
    now,
    now,
  );

  return {
    id: credentialRecordId,
    userId,
    userName,
    credentialId: Buffer.from(credentialId),
    credentialPublicKey: Buffer.from(credentialPublicKey),
    counter: 0,
    transports: transports ? JSON.stringify(transports) : null,
    createdAt: now,
    updatedAt: now,
  };
}

export function getCredentialByUserId(userId: string): CredentialRecord | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM credentials WHERE user_id = ?');
  const row = stmt.get(userId) as Record<string, unknown> | undefined;

  if (!row) return null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    credentialId: row.credential_id as Buffer,
    credentialPublicKey: row.credential_public_key as Buffer,
    counter: row.counter as number,
    transports: (row.transports as string) || null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export function getCredentialByUserName(userName: string): CredentialRecord | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM credentials WHERE user_name = ?');
  const row = stmt.get(userName) as Record<string, unknown> | undefined;

  if (!row) return null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    credentialId: row.credential_id as Buffer,
    credentialPublicKey: row.credential_public_key as Buffer,
    counter: row.counter as number,
    transports: (row.transports as string) || null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export function updateCredentialCounter(userId: string, newCounter: number): void {
  const db = getDatabase();
  const stmt = db.prepare(
    'UPDATE credentials SET counter = ?, updated_at = ? WHERE user_id = ?',
  );
  stmt.run(newCounter, Date.now(), userId);
}

/**
 * Reemplaza la credencial passkey de un usuario existente.
 * Se usa al registrar un nuevo dispositivo bajo sesión autenticada.
 * Mantiene user_id/user_name, reinicia el contador y rota la credencial previa.
 * La credencial anterior queda inválida para autenticaciones futuras.
 */
export function replaceCredentialForUser(
  userId: string,
  userName: string,
  credentialId: Uint8Array,
  credentialPublicKey: Uint8Array,
  transports?: AuthenticatorTransport[],
): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE credentials
    SET credential_id = ?, credential_public_key = ?, counter = ?, transports = ?, updated_at = ?
    WHERE user_id = ? AND user_name = ?
  `);

  stmt.run(
    Buffer.from(credentialId),
    Buffer.from(credentialPublicKey),
    0,
    transports ? JSON.stringify(transports) : null,
    Date.now(),
    userId,
    userName,
  );
}

export function userExists(userName: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM credentials WHERE user_name = ?');
  const row = stmt.get(userName) as Record<string, unknown>;
  return (row.count as number) > 0;
}

export function countAllUsers(): number {
  const db = getDatabase();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM credentials');
  const row = stmt.get() as Record<string, unknown>;
  return row.count as number;
}

export function listAllCredentials(): Pick<CredentialRecord, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>[] {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT id, user_id, user_name, created_at, updated_at FROM credentials ORDER BY created_at ASC',
  ).all() as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  }));
}
