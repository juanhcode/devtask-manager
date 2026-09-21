import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

import { createTestApp } from '../helpers/createTestApp.js';

const VALID_TASK = {
  title: 'Write integration tests',
  description: 'Cover all API endpoints with supertest',
  status: 'TODO',
  priority: 'HIGH',
  tags: ['testing', 'api'],
};

describe('POST /api/v1/tasks', () => {
  let app: ReturnType<typeof createTestApp>['app'];

  beforeEach(() => {
    ({ app } = createTestApp());
  });

  it('should return 201 and the created task with all fields', async () => {
    const res = await request(app).post('/api/v1/tasks').send(VALID_TASK);

    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(res.body.title).toBe(VALID_TASK.title);
    expect(res.body.status).toBe('TODO');
    expect(res.body.priority).toBe('HIGH');
    expect(res.body.tags).toEqual(['testing', 'api']);
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
  });

  it('should return 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ status: 'TODO', priority: 'HIGH' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should return 400 when title is empty string', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ ...VALID_TASK, title: '' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid status', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ ...VALID_TASK, status: 'INVALID' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid priority', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ ...VALID_TASK, priority: 'CRITICAL' });

    expect(res.status).toBe(400);
  });

  it('should default tags to empty array when not provided', async () => {
    const { title, status, priority } = VALID_TASK;
    const res = await request(app).post('/api/v1/tasks').send({ title, status, priority });

    expect(res.status).toBe(201);
    expect(res.body.tags).toEqual([]);
  });
});

describe('GET /api/v1/tasks', () => {
  let app: ReturnType<typeof createTestApp>['app'];

  beforeEach(() => {
    ({ app } = createTestApp());
  });

  it('should return 200 and empty array when no tasks exist', async () => {
    const res = await request(app).get('/api/v1/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return all tasks when no filter is applied', async () => {
    await request(app).post('/api/v1/tasks').send(VALID_TASK);
    await request(app).post('/api/v1/tasks').send({ ...VALID_TASK, title: 'Another task' });

    const res = await request(app).get('/api/v1/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('should filter tasks by status', async () => {
    await request(app).post('/api/v1/tasks').send({ ...VALID_TASK, status: 'TODO' });
    await request(app).post('/api/v1/tasks').send({ ...VALID_TASK, status: 'DONE' });

    const res = await request(app).get('/api/v1/tasks?status=TODO');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe('TODO');
  });

  it('should filter tasks by priority', async () => {
    await request(app).post('/api/v1/tasks').send({ ...VALID_TASK, priority: 'HIGH' });
    await request(app).post('/api/v1/tasks').send({ ...VALID_TASK, priority: 'LOW' });

    const res = await request(app).get('/api/v1/tasks?priority=HIGH');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].priority).toBe('HIGH');
  });

  it('should return 400 for invalid status filter', async () => {
    const res = await request(app).get('/api/v1/tasks?status=INVALID');

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/tasks/stats', () => {
  let app: ReturnType<typeof createTestApp>['app'];

  beforeEach(() => {
    ({ app } = createTestApp());
  });

  it('should return zeros when no tasks exist', async () => {
    const res = await request(app).get('/api/v1/tasks/stats');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 0, todo: 0, inProgress: 0, done: 0 });
  });

  it('should reflect current task state accurately', async () => {
    await request(app).post('/api/v1/tasks').send({ ...VALID_TASK, status: 'TODO' });
    await request(app).post('/api/v1/tasks').send({ ...VALID_TASK, status: 'IN_PROGRESS' });
    await request(app).post('/api/v1/tasks').send({ ...VALID_TASK, status: 'DONE' });

    const res = await request(app).get('/api/v1/tasks/stats');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.todo).toBe(1);
    expect(res.body.inProgress).toBe(1);
    expect(res.body.done).toBe(1);
  });
});

describe('GET /api/v1/tasks/:id', () => {
  let app: ReturnType<typeof createTestApp>['app'];

  beforeEach(() => {
    ({ app } = createTestApp());
  });

  it('should return 200 and the task for a valid id', async () => {
    const created = await request(app).post('/api/v1/tasks').send(VALID_TASK);
    const res = await request(app).get(`/api/v1/tasks/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it('should return 404 for a non-existent id', async () => {
    const res = await request(app).get('/api/v1/tasks/non-existent-id');

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

describe('PUT /api/v1/tasks/:id', () => {
  let app: ReturnType<typeof createTestApp>['app'];

  beforeEach(() => {
    ({ app } = createTestApp());
  });

  it('should return 200 and the updated task', async () => {
    const created = await request(app).post('/api/v1/tasks').send(VALID_TASK);
    const res = await request(app)
      .put(`/api/v1/tasks/${created.body.id}`)
      .send({ ...VALID_TASK, title: 'Updated title', status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated title');
    expect(res.body.status).toBe('IN_PROGRESS');
  });

  it('should not modify createdAt', async () => {
    const created = await request(app).post('/api/v1/tasks').send(VALID_TASK);
    const res = await request(app)
      .put(`/api/v1/tasks/${created.body.id}`)
      .send({ ...VALID_TASK, title: 'Updated' });

    expect(res.body.createdAt).toBe(created.body.createdAt);
  });

  it('should return 404 for non-existent task', async () => {
    const res = await request(app)
      .put('/api/v1/tasks/non-existent')
      .send(VALID_TASK);

    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid body', async () => {
    const created = await request(app).post('/api/v1/tasks').send(VALID_TASK);
    const res = await request(app)
      .put(`/api/v1/tasks/${created.body.id}`)
      .send({ title: '', status: 'INVALID' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/v1/tasks/:id', () => {
  let app: ReturnType<typeof createTestApp>['app'];

  beforeEach(() => {
    ({ app } = createTestApp());
  });

  it('should return 204 on successful deletion', async () => {
    const created = await request(app).post('/api/v1/tasks').send(VALID_TASK);
    const res = await request(app).delete(`/api/v1/tasks/${created.body.id}`);

    expect(res.status).toBe(204);
  });

  it('should make the task unretrievable after deletion', async () => {
    const created = await request(app).post('/api/v1/tasks').send(VALID_TASK);
    await request(app).delete(`/api/v1/tasks/${created.body.id}`);

    const res = await request(app).get(`/api/v1/tasks/${created.body.id}`);

    expect(res.status).toBe(404);
  });

  it('should return 404 for non-existent task', async () => {
    const res = await request(app).delete('/api/v1/tasks/non-existent');

    expect(res.status).toBe(404);
  });

  it('should return 404 on second delete of the same task', async () => {
    const created = await request(app).post('/api/v1/tasks').send(VALID_TASK);
    await request(app).delete(`/api/v1/tasks/${created.body.id}`);
    const res = await request(app).delete(`/api/v1/tasks/${created.body.id}`);

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/v1/tasks/:id/complete', () => {
  let app: ReturnType<typeof createTestApp>['app'];

  beforeEach(() => {
    ({ app } = createTestApp());
  });

  it('should return 200 and task with status DONE', async () => {
    const created = await request(app).post('/api/v1/tasks').send(VALID_TASK);
    const res = await request(app).patch(`/api/v1/tasks/${created.body.id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('DONE');
  });

  it('should return 404 for non-existent task', async () => {
    const res = await request(app).patch('/api/v1/tasks/non-existent/complete');

    expect(res.status).toBe(404);
  });
});
