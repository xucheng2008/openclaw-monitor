import { Request, Response, NextFunction } from 'express'

interface PerformanceMetrics {
  path: string
  method: string
  statusCode: number
  duration: number
  timestamp: string
}

let metrics: PerformanceMetrics[] = []
const SLOW_THRESHOLD = 1000 // 1 秒

export function performanceLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const metric: PerformanceMetrics = {
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString()
    }
    
    // 记录指标
    metrics.push(metric)
    
    // 保留最近 1000 条记录
    if (metrics.length > 1000) {
      metrics.shift()
    }
    
    // 标准日志
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`)
    
    // 慢请求警告
    if (duration > SLOW_THRESHOLD) {
      console.warn(`⚠️ 慢请求警告：${req.path} - ${duration}ms`)
    }
  })
  
  next()
}

// 获取性能指标 API
export function getMetrics(): PerformanceMetrics[] {
  return metrics
}

// 获取慢请求
export function getSlowRequests(threshold: number = SLOW_THRESHOLD): PerformanceMetrics[] {
  return metrics.filter(m => m.duration > threshold)
}