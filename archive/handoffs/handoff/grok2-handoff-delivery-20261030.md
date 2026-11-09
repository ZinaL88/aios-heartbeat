# Grok2 handoff — automated delivery (no Z L)

**Primary fetch (works now):**
https://cdn.jsdelivr.net/gh/ZinaL88/aios-heartbeat@main/handoff/index.json

**Pinned commit:** https://cdn.jsdelivr.net/gh/ZinaL88/aios-heartbeat@c7a23d3437c467a07f338695dae0a63bf66bcd96/handoff/index.json

**Pages (building):** https://zinal88.github.io/aios-heartbeat/handoff/

**Note:** `raw.githubusercontent.com` currently 404s for this public pack even though the API lists the files — autopull prefers jsdelivr → Pages → raw.

**Grok2 install (Jarvis/Nyxen, no Z L):**
```bash
curl -fsSL "https://cdn.jsdelivr.net/gh/ZinaL88/aios-heartbeat@main/handoff/grok2_handoff_autopull.sh" -o ~/bin/grok2_handoff_autopull.sh
chmod +x ~/bin/grok2_handoff_autopull.sh
# cron every 30m on Grok2 box:
# */30 * * * * $HOME/bin/grok2_handoff_autopull.sh >>$HOME/grok2-handoff/pull.log 2>&1
```

Updated: 2026-10-30 23:02:01 HKT · commit c7a23d343
