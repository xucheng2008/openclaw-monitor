import { ConfigProvider, Layout, theme, Menu } from 'antd'
import { DashboardOutlined, FileTextOutlined, BarChartOutlined, DollarOutlined, TrophyOutlined, BellOutlined } from '@ant-design/icons'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Logs from './pages/Logs'
import TaskDetail from './pages/TaskDetail'
import TokenStats from './pages/TokenStats'
import CostAnalysis from './pages/CostAnalysis'
import EfficiencyReport from './pages/EfficiencyReport'
import Alerts from './pages/Alerts'

const { Header, Content, Sider } = Layout

const Navigation: React.FC = () => {
  const location = useLocation()

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/logs',
      icon: <FileTextOutlined />,
      label: <Link to="/logs">日志流</Link>,
    },
    {
      key: '/tasks',
      icon: <BarChartOutlined />,
      label: <Link to="/tasks">任务列表</Link>,
    },
    {
      key: '/token-stats',
      icon: <DollarOutlined />,
      label: <Link to="/token-stats">Token 统计</Link>,
    },
    {
      key: '/cost-analysis',
      icon: <DollarOutlined />,
      label: <Link to="/cost-analysis">成本分析</Link>,
    },
    {
      key: '/efficiency',
      icon: <TrophyOutlined />,
      label: <Link to="/efficiency">效率报表</Link>,
    },
    {
      key: '/alerts',
      icon: <BellOutlined />,
      label: <Link to="/alerts">告警中心</Link>,
    },
  ]

  return (
    <Sider width={200} theme="dark">
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
      />
    </Sider>
  )
}

function AppContent() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navigation />
      <Layout>
        <Header style={{ 
          background: '#001529', 
          display: 'flex', 
          alignItems: 'center',
          padding: '0 24px'
        }}>
          <h1 style={{ margin: 0, color: '#fff', fontSize: '20px' }}>
            📊 OpenClaw Monitor
          </h1>
        </Header>
        <Content style={{ padding: '24px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/tasks" element={<Dashboard />} />
            <Route path="/token-stats" element={<TokenStats />} />
            <Route path="/cost-analysis" element={<CostAnalysis />} />
            <Route path="/efficiency" element={<EfficiencyReport />} />
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
