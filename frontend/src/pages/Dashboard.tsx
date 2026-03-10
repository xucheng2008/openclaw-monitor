import { Card, Col, Row, Statistic, Table, Tag, Progress, Spin, Alert, Button, Space } from 'antd'
import { 
  TeamOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  SyncOutlined
} from '@ant-design/icons'
import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:8080/api'

interface Agent {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy' | 'idle'
  currentTask: string | null
  tasks: number
}

interface Task {
  id: number
  title: string
  status: 'todo' | 'in-progress' | 'done' | 'blocked'
  priority: 'high' | 'medium' | 'low'
  assignee: string
}

interface Stats {
  totalAgents: number
  onlineAgents: number
  activeTasks: number
  completedTasks: number
  projectProgress: number
}

const Dashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [agentsRes, tasksRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/agents`),
        fetch(`${API_BASE}/tasks`),
        fetch(`${API_BASE}/stats`),
      ])
      
      if (!agentsRes.ok || !tasksRes.ok || !statsRes.ok) {
        throw new Error('API 请求失败')
      }
      
      const agentsData = await agentsRes.json()
      const tasksData = await tasksRes.json()
      const statsData = await statsRes.json()
      
      setAgents(agentsData)
      setTasks(tasksData)
      setStats(statsData)
      setError(null)
    } catch (err) {
      setError('数据加载失败，请确保后端服务正在运行')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // 每 30 秒自动刷新
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

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

  const columns = [
    {
      title: '任务',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span style={{ color: '#fff' }}>{text}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusText[status]}</Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={priorityColors[priority]}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: '执行 Agent',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (assignee: string) => <span style={{ color: '#fff' }}>@{assignee}</span>,
    },
  ]

  if (loading && !agents.length) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="加载数据中..." />
      </div>
    )
  }

  return (
    <div>
      {/* 错误提示 */}
      {error && (
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" onClick={fetchData}>
              <ReloadOutlined /> 重试
            </Button>
          }
        />
      )}

      {/* 顶部操作栏 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#fff', margin: 0 }}>📊 OpenClaw Monitor</h1>
        <Space>
          <Button onClick={fetchData} loading={loading}>
            <ReloadOutlined /> 刷新
          </Button>
          <Button onClick={() => fetch(`${API_BASE}/github/sync`, { method: 'POST' })}>
            <SyncOutlined spin={loading} /> 同步 GitHub
          </Button>
        </Space>
      </div>

      {/* 关键指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Agent 数量"
              value={stats?.totalAgents || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃任务"
              value={stats?.activeTasks || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats?.completedTasks || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="项目进度"
              value={stats?.projectProgress || 0}
              suffix="%"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress 
              percent={stats?.projectProgress || 0} 
              strokeColor="#722ed1" 
              showInfo={false} 
              style={{ marginTop: 8 }} 
            />
          </Card>
        </Col>
      </Row>

      {/* Agent 状态 */}
      <Card title="🤖 Agent 状态" style={{ marginBottom: 24 }}>
        <Table 
          columns={[
            { title: 'Agent', dataIndex: 'name', key: 'name', render: (text: string) => <span style={{ color: '#fff' }}>{text}</span> },
            { 
              title: '状态', 
              dataIndex: 'status', 
              key: 'status',
              render: (status: string) => {
                const colors: Record<string, string> = {
                  online: 'green',
                  busy: 'blue',
                  idle: 'gray',
                  offline: 'red',
                }
                const texts: Record<string, string> = {
                  online: '🟢 在线',
                  busy: '🔵 忙碌',
                  idle: '⚪ 空闲',
                  offline: '🔴 离线',
                }
                return <Tag color={colors[status]}>{texts[status]}</Tag>
              }
            },
            { title: '当前任务', dataIndex: 'currentTask', key: 'currentTask', render: (text: string) => <span style={{ color: '#fff' }}>{text || '-'}</span> },
            { title: '任务数', dataIndex: 'tasks', key: 'tasks', render: (num: number) => <span style={{ color: '#fff' }}>{num}</span> },
          ]}
          dataSource={agents.map(a => ({ ...a, key: a.id }))}
          pagination={false}
          rowKey="id"
        />
      </Card>

      {/* 当前任务 */}
      <Card title="📋 当前任务">
        <Table 
          columns={columns}
          dataSource={tasks.map(t => ({ ...t, key: t.id.toString() }))}
          pagination={false}
          rowKey="id"
        />
      </Card>
    </div>
  )
}

export default Dashboard
