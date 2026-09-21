import { getDatabase } from './db/database.js';
import { createTaskRepository } from './repositories/taskRepository.js';
import { createTaskService } from './services/taskService.js';
import { createApp } from './app.js';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

// Wire up the dependency chain: DB → Repository → Service → App
const db = getDatabase();
const repository = createTaskRepository(db);
const service = createTaskService(repository);
const app = createApp(service);

app.listen(PORT, () => {
  console.warn(`DevTask API running on http://localhost:${PORT}`);
  console.warn(`Health: http://localhost:${PORT}/health`);
  console.warn(`Tasks:  http://localhost:${PORT}/api/v1/tasks`);
});
