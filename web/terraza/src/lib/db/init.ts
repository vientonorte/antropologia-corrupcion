import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { cleanupExpiredChallenges } from './challenges';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'terraza.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Initialize schema
    initializeSchema();

    // Clean up expired challenges on each cold start
    cleanupExpiredChallenges();
  }

  return db;
}

function initializeSchema(): void {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Split and execute statements
  const statements = schema
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0);

  if (db === null) {
    throw new Error('Database not initialized');
  }

  for (const statement of statements) {
    db.exec(statement);
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
