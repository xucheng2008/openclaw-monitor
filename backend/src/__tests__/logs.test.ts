import request from 'supertest';
import { app } from '../index';
import * as logsService from '../services/logs';

// Mock the logs service
jest.mock('../services/logs', () => ({
  getLogs: jest.fn(),
  fetchAgentLogs: jest.fn(),
  fetchSystemLogs: jest.fn(),
  addLog: jest.fn(),
}));

describe('Logs API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/logs', () => {
    it('should return logs with default parameters', async () => {
      const mockLogs = [
        {
          id: 'log1',
          timestamp: new Date().toISOString(),
          level: 'info',
          agent: 'agent1',
          message: 'Test log message',
          source: 'test',
        },
      ];
      
      (logsService.getLogs as jest.Mock).mockReturnValue(mockLogs);

      const response = await request(app).get('/api/logs');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLogs);
      expect(logsService.getLogs).toHaveBeenCalledWith({
        level: undefined,
        agent: undefined,
        limit: 100,
        before: undefined,
      });
    });

    it('should return logs with custom parameters', async () => {
      const mockLogs = [
        {
          id: 'log1',
          timestamp: new Date().toISOString(),
          level: 'error',
          agent: 'agent1',
          message: 'Test error log',
          source: 'test',
        },
      ];
      
      (logsService.getLogs as jest.Mock).mockReturnValue(mockLogs);

      const response = await request(app)
        .get('/api/logs?level=error&agent=agent1&limit=50&before=2023-01-01T00:00:00Z');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLogs);
      expect(logsService.getLogs).toHaveBeenCalledWith({
        level: 'error',
        agent: 'agent1',
        limit: 50,
        before: '2023-01-01T00:00:00Z',
      });
    });

    it('should handle errors when getting logs fails', async () => {
      (logsService.getLogs as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/api/logs');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取日志失败' });
    });
  });

  describe('GET /api/logs/agent', () => {
    it('should return agent logs with default limit', async () => {
      const mockLogs = [
        {
          id: 'log1',
          timestamp: new Date().toISOString(),
          level: 'info',
          agent: 'agent1',
          message: 'Test agent log',
          source: 'agent',
        },
      ];
      
      (logsService.fetchAgentLogs as jest.Mock).mockResolvedValue(mockLogs);

      const response = await request(app).get('/api/logs/agent?agent=agent1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLogs);
      expect(logsService.fetchAgentLogs).toHaveBeenCalledWith('agent1', 50);
    });

    it('should return agent logs with custom limit', async () => {
      const mockLogs = [
        {
          id: 'log1',
          timestamp: new Date().toISOString(),
          level: 'info',
          agent: 'agent1',
          message: 'Test agent log',
          source: 'agent',
        },
      ];
      
      (logsService.fetchAgentLogs as jest.Mock).mockResolvedValue(mockLogs);

      const response = await request(app).get('/api/logs/agent?agent=agent1&limit=100');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLogs);
      expect(logsService.fetchAgentLogs).toHaveBeenCalledWith('agent1', 100);
    });

    it('should handle errors when fetching agent logs fails', async () => {
      (logsService.fetchAgentLogs as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/logs/agent?agent=agent1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取 Agent 日志失败' });
    });
  });

  describe('GET /api/logs/system', () => {
    it('should return system logs with default limit', async () => {
      const mockLogs = [
        {
          id: 'log1',
          timestamp: new Date().toISOString(),
          level: 'info',
          agent: null,
          message: 'Test system log',
          source: 'system',
        },
      ];
      
      (logsService.fetchSystemLogs as jest.Mock).mockResolvedValue(mockLogs);

      const response = await request(app).get('/api/logs/system');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLogs);
      expect(logsService.fetchSystemLogs).toHaveBeenCalledWith(50);
    });

    it('should return system logs with custom limit', async () => {
      const mockLogs = [
        {
          id: 'log1',
          timestamp: new Date().toISOString(),
          level: 'info',
          agent: null,
          message: 'Test system log',
          source: 'system',
        },
      ];
      
      (logsService.fetchSystemLogs as jest.Mock).mockResolvedValue(mockLogs);

      const response = await request(app).get('/api/logs/system?limit=100');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLogs);
      expect(logsService.fetchSystemLogs).toHaveBeenCalledWith(100);
    });

    it('should handle errors when fetching system logs fails', async () => {
      (logsService.fetchSystemLogs as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/logs/system');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取系统日志失败' });
    });
  });

  describe('POST /api/logs', () => {
    it('should add a new log successfully', async () => {
      const newLog = {
        id: 'log1',
        timestamp: new Date().toISOString(),
        level: 'info',
        agent: 'agent1',
        message: 'New test log',
        source: 'test',
      };
      
      (logsService.addLog as jest.Mock).mockReturnValue(newLog);

      const response = await request(app)
        .post('/api/logs')
        .send({
          level: 'info',
          agent: 'agent1',
          message: 'New test log',
          source: 'test',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(newLog);
      expect(logsService.addLog).toHaveBeenCalledWith({
        level: 'info',
        agent: 'agent1',
        message: 'New test log',
        source: 'test',
      });
    });

    it('should handle errors when adding log fails', async () => {
      (logsService.addLog as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/logs')
        .send({
          level: 'info',
          agent: 'agent1',
          message: 'New test log',
          source: 'test',
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '添加日志失败' });
    });
  });
});