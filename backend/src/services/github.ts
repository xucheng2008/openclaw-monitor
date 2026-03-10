/**
 * GitHub API 服务
 * 同步任务和 Issue 数据
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface GitHubIssue {
  number: number
  title: string
  state: 'open' | 'closed'
  labels: string[]
  assignee: string | null
  createdAt: string
  updatedAt: string
  closedAt: string | null
}

export interface Activity {
  id: string
  type: 'issue_created' | 'issue_closed' | 'comment_added' | 'task_assigned' | 'task_completed'
  timestamp: string
  description: string
  actor: string
}

/**
 * 获取仓库 Issues
 */
export async function getIssues(repo: string = 'xucheng2008/openclaw-monitor'): Promise<GitHubIssue[]> {
  try {
    const { stdout } = await execAsync(
      `gh issue list --repo ${repo} --limit 50 --json number,title,state,labels,assignee,createdAt,updatedAt,closedAt 2>/dev/null || echo "[]"`
    )
    const issues = JSON.parse(stdout)
    
    return issues.map((issue: any) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      labels: issue.labels?.map((l: any) => l.name) || [],
      assignee: issue.assignee?.login || null,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      closedAt: issue.closedAt,
    }))
  } catch (error) {
    console.error('获取 Issues 失败:', error)
    return []
  }
}

/**
 * 获取任务 Issues（带 task 标签）
 */
export async function getTaskIssues(repo: string = 'xucheng2008/openclaw-monitor'): Promise<GitHubIssue[]> {
  try {
    const { stdout } = await execAsync(
      `gh issue list --repo ${repo} --label "task" --limit 50 --json number,title,state,labels,assignee,createdAt,updatedAt,closedAt 2>/dev/null || echo "[]"`
    )
    const issues = JSON.parse(stdout)
    
    return issues.map((issue: any) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      labels: issue.labels?.map((l: any) => l.name) || [],
      assignee: issue.assignee?.login || null,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      closedAt: issue.closedAt,
    }))
  } catch (error) {
    console.error('获取任务 Issues 失败:', error)
    return []
  }
}

/**
 * 获取 Issue 评论
 */
export async function getIssueComments(repo: string, issueNumber: number): Promise<any[]> {
  try {
    const { stdout } = await execAsync(
      `gh issue view ${issueNumber} --repo ${repo} --json comments 2>/dev/null || echo '{"comments":[]}'`
    )
    const data = JSON.parse(stdout)
    return data.comments || []
  } catch (error) {
    console.error('获取评论失败:', error)
    return []
  }
}

/**
 * 获取最近活动
 */
export async function getRecentActivity(repo: string = 'xucheng2008/openclaw-monitor'): Promise<Activity[]> {
  try {
    const issues = await getIssues(repo)
    
    const activities: Activity[] = []
    
    // 最近创建的 Issue
    issues.slice(0, 5).forEach(issue => {
      activities.push({
        id: `issue-${issue.number}`,
        type: 'issue_created',
        timestamp: issue.createdAt,
        description: `创建了 Issue #${issue.number}: ${issue.title}`,
        actor: issue.assignee || 'unknown',
      })
    })
    
    // 最近关闭的 Issue
    issues.filter(i => i.state === 'closed' && i.closedAt).slice(0, 5).forEach(issue => {
      activities.push({
        id: `closed-${issue.number}`,
        type: 'issue_closed',
        timestamp: issue.closedAt!,
        description: `关闭了 Issue #${issue.number}: ${issue.title}`,
        actor: issue.assignee || 'unknown',
      })
    })
    
    // 按时间排序
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error('获取活动失败:', error)
    return []
  }
}

/**
 * 同步数据到本地
 */
export async function syncData(repo: string = 'xucheng2008/openclaw-monitor'): Promise<{
  issues: GitHubIssue[]
  tasks: GitHubIssue[]
  activities: Activity[]
}> {
  const [issues, tasks, activities] = await Promise.all([
    getIssues(repo),
    getTaskIssues(repo),
    getRecentActivity(repo),
  ])
  
  return { issues, tasks, activities }
}
