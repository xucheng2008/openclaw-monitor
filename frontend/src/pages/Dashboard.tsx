import { Card, Col, Row, Statistic, Table, Tag, Progress } from 'antd'
import { 
  TeamOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ThunderboltOutlined 
} from '@ant-design/icons'

const Dashboard: React.FC = () => {
  // 模拟数据 - 后续会从 API 获取
  const agents = [
    { key: 'boss', name: 'boss', status: 'online', currentTask: 'Phase 1 开发', tasks: 5 },
    { key: 'codex', name: 'codex', status: 'busy', currentTask: '代码开发', tasks: 4 },
    { key: 'aidev', name: 'aidev', status: 'idle', currentTask: '-', tasks: 0 },
    { key: 'review', name: 'review', status: 'idle', currentTask: '-', tasks: 0 },
    { key: 'economy', name: 'economy', status: 'offline', currentTask: '-', tasks: 0 },
  ]

  const tasks = [
    { key: '2', title: 'Phase 1: 创建基础项目结构', status: 'in-progress', priority: 'high', assignee: 'codex' },
    { key: '3', title: 'Phase 2: 实现 Agent 状态监控 API', status: 'pending', priority: 'high', assignee: 'codex' },
    { key: '4', title: 'Phase 3: 实现任务数据同步', status: 'pending', priority: 'high', assignee: 'codex' },
    { key: '5', title: 'Phase 4: 实现数据可视化组件', status: 'pending', priority: 'medium', assignee: 'codex' },
  ]

  const statusColors: Record<string, string> = {
    'in-progress': 'processing',
    'pending': 'default',
    'done': 'success',
  }

  const statusText: Record<string, string> = {
    'in-progress': '进行中',
    'pending': '待开始',
    'done': '已完成',
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

  return (
    <div>
      {/* 关键指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Agent 数量"
              value={5}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃任务"
              value={4}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日完成"
              value={1}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="项目进度"
              value={15}
              suffix="%"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress percent={15} strokeColor="#722ed1" showInfo={false} style={{ marginTop: 8 }} />
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
            { title: '当前任务', dataIndex: 'currentTask', key: 'currentTask', render: (text: string) => <span style={{ color: '#fff' }}>{text}</span> },
            { title: '任务数', dataIndex: 'tasks', key: 'tasks', render: (num: number) => <span style={{ color: '#fff' }}>{num}</span> },
          ]}
          dataSource={agents}
          pagination={false}
          rowKey="key"
        />
      </Card>

      {/* 当前任务 */}
      <Card title="📋 当前任务">
        <Table 
          columns={columns}
          dataSource={tasks}
          pagination={false}
          rowKey="key"
        />
      </Card>
    </div>
  )
}

export default Dashboard
