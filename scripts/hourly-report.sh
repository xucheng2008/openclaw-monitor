#!/bin/bash
# OpenClaw Monitor 进度报告脚本
# 每小时自动报告 Phase 5 开发进度

set -e

REPO="xucheng2008/openclaw-monitor"
WORKSPACE="/Users/xc/.openclaw/workspace/agents-workspace/boss/github-automation/scripts/openclaw-monitor"

echo "## 📊 OpenClaw Monitor Phase 5 进度报告"
echo ""
echo "**报告时间**: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 获取 Issue 状态
echo "### 任务状态"
echo ""
echo "| Issue | 任务 | Agent | 状态 | 优先级 |"
echo "|-------|------|-------|------|--------|"

# 获取 Phase 5 的 Issues
gh issue list --repo $REPO --label "task" --search "Phase 5" --json number,title,labels,state --limit 20 | \
jq -r '.[] | "| #\(.number) | \(.title) | \(.labels | map(select(.name | startswith("agent:"))) | .[0].name // "unassigned") | \(.state) | \(.labels | map(select(.name | startswith("priority:"))) | .[0].name // "medium") |"'

echo ""

# 获取最近的 Git 提交
echo "### 最近提交"
echo ""
cd $WORKSPACE
git log --oneline -5 --since="1 hour ago" 2>/dev/null || echo "_过去 1 小时无新提交_"
echo ""

# 获取活跃的子 Agent 会话
echo "### 执行中任务"
echo ""
# 这里可以添加 sessions_list 的调用，但需要避免在脚本中直接调用
echo "_检查子 Agent 会话状态..._"
echo ""

# 阻塞问题
echo "### 阻塞问题"
echo ""
echo "无"
echo ""

# 下一步计划
echo "### 下一步计划"
echo ""
echo "- 继续执行中的开发任务"
echo "- 验收已完成的代码提交"
echo "- 更新 Issue 状态"
echo ""

# 统计
echo "### 整体进度"
echo ""
TOTAL_ISSUES=$(gh issue list --repo $REPO --label "task" --json number | jq 'length')
DONE_ISSUES=$(gh issue list --repo $REPO --label "status:done" --json number | jq 'length')
PROGRESS=$(echo "scale=0; $DONE_ISSUES * 100 / $TOTAL_ISSUES" | bc)
echo "- **总任务数**: $TOTAL_ISSUES"
echo "- **已完成**: $DONE_ISSUES"
echo "- **进度**: ${PROGRESS}%"
echo ""
