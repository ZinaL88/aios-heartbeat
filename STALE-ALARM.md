# Heartbeat stale alarm (GitHub Actions) — RETIRED 2026-09-30

**Replaced by Healthchecks.io** (Z L approved 2026-09-30): check `aios-box-heartbeat`,
period 10 min, grace 10 min, email alerts to Z L.

- The box pings every 5 min: ai-os `ops/status/healthcheck_loop.sh` → `healthcheck_ping.sh`.
- Success ping only when: heartbeat loop + watchdog alive, local `status.json` < 2 min old,
  workers not all circuit-open, and this public board < 30 min old. Otherwise `/fail` + reason.
- Box silent (dead VM) → Healthchecks alerts after period + grace.
- Ping URL lives only in box-local `ops/status/.env.local` (gitignored). Never commit it.

## The old workflow

`.github/workflows/heartbeat-stale-alarm.yml` keeps only **manual** "Run workflow"
(schedule removed). It failed on every scheduled run since ~Sep 15 because
`source /tmp/age.env` executed the unquoted `HKT=2026-09-30 13:18 HKT` (exit 127);
values are now quoted, threshold raised to 25 min to match the slower public cadence
(public commits at most every ~10 min, `AIOS_PUBLIC_PUBLISH_MIN_SEC`).

Durable source: ai-os `ops/status/github-actions/` (synced here by `mirror_public.py`).
