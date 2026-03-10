/**
 * 告警服务
 * 监控和推送系统告警
 */

import { wsService } from './websocket'

export interface Alert {
  id: string
  type: 'token_limit' | 'task_timeout' | 'agent_offline' | 'custom'
  level: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
  metadata?: Record<string, any>
}

export interface AlertRule {
  id: string
  name: string
  type: Alert['type']
  enabled: boolean
  threshold: number
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  channels: ('email' | 'webhook' | 'feishu' | 'dingtalk')[]
  cooldownMinutes: number
  lastTriggered?: string
}

// 内存存储
const alerts: Alert[] = []
const rules: AlertRule[] = []
const MAX_ALERTS = 500

/**
 * 创建告警
 */
export function createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>): Alert {
  const newAlert: Alert = {
    ...alert,
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  }

  alerts.unshift(newAlert)

  // 限制数量
  if (alerts.length > MAX_ALERTS) {
    alerts.pop()
  }

  // 通过 WebSocket 推送
  wsService.sendNotification('alert', newAlert)

  // 触发通知渠道
  triggerNotifications(newAlert)

  return newAlert
}

/**
 * 获取告警列表
 */
export function getAlerts(options?: {
  level?: Alert['level']
  type?: Alert['type']
  acknowledged?: boolean
  limit?: number
}): Alert[] {
  let filtered = [...alerts]

  if (options?.level) {
    filtered = filtered.filter(a => a.level === options.level)
  }

  if (options?.type) {
    filtered = filtered.filter(a => a.type === options.type)
  }

  if (options?.acknowledged !== undefined) {
    filtered = filtered.filter(a => a.acknowledged === options.acknowledged)
  }

  const limit = options?.limit || 50
  return filtered.slice(0, limit)
}

/**
 * 确认告警
 */
export function acknowledgeAlert(alertId: string): boolean {
  const alert = alerts.find(a => a.id === alertId)
  if (alert) {
    alert.acknowledged = true
    return true
  }
  return false
}

/**
 * 获取告警规则
 */
export function getRules(): AlertRule[] {
  return rules
}

/**
 * 添加告警规则
 */
export function addRule(rule: Omit<AlertRule, 'id'>): AlertRule {
  const newRule: AlertRule = {
    ...rule,
    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }
  rules.push(newRule)
  return newRule
}

/**
 * 更新告警规则
 */
export function updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
  const rule = rules.find(r => r.id === ruleId)
  if (rule) {
    Object.assign(rule, updates)
    return true
  }
  return false
}

/**
 * 删除告警规则
 */
export function deleteRule(ruleId: string): boolean {
  const index = rules.findIndex(r => r.id === ruleId)
  if (index !== -1) {
    rules.splice(index, 1)
    return true
  }
  return false
}

/**
 * 检查规则并触发告警
 */
export function checkRules(context: {
  tokenUsage?: number
  taskDuration?: number
  agentStatus?: Record<string, 'online' | 'offline'>
}): void {
  rules.forEach(rule => {
    if (!rule.enabled) return

    // 检查冷却时间
    if (rule.lastTriggered) {
      const cooldownMs = rule.cooldownMinutes * 60 * 1000
      if (Date.now() - new Date(rule.lastTriggered).getTime() < cooldownMs) {
        return
      }
    }

    let shouldAlert = false
    let alertMessage = ''

    switch (rule.type) {
      case 'token_limit':
        if (context.tokenUsage !== undefined) {
          shouldAlert = evaluateCondition(context.tokenUsage, rule.condition, rule.threshold)
          alertMessage = `Token 使用量 ${context.tokenUsage} ${getConditionText(rule.condition)} ${rule.threshold}`
        }
        break

      case 'task_timeout':
        if (context.taskDuration !== undefined) {
          shouldAlert = evaluateCondition(context.taskDuration, rule.condition, rule.threshold)
          alertMessage = `任务执行时间 ${context.taskDuration}分钟 ${getConditionText(rule.condition)} ${rule.threshold}分钟`
        }
        break

      case 'agent_offline':
        if (context.agentStatus) {
          const offlineAgents = Object.entries(context.agentStatus)
            .filter(([_, status]) => status === 'offline')
            .map(([name]) => name)
          if (offlineAgents.length > 0) {
            shouldAlert = true
            alertMessage = `Agent 离线：${offlineAgents.join(', ')}`
          }
        }
        break
    }

    if (shouldAlert) {
      createAlert({
        type: rule.type,
        level: rule.type === 'agent_offline' ? 'error' : 'warning',
        title: rule.name,
        message: alertMessage,
      })

      rule.lastTriggered = new Date().toISOString()
    }
  })
}

/**
 * 评估条件
 */
function evaluateCondition(value: number, condition: AlertRule['condition'], threshold: number): boolean {
  switch (condition) {
    case 'gt': return value > threshold
    case 'lt': return value < threshold
    case 'eq': return value === threshold
    case 'gte': return value >= threshold
    case 'lte': return value <= threshold
  }
}

/**
 * 获取条件文本
 */
function getConditionText(condition: AlertRule['condition']): string {
  const texts = { gt: '>', lt: '<', eq: '=', gte: '≥', lte: '≤' }
  return texts[condition]
}

/**
 * 触发通知
 */
function triggerNotifications(alert: Alert): void {
  // 查找匹配的规则
  const matchingRules = rules.filter(r => r.type === alert.type && r.enabled)

  matchingRules.forEach(rule => {
    rule.channels.forEach(channel => {
      // 这里实现具体的通知逻辑
      console.log(`🔔 发送告警到 ${channel}: ${alert.title}`)
      // TODO: 实现 email/webhook/feishu/dingtalk 通知
    })
  })
}

/**
 * 获取告警统计
 */
export function getAlertStats(): {
  total: number
  unacknowledged: number
  byLevel: Record<string, number>
  byType: Record<string, number>
} {
  return {
    total: alerts.length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length,
    byLevel: alerts.reduce((acc, a) => {
      acc[a.level] = (acc[a.level] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byType: alerts.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }
}
