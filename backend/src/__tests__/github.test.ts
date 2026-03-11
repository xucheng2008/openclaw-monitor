import request from 'supertest';
import { app } from '../index';
import * as githubService from '../services/github';

// Mock the github service
jest.mock('../services/github', () => ({
  getIssues: jest.fn(),
  getTaskIssues: jest.fn(),
  getRecentActivity: jest.fn(),
  syncData: jest.fn(),
}));

describe('GitHub API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/github/issues', () => {
    it('should return issues successfully with default repo', async () => {
      const mockIssues = [
        {
          id: 1,
          title: 'Test Issue',
          status: 'open',
          assignee: 'test-user',
          createdAt: new Date().toISOString(),
        },
      ];
      
      (githubService.getIssues as jest.Mock).mockResolvedValue(mockIssues);

      const response = await request(app).get('/api/github/issues');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockIssues);
      expect(githubService.getIssues).toHaveBeenCalledWith('xucheng2008/openclaw-monitor');
    });

    it('should return issues with custom repo', async () => {
      const mockIssues = [
        {
          id: 1,
          title: 'Test Issue',
          status: 'open',
          assignee: 'test-user',
          createdAt: new Date().toISOString(),
        },
      ];
      
      (githubService.getIssues as jest.Mock).mockResolvedValue(mockIssues);

      const response = await request(app).get('/api/github/issues?repo=test/repo');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockIssues);
      expect(githubService.getIssues).toHaveBeenCalledWith('test/repo');
    });

    it('should handle errors when getting issues fails', async () => {
      (githubService.getIssues as jest.Mock).mockRejectedValue(new Error('API error'));

      const response = await request(app).get('/api/github/issues');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取 Issues 失败' });
    });
  });

  describe('GET /api/github/tasks', () => {
    it('should return task issues successfully with default repo', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task Issue',
          status: 'open',
          assignee: 'test-user',
          createdAt: new Date().toISOString(),
        },
      ];
      
      (githubService.getTaskIssues as jest.Mock).mockResolvedValue(mockTasks);

      const response = await request(app).get('/api/github/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(githubService.getTaskIssues).toHaveBeenCalledWith('xucheng2008/openclaw-monitor');
    });

    it('should return task issues with custom repo', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task Issue',
          status: 'open',
          assignee: 'test-user',
          createdAt: new Date().toISOString(),
        },
      ];
      
      (githubService.getTaskIssues as jest.Mock).mockResolvedValue(mockTasks);

      const response = await request(app).get('/api/github/tasks?repo=test/repo');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(githubService.getTaskIssues).toHaveBeenCalledWith('test/repo');
    });

    it('should handle errors when getting task issues fails', async () => {
      (githubService.getTaskIssues as jest.Mock).mockRejectedValue(new Error('API error'));

      const response = await request(app).get('/api/github/tasks');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取任务失败' });
    });
  });

  describe('GET /api/github/activity', () => {
    it('should return recent activity successfully with default repo', async () => {
      const mockActivities = [
        {
          id: 1,
          type: 'issue_comment',
          user: 'test-user',
          createdAt: new Date().toISOString(),
          content: 'Test comment',
        },
      ];
      
      (githubService.getRecentActivity as jest.Mock).mockResolvedValue(mockActivities);

      const response = await request(app).get('/api/github/activity');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockActivities);
      expect(githubService.getRecentActivity).toHaveBeenCalledWith('xucheng2008/openclaw-monitor');
    });

    it('should return recent activity with custom repo', async () => {
      const mockActivities = [
        {
          id: 1,
          type: 'issue_comment',
          user: 'test-user',
          createdAt: new Date().toISOString(),
          content: 'Test comment',
        },
      ];
      
      (githubService.getRecentActivity as jest.Mock).mockResolvedValue(mockActivities);

      const response = await request(app).get('/api/github/activity?repo=test/repo');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockActivities);
      expect(githubService.getRecentActivity).toHaveBeenCalledWith('test/repo');
    });

    it('should handle errors when getting recent activity fails', async () => {
      (githubService.getRecentActivity as jest.Mock).mockRejectedValue(new Error('API error'));

      const response = await request(app).get('/api/github/activity');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取活动失败' });
    });
  });

  describe('POST /api/github/sync', () => {
    it('should sync data successfully with default repo', async () => {
      const mockSyncData = {
        issues: 10,
        tasks: 5,
        activities: 20,
      };
      
      (githubService.syncData as jest.Mock).mockResolvedValue(mockSyncData);

      const response = await request(app)
        .post('/api/github/sync')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockSyncData });
      expect(githubService.syncData).toHaveBeenCalledWith('xucheng2008/openclaw-monitor');
    });

    it('should sync data with custom repo', async () => {
      const mockSyncData = {
        issues: 10,
        tasks: 5,
        activities: 20,
      };
      
      (githubService.syncData as jest.Mock).mockResolvedValue(mockSyncData);

      const response = await request(app)
        .post('/api/github/sync')
        .send({ repo: 'test/repo' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockSyncData });
      expect(githubService.syncData).toHaveBeenCalledWith('test/repo');
    });

    it('should handle errors when syncing data fails', async () => {
      (githubService.syncData as jest.Mock).mockRejectedValue(new Error('Sync error'));

      const response = await request(app)
        .post('/api/github/sync')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '同步数据失败' });
    });
  });
});