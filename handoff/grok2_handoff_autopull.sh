#!/usr/bin/env bash
# Grok2 box: curl public handoff pack on thaw — no Z L paste.
set -euo pipefail
DEST="${GROK2_HANDOFF_DIR:-$HOME/grok2-handoff}"
CDN="https://cdn.jsdelivr.net/gh/ZinaL88/aios-heartbeat@main/handoff"
PAGES="https://zinal88.github.io/aios-heartbeat/handoff"
RAW="https://raw.githubusercontent.com/ZinaL88/aios-heartbeat/main/handoff"
mkdir -p "$DEST"
BASE=""
for b in "$CDN" "$PAGES" "$RAW"; do
  if curl -fsSL "$b/index.json" -o "$DEST/index.json"; then BASE="$b"; break; fi
done
if [[ -z "$BASE" ]]; then echo "handoff fetch failed"; exit 1; fi
# pull listed files
python3 - <<PY
import json, urllib.request, pathlib, os
dest=pathlib.Path(os.environ.get("DEST","$DEST"))
base=os.environ.get("BASE","$BASE")
idx=json.loads((dest/"index.json").read_text())
keys=["bootstrap","playbook","live","live_json","delivery","autopull"]
for k in keys:
  name=idx.get(k)
  if not name: continue
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
