import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { getAgents, getTasks, getStats } from './services/openclaw'
import { getIssues, getTaskIssues, getRecentActivity, syncData } from './services/github'
import { wsService } from './services/websocket'
import { getLogs, fetchAgentLogs, fetchSystemLogs, addLog } from './services/logs'
import { getTokenStats, recordTokenUsage, syncTokenUsage, exportTokenReport } from './services/token-stats'
import { getAlerts, acknowledgeAlert, getRules, addRule, updateRule, deleteRule, checkRules, getAlertStats } from './services/alerts'

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

// 初始化 WebSocket 服务
wsService.init(server)

// 内存缓存（后续替换为 Redis）
let cachedData: any = {}
const CACHE_TTL = 30000 // 30 秒

/**
 * 缓存中间件
 */
function cache(key: string, ttl: number = CACHE_TTL) {
  return async (req: any, res: any, next: any) => {
    const cached = cachedData[key]
    if (cached && Date.now() - cached.timestamp < ttl) {
      return res.json(cached.data)
    }
    res.locals.cacheKey = key
    next()
  }
}

/**
 * 缓存响应
 */
function cacheResponse(req: any, res: any, next: any) {
  const originalJson = res.json
  res.json = (data: any) => {
    if (res.locals.cacheKey) {
      cachedData[res.locals.cacheKey] = {
        data,
        timestamp: Date.now(),
      }
    }
    return originalJson.call(res, data)
  }
  next()
}

// API 路由
app.get('/api/agents', cache('agents'), cacheResponse, async (req, res) => {
  try {
    const agents = await getAgents()
    res.json(agents)
  } catch (error) {
    res.status(500).json({ error: '获取 Agent 状态失败' })
  }
})

app.get('/api/agents/:id', async (req, res) => {
  try {
    const agents = await getAgents()
    const agent = agents.find(a => a.id === req.params.id)
    if (agent) {
      res.json(agent)
    } else {
      res.status(404).json({ error: 'Agent not found' })
    }
  } catch (error) {
    res.status(500).json({ error: '获取 Agent 状态失败' })
  }
})

app.get('/api/tasks', cache('tasks'), cacheResponse, async (req, res) => {
  try {
    const repo = req.query.repo as string || 'xucheng2008/openclaw-monitor'
    const tasks = await getTasks(repo)
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: '获取任务列表失败' })
  }
})

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await getTasks()
    const task = tasks.find(t => t.id === parseInt(req.params.id))
    if (task) {
      res.json(task)
    } else {
      res.status(404).json({ error: 'Task not found' })
    }
  } catch (error) {
    res.status(500).json({ error: '获取任务失败' })
  }
})

app.get('/api/stats', cache('stats'), cacheResponse, async (req, res) => {
  try {
    const stats = await getStats()
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败' })
  }
})

app.get('/api/github/issues', cache('github-issues'), cacheResponse, async (req, res) => {
  try {
    const repo = req.query.repo as string || 'xucheng2008/openclaw-monitor'
    const issues = await getIssues(repo)
    res.json(issues)
  } catch (error) {
    res.status(500).json({ error: '获取 Issues 失败' })
  }
})

app.get('/api/github/tasks', cache('github-tasks'), cacheResponse, async (req, res) => {
  try {
    const repo = req.query.repo as string || 'xucheng2008/openclaw-monitor'
    const tasks = await getTaskIssues(repo)
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: '获取任务失败' })
  }
})

app.get('/api/github/activity', cache('github-activity'), cacheResponse, async (req, res) => {
  try {
    const repo = req.query.repo as string || 'xucheng2008/openclaw-monitor'
    const activities = await getRecentActivity(repo)
    res.json(activities)
  } catch (error) {
    res.status(500).json({ error: '获取活动失败' })
  }
})

app.post('/api/github/sync', async (req, res) => {
  try {
    const repo = req.body.repo || 'xucheng2008/openclaw-monitor'
    const data = await syncData(repo)
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ error: '同步数据失败' })
  }
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 日志 API
app.get('/api/logs', (req, res) => {
  try {
    const { level, agent, limit, before } = req.query
    const logs = getLogs({
      level: level as any,
      agent: agent as string,
      limit: limit ? parseInt(limit as string) : 100,
      before: before as string,
    })
    res.json(logs)
  } catch (error) {
    res.status(500).json({ error: '获取日志失败' })
  }
})

