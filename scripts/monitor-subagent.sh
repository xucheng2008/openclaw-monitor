#!/bin/bash
# 子 Agent 进度监控脚本
# 每 5 分钟检查一次代码产出

set -e

CWD="${1:-.}"
INTERVAL="${2:-300}" # 默认 5 分钟

echo "📊 子 Agent 监控脚本"
echo "📁 工作目录：$CWD"
echo "⏱️  检查间隔：${INTERVAL}秒"
echo ""

LAST_CHECK=$(date +%s)
LAST_COMMIT_COUNT=0

while true; do
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - LAST_CHECK))
  
  if [ $ELAPSED -ge $INTERVAL ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🕐 检查时间：$(date '+%Y-%m-%d %H:%M:%S')"
    
    cd "$CWD"
    
    # 检查 git 提交
    NEW_COMMITS=$(git log --oneline --since="${INTERVAL} seconds ago" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$NEW_COMMITS" -gt "$LAST_COMMIT_COUNT" ]; then
      echo "✅ 新提交：$((NEW_COMMITS - LAST_COMMIT_COUNT)) 个"
      git log --oneline -$((NEW_COMMITS - LAST_COMMIT_COUNT)) 2>/dev/null | head -5
    else
      echo "⚠️  无新提交"
    fi
    
    # 检查新文件
    NEW_FILES=$(find . -name "*.ts" -type f -newermt "${INTERVAL} seconds ago" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$NEW_FILES" -gt 0 ]; then
      echo "✅ 新文件：$NEW_FILES 个"
      find . -name "*.ts" -type f -newermt "${INTERVAL} seconds ago" 2>/dev/null | head -5
    else
      echo "⚠️  无新文件"
    fi
    
    # 检查 git 状态
    UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$UNCOMMITTED" -gt 0 ]; then
      echo "⚠️  未提交变更：$UNCOMMITTED 个文件"
    fi
    
    LAST_CHECK=$CURRENT_TIME
    LAST_COMMIT_COUNT=$NEW_COMMITS
    
    echo ""
  fi
  
  sleep 10
done
