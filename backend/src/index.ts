import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

// 模拟数据
const agents = [
  { id: 'boss', name: 'boss', status: 'online', currentTask: 'Phase 1 开发', tasks: 5 },
  { id: 'codex', name: 'codex', status: 'busy', currentTask: '代码开发', tasks: 4 },
  { id: 'aidev', name: 'aidev', status: 'idle', currentTask: null, tasks: 0 },
  { id: 'review', name: 'review', status: 'idle', currentTask: null, tasks: 0 },
  { id: 'economy', name: 'economy', status: 'offline', currentTask: null, tasks: 0 },
]

const tasks = [
  { id: 2, title: 'Phase 1: 创建基础项目结构', status: 'in-progress', priority: 'high', assignee: 'codex' },
  { id: 3, title: 'Phase 2: 实现 Agent 状态监控 API', status: 'pending', priority: 'high', assignee: 'codex' },
  { id: 4, title: 'Phase 3: 实现任务数据同步', status: 'pending', priority: 'high', assignee: 'codex' },
  { id: 5, title: 'Phase 4: 实现数据可视化组件', status: 'pending', priority: 'medium', assignee: 'codex' },
]

// API 路由
app.get('/api/agents', (req, res) => {
  res.json(agents)
})

app.get('/api/agents/:id', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id)
  if (agent) {
    res.json(agent)
  } else {
    res.status(404).json({ error: 'Agent not found' })
  }
})

app.get('/api/tasks', (req, res) => {
  res.json(tasks)
})

app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id))
  if (task) {
    res.json(task)
  } else {
    res.status(404).json({ error: 'Task not found' })
  }
})

app.get('/api/stats', (req, res) => {
  res.json({
    totalAgents: agents.length,
    onlineAgents: agents.filter(a => a.status === 'online' || a.status === 'busy').length,
    activeTasks: tasks.filter(t => t.status === 'in-progress').length,
    completedTasks: 1,
    projectProgress: 15,
  })
})

app.listen(PORT, () => {
  console.log(`🚀 OpenClaw Monitor API 运行在 http://localhost:${PORT}`)
})
