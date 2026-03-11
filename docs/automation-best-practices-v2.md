# 自动化流程最佳实践 v2.0

**更新时间**: 2026-03-11 20:20  
**版本**: 2.0 (基于 10 个问题的经验总结)

---

## 🎯 核心原则

### 1. 子 Agent 不是银弹
- ❌ 不能处理复杂任务
- ✅ 适合简单重复工作
- 🎯 关键任务由 boss 执行

### 2. 明确胜过隐含
- ❌ 依赖自动继承
- ✅ 明确指定 cwd
- ✅ 明确提交流程

### 3. 验证胜过信任
- ❌ 相信子 Agent 汇报
- ✅ 验证 git 提交
- ✅ 检查文件创建

### 4. 小步胜过大步
- ❌ 4-6 小时大任务
- ✅ 15 分钟小任务
- ✅ 快速迭代

### 5. 监控胜过等待
- ❌ 90 分钟后发现
- ✅ 15 分钟检查
- ✅ 实时告警

---

## 📋 子 Agent 使用指南

### ✅ 适合的场景

| 类型 | 说明 | 示例 |
|------|------|------|
| 文件创建 | 创建单个文件 | 创建 auth.ts |
| 简单修改 | 修改现有文件 | 添加 API 端点 |
| 测试编写 | 编写单元测试 | 创建 agents.test.ts |
| 文档更新 | 更新文档 | 修改 README.md |
| 依赖安装 | 安装 npm 包 | npm install prisma |

**特征**:
- ⏱️ 15 分钟内完成
- 📁 影响范围小（1-2 个文件）
- ✅ 结果易验证

### ❌ 不适合的场景

| 类型 | 说明 | 原因 |
|------|------|------|
| 架构设计 | 数据库设计、API 设计 | 需要决策能力 |
| 复杂功能 | 多步骤、多文件 | 容易迷失方向 |
| 关键核心 | 认证、支付等 | 容错率低 |
| 调试修复 | 排查复杂 bug | 需要上下文理解 |

**特征**:
- ⏱️ >30 分钟
- 📁 影响范围大
- ❌ 验证困难

---

## 🔧 标准任务模板

### 任务描述模板

```markdown
## 任务：[简单明确的任务名]

### 工作目录（必须）
`/absolute/path/to/workdir`

### 步骤（≤5 步，≤15 分钟）
1. 步骤 1（具体命令）
2. 步骤 2（具体命令）
3. 步骤 3（具体命令）

### 代码模板（如适用）
```typescript
// 提供完整代码
```

### 强制提交
```bash
git add -A
git commit -m "feat: 功能描述"
git push origin main
```

### 验证
- [ ] 文件已创建
- [ ] git 提交成功
- [ ] 推送成功
```

---

## 🚀 sessions_spawn 标准调用

```javascript
await sessions_spawn({
  agentId: "codex",
  cwd: "/absolute/path/to/workdir", // ✅ 必须
  mode: "run",
  runtime: "subagent",
  task: `
## 任务：创建 JWT 认证服务

### 工作目录
\`/Users/xc/.openclaw/workspace/.../backend\`

### 步骤
1. 创建文件：src/services/auth.ts
2. 写入代码：（提供模板）
3. 提交：git add -A && git commit -m "feat: auth" && git push

### 验证
git log --oneline -1
`,
  timeoutSeconds: 900, // ✅ 15 分钟
  label: "unique-task-id" // ✅ 唯一标识
})
```

---

## ⏰ 监控机制

### 时间检查点

| 时间 | 检查项 | 处理 |
|------|--------|------|
| 5 分钟 | 是否开始执行 | 无动作 |
| 10 分钟 | 是否有进展 | 无动作 |
| 15 分钟 | 是否完成 | ⚠️ 超时告警 |
| 20 分钟 | 是否完成 | ❌ 终止 |

### 验证检查点

```bash
# 每 5 分钟检查
git log --oneline --since="5 minutes ago"
find . -name "*.ts" -type f -newermt "5 minutes ago"
```

### 汇报机制

**子 Agent 汇报频率**: 每 15 分钟

**汇报内容**:
```markdown
## 📊 进度汇报 - [任务名]

进度：XX%
当前：正在 XXX
下一步：XXX
```

---

## 🎯 任务拆分原则

### ❌ 错误示例

```
任务：PostgreSQL 集成（4-6 小时）
- 设计数据库 Schema
- 配置 Prisma ORM
- 创建迁移脚本
- 替换内存存储
- 实现数据清理
```

### ✅ 正确示例

```
任务：创建 Prisma Schema（15 分钟）
1. 安装 Prisma: npm install -D prisma
2. 初始化：npx prisma init
3. 编辑 schema.prisma（提供模板）
4. 提交：git add -A && git commit -m "feat: prisma schema" && git push
```

**规则**:
- ⏱️ 单个任务 ≤ 15 分钟
- 📝 步骤数 ≤ 5 步
- ✅ 每步可验证

---

## 📊 异常处理

### 场景 1: 超时未完成

**处理流程**:
```
15 分钟 → 发送询问
20 分钟 → 要求立即提交
25 分钟 → 终止会话
30 分钟 → boss 手动完成
```

### 场景 2: 虚假汇报

**识别方法**:
```bash
# 对比汇报与实际
git log --oneline --since="10 minutes ago"
find . -name "*.ts" -newermt "10 minutes ago"
```

**处理**: 立即终止，boss 手动完成

### 场景 3: 会话丢失

**识别方法**:
```javascript
sessions_list({ activeMinutes: 30 })
// 返回空列表
```

**处理**: 重新启动任务（更小粒度）

---

## 📈 成功指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 完成率 | >80% | 成功完成/总任务 |
| 按时率 | >90% | 15 分钟内完成 |
| 代码产出 | 100% | 有 git 提交 |
| 验证通过 | 100% | 汇报=实际 |

---

## 🎓 boss 介入时机

**立即介入**:
- ❌ 子 Agent 连续失败 2 次
- ❌ 关键核心功能
- ❌ 时间紧迫（<1 小时 deadline）

**延后介入**:
- ⏳ 第一次尝试（给机会）
- ⏳ 简单任务（<15 分钟）
- ⏳ 非关键功能

---

## 📝 持续改进

### 每周回顾

```markdown
## 子 Agent 使用回顾 - YYYY-MM-DD

### 统计数据
- 总任务数：X
- 成功完成：Y
- 失败：Z
- 成功率：Y/X%

### 问题分析
- 失败原因 1
- 失败原因 2

### 改进措施
- 措施 1
- 措施 2
```

---

## 🔗 相关文档

- [subagent-best-practices.md](./subagent-best-practices.md) - 子 Agent 使用最佳实践
- [task-templates.md](./task-templates.md) - 任务模板库
- [monitoring-guide.md](./monitoring-guide.md) - 监控指南

---

**核心原则**: **子 Agent 是工具，不是银弹。boss 手动执行更可靠！**

**最后更新**: 2026-03-11 20:20  
**版本**: 2.0
