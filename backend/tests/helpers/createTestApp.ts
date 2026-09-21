import Database from 'better-sqlite3';

import { createDatabase } from '../../src/db/database.js';
import { createTaskRepository } from '../../src/repositories/taskRepository.js';
import { createTaskService } from '../../src/services/taskService.js';
import { createApp } from '../../src/app.js';

/**
 * Creates a fully-wired application stack backed by an in-memory SQLite database.
 * Each call returns a fresh, isolated instance — no test pollution.
 */
export function createTestApp(): {
  app: ReturnType<typeof createApp>;
  db: Database.Database;
  service: ReturnType<typeof createTaskService>;
  repository: ReturnType<typeof createTaskRepository>;
} {
  const db = createDatabase(':memory:');
  const repository = createTaskRepository(db);
  const service = createTaskService(repository);
  const app = createApp(service);

  return { app, db, service, repository };
}
