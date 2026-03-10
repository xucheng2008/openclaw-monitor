/**
 * 日志服务
 * 收集和推送 Agent 执行日志
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { wsService } from './websocket'

const execAsync = promisify(exec)

export interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  agent: string
  message: string
  source: string
}

// 内存日志存储（后续可替换为数据库）
const logBuffer: LogEntry[] = []
const MAX_LOGS = 1000

/**
 * 添加日志条目
 */
export function addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): LogEntry {
  const entryWithMeta: LogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  logBuffer.push(entryWithMeta)

  // 限制日志数量
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.shift()
  }

  // 通过 WebSocket 推送
  wsService.sendNotification('log', entryWithMeta)

  return entryWithMeta
}

/**
 * 获取日志列表
 */
export function getLogs(options?: {
  level?: LogEntry['level']
  agent?: string
  limit?: number
  before?: string
}): LogEntry[] {
  let filtered = [...logBuffer]

  if (options?.level) {
    filtered = filtered.filter(log => log.level === options.level)
  }

  if (options?.agent) {
    filtered = filtered.filter(log => log.agent === options.agent)
  }

  if (options?.before) {
    filtered = filtered.filter(log => log.timestamp < options.before!)
  }

  const limit = options?.limit || 100
  return filtered.slice(-limit)
}

/**
 * 从 OpenClaw 获取 Agent 日志
 */
export async function fetchAgentLogs(agent?: string, limit: number = 50): Promise<LogEntry[]> {
  try {
    // 尝试从 sessions_list 获取日志
    // 这里简化处理，生成模拟日志
    const agents = ['boss', 'codex', 'aidev', 'review', 'economy']
    const targetAgents = agent ? [agent] : agents

    const logs: LogEntry[] = []

    for (const agentName of targetAgents) {
      // 模拟日志
      logs.push({
        id: `log-${Date.now()}-${agentName}`,
        timestamp: new Date().toISOString(),
        level: 'info',
        agent: agentName,
        message: `Agent ${agentName} 正在执行任务`,
        source: 'openclaw',
      })
    }

    return logs.slice(0, limit)
  } catch (error) {
    console.error('获取 Agent 日志失败:', error)
    return []
  }
}

/**
 * 从系统日志获取
 */
export async function fetchSystemLogs(limit: number = 50): Promise<LogEntry[]> {
  try {
    const { stdout } = await execAsync(`tail -n ${limit} ~/.openclaw/logs/*.log 2>/dev/null || echo ""`)
    
    if (!stdout.trim()) {
      return []
    }

    const lines = stdout.split('\n').filter(line => line.trim())
    
    return lines.map((line, index) => ({
      id: `sys-${Date.now()}-${index}`,
      timestamp: new Date().toISOString(),
      level: 'info' as const,
      agent: 'system',
      message: line,
      source: 'system',
    }))
  } catch (error) {
    console.error('获取系统日志失败:', error)
    return []
  }
}

/**
 * 清理旧日志
 */
export function cleanupLogs(olderThan: Date): number {
  const initialLength = logBuffer.length
  const timestamp = olderThan.toISOString()
  
  const index = logBuffer.findIndex(log => log.timestamp >= timestamp)
  if (index > 0) {
    logBuffer.splice(0, index)
  }

  return initialLength - logBuffer.length
}

/**
 * 导出日志为 JSON
 */
export function exportLogs(format: 'json' | 'text' = 'json'): string {
  if (format === 'json') {
    return JSON.stringify(logBuffer, null, 2)
  } else {
    return logBuffer
      .map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.agent}] ${log.message}`)
      .join('\n')
  }
}
