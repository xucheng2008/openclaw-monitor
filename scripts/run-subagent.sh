#!/bin/bash
# 子 Agent 任务执行脚本（优化版）
# 使用方式：./run-subagent.sh <agent> <task-label> <cwd> <task-description>

set -e

AGENT=$1
LABEL=$2
CWD=$3
TASK=$4

if [ -z "$AGENT" ] || [ -z "$LABEL" ] || [ -z "$CWD" ] || [ -z "$TASK" ]; then
  echo "用法：./run-subagent.sh <agent> <label> <cwd> <task>"
  echo "示例：./run-subagent.sh codex test-task /path/to/workdir '创建测试文件'"
  exit 1
fi

echo "🚀 启动子 Agent: $AGENT"
echo "📋 任务标签：$LABEL"
echo "📁 工作目录：$CWD"
echo "⏱️ 超时时间：15 分钟"
echo ""

# 记录开始时间
START_TIME=$(date +%s)

# 启动子 Agent（通过 OpenClaw API）
# 注意：实际调用需要通过 sessions_spawn 工具
# 这里提供的是 bash 封装示例

echo "✅ 子 Agent 已启动"
echo ""
echo "📊 监控检查点:"
echo "  - 5 分钟：检查是否开始执行"
echo "  - 10 分钟：检查是否有进展"
echo "  - 15 分钟：检查是否完成"
echo ""

# 等待完成（实际由 OpenClaw 管理）
# 这里只记录日志

echo "⏳ 等待子 Agent 完成..."

# 定期检查进度
while true; do
  ELAPSED=$(($(date +%s) - START_TIME))
  MINUTES=$((ELAPSED / 60))
  
  if [ $MINUTES -ge 15 ]; then
    echo "⚠️  警告：已运行 $MINUTES 分钟，超过预期时间"
  fi
  
  # 检查 git 提交
  cd "$CWD"
  COMMITS=$(git log --oneline --since="5 minutes ago" 2>/dev/null | wc -l)
  
  if [ $COMMITS -gt 0 ]; then
    echo "✅ 检测到代码提交:"
    git log --oneline -1
    break
  fi
  
  if [ $MINUTES -ge 20 ]; then
    echo "❌ 超时（20 分钟无提交），终止任务"
    exit 1
  fi
  
  sleep 60
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "✅ 任务完成！"
echo "⏱️  运行时间：$DURATION 秒"
