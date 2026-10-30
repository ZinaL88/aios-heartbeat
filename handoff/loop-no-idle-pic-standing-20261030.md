# Standing: no idle open work without PIC (2026-10-30)

Z L hard: Grok1 must assign parallel free doers the same turn any open sit-room/fleet task is idle with no PIC. Keep Loop Engineering until built/tested/deployed/published.

## Recurring failure fixed
`run_parallel_doers.sh` only globbed `assign-*.json` while claim-free wrote `job-*.json` → claimed tickets with zero workers. Patched to also glob `job-*.json`. Checker: `fleet-monitor/allowance/checks/check_claimed_have_executors.sh` (FAIL if claimed & alive_workers=0, or job-* glob missing, or parallel claim <3 when work available).

## Active PICs (2026-10-30 ~20:35 HKT)
1. instinct+cursor % collectors — OpenCode job-62e1… + box executor
2. gemini % + CLI path — OpenCode job-8cbc… + box executor  
3. Gemini wake→post — OpenCode job-c1ff… + box executor
