# Parallel free doers — 2026-10-30 ~19:43 HKT

**Goal:** Independent free-tool jobs run **in parallel** and **execute** (OpenCode tabs/workers, Pi/Ollama, Orca) — not serial drip, not empty claim-slot holders. Z L rejects good-enough.

## What was wrong (~19:32)

`run_parallel_doers.sh` spawned **sleep-loop slot holders** that printed `DOER_HINT` and waited. 6 claimed + 6 PIDs looked parallel but **zero tickets were executed** via the worker path. Two orphan `opencode run` processes existed outside the claim workers.

## Fix (live `/workspace/fleet-monitor/allowance/`)

| Piece | Role |
|-------|------|
| `worker_execute.sh` | Per-ticket executor: resolve prompt/workdir → adopt existing OC **or** invoke `opencode run --auto` / `pi -p` / `orca exec` → `--complete`/`--fail` + `sync_to_surfaces` |
| `run_parallel_doers.sh` | `DOER_EXECUTE=1` default; refuses slot-holders; `--kill-idle`; spawns `worker_execute` |
| `prompts/*.md` | Job prompts (MEMBERS, bridge, checker, UX, redeploy, OPS YT) |
| Claim tickets | Now carry `prompt_path`, `workdir`, `executor` |
| `run_assign_hop.sh` | After `--claim-free`, `--spawn-only` real executors |
| `checkers/check_doer_workers_alive.sh` | **FAIL** if claimed>0 with no attached exec worker, or idle >15m without complete attempt, or slot-holder loop still in source |
| False-complete guard | OPS YouTube must have brief/tests + video_collect before `--complete` |

## Proof (Asia/Hong_Kong) — claimed→done|fail with notes

Strip after execute hop: **queued=0 claimed=0 done=4 fail=13** (fixtures included in fail).

| Job | End | How |
|-----|-----|-----|
| sit-room live allowance bridge | **done** | worker verify_or_execute — prior doer + checker PASS re-verified |
| sit-room allowance bridge checker≠doer | **done** | worker verify — CHECKER.md PASS |
| sit-room MEMBERS | **done** | worker re-verify member-row + confirmAction; killed redundant OC |
| sit-room full UX revamp | **done** (partial) | PRODUCT.md+UX_SPEC.md present; OC free limit mid-implement; CHANGELOG missing |
| sit-room-redeploy | **fail** | `blocked_needs_zl_yes` — will not invent Yes/deploy |
| OPS YouTube intake | **fail** | OC hung ~3h51m + free limit; Pi/ollama rc=0 but **no code fix** (false-complete corrected); escalate Gemini→Cursor→Codex |

## Tools

| CLI | Status |
|-----|--------|
| opencode 1.19.5 | **Free usage limit reached** (AI_APICallError) during this hop |
| pi 1.4.0 + ollama qwen2.5-coder:1.5b | Works; too weak for OPS YouTube mutation fix |
| orca 0.5.14 | Installed; **no API key** (`ORCA_API_KEY`/`DEEPSEEK_API_KEY`) |
| gemini | OAuth still blocked |

## Checker

- `check_doer_workers_alive.sh` — claimed=0 → PASS (no orphan claims)
- Parallel N≥3 source gates remain in `check_assign_parallel_claims.sh` (+ worker execute gates)

## Still slot-only? **No** for this hop

Workers invoked tools and called `--complete`/`--fail`. Remaining gaps are **capacity** (OC free limit, Pi model size, Orca key, redeploy gate) — not empty PIDs.

## How to run

```bash
/workspace/fleet-monitor/allowance/run_parallel_doers.sh          # claim-free + EXEC spawn
/workspace/fleet-monitor/allowance/run_parallel_doers.sh --status
/workspace/fleet-monitor/allowance/checkers/check_doer_workers_alive.sh
```

## PR

Stack on feat/assign-parallel-free-doers (#108). Pushed `0d6f41f66` (execute workers). Live ai-os dirty — no hard-reset. No WA. No Grok burn for coding.

## Blockers for next hop

1. OpenCode free tier exhausted — need Go sub **or** escalate Gemini/Cursor/Codex for OPS YT + UX implement.
2. Orca needs API key to be usable.
3. Pi 1.5b insufficient for OPS mutation; keep as smoke/fallback only.
4. sit-room redeploy still gated on Z L yes.
5. UX CHANGELOG_REVAMP.md + static implement still open after free-limit kill.
