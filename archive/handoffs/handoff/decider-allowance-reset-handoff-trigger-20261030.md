# Decider: allowance-reset → Grok box handoff seed · 2026-10-30 23:05:39 HKT

## Z L intent (2026-10-30)
Decider always monitors each bot/agent allowance. When a Grok bot resets to **100%**, Decider must:
1. Trigger install of `grok2_handoff_autopull.sh` + `*/30` cron **on that bot’s own box** (not primary).
2. Remind that bot to read the public handoff playbook/index.

## Public pack
- https://zinal88.github.io/aios-heartbeat/handoff/index.json
- https://zinal88.github.io/aios-heartbeat/handoff/grok2_handoff_autopull.sh

## Design (product B / fleet C)
- Input: allowance board live rows (measured, not fixture).
- Edge: `remaining_pct` crosses from <100 (or unknown) → ≥99.5 / 100 on grok1/grok2 (and future grok seats).
- Action: enqueue `tool_job` doer=`opencode` OR sit-room/Instinct wake with install one-liner + playbook URL; idempotent (seed_once flag per account/box).
- Never ask Z L to paste. Never install Grok2 puller on Grok1 box.
- Checker ≠ doer; publish event `decider.allowance_reset_handoff_seed`.

## Deliverables
1. Spec + state machine in `/workspace/ai-os/` or fleet-monitor decider.
2. Hook from allowance refresh → edge detect → assign.
3. Smoke with synthetic 40%→100% fixture then dry-run assign (no real 2nd-box if unreachable).

## Update 2026-10-30 23:06 HKT — Z L hard
**Do NOT** use Instinct WA to seed Grok2/Nyxen (Grok2 inactive at 0 tokens; path failed before).
**Canonical:** Decider watches allowances → on Grok seat reset to 100% → trigger autopull cron on THAT box + remind playbook.
Public pack remains LIVE for when Decider fires.

## Z L hard (added 2026-10-30 23:06 HKT)
- **Do NOT** trust Instinct WA as Grok2 handoff seed (inactive / 0 tokens; path failed).
- **Canonical only:** Decider allowance-reset → 100% → install autopull+cron on **that** bot’s box + remind playbook.
- No human paste. No install on wrong host.
