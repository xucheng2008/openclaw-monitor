import request from 'supertest'
import { app } from '../index'

describe('API 性能测试', () => {
  test('/api/agents 响应时间 <100ms', async () => {
    const start = Date.now()
    await request(app).get('/api/agents')
    const duration = Date.now() - start
    expect(duration).toBeLessThan(100)
  })
  
  test('/api/tasks 响应时间 <100ms（缓存命中）', async () => {
    // 先预热缓存
    await request(app).get('/api/tasks')
    
    const start = Date.now()
    await request(app).get('/api/tasks')
    const duration = Date.now() - start
    expect(duration).toBeLessThan(100)
  })
  
  test('/api/stats 响应时间 <100ms（缓存命中）', async () => {
    const start = Date.now()
    await request(app).get('/api/stats')
    const duration = Date.now() - start
    expect(duration).toBeLessThan(100)
  })
})