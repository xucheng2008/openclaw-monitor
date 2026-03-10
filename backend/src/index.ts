import express from 'express'
import cors from 'cors'
import { getAgents, getTasks, getStats } from './services/openclaw'
import { getIssues, getTaskIssues, getRecentActivity, syncData } from './services/github'

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

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

app.listen(PORT, () => {
  console.log(`🚀 OpenClaw Monitor API 运行在 http://localhost:${PORT}`)
  console.log(`📊 健康检查：http://localhost:${PORT}/health`)
})
