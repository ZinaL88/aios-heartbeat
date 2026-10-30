#!/usr/bin/env bash
# Any box (Grok2/Codex/Gemini host): curl public wall handoff pack — no Z L paste.
set -euo pipefail
DEST="${GROK2_HANDOFF_DIR:-$HOME/briefs/grok2-handoff}"
CDN="https://cdn.jsdelivr.net/gh/ZinaL88/aios-heartbeat@main/handoff"
PAGES="https://zinal88.github.io/aios-heartbeat/handoff"
RAW="https://raw.githubusercontent.com/ZinaL88/aios-heartbeat/main/handoff"
mkdir -p "$DEST"
BASE=""
for b in "$CDN" "$PAGES" "$RAW"; do
  if curl -fsSL "$b/index.json" -o "$DEST/index.json"; then BASE="$b"; break; fi
done
[[ -n "$BASE" ]] || { echo "handoff fetch failed"; exit 1; }
export DEST BASE
python3 <<'PY'
import json, urllib.request, pathlib, os
dest=pathlib.Path(os.environ["DEST"])
base=os.environ["BASE"]
idx=json.loads((dest/"index.json").read_text())
names=set()
for v in idx.values():
  if isinstance(v,str) and (v.endswith(".md") or v.endswith(".json") or v.endswith(".sh")):
    names.add(v)
for name in sorted(names):
  url=f"{base}/{name}"
  try:
    data=urllib.request.urlopen(url, timeout=60).read()
    (dest/name).write_bytes(data)
    print("ok", name)
  except Exception as e:
    print("skip", name, e)
print("BASE", base)
print("DONE", dest)
PY
