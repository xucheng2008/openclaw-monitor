import { Card, Row, Col, Statistic, Table, Tag, Select, Button, Space, Typography, Progress } from 'antd'
import { ThunderboltOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { Line, Bar, Pie } from '@ant-design/plots'

const { Title } = Typography
const { Option } = Select

const API_BASE = 'http://localhost:8080/api'

interface TokenStats {
  totalTokens: number
  totalCost: number
  byAgent: Record<string, number>
  byModel: Record<string, number>
  trend: any[]
}

const TokenStatsPage: React.FC = () => {
  const [stats, setStats] = useState<TokenStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<string>('24')

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/token/stats?hours=${timeRange}`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('获取 Token 统计失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const syncTokenData = async () => {
    try {
      await fetch(`${API_BASE}/token/sync`, { method: 'POST' })
      fetchStats()
    } catch (error) {
      console.error('同步 Token 数据失败:', error)
    }
  }

  const exportReport = async (format: 'json' | 'csv') => {
    try {
      const res = await fetch(`${API_BASE}/token/export?format=${format}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `token-report-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
    } catch (error) {
      console.error('导出报告失败:', error)
    }
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Title level={2} style={{ color: '#fff' }}>💰 Token 使用统计</Title>
      </div>
    )
  }

  // Agent 分布数据
  const agentData = Object.entries(stats.byAgent).map(([agent, tokens]) => ({
    type: agent,
    value: tokens,
  }))

  // 趋势数据
  const trendData = stats.trend.map((t: any) => ({
    time: new Date(t.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    tokens: t.totalTokens,
  }))

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>💰 Token 使用统计</Title>
        <Space>
          <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}>
            <Option value="1">最近 1 小时</Option>
            <Option value="24">最近 24 小时</Option>
            <Option value="168">最近 7 天</Option>
            <Option value="720">最近 30 天</Option>
          </Select>
          <Button onClick={syncTokenData}>同步数据</Button>
          <Button onClick={() => exportReport('csv')}>导出 CSV</Button>
          <Button onClick={() => exportReport('json')}>导出 JSON</Button>
        </Space>
      </div>

      {/* 关键指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总 Token 数"
              value={stats.totalTokens}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1677ff' }}
              suffix="tokens"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总成本"
              value={stats.totalCost}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="元"
              precision={4}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Agent 数量"
              value={Object.keys(stats.byAgent).length}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="📊 Agent Token 使用分布">
            <Pie
              data={agentData}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{
                type: 'outer',
                content: '{name} {percentage}',
              }}
              interactions={[{ type: 'element-active' }]}
              color={['#1677ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96']}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="📈 Token 使用趋势">
            <Line
              data={trendData}
              xField="time"
              yField="tokens"
              point={{ size: 5, shape: 'circle' }}
              xAxis={{
                label: {
                  autoRotate: true,
                  autoHide: false,
                },
              }}
              yAxis={{
                label: {
                  formatter: (value) => `${(value / 1000).toFixed(0)}k`,
                },
              }}
              color="#1677ff"
            />
          </Card>
        </Col>
      </Row>

      {/* Agent 详情表格 */}
      <Card title="📋 Agent Token 使用详情">
        <Table
          columns={[
            {
              title: 'Agent',
              dataIndex: 'agent',
              key: 'agent',
              render: (agent: string) => <span style={{ color: '#fff' }}>{agent}</span>,
            },
            {
              title: 'Token 数',
              dataIndex: 'tokens',
              key: 'tokens',
              render: (tokens: number) => <span style={{ color: '#fff' }}>{tokens.toLocaleString()}</span>,
              sorter: (a: any, b: any) => a.tokens - b.tokens,
            },
            {
              title: '占比',
              dataIndex: 'percentage',
              key: 'percentage',
              render: (percentage: number) => (
                <Progress percent={Math.round(percentage * 100)} size="small" />
              ),
            },
          ]}
          dataSource={Object.entries(stats.byAgent).map(([agent, tokens]) => ({
            key: agent,
            agent,
            tokens,
            percentage: tokens / stats.totalTokens,
          })).sort((a, b) => b.tokens - a.tokens)}
          pagination={false}
          rowKey="agent"
        />
      </Card>
    </div>
  )
}

export default TokenStatsPage
