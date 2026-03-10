# OpenClaw Monitor 📊

> OpenClaw 的可视化监控面板 - 监控 Agent 状态、任务追踪和数据分析

[![Status](https://img.shields.io/badge/status-active-development)](https://github.com/xucheng2008/openclaw-monitor)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎯 项目愿景

让 OpenClaw Agent 的工作完全透明化，提供实时的监控、任务追踪和数据分析能力。

## ✨ 核心功能

### 📊 Dashboard 总览
- 关键指标卡片（Agent 数量、活跃任务、完成率等）
- 任务状态分布图
- 实时活动流
- 告警通知

### 🤖 Agent 监控
- 实时状态（在线/离线/忙碌）
- 当前任务追踪
- 历史表现统计
- Token 使用分析

### 📋 任务管理
- 任务列表和筛选
- 任务详情和时间线
- 子任务关系展示
- 进度追踪

### 📈 数据分析
- 历史趋势图
- 效率对比
- 成本统计
- 导出报告

## 🚀 快速开始

### 开发环境

```bash
# 克隆项目
git clone https://github.com/xucheng2008/openclaw-monitor.git
cd openclaw-monitor

# 安装前端依赖
cd frontend
npm install
npm run dev

# 安装后端依赖
cd ../backend
npm install
npm run dev
```

### 生产部署

```bash
# 构建
npm run build

# 启动
npm run start
```

## 📐 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **UI 库**: Ant Design 5.x
- **图表**: Recharts
- **构建工具**: Vite 5.x
- **状态管理**: Zustand

### 后端
- **运行时**: Node.js 20+
- **框架**: Express
- **数据库**: PostgreSQL + Redis
- **ORM**: Prisma
- **实时通信**: WebSocket

### 数据源
- OpenClaw API
- GitHub API
- 本地文件系统

## 📁 项目结构

```
openclaw-monitor/
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── components/   # 可复用组件
│   │   ├── pages/        # 页面组件
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── stores/       # 状态管理
│   │   └── utils/        # 工具函数
│   └── package.json
│
├── backend/              # 后端服务
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   ├── services/     # 业务逻辑
│   │   ├── models/       # 数据模型
│   │   └── utils/        # 工具函数
│   └── package.json
│
├── docs/                 # 文档
└── README.md
```

## 🗺️ 开发路线图

### Phase 1 - 基础监控 (当前)
- [x] 项目初始化
- [ ] Dashboard 总览
- [ ] Agent 状态监控
- [ ] 基础统计图表

### Phase 2 - 实时追踪
- [ ] WebSocket 实时推送
- [ ] 实时日志流
- [ ] 任务进度追踪

### Phase 3 - 数据分析
- [ ] Token 使用统计
- [ ] 成本分析
- [ ] 效率对比

### Phase 4 - 告警通知
- [ ] 告警规则配置
- [ ] 超时检测
- [ ] 通知推送

## 🤝 参与贡献

我们欢迎各种形式的贡献！

### 开发流程

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 任务领取

查看 [Issues](https://github.com/xucheng2008/openclaw-monitor/issues) 中标记为 `good first issue` 或 `help wanted` 的任务。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

- **项目地址**: https://github.com/xucheng2008/openclaw-monitor
- **问题反馈**: https://github.com/xucheng2008/openclaw-monitor/issues
- **讨论区**: https://github.com/xucheng2008/openclaw-monitor/discussions

## 🙏 致谢

感谢 OpenClaw 团队提供的强大基础设施！

---

<div align="center">

**Made with ❤️ by OpenClaw Community**

[⭐ Star this repo](https://github.com/xucheng2008/openclaw-monitor) if you like it!

</div>
