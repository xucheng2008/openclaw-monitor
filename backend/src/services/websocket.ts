/**
 * WebSocket 服务
 * 实时推送 Agent 状态和任务数据更新
 */

import { WebSocketServer, WebSocket } from 'ws'
import { getAgents, getTasks, getStats } from './openclaw'
import type { Server } from 'http'

export class WebSocketService {
  private wss: WebSocketServer | null = null
  private clients: Set<WebSocket> = new Set()
  private interval: NodeJS.Timeout | null = null
  private lastData: any = null

  /**
   * 初始化 WebSocket 服务
   */
  init(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' })

    this.wss.on('connection', (ws) => {
      this.clients.add(ws)

      // 发送初始数据
      this.sendInitialData(ws)

      ws.on('close', () => {
        this.clients.delete(ws)
      })

      ws.on('error', (error) => {
        this.clients.delete(ws)
      })
    })

    // 定时推送数据更新 - 每 10 秒
    this.startDataPush()
  }

  /**
   * 发送初始数据
   */
  private async sendInitialData(ws: WebSocket) {
    try {
      const [agents, tasks, stats] = await Promise.all([
        getAgents(),
        getTasks(),
        getStats(),
      ])

      ws.send(JSON.stringify({
        type: 'init',
        data: { agents, tasks, stats },
      }))
    } catch (error) {
      // Ignore errors in test environment
    }
  }

  /**
   * 启动数据推送
   */
  private startDataPush() {
    setInterval(async () => {
      try {
        const [agents, tasks, stats] = await Promise.all([
          getAgents(),
          getTasks(),
          getStats(),
        ])

        const currentData = { agents, tasks, stats }

        // 检查数据是否有变化
        if (this.hasDataChanged(currentData)) {
          this.broadcast({
            type: 'update',
            data: currentData,
          })
          this.lastData = currentData
        }
      } catch (error) {
        // Ignore errors in test environment
      }
    }, 10000) // 每 10 秒检查一次
  }

  /**
   * 检查数据是否变化
   */
  private hasDataChanged(current: any): boolean {
    if (!this.lastData) return true

    // 检查 Agent 状态变化
    const agentsChanged = JSON.stringify(current.agents) !== JSON.stringify(this.lastData.agents)
    if (agentsChanged) return true

    // 检查任务状态变化
    const tasksChanged = JSON.stringify(current.tasks) !== JSON.stringify(this.lastData.tasks)
    if (tasksChanged) return true

    return false
  }

  /**
   * 广播消息给所有客户端
   */
  broadcast(message: any) {
    const data = JSON.stringify(message)
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }

  /**
   * 发送通知消息
   */
  sendNotification(type: string, data: any) {
    this.broadcast({
      type: 'notification',
      notification: { type, data },
    })
  }

  /**
   * 关闭服务
   */
  close() {
    if (this.interval) {
      clearInterval(this.interval)
    }
    if (this.wss) {
      this.wss.close()
    }
    this.clients.clear()
  }
}

// 导出单例
export const wsService = new WebSocketService()