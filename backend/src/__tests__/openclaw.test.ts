import request from 'supertest';
import { app } from '../index';
import * as openclawService from '../services/openclaw';

// Mock the openclaw service
jest.mock('../services/openclaw', () => ({
  getAgents: jest.fn(),
  getTasks: jest.fn(),
  getStats: jest.fn(),
}));

describe('OpenClaw API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/agents', () => {
    it('should return agents successfully', async () => {
      const mockAgents = [
        {
          id: 'agent1',
          name: 'Test Agent',
          status: 'active',
          lastSeen: new Date().toISOString(),
          tasks: [],
        },
      ];
      
      (openclawService.getAgents as jest.Mock).mockResolvedValue(mockAgents);

      const response = await request(app).get('/api/agents');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAgents);
      expect(openclawService.getAgents).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when getting agents fails', async () => {
      (openclawService.getAgents as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/agents');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取 Agent 状态失败' });
    });
  });

  describe('GET /api/agents/:id', () => {
    it('should return specific agent when found', async () => {
      const mockAgents = [
        {
          id: 'agent1',
          name: 'Test Agent',
          status: 'active',
          lastSeen: new Date().toISOString(),
          tasks: [],
        },
      ];
      
      (openclawService.getAgents as jest.Mock).mockResolvedValue(mockAgents);

      const response = await request(app).get('/api/agents/agent1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAgents[0]);
    });

    it('should return 404 when agent not found', async () => {
      const mockAgents = [
        {
          id: 'agent2',
          name: 'Test Agent 2',
          status: 'active',
          lastSeen: new Date().toISOString(),
          tasks: [],
        },
      ];
      
      (openclawService.getAgents as jest.Mock).mockResolvedValue(mockAgents);

      const response = await request(app).get('/api/agents/agent1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Agent not found' });
    });

    it('should handle errors when getting agents fails', async () => {
      (openclawService.getAgents as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/agents/agent1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取 Agent 状态失败' });
    });
  });

  describe('GET /api/tasks', () => {
    it('should return tasks successfully with default repo', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task',
          status: 'open',
          assignee: 'test-user',
          createdAt: new Date().toISOString(),
        },
      ];
      
      (openclawService.getTasks as jest.Mock).mockResolvedValue(mockTasks);

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(openclawService.getTasks).toHaveBeenCalledWith('xucheng2008/openclaw-monitor');
    });

    it('should return tasks with custom repo', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task',
          status: 'open',
          assignee: 'test-user',
          createdAt: new Date().toISOString(),
        },
      ];
      
      (openclawService.getTasks as jest.Mock).mockResolvedValue(mockTasks);

      const response = await request(app).get('/api/tasks?repo=test/repo');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(openclawService.getTasks).toHaveBeenCalledWith('test/repo');
    });

    it('should handle errors when getting tasks fails', async () => {
      (openclawService.getTasks as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取任务列表失败' });
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return specific task when found', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task',
          status: 'open',
          assignee: 'test-user',
          createdAt: new Date().toISOString(),
        },
      ];
      
      (openclawService.getTasks as jest.Mock).mockResolvedValue(mockTasks);

      const response = await request(app).get('/api/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks[0]);
    });

    it('should return 404 when task not found', async () => {
      const mockTasks = [
        {
          id: 2,
          title: 'Test Task 2',
          status: 'open',
          assignee: 'test-user',
          createdAt: new Date().toISOString(),
        },
      ];
      
      (openclawService.getTasks as jest.Mock).mockResolvedValue(mockTasks);

      const response = await request(app).get('/api/tasks/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Task not found' });
    });

    it('should handle errors when getting tasks fails', async () => {
      (openclawService.getTasks as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/tasks/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取任务失败' });
    });
  });

  describe('GET /api/stats', () => {
    it('should return stats successfully', async () => {
      const mockStats = {
        totalAgents: 5,
        activeAgents: 3,
        totalTasks: 10,
        completedTasks: 7,
      };
      
      (openclawService.getStats as jest.Mock).mockResolvedValue(mockStats);

      const response = await request(app).get('/api/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
    });

    it('should handle errors when getting stats fails', async () => {
      (openclawService.getStats as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/stats');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取统计数据失败' });
    });
  });

  describe('GET /health', () => {
    it('should return health check status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});