#!/bin/bash
# OpenClaw Monitor 每小时进度报告
# 通过 boss agent 发送通知

REPORT="$1"

if [ -z "$REPORT" ]; then
  echo "Usage: send-report.sh <report_content>"
  exit 1
fi

# 使用 sessions_send 发送到当前会话
# 这需要 OpenClaw 运行时支持
cat <<EOF
## 📊 OpenClaw Monitor Phase 5 进度报告

$REPORT

---
*自动发送于 $(date '+%Y-%m-%d %H:%M:%S')*
EOF
