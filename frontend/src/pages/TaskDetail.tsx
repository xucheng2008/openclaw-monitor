import { Card, Timeline, Tag, Descriptions, Spin, Alert, Button, Space, Typography, Divider } from 'antd'
import { ClockCircleOutlined, CheckCircleOutlined, UserOutlined, FlagOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography
const { Option } = Descriptions

const API_BASE = 'http://localhost:8080/api'

interface Task {
  id: number
  title: string
  status: 'todo' | 'in-progress' | 'done' | 'blocked'
  priority: 'high' | 'medium' | 'low'
  assignee: string
  createdAt: string
  updatedAt: string
  closedAt?: string
  body?: string
  comments?: Comment[]
}

interface Comment {
  id: number
  author: string
  body: string
  createdAt: string
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTask = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/tasks/${id}`)
      if (!res.ok) throw new Error('Task not found')
      
      const data = await res.json()
      setTask(data)
      setError(null)
    } catch (err) {
      setError('任务加载失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchTask()
  }, [id])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="加载任务详情..." />
      </div>
    )
  }

  if (error || !task) {
    return (
      <Alert
        message="任务不存在"
        description={error || '找不到该任务'}
        type="error"
        action={
          <Button onClick={() => navigate('/')}>返回首页</Button>
        }
      />
    )
  }

  const statusColors: Record<string, string> = {
    'in-progress': 'processing',
    'todo': 'default',
    'done': 'success',
    'blocked': 'error',
  }

  const statusText: Record<string, string> = {
    'in-progress': '进行中',
    'todo': '待开始',
    'done': '已完成',
    'blocked': '已阻塞',
  }

  const priorityColors: Record<string, string> = {
    'high': 'red',
    'medium': 'orange',
    'low': 'green',
  }

  // 构建任务时间线
  const timelineItems: { color: string; children: React.ReactNode }[] = [
    {
      color: 'blue',
      children: (
        <div>
          <p style={{ margin: 0 }}>任务创建</p>
          <small style={{ color: '#888' }}>{new Date(task.createdAt).toLocaleString('zh-CN')}</small>
        </div>
      ),
    },
  ]

  if (task.updatedAt !== task.createdAt) {
    timelineItems.push({
      color: 'orange',
      children: (
        <div>
          <p style={{ margin: 0 }}>最后更新</p>
          <small style={{ color: '#888' }}>{new Date(task.updatedAt).toLocaleString('zh-CN')}</small>
        </div>
      ),
    })
  }

  if (task.status === 'done' && task.closedAt) {
    timelineItems.push({
      color: 'green',
      children: (
        <div>
          <p style={{ margin: 0 }}>任务完成</p>
          <small style={{ color: '#888' }}>{new Date(task.closedAt).toLocaleString('zh-CN')}</small>
        </div>
      ),
    })
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button onClick={() => navigate('/')} style={{ marginBottom: 16 }}>
          ← 返回
        </Button>
        <Title level={2} style={{ color: '#fff', margin: '0 0 16px 0' }}>
          #{task.id} {task.title}
        </Title>
        <Space>
          <Tag color={statusColors[task.status]}>{statusText[task.status]}</Tag>
          <Tag color={priorityColors[task.priority]}>{task.priority.toUpperCase()}</Tag>
        </Space>
      </div>

      <Card title="📋 任务详情" style={{ marginBottom: 24 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="任务 ID">{task.id}</Descriptions.Item>
          <Descriptions.Item label="执行 Agent">@{task.assignee}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusColors[task.status]}>{statusText[task.status]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="优先级">
            <Tag color={priorityColors[task.priority]}>{task.priority.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            <ClockCircleOutlined /> {new Date(task.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            <ClockCircleOutlined /> {new Date(task.updatedAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          {task.closedAt && (
            <Descriptions.Item label="完成时间" span={2}>
              <CheckCircleOutlined /> {new Date(task.closedAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="📅 时间线" style={{ marginBottom: 24 }}>
        <Timeline items={timelineItems} />
      </Card>

      {task.body && (
        <Card title="📝 任务描述" style={{ marginBottom: 24 }}>
          <Paragraph style={{ color: '#fff', whiteSpace: 'pre-wrap' }}>{task.body}</Paragraph>
        </Card>
      )}
    </div>
  )
}

export default TaskDetail
