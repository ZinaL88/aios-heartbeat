#!/usr/bin/env bash
# Run on Grok2's box (token-free). Fetches wall-handoff pack from public Heartbeat.
# Install: cron */30 or first line of Grok2 wake routine. No Z L.
set -euo pipefail
BASE="${GROK2_HANDOFF_RAW_BASE:-https://raw.githubusercontent.com/ZinaL88/aios-heartbeat/main/handoff}"
OUT="${GROK2_HANDOFF_DIR:-$HOME/briefs/grok2-handoff}"
mkdir -p "$OUT"
curl -fsSL "$BASE/index.json" -o "$OUT/index.json"
BOOT=$(python3 -c "import json; print(json.load(open('$OUT/index.json')).get('bootstrap','GROK2-PASTE-BOOTSTRAP-20261030.md'))")
for f in "$BOOT" grok2-wall-handoff-20261030.md grok2-wall-handoff-live-20261030.md grok2-wall-handoff-live.json grok2-handoff-delivery-20261030.md; do
  curl -fsSL "$BASE/$f" -o "$OUT/$f" || true
done
date "+%Y-%m-%d %H:%M:%S HKT autopull ok → $OUT" >>"$OUT/autopull.log"
echo "$OUT/$BOOT"
