import request from 'supertest';
import { app } from '../index';

describe('Tasks API Routes', () => {
  it('GET /api/tasks should return 200', async () => {
    const response = await request(app).get('/api/tasks');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /api/tasks/:id should return 200 or 404', async () => {
    const response = await request(app).get('/api/tasks/1');
    expect([200, 404]).toContain(response.status);
  });
});