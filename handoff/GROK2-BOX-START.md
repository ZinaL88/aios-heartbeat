# GROK2-BOX-START — bootstrap steps for the Grok2 box · 2026-10-30 HKT

**Audience: Grok2 only.** Run every step **on the Grok2 box itself**. Z L does nothing: no manual delivery, no chat relay, no file copy. You fetch your own pack from the public URLs below.

**Pack root (Pages, canonical):** `https://zinal88.github.io/aios-heartbeat/handoff/`

---

## Hard bans (read before anything else)

1. **Wrong-host ban — NEVER install `grok2_handoff_autopull.sh` or its `*/30` cron on the Grok1 primary box.** The puller belongs on the Grok2 box only. A one-time `curl` fetch test from the primary is tolerable as a connective probe, but it must **not** install the cron or write a recurring job there.
2. **Token-0 path: while your own allowance is at 0%, the seed for this bootstrap is the product Decider detecting your reset → 100% and firing the autopull install on this box.** Do **NOT** wait on Instinct WA to wake or seed you — that path is dead and explicitly banned.
3. **No WhatsApp on this box.** WA Fork-5 on the primary is Grok1-only; you never open a competing WA session there.
4. **Secrets:** path names only, never values (tokens, cookies, PATs).

---

## Numbered steps (in order, on the Grok2 box)

1. **Fetch the index** — confirm the pack is live:
   ```bash
   curl -fsSL https://zinal88.github.io/aios-heartbeat/handoff/index.json
   ```
   Expect HTTP 200, `"schema": "aios-wall-handoff-pack/v1"`, and `"prefer[0]" == "pages_base"`. If Pages is down, the index lists `cdn_base` and `raw_base` fallbacks in `prefer` order.
2. **Install the autopuller once:**
   ```bash
   mkdir -p ~/bin
   curl -fsSL https://zinal88.github.io/aios-heartbeat/handoff/grok2_handoff_autopull.sh -o ~/bin/grok2_handoff_autopull.sh
   chmod +x ~/bin/grok2_handoff_autopull.sh
   ~/bin/grok2_handoff_autopull.sh
   ```
   It fetches `index.json` (Pages → CDN → raw) and pulls **every** file listed in the index into `$HOME/briefs/grok2-handoff/`. Before installing, confirm you are NOT on the Grok1 primary box (wrong-host ban above).
3. **Install the `*/30` cron on the Grok2 box** so the strip refreshes itself every 30 minutes:
   ```cron
   */30 * * * * $HOME/bin/grok2_handoff_autopull.sh >> $HOME/briefs/grok2-handoff/autopull.log 2>&1
   ```
   Use the box scheduler (crontab/supercronic/systemd timer). Token-free — never a Grok status ticker.
4. **Read the two core playbooks** (now in `~/briefs/grok2-handoff/`):
   - `loop-engineering-playbook-20261030.md` — the Loop Engineering method: claim → spawn ∈3 free doers → checker ≠ doer → close/escalate; free-first ladder OpenCode → Gemini (API/agy) → Cursor → Codex; never park idle no-PIC work; never install this puller on the primary.
   - `grok2-wall-handoff-20261030.md` — the wall playbook: trigger conditions, role after takeover, hard gates needing Z L (`merge / deploy / spend / WA-speak-as-Z L / hard-reset`), first-60-minutes checklist, token discipline.
   Full file map: `index.json` (same directory). Every listed file is pulled by step 2.
5. **Claim idle work.** Now that you have the method:
   - Inventory open sit-room/fleet/LE tickets with **no PIC** or a stale claim (`alive_workers=0` = FAIL).
   - Claim with `prompt_path` + `workdir` + `executor` attached; prefer ≥3 independent claims when work exists.
   - Spawn real free doers the **same turn**. Checker never equals doer.
   - Leave a short status stub where the box keeps notes: what you claimed, who is PIC, blockers for Z L.
   - Hard-gate blockers: draft + ask Z L. Tech-methodology judgment calls: `https://ask.lizheng.ai/` (public, no secrets); playbook `ask-lizheng-blocker-path-20261030.md`.

---

## Verify yourself

- `curl -s -o /dev/null -w '%{http_code}' https://zinal88.github.io/aios-heartbeat/handoff/index.json` → `200`
- `ls ~/briefs/grok2-handoff/` → contains `index.json`, both playbooks, `grok2_handoff_autopull.sh`, the live strip `grok2-wall-handoff-live-20261030.md` (fresh < 30 min old), and every file in the index file map.
- Cron entry present **on this box only**; nothing installed on the Grok1 primary.
- Self-check against `acceptance-checklist.md` next to this file. Final gate (`ACCEPTED`) is stamped by the Grok1 reviewer — you never self-accept.

---

*No secrets in this file. Written 2026-10-30 HKT. Supersedes the paste-wording bootstrap; `GROK2-PASTE-BOOTSTRAP-20261030.md` is kept only as a deprecated alias.*
