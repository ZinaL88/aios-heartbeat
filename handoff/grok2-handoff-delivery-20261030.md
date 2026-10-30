# Grok2 handoff delivery — automated (no Z L manual) · 2026-10-30

## Rule
Z L does **not** paste, open Drive, or babysit. Delivery is bot/cron only.

## How Grok2 gets the pack when frozen/locked
1. **Grok1 box** refreshes live snapshot every 15m (`refresh_grok2_handoff.sh`) and stages `aios-heartbeat/handoff/`.
2. **Publish** to public Heartbeat repo → durable URLs (no Grok tokens to read):
   - `https://zinal88.github.io/aios-heartbeat/handoff/index.json`
   - `https://raw.githubusercontent.com/ZinaL88/aios-heartbeat/main/handoff/GROK2-PASTE-BOOTSTRAP-20261030.md`
3. **Grok2 auto-puller** (install on Grok2 box once via Jarvis/Nyxen/free doer — not Z L): on every wake/thaw, `curl` index.json → write briefs locally → run first-60-min checklist. Script: `/workspace/fleet-monitor/scripts/grok2_handoff_autopull.sh` (portable).
4. Optional: Instinct WA auto-notify Grok2 with the raw URL when Grok1 usage stamp crosses a threshold (bot-to-bot; not Z L).

## Non-goals
- No “please paste into Grok2”
- No Drive open for her
- No gist unless already approved for other reasons
