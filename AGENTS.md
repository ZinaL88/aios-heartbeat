# Agent rules for aios-heartbeat

## Shared rules (all AI tools: Grok2, Grok1, Instinct, Codex, Gemini, OpenCode)
Zina's standing rules live in [ZinaL88/ai-os RULES.md](https://github.com/ZinaL88/ai-os/blob/main/RULES.md), not in any tool's memory.
- Before work, load your scope: `python3 tools/rules/rules.py brief merge` in an ai-os checkout (prints `always` + `merge` rules and the current `rules_version`). If you can't run it, read the `always` and `merge` sections of RULES.md.
- Echo `rules_version: <version>` in every task report and review record; stale versions fail the check.
- ALWAYS-19 presence: write `python3 tools/rules/rules.py state <worker> <working|waiting_remote|idle> <task>` (box: `/workspace/loop/ops/state/<worker>.json`). Waiting on remote must not block the queue; watchdog flags idle/waiting_remote >2 min while open-tasks has queued work.
- Merges follow MERGE-01..05: a different AI tool reviews, record in ai-os `ops/reviews/`; reserved-risk changes wait for Zina's brief.
- ai-os `tools/rules/gates.py` (no secrets, no Lark writes, no company data, CV claims) runs pre-merge; run it on this repo with `--repo-root`.
