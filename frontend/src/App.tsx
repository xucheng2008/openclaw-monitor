import { ConfigProvider, Layout, theme } from 'antd'
import Dashboard from './pages/Dashboard'

const { Header, Content } = Layout

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
      <Layout style={{ minHeight: '100vh' }}>
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
          <Dashboard />
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

export default App
