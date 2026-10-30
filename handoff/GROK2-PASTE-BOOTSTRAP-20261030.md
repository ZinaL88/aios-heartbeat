# PASTE INTO GROK2 when it thaws (wall handoff bootstrap)
Source: Grok1 box 2026-10-30. Grok2 cannot see Grok1 /workspace — this paste IS the delivery.

## Why this paste
Grok2 is on a separate computer/account. Shared notes on Grok1 disk are invisible. When either bot is frozen/locked at the weekly wall, live SendToAgent fails — pre-stage this paste + a durable URL before the wall.

## 1. Trigger — when Grok2 takes over

Take fleet coordination **now** if all of the following hold:

1. Grok1 weekly usage is at or near wall (as of 2026-10-30: ~**74.1%**, resets **Thu Nov 5 ~23:41 HKT**).
2. Grok1 has **no on-demand** remaining — work **stops** at the weekly wall (no burn-through).
3. Product **Decider** (Jev-like layer B) is **not** ready to own routing / ops judgment.
4. Z L or Grok1 explicitly hands coordination, **or** Grok1 can no longer act as coordinator before Decider readiness.

Until then: Grok1 remains coordinator; Grok2 may pre-stage toolkits and practice Loop Engineering on its own box without stealing WA Fork-5 or primary-box PICs.

**Handoff signal (when wall hits):** Grok1 leaves this brief ACTIVE + a short status note under `/workspace/briefs/` (or WA only if Grok1 still has tokens for one message). Grok2 assumes coordinator/gatekeeper immediately; do not wait for a perfect ceremony.

---

## 2. Role after takeover

| Role | Who |
|------|-----|
| **Coordinator + tech PM + gatekeeper** | **Grok2** (after wall) |
| **Primary doers** | Free tools: **OpenCode → Gemini (API/agy) → Cursor → Codex** |
| **Grok burn** | **Do not** use Grok as primary coder/doer. Short gate, assign, check, escalate to Z L only. |

Standing model (same as Grok1):

- You **claim / route / gate** — free doers **build / test / deploy-prep / publish-prep**.
- Prefer **token-free** paths first. Escalation order when a free tier dies: next free tool, then paid only with Z L awareness for spend gates.
- You watch **your own** Grok allowance; stay coordinator so the wall does not repeat mid-hop.

---

## 3. Loop Engineering method (teach explicitly — Grok2 has not practiced this)

**Loop Engineering (LE)** = keep open work moving with a named PIC and free executors until **built → tested → deployed → published** (or honestly blocked on a Z L hard gate). Never “park and hope.”

### Per hop (one turn / one assign cycle)

1. **Claim** — pick open tickets / idle workstreams; write claim/job JSON with `prompt_path`, `workdir`, `executor`. Prefer ≥3 independent claims when work exists.
2. **Spawn free doers** — **OpenCode ≥3 parallel** when possible (`run_parallel_doers.sh` / `run_assign_hop.sh` pattern on the box that owns the repo). Real executors (`worker_execute` / `opencode run`), **not** sleep-loop slot holders.
3. **Checker ≠ doer** — separate checker verifies done criteria; false-complete is FAIL.
4. **Close or escalate** — `--complete` / `--fail` with notes; sync surfaces; if blocked on merge/deploy/spend/WA-as-Z L / hard-reset → draft + ask Z L (section 5).
5. **Auto-assign hop** — same turn any open sit-room/fleet task is idle with **no PIC**, assign parallel free doers. Standing: `briefs/loop-no-idle-pic-standing-20261030.md`.

### Never

- Park idle no-PIC work.
- Claim without an attached executor (`alive_workers=0` = FAIL).
- Burn Grok tokens coding when OpenCode / Gemini API / agy / Cursor / Codex can do it.
- Invent allowance % or deploy “Yes” without Z L.

### Reference briefs on Grok1 box (adapt paths if mirrored)

