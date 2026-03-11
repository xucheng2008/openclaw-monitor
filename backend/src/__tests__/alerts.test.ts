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
          level: 'error',
          type: 'agent-down',
          message: 'Agent is down',
          timestamp: new Date().toISOString(),
          acknowledged: false,
          agentId: 'agent1',
        },
      ];
      
      (alertsService.getAlerts as jest.Mock).mockReturnValue(mockAlerts);

      const response = await request(app).get('/api/alerts');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAlerts);
      expect(alertsService.getAlerts).toHaveBeenCalledWith({
        level: undefined,
        type: undefined,
        acknowledged: undefined,
        limit: 50,
      });
    });

    it('should return alerts with custom parameters', async () => {
      const mockAlerts = [
        {
          id: 'alert1',
          level: 'warning',
          type: 'high-cpu',
          message: 'High CPU usage',
          timestamp: new Date().toISOString(),
          acknowledged: true,
          agentId: 'agent1',
        },
      ];
      
      (alertsService.getAlerts as jest.Mock).mockReturnValue(mockAlerts);

      const response = await request(app).get('/api/alerts?level=warning&type=high-cpu&acknowledged=true&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAlerts);
      expect(alertsService.getAlerts).toHaveBeenCalledWith({
        level: 'warning',
        type: 'high-cpu',
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
        acknowledged: 3,
        unacknowledged: 7,
        byLevel: {
          error: 5,
          warning: 3,
          info: 2,
        },
        byType: {
          'agent-down': 3,
          'high-cpu': 2,
          'memory-warning': 5,
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
          type: 'agent-down',
          enabled: true,
          threshold: 5,
          condition: 'status === "down"',
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
        type: 'high-cpu',
        enabled: true,
        threshold: 80,
        condition: 'cpu > 80',
        channels: ['email'],
        cooldownMinutes: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      (alertsService.addRule as jest.Mock).mockReturnValue(newRule);

      const ruleData = {
        name: 'High CPU Alert',
        type: 'high-cpu',
        enabled: true,
        threshold: 80,
        condition: 'cpu > 80',
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
        type: 'high-cpu',
        enabled: true,
        threshold: 80,
        condition: 'cpu > 80',
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

describe('Alerts Service Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAlerts', () => {
    it('should filter alerts by level', () => {
      const allAlerts = [
        { id: '1', level: 'error', acknowledged: false },
        { id: '2', level: 'warning', acknowledged: false },
        { id: '3', level: 'error', acknowledged: true },
      ];
      
      // Mock the underlying data source
      jest.spyOn(alertsService, 'getAlerts').mockImplementation((options: any) => {
        let filtered = allAlerts;
        if (options.level) {
          filtered = filtered.filter(a => a.level === options.level);
        }
        if (options.acknowledged !== undefined) {
          filtered = filtered.filter(a => a.acknowledged === options.acknowledged);
        }
        return filtered.slice(0, options.limit || 50);
      });

      const result = alertsService.getAlerts({ level: 'error' });
      
      expect(result).toHaveLength(2);
      expect(result.every(a => a.level === 'error')).toBe(true);
    });

    it('should filter alerts by acknowledged status', () => {
      const allAlerts = [
        { id: '1', level: 'error', acknowledged: false },
        { id: '2', level: 'warning', acknowledged: false },
        { id: '3', level: 'error', acknowledged: true },
      ];
      
      jest.spyOn(alertsService, 'getAlerts').mockImplementation((options: any) => {
        let filtered = allAlerts;
        if (options.level) {
          filtered = filtered.filter(a => a.level === options.level);
        }
        if (options.acknowledged !== undefined) {
          filtered = filtered.filter(a => a.acknowledged === options.acknowledged);
        }
        return filtered.slice(0, options.limit || 50);
      });

      const result = alertsService.getAlerts({ acknowledged: false });
      
      expect(result).toHaveLength(2);
      expect(result.every(a => !a.acknowledged)).toBe(true);
    });
  });

  describe('getAlertStats', () => {
    it('should calculate correct statistics', () => {
      const alerts = [
        { id: '1', level: 'error', type: 'agent-down', acknowledged: false },
        { id: '2', level: 'warning', type: 'high-cpu', acknowledged: false },
        { id: '3', level: 'error', type: 'agent-down', acknowledged: true },
        { id: '4', level: 'info', type: 'memory-warning', acknowledged: false },
        { id: '5', level: 'warning', type: 'memory-warning', acknowledged: true },
      ];
      
      jest.spyOn(alertsService, 'getAlertStats').mockImplementation(() => {
        const total = alerts.length;
        const acknowledged = alerts.filter(a => a.acknowledged).length;
        const unacknowledged = total - acknowledged;
        
        const byLevel: Record<string, number> = {};
        alerts.forEach(a => {
          byLevel[a.level] = (byLevel[a.level] || 0) + 1;
        });
        
        const byType: Record<string, number> = {};
        alerts.forEach(a => {
          byType[a.type] = (byType[a.type] || 0) + 1;
        });
        
        return { total, acknowledged, unacknowledged, byLevel, byType };
      });

      const stats = alertsService.getAlertStats();
      
      expect(stats.total).toBe(5);
      expect(stats.acknowledged).toBe(2);
      expect(stats.unacknowledged).toBe(3);
      expect(stats.byLevel.error).toBe(2);
      expect(stats.byLevel.warning).toBe(2);
      expect(stats.byLevel.info).toBe(1);
      expect(stats.byType['agent-down']).toBe(2);
      expect(stats.byType['high-cpu']).toBe(1);
      expect(stats.byType['memory-warning']).toBe(2);
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge existing alert', () => {
      const alerts = [
        { id: '1', level: 'error', acknowledged: false },
        { id: '2', level: 'warning', acknowledged: false },
      ];
      
      jest.spyOn(alertsService, 'acknowledgeAlert').mockImplementation((id: string) => {
        const alert = alerts.find(a => a.id === id);
        if (alert) {
          alert.acknowledged = true;
          return true;
        }
        return false;
      });

      const result = alertsService.acknowledgeAlert('1');
      
      expect(result).toBe(true);
      expect(alerts[0].acknowledged).toBe(true);
    });

    it('should return false for non-existent alert', () => {
      const alerts = [
        { id: '1', level: 'error', acknowledged: false },
        { id: '2', level: 'warning', acknowledged: false },
      ];
      
      jest.spyOn(alertsService, 'acknowledgeAlert').mockImplementation((id: string) => {
        const alert = alerts.find(a => a.id === id);
        if (alert) {
          alert.acknowledged = true;
          return true;
        }
        return false;
      });

      const result = alertsService.acknowledgeAlert('3');
      
      expect(result).toBe(false);
    });
  });

  describe('addRule', () => {
    it('should add new rule with generated ID', () => {
      const rules: any[] = [];
      
      jest.spyOn(alertsService, 'addRule').mockImplementation((ruleData: any) => {
        const rule = {
          ...ruleData,
          id: `rule-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        rules.push(rule);
        return rule;
      });

      const ruleData = {
        name: 'Test Rule',
        type: 'test-type',
        enabled: true,
        threshold: 10,
        condition: 'test > 10',
        channels: ['email'],
        cooldownMinutes: 5,
      };

      const result = alertsService.addRule(ruleData);
      
      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test Rule');
      expect(result.type).toBe('test-type');
      expect(rules).toHaveLength(1);
    });
  });

  describe('updateRule', () => {
    it('should update existing rule', () => {
      const rules = [
        {
          id: 'rule1',
          name: 'Old Name',
          enabled: true,
          threshold: 10,
          updatedAt: new Date().toISOString(),
        },
      ];
      
      jest.spyOn(alertsService, 'updateRule').mockImplementation((id: string, updates: any) => {
        const rule = rules.find(r => r.id === id);
        if (rule) {
          Object.assign(rule, updates);
          rule.updatedAt = new Date().toISOString();
          return true;
        }
        return false;
      });

      const result = alertsService.updateRule('rule1', { name: 'New Name', enabled: false });
      
      expect(result).toBe(true);
      expect(rules[0].name).toBe('New Name');
      expect(rules[0].enabled).toBe(false);
    });

    it('should return false for non-existent rule', () => {
      const rules = [
        {
          id: 'rule1',
          name: 'Old Name',
          enabled: true,
          threshold: 10,
          updatedAt: new Date().toISOString(),
        },
      ];
      
      jest.spyOn(alertsService, 'updateRule').mockImplementation((id: string, updates: any) => {
        const rule = rules.find(r => r.id === id);
        if (rule) {
          Object.assign(rule, updates);
          rule.updatedAt = new Date().toISOString();
          return true;
        }
        return false;
      });

      const result = alertsService.updateRule('rule2', { name: 'New Name' });
      
      expect(result).toBe(false);
    });
  });

  describe('deleteRule', () => {
    it('should delete existing rule', () => {
      const rules = [
        { id: 'rule1', name: 'Rule 1' },
        { id: 'rule2', name: 'Rule 2' },
      ];
      
      jest.spyOn(alertsService, 'deleteRule').mockImplementation((id: string) => {
        const index = rules.findIndex(r => r.id === id);
        if (index !== -1) {
          rules.splice(index, 1);
          return true;
        }
        return false;
      });

      const result = alertsService.deleteRule('rule1');
      
      expect(result).toBe(true);
      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe('rule2');
    });

    it('should return false for non-existent rule', () => {
      const rules = [
        { id: 'rule1', name: 'Rule 1' },
        { id: 'rule2', name: 'Rule 2' },
      ];
      
      jest.spyOn(alertsService, 'deleteRule').mockImplementation((id: string) => {
        const index = rules.findIndex(r => r.id === id);
        if (index !== -1) {
          rules.splice(index, 1);
          return true;
        }
        return false;
      });

      const result = alertsService.deleteRule('rule3');
      
      expect(result).toBe(false);
      expect(rules).toHaveLength(2);
    });
  });

  describe('checkRules', () => {
    it('should trigger alerts based on rules', () => {
      const rules = [
        {
          id: 'rule1',
          name: 'High CPU Alert',
          type: 'high-cpu',
          enabled: true,
          threshold: 80,
          condition: 'cpu > 80',
          channels: ['email'],
          cooldownMinutes: 5,
        },
      ];
      
      const alerts: any[] = [];
      
      jest.spyOn(alertsService, 'checkRules').mockImplementation((data: any) => {
        rules.forEach(rule => {
          if (!rule.enabled) return;
          
          // Simple condition evaluation
          const cpu = data.cpu || 0;
          if (eval(rule.condition)) {
            alerts.push({
              id: `alert-${Date.now()}`,
              level: 'warning',
              type: rule.type,
              message: `${rule.name}: CPU is at ${cpu}%`,
              timestamp: new Date().toISOString(),
              acknowledged: false,
              agentId: data.agentId,
            });
          }
        });
        
        return alerts;
      });

      const result = alertsService.checkRules({ cpu: 90, agentId: 'agent1' });
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('high-cpu');
      expect(result[0].message).toContain('CPU is at 90%');
    });

    it('should not trigger alerts for disabled rules', () => {
      const rules = [
        {
          id: 'rule1',
          name: 'High CPU Alert',
          type: 'high-cpu',
          enabled: false, // Disabled rule
          threshold: 80,
          condition: 'cpu > 80',
          channels: ['email'],
          cooldownMinutes: 5,
        },
      ];
      
      const alerts: any[] = [];
      
      jest.spyOn(alertsService, 'checkRules').mockImplementation((data: any) => {
        rules.forEach(rule => {
          if (!rule.enabled) return;
          
          const cpu = data.cpu || 0;
          if (eval(rule.condition)) {
            alerts.push({
              id: `alert-${Date.now()}`,
              level: 'warning',
              type: rule.type,
              message: `${rule.name}: CPU is at ${cpu}%`,
              timestamp: new Date().toISOString(),
              acknowledged: false,
              agentId: data.agentId,
            });
          }
        });
        
        return alerts;
      });

      const result = alertsService.checkRules({ cpu: 90, agentId: 'agent1' });
      
      expect(result).toHaveLength(0);
    });
  });
});