import request from 'supertest';
import { app } from '../index';
import * as tokenStatsService from '../services/token-stats';

// Mock the token stats service
jest.mock('../services/token-stats', () => ({
  getTokenStats: jest.fn(),
  recordTokenUsage: jest.fn(),
  syncTokenUsage: jest.fn(),
  exportTokenReport: jest.fn(),
}));

describe('Token Stats API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/token/stats', () => {
    it('should return token stats successfully with default parameters', async () => {
      const mockStats = {
        totalTokens: 1000,
        inputTokens: 600,
        outputTokens: 400,
        agents: ['agent1', 'agent2'],
        models: ['gpt-4', 'claude-3'],
        hourlyUsage: [],
      };
      
      (tokenStatsService.getTokenStats as jest.Mock).mockReturnValue(mockStats);

      const response = await request(app).get('/api/token/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
      expect(tokenStatsService.getTokenStats).toHaveBeenCalledWith({
        agent: undefined,
        model: undefined,
        hours: undefined,
      });
    });

    it('should return token stats with custom parameters', async () => {
      const mockStats = {
        totalTokens: 500,
        inputTokens: 300,
        outputTokens: 200,
        agents: ['agent1'],
        models: ['gpt-4'],
        hourlyUsage: [],
      };
      
      (tokenStatsService.getTokenStats as jest.Mock).mockReturnValue(mockStats);

      const response = await request(app)
        .get('/api/token/stats')
        .query({ agent: 'agent1', model: 'gpt-4', hours: '24' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
      expect(tokenStatsService.getTokenStats).toHaveBeenCalledWith({
        agent: 'agent1',
        model: 'gpt-4',
        hours: 24,
      });
    });

    it('should handle errors when getting token stats fails', async () => {
      (tokenStatsService.getTokenStats as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/api/token/stats');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取 Token 统计失败' });
    });
  });

  describe('POST /api/token/record', () => {
    it('should record token usage successfully', async () => {
      const mockRecord = {
        id: 'record1',
        agent: 'agent1',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        timestamp: new Date().toISOString(),
      };
      
      (tokenStatsService.recordTokenUsage as jest.Mock).mockReturnValue(mockRecord);

      const response = await request(app)
        .post('/api/token/record')
        .send({
          agent: 'agent1',
          model: 'gpt-4',
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecord);
      expect(tokenStatsService.recordTokenUsage).toHaveBeenCalledWith({
        agent: 'agent1',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      });
    });

    it('should handle errors when recording token usage fails', async () => {
      (tokenStatsService.recordTokenUsage as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/token/record')
        .send({
          agent: 'agent1',
          model: 'gpt-4',
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '记录 Token 使用失败' });
    });
  });

  describe('POST /api/token/sync', () => {
    it('should sync token usage successfully', async () => {
      const mockUsage = [
        { id: 'record1', agent: 'agent1', model: 'gpt-4', totalTokens: 150 },
        { id: 'record2', agent: 'agent2', model: 'claude-3', totalTokens: 200 },
      ];
      
      (tokenStatsService.syncTokenUsage as jest.Mock).mockResolvedValue(mockUsage);

      const response = await request(app).post('/api/token/sync');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, count: 2 });
      expect(tokenStatsService.syncTokenUsage).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when syncing token usage fails', async () => {
      (tokenStatsService.syncTokenUsage as jest.Mock).mockRejectedValue(new Error('Sync failed'));

      const response = await request(app).post('/api/token/sync');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '同步 Token 数据失败' });
    });
  });

  describe('GET /api/token/export', () => {
    it('should export token report as JSON by default', async () => {
      const mockReport = { data: 'json report' };
      
      (tokenStatsService.exportTokenReport as jest.Mock).mockReturnValue(JSON.stringify(mockReport));

      const response = await request(app).get('/api/token/export');

      expect(response.status).toBe(200);
      expect(response.type).toContain('application/json');
      expect(response.text).toEqual(JSON.stringify(mockReport));
      expect(tokenStatsService.exportTokenReport).toHaveBeenCalledWith('json');
    });

    it('should export token report as CSV when specified', async () => {
      const mockReport = 'csv,data\n1,2';
      
      (tokenStatsService.exportTokenReport as jest.Mock).mockReturnValue(mockReport);

      const response = await request(app).get('/api/token/export?format=csv');

      expect(response.status).toBe(200);
      expect(response.type).toContain('text/csv');
      expect(response.text).toEqual(mockReport);
      expect(tokenStatsService.exportTokenReport).toHaveBeenCalledWith('csv');
    });

    it('should handle errors when exporting report fails', async () => {
      (tokenStatsService.exportTokenReport as jest.Mock).mockImplementation(() => {
        throw new Error('Export failed');
      });

      const response = await request(app).get('/api/token/export');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '导出报告失败' });
    });
  });
});

describe('Token Stats Service Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get token stats with proper filtering', () => {
    const mockData = [
      { agent: 'agent1', model: 'gpt-4', totalTokens: 100, timestamp: new Date(Date.now() - 1000 * 60 * 60) },
      { agent: 'agent2', model: 'claude-3', totalTokens: 200, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    ];
    
    // Mock the internal data store
    const originalGetTokenRecords = (tokenStatsService as any).getTokenRecords;
    (tokenStatsService as any).getTokenRecords = jest.fn().mockReturnValue(mockData);

    const result = tokenStatsService.getTokenStats({ agent: 'agent1' });

    expect(result.totalTokens).toBe(100);
    expect(result.agents).toContain('agent1');
    expect(result.models).toContain('gpt-4');

    // Restore original function
    (tokenStatsService as any).getTokenRecords = originalGetTokenRecords;
  });

  it('should record token usage with proper validation', () => {
    const record = tokenStatsService.recordTokenUsage({
      agent: 'test-agent',
      model: 'test-model',
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    });

    expect(record).toHaveProperty('id');
    expect(record.agent).toBe('test-agent');
    expect(record.model).toBe('test-model');
    expect(record.inputTokens).toBe(100);
    expect(record.outputTokens).toBe(50);
    expect(record.totalTokens).toBe(150);
    expect(record).toHaveProperty('timestamp');
  });
});