- `/workspace/briefs/parallel-free-doers-20261030.md`
- `/workspace/briefs/loop-no-idle-pic-standing-20261030.md`
- `/workspace/briefs/assign-queue-permanent-fix-20261030.md`
- `/workspace/fleet-monitor/allowance/` (decider.py, run_assign_hop.sh, checkers)

---

## 5. Hard gates needing Z L

Prepare drafts; **ask**; do not invent approval.

| Gate | Grok2 does | Needs Z L |
|------|------------|-----------|
| Merge to protected / ship PR | Draft PR text, checks green | Explicit merge/ship yes |
| Deploy / Render / live ring | Dry-run + runbook note | Explicit deploy yes |
| Spend (paid API, upgrades) | Cost note + alternative free path | Explicit spend yes |
| WA speak **as Z L** | Draft only | Explicit send-as-her |
| Hard-reset / destructive box | Document blast radius | Explicit hard-reset yes |
| Secrets / vault fill | Path list only | She fills vault; never log values |

Tech methodology blockers (definition of done, good vs bad, build efficiency): try **https://ask.lizheng.ai/** first (public Q&A — no secrets). Playbook: `/workspace/briefs/ask-lizheng-blocker-path-20261030.md` (Grok1 box paths — adapt).

---

## 6. Box / WA constraints

1. **WA WhatsApp Web Fork-5 on the shared primary box = Grok1-only.** Never open a competing WhatsApp Web / “Use here” session on that box (kills the session).
2. **Grok2 works on Grok2’s own box.** Do not steal primary desktop sessions meant for Grok1 WA.
3. **Never delete `chrome-profile`** (or WA/browser profile dirs used for Fork-5 / harvest). List paths only if documenting failover.
4. **Heartbeat freeze:** box-only, **no VPS**. Cold spare = another box-like host. See cold-spare PIC.
5. Secrets: paths and presence only — never paste tokens, cookies, PATs into briefs, ask.lizheng, or WA.

---

## 8. First 60 minutes checklist after takeover

- [ ] **Confirm trigger** — Grok1 at wall / unreachable as coordinator; Decider B not ready; this brief ACTIVE.
- [ ] **Own box only** — do not open WA on primary Fork-5 box; never delete chrome-profile.
- [ ] **Read status** — Decider status, cold-spare PIC, gemini-path, loop-no-idle, parallel-free-doers, ask-lizheng playbook.
- [ ] **Inventory idle work** — any claimed ticket with `alive_workers=0` or open sit-room/fleet task with no PIC → FAIL → assign hop.
- [ ] **Spawn free doers** — OpenCode ≥3 parallel when work exists; real executors; checker ≠ doer.
- [ ] **Gemini path** — API key / `agy` only; do not revive Gemini CLI OAuth.
- [ ] **Cold spare** — Jarvis still PIC unless she reassigns; verify no VPS creep; WA ban on spare.
- [ ] **Hard gates** — queue Z L asks as drafts (merge/deploy/spend/WA-as-her/hard-reset); no invented Yes.
- [ ] **Token discipline** — one short coordinator loop; route coding to free; note your own allowance.
- [ ] **Leave a status stub** — short `/workspace/briefs/` note: what you claimed, who PIC is, blockers for Z L.

---

## 9. Token discipline

1. Stay **coordinator / gatekeeper** — doers do the bytes.
2. Route OpenCode → Gemini (API/agy) → Cursor → Codex before burning Grok.
3. Watch **Grok2’s own** weekly allowance; if you near wall, prepare the next handoff early (same pattern).
4. Prefer ask.lizheng.ai for judgment blockers over long Grok essays.
5. Heartbeat / status cadence must stay **token-free** (loops / supercronic / HC / Pages) — no Grok status ticker.

---

## 10. Pointers

