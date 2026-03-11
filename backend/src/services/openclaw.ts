/**
 * OpenClaw API 服务
 * 获取 Agent 状态和任务数据
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// 缓存变量
let cachedTasks: Task[] = []
let cacheTime: number = 0
const CACHE_TTL = 30000 // 30 秒

export interface Agent {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy' | 'idle'
  currentTask: string | null
  tasks: number
  tokenUsage: number
  lastActive: string
}

export interface Task {
  id: number
  title: string
  status: 'todo' | 'in-progress' | 'done' | 'blocked'
  priority: 'high' | 'medium' | 'low'
  assignee: string
  createdAt: string
  updatedAt: string
}

export interface Stats {
  totalAgents: number
  onlineAgents: number
  activeTasks: number
  completedTasks: number
  projectProgress: number
  totalTokenUsage: number
}

/**
 * 获取 Agent 列表
 */
export async function getAgents(): Promise<Agent[]> {
  try {
    // 从 OpenClaw 获取 Agent 状态
    const { stdout } = await execAsync('openclaw status 2>/dev/null || echo "{}"')
    const data = JSON.parse(stdout)
    
    // 模拟数据（后续替换为真实 API）
    return [
      { 
        id: 'boss', 
        name: 'boss', 
        status: 'online', 
        currentTask: 'Phase 1 开发', 
        tasks: 5,
        tokenUsage: 12500,
        lastActive: new Date().toISOString()
      },
      { 
        id: 'codex', 
        name: 'codex', 
        status: 'busy', 
        currentTask: '代码开发', 
        tasks: 4,
        tokenUsage: 45000,
        lastActive: new Date().toISOString()
      },
      { 
        id: 'aidev', 
        name: 'aidev', 
        status: 'idle', 
        currentTask: null, 
        tasks: 0,
        tokenUsage: 8000,
        lastActive: new Date().toISOString()
      },
      { 
        id: 'review', 
        name: 'review', 
        status: 'idle', 
        currentTask: null, 
        tasks: 0,
        tokenUsage: 5000,
        lastActive: new Date().toISOString()
      },
      { 
        id: 'economy', 
        name: 'economy', 
        status: 'offline', 
        currentTask: null, 
        tasks: 0,
        tokenUsage: 2000,
        lastActive: new Date(Date.now() - 86400000).toISOString()
      },
    ]
  } catch (error) {
    console.error('获取 Agent 状态失败:', error)
    return []
  }
}

/**
 * 获取任务列表
 */
export async function getTasks(repo: string = 'xucheng2008/openclaw-monitor'): Promise<Task[]> {
  // 检查缓存
  if (Date.now() - cacheTime < CACHE_TTL && cachedTasks.length > 0) {
    console.log('Cache hit for tasks') // 添加日志以便调试
    return cachedTasks
  }
  
  console.log('Cache miss for tasks, fetching from GitHub') // 添加日志以便调试
  
  try {
    // 从 GitHub API 获取任务
    const { stdout } = await execAsync(
      `gh issue list --repo ${repo} --label "task" --limit 20 --json number,title,labels,createdAt,updatedAt 2>/dev/null || echo "[]"`
    )
    const issues = JSON.parse(stdout)
    
    const tasks = issues.map((issue: any) => {
      const statusLabel = issue.labels?.find((l: any) => l.name.startsWith('status:'))
      const priorityLabel = issue.labels?.find((l: any) => l.name.startsWith('priority:'))
      const agentLabel = issue.labels?.find((l: any) => l.name.startsWith('agent:'))
      
      return {
        id: issue.number,
        title: issue.title.replace('[TASK] ', ''),
        status: (statusLabel?.name.replace('status:', '') as Task['status']) || 'todo',
        priority: (priorityLabel?.name.replace('priority:', '') as Task['priority']) || 'medium',
        assignee: agentLabel?.name.replace('agent:', '') || 'unassigned',
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      }
    })
    
    // 更新缓存
    cachedTasks = tasks
    cacheTime = Date.now()
    
    return tasks
  } catch (error) {
    console.error('获取任务列表失败:', error)
    // 返回缓存数据（如果有的话）或模拟数据
    if (cachedTasks.length > 0) {
      console.log('Returning cached data due to error')
      return cachedTasks
    }
    // 返回模拟数据
    return [
      { id: 2, title: 'Phase 1: 创建基础项目结构', status: 'done', priority: 'high', assignee: 'codex', createdAt: '', updatedAt: '' },
      { id: 3, title: 'Phase 2: 实现 Agent 状态监控 API', status: 'in-progress', priority: 'high', assignee: 'codex', createdAt: '', updatedAt: '' },
      { id: 4, title: 'Phase 3: 实现任务数据同步', status: 'in-progress', priority: 'high', assignee: 'codex', createdAt: '', updatedAt: '' },
      { id: 5, title: 'Phase 4: 实现数据可视化组件', status: 'in-progress', priority: 'medium', assignee: 'codex', createdAt: '', updatedAt: '' },
    ]
  }
}

/**
 * 获取统计数据
 */
export async function getStats(): Promise<Stats> {
  const agents = await getAgents()
  const tasks = await getTasks() // 这里也会使用缓存
  
  return {
    totalAgents: agents.length,
    onlineAgents: agents.filter(a => a.status === 'online' || a.status === 'busy').length,
    activeTasks: tasks.filter(t => t.status === 'in-progress').length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    projectProgress: Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100),
    totalTokenUsage: agents.reduce((sum, a) => sum + a.tokenUsage, 0),
  }
}

/**
 * 手动刷新缓存
 */
export async function refreshCache(): Promise<void> {
  cachedTasks = []
  cacheTime = 0
  await getTasks() // 这会重新填充缓存
  console.log('缓存刷新完成')
}

// 后台定时刷新（每 5 分钟）
const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 分钟

export function startBackgroundRefresh(): void {
  // 启动时立即刷新
  refreshCache()
  
  // 定时刷新
  setInterval(async () => {
    try {
      await refreshCache()
      console.log('缓存已刷新:', new Date().toISOString())
    } catch (error) {
      console.error('刷新缓存失败:', error)
    }
  }, REFRESH_INTERVAL)
}

/**
 * 获取缓存状态
 */
export function getCacheStatus() {
  return {
    tasks: {
      cached: cachedTasks.length > 0,
      age: Date.now() - cacheTime,
      ttl: CACHE_TTL
    }
  }
}