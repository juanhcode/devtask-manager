import { Router } from 'express';

import type { TaskService } from '../services/taskService.js';
import { createTaskController } from '../controllers/taskController.js';

/**
 * Creates and returns the task router bound to the given service.
 * Route order matters: /stats must come before /:id to prevent
 * Express matching "stats" as a task ID.
 */
export function createTaskRouter(service: TaskService): Router {
  const router = Router();
  const controller = createTaskController(service);

  // Stats route MUST be before /:id
  router.get('/stats', controller.getStats);

  router.get('/', controller.listTasks);
  router.post('/', controller.createTask);
  router.get('/:id', controller.getTaskById);
  router.put('/:id', controller.updateTask);
  router.delete('/:id', controller.deleteTask);
  router.patch('/:id/complete', controller.completeTask);

  return router;
}
