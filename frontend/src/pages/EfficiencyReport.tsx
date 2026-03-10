import { Card, Row, Col, Table, Tag, Progress, Typography, Space, Rate } from 'antd'
import { TrophyOutlined, ClockCircleOutlined, CheckCircleOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { Radar, Column } from '@ant-design/plots'

const { Title } = Typography

interface AgentEfficiency {
  agent: string
  tasksCompleted: number
  avgCompletionTime: number // 小时
  completionRate: number // 百分比
  qualityScore: number // 1-5
  tokenEfficiency: number // tokens/任务
}

const EfficiencyReport: React.FC = () => {
  const [data, setData] = useState<AgentEfficiency[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 模拟数据
    const mockData: AgentEfficiency[] = [
      {
        agent: 'boss',
        tasksCompleted: 15,
        avgCompletionTime: 2.5,
        completionRate: 95,
        qualityScore: 4.8,
        tokenEfficiency: 8500,
      },
      {
        agent: 'codex',
        tasksCompleted: 28,
        avgCompletionTime: 1.8,
        completionRate: 92,
        qualityScore: 4.5,
        tokenEfficiency: 12000,
      },
      {
        agent: 'aidev',
        tasksCompleted: 22,
        avgCompletionTime: 1.2,
        completionRate: 88,
        qualityScore: 4.2,
        tokenEfficiency: 6500,
      },
      {
        agent: 'review',
        tasksCompleted: 18,
        avgCompletionTime: 0.8,
        completionRate: 98,
        qualityScore: 4.9,
        tokenEfficiency: 3200,
      },
      {
        agent: 'economy',
        tasksCompleted: 8,
        avgCompletionTime: 3.5,
        completionRate: 85,
        qualityScore: 4.0,
        tokenEfficiency: 5000,
      },
    ]
    setData(mockData)
  }, [])

  // 雷达图数据
  const radarData = data.flatMap(agent => [
    { item: '任务完成', score: agent.tasksCompleted / 30 * 100, user: agent.agent },
    { item: '完成速度', score: (5 - agent.avgCompletionTime / 5) * 20, user: agent.agent },
    { item: '完成率', score: agent.completionRate, user: agent.agent },
    { item: '质量评分', score: agent.qualityScore * 20, user: agent.agent },
    { item: 'Token 效率', score: 100 - (agent.tokenEfficiency / 15000 * 100), user: agent.agent },
  ])

  // 排行榜数据
  const leaderboard = [...data].sort((a, b) => {
    const scoreA = a.tasksCompleted * a.completionRate * a.qualityScore
    const scoreB = b.tasksCompleted * b.completionRate * b.qualityScore
    return scoreB - scoreA
  })

  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => {
        const icons = ['🥇', '🥈', '🥉']
        return <span style={{ fontSize: 20 }}>{icons[rank - 1] || `#${rank}`}</span>
      },
    },
    {
      title: 'Agent',
      dataIndex: 'agent',
      key: 'agent',
      render: (agent: string) => (
        <span style={{ color: '#fff', fontWeight: 'bold' }}>{agent}</span>
      ),
    },
    {
      title: '完成任务',
      dataIndex: 'tasksCompleted',
      key: 'tasksCompleted',
      render: (num: number) => (
        <span style={{ color: '#1677ff' }}>{num}</span>
      ),
      sorter: (a: any, b: any) => a.tasksCompleted - b.tasksCompleted,
    },
    {
      title: '平均耗时',
      dataIndex: 'avgCompletionTime',
      key: 'avgCompletionTime',
      render: (hours: number) => (
        <span style={{ color: '#faad14' }}>{hours.toFixed(1)}h</span>
      ),
      sorter: (a: any, b: any) => a.avgCompletionTime - b.avgCompletionTime,
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          strokeColor={{
            '0%': rate >= 90 ? '#52c41a' : rate >= 80 ? '#faad14' : '#ff4d4f',
            '100%': rate >= 90 ? '#95de64' : rate >= 80 ? '#ffd591' : '#ff7875',
          }}
        />
      ),
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      render: (score: number) => <Rate disabled defaultValue={score} character={<TrophyOutlined />} style={{ fontSize: 14 }} />,
    },
    {
      title: 'Token 效率',
      dataIndex: 'tokenEfficiency',
      key: 'tokenEfficiency',
      render: (tokens: number) => (
        <span style={{ color: '#722ed1' }}>{(tokens / 1000).toFixed(1)}k/任务</span>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>🏆 效率对比报表</Title>
      </div>

      {/* 总览卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总完成任务"
              value={data.reduce((sum, a) => sum + a.tasksCompleted, 0)}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均完成时间"
              value={data.reduce((sum, a) => sum + a.avgCompletionTime, 0) / data.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1677ff' }}
              suffix="小时"
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均完成率"
              value={data.reduce((sum, a) => sum + a.completionRate, 0) / data.length}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均质量评分"
              value={data.reduce((sum, a) => sum + a.qualityScore, 0) / data.length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* 雷达图 */}
      <Card title="📊 Agent 能力雷达图" style={{ marginBottom: 24 }}>
        <Radar
          data={radarData}
          xField="item"
          yField="score"
          seriesField="user"
          meta={{
            score: {
              alias: '得分',
              min: 0,
              max: 100,
            },
          }}
          xAxis={{
            line: null,
            tickLine: null,
            grid: {
              line: {
                style: {
                  lineDash: null,
                },
              },
            },
          }}
          yAxis={{
            line: null,
            tickLine: null,
            grid: {
              line: {
                type: 'line',
                style: {
                  lineDash: null,
                },
              },
            },
          }}
          legend={{
            position: 'bottom',
          }}
          color={['#1677ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96']}
        />
      </Card>

      {/* 排行榜 */}
      <Card title="🏆 Agent 效率排行榜">
        <Table
          columns={columns}
          dataSource={leaderboard.map((agent, index) => ({
            ...agent,
            key: agent.agent,
            rank: index + 1,
          }))}
          pagination={false}
          rowKey="agent"
          size="middle"
        />
      </Card>
    </div>
  )
}

export default EfficiencyReport
