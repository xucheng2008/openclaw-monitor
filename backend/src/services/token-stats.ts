/**
 * Token 使用统计服务
 * 追踪和分析 Agent 的 Token 消耗
 */

import { getAgents } from './openclaw'

export interface TokenUsage {
  agent: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  timestamp: string
}

export interface TokenStats {
  totalTokens: number
  totalCost: number
  byAgent: Record<string, number>
  byModel: Record<string, number>
  trend: TokenUsage[]
}

// 模型定价 (每 1000 tokens)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'qwen3.5-plus': { input: 0.002, output: 0.006 },
  'qwen3-coder-plus': { input: 0.002, output: 0.006 },
  'qwen3-coder-next': { input: 0.001, output: 0.003 },
  'qwen3-max-2026-01-23': { input: 0.004, output: 0.012 },
  'glm-4.7': { input: 0.001, output: 0.003 },
  'default': { input: 0.002, output: 0.006 },
}

// 内存存储 Token 使用记录
const tokenUsageHistory: TokenUsage[] = []

/**
 * 计算成本
 */
function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['default']
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1000
}

/**
 * 记录 Token 使用
 */
export function recordTokenUsage(usage: Omit<TokenUsage, 'timestamp' | 'cost'>): TokenUsage {
  const cost = calculateCost(usage.model, usage.inputTokens, usage.outputTokens)
  const record: TokenUsage = {
    ...usage,
    cost,
    timestamp: new Date().toISOString(),
  }
  
  tokenUsageHistory.push(record)
  
  // 保留最近 1000 条记录
  if (tokenUsageHistory.length > 1000) {
    tokenUsageHistory.shift()
  }
  
  return record
}

/**
 * 获取 Token 统计
 */
export function getTokenStats(options?: {
  agent?: string
  model?: string
  hours?: number
}): TokenStats {
  let filtered = [...tokenUsageHistory]
  
  if (options?.agent) {
    filtered = filtered.filter(u => u.agent === options.agent)
  }
  
  if (options?.model) {
    filtered = filtered.filter(u => u.model === options.model)
  }
  
  if (options?.hours) {
    const cutoff = new Date(Date.now() - options.hours * 60 * 60 * 1000)
    filtered = filtered.filter(u => new Date(u.timestamp) > cutoff)
  }
  
  const totalTokens = filtered.reduce((sum, u) => sum + u.totalTokens, 0)
  const totalCost = filtered.reduce((sum, u) => sum + u.cost, 0)
  
  const byAgent: Record<string, number> = {}
  const byModel: Record<string, number> = {}
  
  filtered.forEach(u => {
    byAgent[u.agent] = (byAgent[u.agent] || 0) + u.totalTokens
    byModel[u.model] = (byModel[u.model] || 0) + u.totalTokens
  })
  
  return {
    totalTokens,
    totalCost,
    byAgent,
    byModel,
    trend: filtered.slice(-100), // 最近 100 条趋势
  }
}

/**
 * 从 Agent 获取 Token 使用数据
 */
export async function fetchTokenUsageFromAgents(): Promise<TokenUsage[]> {
  try {
    const agents = await getAgents()
    
    return agents.map(agent => ({
      agent: agent.id,
      model: 'qwen3.5-plus', // 默认模型
      inputTokens: Math.floor(Math.random() * 10000), // 模拟数据
      outputTokens: Math.floor(Math.random() * 5000),
      totalTokens: agent.tokenUsage || 0,
      cost: 0,
      timestamp: agent.lastActive,
    })).map(u => ({
      ...u,
      cost: calculateCost(u.model, u.inputTokens, u.outputTokens),
    }))
  } catch (error) {
    console.error('获取 Token 使用数据失败:', error)
    return []
  }
}

/**
 * 同步 Token 使用数据
 */
export async function syncTokenUsage(): Promise<TokenUsage[]> {
  const usage = await fetchTokenUsageFromAgents()
  
  usage.forEach(u => {
    recordTokenUsage({
      agent: u.agent,
      model: u.model,
      inputTokens: u.inputTokens,
      outputTokens: u.outputTokens,
      totalTokens: u.totalTokens,
    })
  })
  
  return usage
}

/**
 * 导出 Token 使用报告
 */
export function exportTokenReport(format: 'json' | 'csv' = 'json'): string {
  const stats = getTokenStats()
  
  if (format === 'json') {
    return JSON.stringify(stats, null, 2)
  } else {
    const headers = ['Agent', 'Model', 'Input Tokens', 'Output Tokens', 'Total', 'Cost', 'Timestamp']
    const rows = tokenUsageHistory.map(u => [
      u.agent,
      u.model,
      u.inputTokens,
      u.outputTokens,
      u.totalTokens,
      u.cost.toFixed(6),
      u.timestamp,
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }
}
