import request from 'supertest';
import { app } from '../index';

describe('Agents API Routes', () => {
  describe('GET /api/agents', () => {
    it('should return agents list with 200 status', async () => {
      const response = await request(app).get('/api/agents');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/agents/:id', () => {
    it('should handle agent lookup without errors', async () => {
      const response = await request(app).get('/api/agents/test-id');
      // Should either return 200 with data or 404 if not found, but not 500
      expect(response.status).toBeLessThan(500);
    });
  });
});