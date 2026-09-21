import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

// ── Schema ────────────────────────────────────────────────────────────────────

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'DONE')),
    priority    TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
    tags        TEXT NOT NULL DEFAULT '[]',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_status   ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
`;

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates and initializes a SQLite database instance.
 * Pass ':memory:' for in-memory databases (used in tests).
 */
export function createDatabase(dbPath: string): Database.Database {
  // Ensure the directory exists for file-based databases
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Initialize schema
  db.exec(SCHEMA_SQL);

  return db;
}

// ── Production singleton ──────────────────────────────────────────────────────

const DB_PATH = process.env['DATABASE_PATH'] ?? './data/devtask.sqlite';

let _db: Database.Database | null = null;

/**
 * Returns the production database singleton.
 * Initializes on first call.
 */
export function getDatabase(): Database.Database {
  if (!_db) {
    _db = createDatabase(DB_PATH);
  }
  return _db;
}
