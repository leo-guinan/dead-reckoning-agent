#!/bin/bash
# sensors/heartbeat.sh — Periodic heartbeat trigger
#
# Add to crontab:
#   */30 * * * * /path/to/agent-repo/sensors/heartbeat.sh >> /tmp/agent-heartbeat.log 2>&1
#
# Or run manually: bash sensors/heartbeat.sh

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$REPO_DIR/memory/heartbeat.log"
NOTIFY_CMD="${NOTIFY_CMD:-}" # Optional: set to notify-send, ntfy, etc.

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Heartbeat triggered"

cd "$REPO_DIR" || exit 1

# Load env if .env exists
[ -f .env ] && export $(grep -v '^#' .env | xargs)

# Run the heartbeat
RESPONSE=$(node harness/run.mjs --heartbeat 2>&1)
EXIT_CODE=$?

echo "$RESPONSE"

# If not a clean heartbeat OK and we have a notify command, ping the human
if [ $EXIT_CODE -ne 0 ] || ! echo "$RESPONSE" | grep -q "^HEARTBEAT_OK"; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ALERT: $RESPONSE" >> "$LOG_FILE"
  if [ -n "$NOTIFY_CMD" ]; then
    echo "$RESPONSE" | $NOTIFY_CMD
  fi
fi