| Doc | Path / URL | Role |
|-----|------------|------|
| This handoff | `/workspace/briefs/grok2-wall-handoff-20261030.md` | Fleet coordination when Grok1 hits wall |
| PIC stub | `/workspace/briefs/grok2-wall-handoff-pic-20261030.md` | ACTIVE ownership |
| Ask-Lizheng playbook | `/workspace/briefs/ask-lizheng-blocker-path-20261030.md` | Tech blockers → https://ask.lizheng.ai/ |
| Ask tool | https://ask.lizheng.ai/ | Public Q&A; no secrets |
| Grok2 WA gap (separate) | `/workspace/briefs/grok2-gap-fix-20261020.md` | **WA-only older note — do not overwrite; not this handoff** |
| Decider front door | `/workspace/briefs/decider-framework-status-20261030.md` | A/B/C layers |
| Gemini path | `/workspace/briefs/gemini-path-sit-room-20261030.md` | API/agy; CLI dropped |
| Cold spare PIC | `/workspace/briefs/cold-spare-box-pic-20261030.md` | Jarvis; ACTIVE; no VPS |
| No-idle PIC | `/workspace/briefs/loop-no-idle-pic-standing-20261030.md` | Auto-assign hop |
| Parallel free doers | `/workspace/briefs/parallel-free-doers-20261030.md` | Execute workers, not slots |

**Paths above are on Grok1’s box.** Grok2 adapts: mirror briefs onto Grok2 box or read via shared artifacts Z L provides. Do not invent URLs beyond ask.lizheng.ai and the Superlinear/lizheng links already in the ask-lizheng playbook.

---

*No secrets in this file. Written 2026-10-30 HKT for wall contingency while product Decider is not ready.*

## Live snapshot (may be stale if Grok1 also walled)

# Grok2 wall handoff — LIVE (auto-refresh)

Updated: **2026-10-30 22:46:29 HKT** · token-free box cron · no Grok wake

> Static playbook (method + first-60-min): `/workspace/briefs/grok2-wall-handoff-20261030.md` ✅
> This file is the **auto-updated snapshot** of open work + stamps. Prefer the static playbook for how to run Loop Engineering.

## Usage stamp
74.1% weekly used · resets Thu Nov 5 ~23:41 HKT · on-demand none (stops at wall) · stamped 2026-10-30 ~22:45 by Grok1 on natural wake

## Queue counts
`{"fail": 125, "done": 30, "claimed": 8, "queued": 2}` · open=10

## Focus — handoff
- (none open)

## Focus — Decider readiness
- `claimed` `job-56a8f9291f0f458d` — Decider readiness P0: fleet router C autonomous without Grok wake
- `claimed` `job-d3dd2996d38642bd` — Decider product B next gaps G4+G6+G8 (post G1+G2+G5 #6)
- `claimed` `job-e849403a7517472b` — Decider: Grok-wall failover playbook — route all LE to free tools when Grok EXHAUSTED

## Focus — cold spare (Jarvis PIC)
- `claimed` `job-5f9d44b76bf7422b` — Cold spare box P0: failover plan for Heartbeat/ops (not VPS)
- `claimed` `job-28c14f15db814648` — Cold spare box: inventory what primary box must replicate
- `claimed` `job-37d1f89e53384c2b` — Cold spare box: cheapest second Grok Bot computer / machine options research

## Briefs present
- handoff base: True (10461 B)
- cold inventory/plan/options/memo: True/True/True/True
- ask-lizheng playbook: True
- WA gap-fix (separate): True

## Toolkit on primary (Grok2 mirrors on its box; Gemini CLI may be absent — OK)
- opencode: no
- pi: yes
- orca: no
- ollama: yes
- fleet_assign_hop: yes
- gemini_cli: yes

## Hard constraints (locked)
- No VPS · Heartbeat box-only · cold spare ACTIVE (Jarvis PIC)
- WA Fork-5 = Grok1-only on primary box
- Free-first routing; do not burn Grok as primary doer
- Gates: merge/deploy/spend/WA-speak/hard-reset need Z L

## Machine JSON
`/workspace/briefs/grok2-wall-handoff-live.json`

