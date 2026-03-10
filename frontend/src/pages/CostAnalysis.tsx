import { Card, Row, Col, Table, Tag, Button, Space, Typography, DatePicker, Statistic } from 'antd'
import { DollarOutlined, TrendUpOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { Column, Line, Area } from '@ant-design/plots'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker

const API_BASE = 'http://localhost:8080/api'

interface CostData {
  agent: string
  model: string
  tokens: number
  cost: number
  date: string
}

interface CostStats {
  totalCost: number
  byAgent: Record<string, number>
  byModel: Record<string, number>
  dailyTrend: { date: string; cost: number }[]
  projection: number
}

const CostAnalysis: React.FC = () => {
  const [stats, setStats] = useState<CostStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<[any, any]>([dayjs().subtract(7, 'day'), dayjs()])

  const fetchStats = async () => {
    try {
      setLoading(true)
      // 模拟数据（后续连接真实 API）
      const mockStats: CostStats = {
        totalCost: 125.6789,
        byAgent: {
          boss: 45.23,
          codex: 52.18,
          aidev: 18.45,
          review: 7.82,
          economy: 2.00,
        },
        byModel: {
          'qwen3.5-plus': 78.45,
          'qwen3-coder-plus': 35.23,
          'qwen3-max-2026-01-23': 10.00,
          'glm-4.7': 2.00,
        },
        dailyTrend: [
          { date: '2026-03-04', cost: 15.23 },
          { date: '2026-03-05', cost: 18.45 },
          { date: '2026-03-06', cost: 12.67 },
          { date: '2026-03-07', cost: 20.12 },
          { date: '2026-03-08', cost: 17.89 },
          { date: '2026-03-09', cost: 22.34 },
          { date: '2026-03-10', cost: 18.97 },
        ],
        projection: 380.00,
      }
      setStats(mockStats)
    } catch (error) {
      console.error('获取成本数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const exportReport = async () => {
    try {
      const res = await fetch(`${API_BASE}/token/export?format=csv`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cost-report-${dayjs().format('YYYY-MM-DD')}.csv`
      a.click()
    } catch (error) {
      console.error('导出报告失败:', error)
    }
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Title level={2} style={{ color: '#fff' }}>💰 成本分析</Title>
      </div>
    )
  }

  // Agent 成本数据
  const agentData = Object.entries(stats.byAgent).map(([agent, cost]) => ({
    agent,
    cost: Number(cost.toFixed(2)),
  }))

  // 模型成本数据
  const modelData = Object.entries(stats.byModel).map(([model, cost]) => ({
    model: model.replace('qwen', 'Qwen').replace('glm', 'GLM'),
    cost: Number(cost.toFixed(2)),
  }))

  // 趋势数据
  const trendData = stats.dailyTrend.map(d => ({
    date: d.date.slice(5), // MM-DD
    cost: Number(d.cost.toFixed(2)),
  }))

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>💰 成本分析图表</Title>
        <Space>
          <RangePicker value={dateRange} onChange={(dates) => dates && setDateRange(dates as any)} />
          <Button onClick={exportReport}>导出报表</Button>
        </Space>
      </div>

      {/* 关键指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总成本"
              value={stats.totalCost}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="元"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="日均成本"
              value={stats.totalCost / 7}
              prefix={<TrendUpOutlined />}
              valueStyle={{ color: '#1677ff' }}
              suffix="元/天"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月预算"
              value={500}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="预计月度"
              value={stats.projection}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="元"
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      {/* 预算进度 */}
      <Card title="📊 预算使用进度" style={{ marginBottom: 24 }}>
        <div style={{ padding: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#fff' }}>已使用</span>
            <span style={{ color: '#fff' }}>{((stats.totalCost / 500) * 100).toFixed(1)}%</span>
          </div>
          <div style={{ background: '#333', borderRadius: 10, height: 20, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min((stats.totalCost / 500) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #52c41a 0%, #1677ff 100%)',
                height: '100%',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
            剩余预算：{(500 - stats.totalCost).toFixed(2)} 元
          </div>
        </div>
      </Card>

      {/* 图表 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="📈 每日成本趋势">
            <Area
              data={trendData}
              xField="date"
              yField="cost"
              xAxis={{
                label: {
                  autoRotate: true,
                  autoHide: false,
                },
              }}
              yAxis={{
                label: {
                  formatter: (value) => `¥${value}`,
                },
              }}
              areaStyle={{
                fill: 'l(270) 0:#1677ff 1:#1677ff00',
              }}
              line={{
                size: 2,
                color: '#1677ff',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="📊 Agent 成本对比">
            <Column
              data={agentData}
              xField="agent"
              yField="cost"
              yAxis={{
                label: {
                  formatter: (value) => `¥${value}`,
                },
              }}
              columnWidthRatio={0.5}
              color={({ agent }: any) => {
                const colors: Record<string, string> = {
                  boss: '#1677ff',
                  codex: '#52c41a',
                  aidev: '#faad14',
                  review: '#722ed1',
                  economy: '#eb2f96',
                }
                return colors[agent] || '#888'
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="📊 模型成本对比">
            <Column
              data={modelData}
              xField="model"
              yField="cost"
              yAxis={{
                label: {
                  formatter: (value) => `¥${value}`,
                },
              }}
              columnWidthRatio={0.5}
              color="#1677ff"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="📋 成本详情">
            <Table
              columns={[
                {
                  title: 'Agent',
                  dataIndex: 'agent',
                  key: 'agent',
                  render: (agent: string) => <span style={{ color: '#fff' }}>{agent}</span>,
                },
                {
                  title: '成本',
                  dataIndex: 'cost',
                  key: 'cost',
                  render: (cost: number) => <span style={{ color: '#52c41a' }}>¥{cost.toFixed(2)}</span>,
                  sorter: (a: any, b: any) => a.cost - b.cost,
                },
                {
                  title: '占比',
                  dataIndex: 'percentage',
                  key: 'percentage',
                  render: (percentage: number) => (
                    <span style={{ color: '#fff' }}>{(percentage * 100).toFixed(1)}%</span>
                  ),
                },
              ]}
              dataSource={agentData.map(item => ({
                key: item.agent,
                agent: item.agent,
                cost: item.cost,
                percentage: item.cost / stats.totalCost,
              })).sort((a, b) => b.cost - a.cost)}
              pagination={false}
              rowKey="agent"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CostAnalysis
