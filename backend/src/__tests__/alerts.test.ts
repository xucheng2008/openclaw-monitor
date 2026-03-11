import request from 'supertest';
import { app } from '../index';
import * as alertsService from '../services/alerts';

// Mock the alerts service
jest.mock('../services/alerts', () => ({
  getAlerts: jest.fn(),
  acknowledgeAlert: jest.fn(),
  getAlertStats: jest.fn(),
  getRules: jest.fn(),
  addRule: jest.fn(),
  updateRule: jest.fn(),
  deleteRule: jest.fn(),
  checkRules: jest.fn(),
}));

describe('Alerts API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/alerts', () => {
    it('should return alerts successfully with default parameters', async () => {
      const mockAlerts = [
        {
          id: 'alert1',
          type: 'agent_offline' as const,
          level: 'error' as const,
          title: 'Agent Down',
          message: 'Agent is down',
          timestamp: new Date().toISOString(),
          acknowledged: false,
        },
      ];
      
      (alertsService.getAlerts as jest.Mock).mockReturnValue(mockAlerts);

      const response = await request(app).get('/api/alerts');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAlerts);
      expect(alertsService.getAlerts).toHaveBeenCalledWith({
        level: undefined,
        type: undefined,
        acknowledged: false, // Default to false
        limit: 50,
      });
    });

    it('should return alerts with custom parameters', async () => {
      const mockAlerts = [
        {
          id: 'alert1',
          type: 'token_limit' as const,
          level: 'warning' as const,
          title: 'High CPU Usage',
          message: 'High CPU usage',
          timestamp: new Date().toISOString(),
          acknowledged: true,
        },
      ];
      
      (alertsService.getAlerts as jest.Mock).mockReturnValue(mockAlerts);

      const response = await request(app).get('/api/alerts?level=warning&type=token_limit&acknowledged=true&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAlerts);
      expect(alertsService.getAlerts).toHaveBeenCalledWith({
        level: 'warning',
        type: 'token_limit',
        acknowledged: true,
        limit: 10,
      });
    });

    it('should handle errors when getting alerts fails', async () => {
      (alertsService.getAlerts as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/api/alerts');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取告警失败' });
    });
  });

  describe('GET /api/alerts/stats', () => {
    it('should return alert stats successfully', async () => {
      const mockStats = {
        total: 10,
        unacknowledged: 7,
        byLevel: {
          error: 5,
          warning: 3,
          info: 2,
        },
        byType: {
          agent_offline: 3,
          high_cpu: 2,
          memory_warning: 5,
        },
      };
      
      (alertsService.getAlertStats as jest.Mock).mockReturnValue(mockStats);

      const response = await request(app).get('/api/alerts/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
    });

    it('should handle errors when getting alert stats fails', async () => {
      (alertsService.getAlertStats as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/api/alerts/stats');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取告警统计失败' });
    });
  });

  describe('POST /api/alerts/:id/acknowledge', () => {
    it('should acknowledge alert successfully', async () => {
      (alertsService.acknowledgeAlert as jest.Mock).mockReturnValue(true);

      const response = await request(app).post('/api/alerts/alert1/acknowledge');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(alertsService.acknowledgeAlert).toHaveBeenCalledWith('alert1');
    });

    it('should handle errors when acknowledging alert fails', async () => {
      (alertsService.acknowledgeAlert as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).post('/api/alerts/alert1/acknowledge');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '确认告警失败' });
    });
  });

  describe('GET /api/alerts/rules', () => {
    it('should return alert rules successfully', async () => {
      const mockRules = [
        {
          id: 'rule1',
          name: 'Agent Down Alert',
          type: 'agent_offline' as const,
          enabled: true,
          threshold: 5,
          condition: 'gt' as const,
          channels: ['email', 'slack'],
          cooldownMinutes: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      (alertsService.getRules as jest.Mock).mockReturnValue(mockRules);

      const response = await request(app).get('/api/alerts/rules');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRules);
    });

    it('should handle errors when getting alert rules fails', async () => {
      (alertsService.getRules as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/api/alerts/rules');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '获取告警规则失败' });
    });
  });

  describe('POST /api/alerts/rules', () => {
    it('should create alert rule successfully', async () => {
      const newRule = {
        id: 'rule2',
        name: 'High CPU Alert',
        type: 'token_limit' as const,
        enabled: true,
        threshold: 80,
        condition: 'gt' as const,
        channels: ['email'],
        cooldownMinutes: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      (alertsService.addRule as jest.Mock).mockReturnValue(newRule);

      const ruleData = {
        name: 'High CPU Alert',
        type: 'token_limit',
        enabled: true,
        threshold: 80,
        condition: 'gt',
        channels: ['email'],
        cooldownMinutes: 5,
      };

      const response = await request(app).post('/api/alerts/rules').send(ruleData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(newRule);
      expect(alertsService.addRule).toHaveBeenCalledWith(ruleData);
    });

    it('should handle errors when creating alert rule fails', async () => {
      (alertsService.addRule as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const ruleData = {
        name: 'High CPU Alert',
        type: 'token_limit',
        enabled: true,
        threshold: 80,
        condition: 'gt',
        channels: ['email'],
        cooldownMinutes: 5,
      };

      const response = await request(app).post('/api/alerts/rules').send(ruleData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '添加告警规则失败' });
    });
  });

  describe('PUT /api/alerts/rules/:id', () => {
    it('should update alert rule successfully', async () => {
      (alertsService.updateRule as jest.Mock).mockReturnValue(true);

      const updateData = {
        name: 'Updated High CPU Alert',
        enabled: false,
        threshold: 90,
      };

      const response = await request(app).put('/api/alerts/rules/rule1').send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(alertsService.updateRule).toHaveBeenCalledWith('rule1', updateData);
    });

    it('should handle errors when updating alert rule fails', async () => {
      (alertsService.updateRule as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const updateData = {
        name: 'Updated High CPU Alert',
        enabled: false,
        threshold: 90,
      };

      const response = await request(app).put('/api/alerts/rules/rule1').send(updateData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '更新告警规则失败' });
    });
  });

  describe('DELETE /api/alerts/rules/:id', () => {
    it('should delete alert rule successfully', async () => {
      (alertsService.deleteRule as jest.Mock).mockReturnValue(true);

      const response = await request(app).delete('/api/alerts/rules/rule1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(alertsService.deleteRule).toHaveBeenCalledWith('rule1');
    });

    it('should handle errors when deleting alert rule fails', async () => {
      (alertsService.deleteRule as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).delete('/api/alerts/rules/rule1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: '删除告警规则失败' });
    });
  });
});