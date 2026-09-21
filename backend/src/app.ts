import express from 'express';

import type { TaskService } from './services/taskService.js';
import { createTaskRouter } from './routes/taskRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

/**
 * Creates and configures the Express application.
 * Accepts the service as a parameter so tests can inject an in-memory version.
 * Does NOT call app.listen() — that is the responsibility of server.ts.
 */
export function createApp(service: TaskService): express.Application {
  const app = express();

  // Parse JSON bodies
  app.use(express.json());

  // Health check — useful for Docker and load balancers
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // API routes
  app.use('/api/v1/tasks', createTaskRouter(service));

  // 404 for unmatched routes
  app.use(notFoundHandler);

  // Global error handler — must be last
  app.use(errorHandler);

  return app;
}
