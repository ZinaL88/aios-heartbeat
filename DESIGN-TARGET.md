# Heartbeat UI design target (LOCKED 2026-09-14 · v20)

Source: Grok sandbox Build preview (React/TanStack hydrated app).
Canonical public host stays: https://zinal88.github.io/aios-heartbeat/
Do NOT dual-maintain a separate v5.html paint path.

## Must have (from sandbox)
- Header: HEARTBEAT + ping timestamp + live PING/STT/captions pills
- THREE LANES: Brain (SuperGrok Build) · Source (GitHub ai-os) · Hands (shell loop / watchdog — not crontab)
- NOW banner: active STT/captions ids **or** honest Paused · backlog N / Caught up
- Metrics row: **Transcripts on disk** (primary; includes caption-derived text) + pending secondary · **Captions done** (primary) + left secondary · RAM free · Ping — same failure-aware language
- WORK panel: CAPTIONS + STT — big number = **done**; subline `N done · M left` (show `now: {name}` only when running; never `file -` when no inflight)
- PROGRESS card: cumulative totals + top channels by done counts (phone-readable)
- BOX · HEARTBEAT: RAM/load/disk/tmp/cookies/next ping, RAM TOP, REBOOST LOG
- QUEUE: Edit, search, filters (Queued / Running / **Done** / All / Channels / Playlists), drag reorder, git-save stamp
- DO NOT safety panel

## Worker states (failure-aware)
Never say **idle**. Four states:
1. **Running** (green) — workers alive (`tracks.*.running=true` from live procs)
2. **Paused** (amber) — no workers BUT pending/left > 0 — copy: `Paused · backlog N`
3. **Caught up** (muted) — pending/left == 0 and no recorded failure — copy: `Caught up`
4. **Failed** (amber) — recorded crash/contract failure; restart backoff and circuit state exposed. A live worker remains Running; failed slots remain visible in health/events.

ETA rules:
- Running → live ETA (or calculating)
- Paused + overdue/frozen → `ETA overdue · worker stopped` (not a lone red past timestamp)
- Caught up → hide / `—`

## Visual
Near-black bg, charcoal cards, lime live accent, amber for Paused / low-RAM,
sans body + mono telemetry, mobile stacks / 2×2 metrics.

## Port strategy
Static HTML+JS on Pages fed by status.json (shell heartbeat). Recreate
layout fidelity; not a full React sandbox deploy (sandbox URLs die).
Cache-bust board fetches with `?v=20`.


## Plain-language board copy (v20 — never regress)
- **YouTube collect order** (was QUEUE): channels & playlists waiting for captions/transcripts. Top = first. Filters: Waiting / Collecting / Done / All / Channels / Playlists. Keep `data-phase` values `queued|running|done`; change visible labels only. Row subtitles: `Channel · waiting` · `Playlist · waiting · ~N videos` · `… collecting now` · `… first pass done`. No raw P0–P5 on the default line (optional `priority N` in edit mode only).
- **Everything else** (was OTHER): docs, OCR, cleanup, eval, CoS — not the YouTube list. Meta: `Docs, cleanup, OCR & CoS tasks · N in progress · M total`. Hide live-cap/live-stt/`collector-live` duplicates (those belong on collect order). Map resource classes for display only (`ram_heavy`→needs lots of memory, etc.). Pills: In progress / To do / Stuck / Done — keep `data-ostatus` values.
- Soften lanes header + Source lane one-liner; soften Save/skip hint (no PUT/path jargon).

## LOCKED ops rules (P0 — never regress)
- **Live proc detection (v19):** `write_status.classify_procs` must detect captions via cmdline match `backfill_members.py` + `--mode captions` (any python path, not only `.venv`). Same for STT `--mode stt` / whisper. Never publish `running=False` / `jobs=0` when those procs are alive. `/proc` cmdline > watcher heuristics.
- **Cumulative done (v18 — never regress):** zero-done while disk has files is a P0 lie; always overlay `disk_progress` onto `collector.tracks` + `collector.progress`. Pipeline correctness > watchers.
- **QUEUE search (v17+):** Typing in `#qSearch` auto-activates **All** and matches across phases (name / id / `data-name`), with `zhFold` simp↔trad (麦↔麥 etc.). Clearing search restores the prior phase tab when possible. Live `paint()` refreshes `data-phase` from STT/captions so Running/Queued/Done pills stay honest.
- **Edit is required real.** Edit button + PAT (`localStorage aios.pat`, never server) + Save must PUT `jobs/channel_queue.json` on `ZinaL88/ai-os` via GitHub Contents API. Never strip Edit down to “view only” when save is broken — fix save instead.
- **Ping stale >5m is a P0 ops fail.** If `written_at_utc` age exceeds 5 minutes, ping line + pill must show amber `STALE · {hkt} · {N}m ago` (heartbeat_loop dead / mirror lag). Do not hide a dead loop behind a green PING.

## QA gate before claim ship (v19 — never regress)
- Run `ops/status/qa_status_truth.sh` **before** claiming detection/UI ship.
- Script FAILs (exit 1) if:
  - live `backfill_members.py --mode captions` (argv) count >0 but `tracks.captions.running` false OR `jobs==0`
  - live STT/whisper but `tracks.stt.running` false
  - disk STT done >100 but `tracks.stt.done` / `transcripts_on_disk` ==0
  - pending/left >0 and not running but `worker_state` not in `paused` / `failed` (bare idle banned)
- Also prove Pages: `curl` public `status.json` and assert `tracks.captions.running` matches box live count.
- UI click/DOM QA on `?v=20`: captions pill = Running when workers live, else Paused · backlog N / Caught up. No `file -`. ETA overdue explained when paused.


## Responsive (v21 — never regress)
- Usable at ~390 / ~768 / ≥1200 without horizontal scroll or tap targets <40px.
- Safe-area insets on notched phones; form controls `font-size:16px` (no iOS zoom).
- Board stacks (lanes/metrics/grid2/bottom) single-column under 820px; multi-column when width allows.
- Queue/other lists scroll inside cards on narrow screens; sticky edit bar + confirm sheet stay phone-friendly.
- Patch **ops/status/render_public_html.py** (not only mirrored index.html) so status sync keeps fixes.
- Cache-bust library links / board fetch `?v=21`.

## Operational truth update
Recent Ops is immutable completed-action history. SYSTEM EVENTS records transitions. Unique-video corpus totals live in a durable ledger; scope progress is separate. Original spoken language must be preserved; automatic audio language detection must not inherit channel/title guesses. See PRINCIPLES.md and the source ops/status/OPERATIONS.md.
