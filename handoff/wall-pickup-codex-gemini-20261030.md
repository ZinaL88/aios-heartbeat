# Wall pickup — Codex & Gemini (and any free doer) — 2026-10-30

**Audience:** Codex, Gemini (API/agy), Cursor, OpenCode — whoever Z L points at when **Grok1 hits the weekly wall**.  
**Not for Z L to paste.** Fetch from public Heartbeat handoff.  
**Timezone:** Asia/Hong_Kong (HKT).

## 0. How you get this pack
- Index: https://zinal88.github.io/aios-heartbeat/handoff/index.json  
- CDN: https://cdn.jsdelivr.net/gh/ZinaL88/aios-heartbeat@main/handoff/index.json  
- This file: `wall-pickup-codex-gemini-20261030.md`  
- Loop Engineering core: `loop-engineering-playbook-20261030.md`  
- Fleet coordinator (Grok2-oriented, still useful): `grok2-wall-handoff-20261030.md`  
- Live strip: `grok2-wall-handoff-live-20261030.md` + `.json`
- Decider first principles (free/box): `decider-first-principles-free-box-20261031.md`

On first wake after Grok1 wall: **curl index → read this + LE playbook → claim open idle work**.

## 1. Your role when Grok1 is at wall
| Role | Who |
|------|-----|
| Coordinator / gate (if Grok2 thawed) | Grok2 |
| If Grok2 still at 0% / inactive | **You (Codex/Gemini) execute under Z L / Decider routing** — do not wait for Grok1 |
| Primary builders | Free-first: OpenCode → Gemini API/agy → Cursor → **Codex** |
| Grok burn | **Do not** use Grok as primary coder |

## 2. Loop Engineering (must follow)
See `loop-engineering-playbook-20261030.md`. Short form:
1. **Claim** open idle no-PIC work same turn.
2. **Spawn ≥3 parallel free doers** when work exists (real executors, not sleep slots).
3. **Checker ≠ doer**.
4. Drive to **built → tested → deployed → published** (or honest Z L hard-gate block).
5. **Never park** idle no-PIC work.

## 3. Standing rules (Z L hard)
- No manual jobs for Z L (no paste / Drive open / form fill). Automate.
- **Free/box cron first (Decider + LE, 2026-10-31):** dispatch of idle no-PIC work = box cron / free process. A scheduled **Grok wake for free-doer work = design defect = FAIL**; Grok wakes only for Z-L-facing results (decision, gate, secret, unblock). The Open idle LE hop is **box supercronic `*/15 9-22` → `run_assign_hop.sh`**; the Grok "Open idle LE auto-assign" routine is **paused**. Any new "monitor X every N min" defaults to box cron.
- Heartbeat freeze = **box-only** (no VPS).
- WA Fork-5 on primary = **Grok1 only**; never second WhatsApp Web on that box.
- Do **not** trust Instinct WA to seed Grok2 when Grok2 is at 0 tokens.
- Decider must monitor allowances; on Grok **reset→100%** trigger that box’s autopull cron + playbook remind (token-free box path — never a Grok cron).
- Vault/config fields = bot work, never ask Z L.
- Tech blockers: try https://ask.lizheng.ai/ (public, no secrets) before burning loops.
- Hard gates (merge/deploy/spend/WA-as-Z L/hard-reset): **draft + ask Z L** — never invent Yes.

## 3b. Continuous pack refresh duty (free maintainers)
The wall/pickup pack lives in the public repo `aios-heartbeat/handoff/` and ships via GitHub Pages. If you own or inherit maintenance of it:
1. Update the playbooks + live strip (`grok2-wall-handoff-live-20261030.md/.json`) **continuously along the build** — every material design/ops change, same turn.
2. `git add` the touched files → `git commit` → `git push` so Pages reflects the latest (`pages_base` is `prefer[0]`).
3. If a file is newly added to the pack, add it to `index.json` (autopull pulls every file listed there).
4. **Never wait for Z L to remind you to refresh.** The pack is only useful if it matches live state.
5. Doers never self-accept: gate stamp `ACCEPTED` lives only in the Grok1 gate-review brief.

## 4. First 30 minutes checklist
1. Pull handoff index + live JSON.
2. Inventory `/workspace/ai-os/jobs/tool_job_queue.json` (or fleet mirror): queued/claimed idle.
3. Claim + spawn free doers for every idle no-PIC ticket.
4. Prefer OpenCode free; escalate Gemini API/agy → Cursor → Codex only as needed.
5. Do not touch Fork-5 WA / chrome-profile delete / VPS migration.
6. Publish progress notes under `/workspace/briefs/` and keep public `handoff/live` fresh if you own Heartbeat publish (commit + push each material change — never wait for a Z L reminder; §3b).

## 5. What “done” means
Ticket is done only when checker passes and artifact exists (code/tests/brief). False-complete = FAIL.
