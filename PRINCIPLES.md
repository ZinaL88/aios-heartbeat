# HEARTBEAT principles

HEARTBEAT is AIOS's partner and control surface: a place to monitor, instruct, interact and iterate. AIOS owns execution and source state. The goal is autonomous operation without paid agents or runtime model-token calls. The longer-term Memory/knowledge layer remains parked.

- Original-language transcripts only. Automatic workers detect spoken language, transcribe rather than translate, and use verified original caption tracks. Channel labels and video titles must not force an audio language.
- Source state decides whether an addition exists. Queue writes serialize by a shared lock; canonical channel/playlist IDs and video IDs prevent duplicate additions. A request ID replays the saved result of the same action.
- Ops history is immutable history, never a pending queue. Applied means the addition reached source state, not that collection finished. Already present, partial and failed outcomes are explicit. Multi-scope actions retain per-entity outcomes.
- Running comes from live worker processes. Paused means stopped with outstanding work and no recorded crash. Failed means recorded worker failure, with bounded retries. Caught up means no remaining work in the observed scope.
- Global corpus totals count unique video IDs ever observed by the durable ledger; current disk counts and worker-scope progress remain separate. A decrease in observed files is a system event, not silently hidden by a maximum counter.
- System events record meaningful transitions. Repeated unchanged pings do not create new system events.
- Freshness and history have different jobs: latest status every five minutes, local status every ten seconds, compact daily deltas and daily checkpoints retained for 30 days. Legacy snapshots remain a frozen archive. Git still stores versions of latest status; no history rewrite is required.
- Secrets, cookies, credentials and local paths do not belong in public telemetry. Preserve existing library functionality; do not treat every collected item as public.
