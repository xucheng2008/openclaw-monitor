# 子 Agent 任务模板库

## 📋 文件创建类

### 模板 1: 创建 TypeScript 服务文件

```markdown
## 任务：创建 [服务名] 服务

### 工作目录
`/Users/xc/.openclaw/workspace/agents-workspace/boss/github-automation/scripts/openclaw-monitor/backend`

### 步骤（10 分钟）
1. 创建目录（如需要）：`mkdir -p src/services/[name]`
2. 创建文件：`src/services/[name]/[name].ts`
3. 写入代码（见下方模板）
4. 提交：`git add -A && git commit -m "feat: add [name] service" && git push`

### 代码模板
```typescript
// src/services/[name]/[name].ts

export interface [Name]Config {
  // 配置项
}

export class [Name]Service {
  private config: [Name]Config;

  constructor(config: [Name]Config) {
    this.config = config;
  }

  async execute(): Promise<boolean> {
    // 实现逻辑
    return true;
  }
}
```

### 验证
- [ ] 文件已创建
- [ ] git 提交成功
- [ ] 推送成功
```

---

### 模板 2: 创建单元测试文件

```markdown
## 任务：创建 [模块] 单元测试

### 工作目录
`/Users/xc/.openclaw/workspace/agents-workspace/boss/github-automation/scripts/openclaw-monitor/backend`

### 步骤（15 分钟）
1. 创建测试文件：`src/__tests__/[module].test.ts`
2. 编写测试用例（见下方模板）
3. 运行测试：`npm test -- [module].test.ts`
4. 提交：`git add -A && git commit -m "test: add [module] tests" && git push`

### 测试模板
```typescript
// src/__tests__/[module].test.ts

import { [ModuleName] } from '../services/[module]';

describe('[ModuleName]', () => {
  let service: [ModuleName];

  beforeEach(() => {
    service = new [ModuleName]();
  });

  test('should create instance', () => {
    expect(service).toBeDefined();
  });

  test('should execute successfully', async () => {
    const result = await service.execute();
    expect(result).toBe(true);
  });
});
```

### 验证
- [ ] 测试文件已创建
- [ ] 测试通过
- [ ] git 提交成功
```

---

## 📝 文件修改类

### 模板 3: 添加 API 路由

```markdown
## 任务：添加 [功能] API 路由

### 工作目录
`/Users/xc/.openclaw/workspace/agents-workspace/boss/github-automation/scripts/openclaw-monitor/backend`

### 步骤（15 分钟）
1. 编辑文件：`src/index.ts`
2. 添加路由代码（见下方）
3. 测试：`npm run dev`（手动验证）
4. 提交：`git add -A && git commit -m "feat: add [feature] API" && git push`

### 代码模板
```typescript
// 添加到 src/index.ts

app.get('/api/[feature]', (req, res) => {
  try {
    // 实现逻辑
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ error: 'Error message' });
  }
});
```

### 验证
- [ ] 路由已添加
- [ ] 测试通过
- [ ] git 提交成功
```

---

## 📦 依赖管理类

### 模板 4: 安装 npm 依赖

```markdown
## 任务：安装 [包名] 依赖

### 工作目录
`/Users/xc/.openclaw/workspace/agents-workspace/boss/github-automation/scripts/openclaw-monitor/backend`

### 步骤（5 分钟）
1. 安装：`npm install [package-name]`
2. 安装类型定义（如需要）：`npm install -D @types/[package-name]`
3. 验证：`npm list [package-name]`
4. 提交：`git add -A && git commit -m "chore: add [package-name] dependency" && git push`

### 验证
- [ ] 依赖已安装
- [ ] package.json 已更新
- [ ] git 提交成功
```

---

## 📚 文档更新类

### 模板 5: 更新 README

```markdown
## 任务：更新 README 文档

### 工作目录
`/Users/xc/.openclaw/workspace/agents-workspace/boss/github-automation/scripts/openclaw-monitor`

### 步骤（10 分钟）
1. 编辑文件：`README.md`
2. 添加内容：[具体章节]
3. 提交：`git add -A && git commit -m "docs: update README with [feature]" && git push`

### 验证
- [ ] README 已更新
- [ ] 格式正确
- [ ] git 提交成功
```

---

## ✅ 使用指南

### 选择合适的模板

| 任务类型 | 使用模板 | 预计时间 |
|---------|---------|---------|
| 创建新服务 | 模板 1 | 10 分钟 |
| 编写测试 | 模板 2 | 15 分钟 |
| 添加 API | 模板 3 | 15 分钟 |
| 安装依赖 | 模板 4 | 5 分钟 |
| 更新文档 | 模板 5 | 10 分钟 |

### 自定义模板

```markdown
## 任务：[任务名]

### 工作目录
`/absolute/path`

### 步骤（≤5 步，≤15 分钟）
1. 步骤 1
2. 步骤 2
3. 步骤 3

### 代码模板（如适用）
```typescript
// 代码
```

### 强制提交
```bash
git add -A && git commit -m "message" && git push
```

### 验证
- [ ] 检查项 1
- [ ] 检查项 2
```
