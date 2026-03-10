import { Card, Table, Tag, Select, Space, Button, Input, Typography } from 'antd'
import { ReloadOutlined, ClearOutlined } from '@ant-design/icons'
import { useState, useEffect, useRef } from 'react'

const { Title } = Typography
const { Option } = Select

const API_BASE = 'http://localhost:8080/api'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  agent: string
  message: string
  source: string
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '100',
        ...(levelFilter !== 'all' && { level: levelFilter }),
        ...(agentFilter !== 'all' && { agent: agentFilter }),
      })
      
      const res = await fetch(`${API_BASE}/logs?${params}`)
      if (!res.ok) throw new Error('Failed to fetch logs')
      
      const data = await res.json()
      setLogs(data)
    } catch (error) {
      console.error('获取日志失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [levelFilter, agentFilter])

  // 自动滚动到最新日志
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const levelColors: Record<string, string> = {
    info: 'blue',
    warn: 'orange',
    error: 'red',
    debug: 'gray',
  }

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (ts: string) => new Date(ts).toLocaleString('zh-CN'),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => (
        <Tag color={levelColors[level]}>{level.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Agent',
      dataIndex: 'agent',
      key: 'agent',
      width: 100,
      render: (agent: string) => <span style={{ color: '#fff' }}>{agent}</span>,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      render: (text: string) => <span style={{ color: '#fff', fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: string) => <span style={{ color: '#fff' }}>{source}</span>,
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>📜 实时日志流</Title>
        <Space>
          <Select
            value={levelFilter}
            onChange={setLevelFilter}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '所有级别' },
              { value: 'info', label: 'Info' },
              { value: 'warn', label: 'Warn' },
              { value: 'error', label: 'Error' },
              { value: 'debug', label: 'Debug' },
            ]}
          />
          <Select
            value={agentFilter}
            onChange={setAgentFilter}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '所有 Agent' },
              { value: 'boss', label: 'boss' },
              { value: 'codex', label: 'codex' },
              { value: 'aidev', label: 'aidev' },
              { value: 'review', label: 'review' },
              { value: 'economy', label: 'economy' },
              { value: 'system', label: 'system' },
            ]}
          />
          <Button onClick={() => setAutoScroll(!autoScroll)}>
            {autoScroll ? '⏸️ 暂停滚动' : '▶️ 继续滚动'}
          </Button>
          <Button onClick={fetchLogs} loading={loading}>
            <ReloadOutlined /> 刷新
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={logs.map(log => ({ ...log, key: log.id }))}
          pagination={{ pageSize: 50, showSizeChanger: true }}
          loading={loading}
          rowKey="id"
        />
        <div ref={logsEndRef} />
      </Card>
    </div>
  )
}

export default Logs