app.get('/api/logs/agent', async (req, res) => {
  try {
    const { agent, limit } = req.query
    const logs = await fetchAgentLogs(agent as string, limit ? parseInt(limit as string) : 50)
    res.json(logs)
  } catch (error) {
    res.status(500).json({ error: '获取 Agent 日志失败' })
  }
})

app.get('/api/logs/system', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50
    const logs = await fetchSystemLogs(limit)
    res.json(logs)
  } catch (error) {
    res.status(500).json({ error: '获取系统日志失败' })
  }
})

app.post('/api/logs', (req, res) => {
  try {
    const { level, agent, message, source } = req.body
    const log = addLog({ level, agent, message, source })
    res.json(log)
  } catch (error) {
    res.status(500).json({ error: '添加日志失败' })
  }
})

// Token 统计 API
app.get('/api/token/stats', (req, res) => {
  try {
    const { agent, model, hours } = req.query
    const stats = getTokenStats({
      agent: agent as string,
      model: model as string,
      hours: hours ? parseInt(hours as string) : undefined,
    })
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: '获取 Token 统计失败' })
  }
})

app.post('/api/token/record', (req, res) => {
  try {
    const { agent, model, inputTokens, outputTokens, totalTokens } = req.body
    const record = recordTokenUsage({ agent, model, inputTokens, outputTokens, totalTokens })
    res.json(record)
  } catch (error) {
    res.status(500).json({ error: '记录 Token 使用失败' })
  }
})

app.post('/api/token/sync', async (req, res) => {
  try {
    const usage = await syncTokenUsage()
    res.json({ success: true, count: usage.length })
  } catch (error) {
    res.status(500).json({ error: '同步 Token 数据失败' })
  }
})

app.get('/api/token/export', (req, res) => {
  try {
    const format = (req.query.format as string) || 'json'
    const report = exportTokenReport(format as any)
    res.type(format === 'csv' ? 'text/csv' : 'application/json')
    res.send(report)
  } catch (error) {
    res.status(500).json({ error: '导出报告失败' })
  }
})

// 告警 API
app.get('/api/alerts', (req, res) => {
  try {
    const { level, type, acknowledged, limit } = req.query
    const alerts = getAlerts({
      level: level as any,
      type: type as any,
      acknowledged: acknowledged === 'true',
      limit: limit ? parseInt(limit as string) : 50,
    })
    res.json(alerts)
  } catch (error) {
    res.status(500).json({ error: '获取告警失败' })
  }
})

app.get('/api/alerts/stats', (req, res) => {
  try {
    const stats = getAlertStats()
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: '获取告警统计失败' })
  }
})

app.post('/api/alerts/:id/acknowledge', (req, res) => {
  try {
    const success = acknowledgeAlert(req.params.id)
    res.json({ success })
  } catch (error) {
    res.status(500).json({ error: '确认告警失败' })
  }
})

app.get('/api/alerts/rules', (req, res) => {
  try {
    const rules = getRules()
    res.json(rules)
  } catch (error) {
    res.status(500).json({ error: '获取告警规则失败' })
  }
})

app.post('/api/alerts/rules', (req, res) => {
  try {
    const { name, type, enabled, threshold, condition, channels, cooldownMinutes } = req.body
    const rule = addRule({ name, type, enabled, threshold, condition, channels, cooldownMinutes })
    res.json(rule)
  } catch (error) {
    res.status(500).json({ error: '添加告警规则失败' })
  }
})

app.put('/api/alerts/rules/:id', (req, res) => {
  try {
    const success = updateRule(req.params.id, req.body)
    res.json({ success })
  } catch (error) {
    res.status(500).json({ error: '更新告警规则失败' })
  }
})

app.delete('/api/alerts/rules/:id', (req, res) => {
  try {
    const success = deleteRule(req.params.id)
    res.json({ success })
  } catch (error) {
    res.status(500).json({ error: '删除告警规则失败' })
  }
})

// 定时检查告警规则（每 5 分钟）
setInterval(() => {
  checkRules({})
}, 5 * 60 * 1000)

// 导出 app 用于测试
export { app }

server.listen(PORT, () => {
  // Server started
})
