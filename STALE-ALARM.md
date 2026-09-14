# Heartbeat stale alarm (GitHub Actions)

**Locked (Z L 2026-09-14):** Outside smoke alarm only — **no separate VPS push**, no Jarvis babysit routines.

## What it does

Workflow: `.github/workflows/heartbeat-stale-alarm.yml`

- Every ~15 minutes (+ manual **Run workflow**).
- Fetches `status.json` from Pages / raw GitHub.
- If `written_at` older than **12 minutes** (or unreachable): opens/comments Issue labeled `heartbeat-stale`.
- If fresh again: auto-closes those Issues.

## What it does not do

- Does **not** restart collectors/heartbeat on Grok Bot's computer.
- Does **not** spend Cursor / Grok Bot tokens.

## Heal path

On next Jarvis wake: shell recover from `ai-os` `ops/WHEN-BOT-RESUMES.md`. Confirm this board's `written_at` moves.
