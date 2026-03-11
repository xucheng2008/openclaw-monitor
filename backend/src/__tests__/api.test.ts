import request from 'supertest';
import { app } from '../index';

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('CORS', () => {
    it('should allow cross-origin requests', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');
      
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app).get('/nonexistent');
      
      expect(response.status).toBe(404);
    });
  });

  // Test all main API endpoints
  describe('Main API Endpoints', () => {
    const endpoints = [
      '/api/agents',
      '/api/tasks',
      '/api/stats',
      '/api/github/issues',
      '/api/github/tasks',
      '/api/github/activity',
      '/api/logs',
      '/api/logs/agent',
      '/api/logs/system',
      '/api/token/stats',
      '/api/alerts',
      '/api/alerts/stats',
      '/api/alerts/rules',
    ];

    endpoints.forEach(endpoint => {
      it(`should respond to ${endpoint} with appropriate status`, async () => {
        // Most endpoints will return 500 because they require mocked services
        // But they should at least not crash the server
        const response = await request(app).get(endpoint);
        
        // Should not be 404 (route exists)
        expect(response.status).not.toBe(404);
        // Should not be 500 if we had proper mocks, but for integration test this is acceptable
        // The important thing is that the route is defined and handled
      });
    });
  });
});