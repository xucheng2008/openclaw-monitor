import { Card, Table, Tag, Button, Space, Typography, Badge, Modal, Form, Input, InputNumber, Select, Switch, Checkbox } from 'antd'
import { BellOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'

const { Title } = Typography
const { Option } = Select

const API_BASE = 'http://localhost:8080/api'

interface Alert {
  id: string
  type: string
  level: string
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
}

interface AlertRule {
  id: string
  name: string
  type: string
  enabled: boolean
  threshold: number
  condition: string
  channels: string[]
  cooldownMinutes: number
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [rules, setRules] = useState<AlertRule[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE}/alerts?limit=50`)
      const data = await res.json()
      setAlerts(data)
    } catch (error) {
      console.error('获取告警失败:', error)
    }
  }

  const fetchRules = async () => {
    try {
      const res = await fetch(`${API_BASE}/alerts/rules`)
      const data = await res.json()
      setRules(data)
    } catch (error) {
      console.error('获取规则失败:', error)
    }
  }

  useEffect(() => {
    fetchAlerts()
    fetchRules()
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [])

  const acknowledgeAlert = async (id: string) => {
    try {
      await fetch(`${API_BASE}/alerts/${id}/acknowledge`, { method: 'POST' })
      fetchAlerts()
    } catch (error) {
      console.error('确认告警失败:', error)
    }
  }

  const addRule = async (values: any) => {
    try {
      await fetch(`${API_BASE}/alerts/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      setModalVisible(false)
      form.resetFields()
      fetchRules()
    } catch (error) {
      console.error('添加规则失败:', error)
    }
  }

  const deleteRule = async (id: string) => {
    try {
      await fetch(`${API_BASE}/alerts/rules/${id}`, { method: 'DELETE' })
      fetchRules()
    } catch (error) {
      console.error('删除规则失败:', error)
    }
  }

  const levelColors: Record<string, string> = {
    info: 'blue',
    warning: 'orange',
    error: 'red',
    critical: 'purple',
  }

  const typeTexts: Record<string, string> = {
    token_limit: 'Token 超限',
    task_timeout: '任务超时',
    agent_offline: 'Agent 离线',
    custom: '自定义',
  }

  const alertColumns = [
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
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <span style={{ color: '#fff' }}>{typeTexts[type] || type}</span>,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <span style={{ color: '#fff', fontWeight: 'bold' }}>{title}</span>,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (message: string) => <span style={{ color: '#fff' }}>{message}</span>,
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (ts: string) => new Date(ts).toLocaleString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'acknowledged',
      key: 'acknowledged',
      width: 100,
      render: (acknowledged: boolean, record: Alert) => (
        <Space>
          {acknowledged ? (
            <Tag color="green"><CheckCircleOutlined /> 已确认</Tag>
          ) : (
            <Button size="small" onClick={() => acknowledgeAlert(record.id)}>
              确认
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const ruleColumns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ color: '#fff' }}>{name}</span>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <span style={{ color: '#fff' }}>{typeTexts[type] || type}</span>,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'gray'}>{enabled ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '条件',
      key: 'condition',
      width: 150,
      render: (_: any, record: AlertRule) => (
        <span style={{ color: '#fff' }}>
          {record.condition} {record.threshold}
        </span>
      ),
    },
    {
      title: '通知渠道',
      dataIndex: 'channels',
      key: 'channels',
      width: 150,
      render: (channels: string[]) => (
        <Space size={4}>
          {channels.map(c => (
            <Tag key={c} color="blue">{c}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '冷却时间',
      dataIndex: 'cooldownMinutes',
      key: 'cooldownMinutes',
      width: 100,
      render: (min: number) => <span style={{ color: '#fff' }}>{min}分钟</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: AlertRule) => (
        <Button danger size="small" onClick={() => deleteRule(record.id)}>
          删除
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>🚨 告警中心</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          添加规则
        </Button>
      </div>

      {/* 未确认告警统计 */}
      <Card title="🔔 未确认告警" style={{ marginBottom: 24 }}>
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Badge count={alerts.filter(a => !a.acknowledged).length} overflowCount={999} size="preset">
            <BellOutlined style={{ fontSize: 48, color: '#faad14' }} />
          </Badge>
          <div style={{ marginTop: 16, color: '#fff', fontSize: 18 }}>
            {alerts.filter(a => !a.acknowledged).length} 条未确认告警
          </div>
        </div>
      </Card>

      {/* 告警列表 */}
      <Card title="📋 告警列表" style={{ marginBottom: 24 }}>
        <Table
          columns={alertColumns}
          dataSource={alerts.map(a => ({ ...a, key: a.id }))}
          pagination={{ pageSize: 10 }}
          loading={loading}
          rowKey="id"
        />
      </Card>

      {/* 告警规则 */}
      <Card title="⚙️ 告警规则">
        <Table
          columns={ruleColumns}
          dataSource={rules.map(r => ({ ...r, key: r.id }))}
          pagination={false}
          rowKey="id"
        />
      </Card>

      {/* 添加规则弹窗 */}
      <Modal
        title="添加告警规则"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={addRule}>
          <Form.Item name="name" label="规则名称" rules={[{ required: true }]}>
            <Input placeholder="例如：Token 使用超限告警" />
          </Form.Item>
          <Form.Item name="type" label="告警类型" rules={[{ required: true }]}>
            <Select>
              <Option value="token_limit">Token 超限</Option>
              <Option value="task_timeout">任务超时</Option>
              <Option value="agent_offline">Agent 离线</Option>
              <Option value="custom">自定义</Option>
            </Select>
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item name="condition" label="条件" rules={[{ required: true }]}>
            <Select>
              <Option value="gt">大于 (>)</Option>
              <Option value="lt">小于 (<)</Option>
              <Option value="eq">等于 (=)</Option>
              <Option value="gte">大于等于 (≥)</Option>
              <Option value="lte">小于等于 (≤)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="threshold" label="阈值" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="例如：10000" />
          </Form.Item>
          <Form.Item name="channels" label="通知渠道">
            <Checkbox.Group>
              <Checkbox value="email">邮件</Checkbox>
              <Checkbox value="webhook">Webhook</Checkbox>
              <Checkbox value="feishu">飞书</Checkbox>
              <Checkbox value="dingtalk">钉钉</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item name="cooldownMinutes" label="冷却时间（分钟）" initialValue={60}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Alerts
