# HEARTBEAT

HEARTBEAT is AIOS's partner and control surface for monitoring, instructing, interacting and iterating toward a token-free autonomous setup. It is not AIOS itself. The longer-term Memory/knowledge layer is not part of this change.

The public UI lives here. Canonical implementation lives in [ZinaL88/ai-os](https://github.com/ZinaL88/ai-os): `ops/api` applies additions, `ops/status` observes workers and publishes this surface, and collector scripts execute work. Fix the source renderer rather than editing only generated HTML.

## Status and history

- `status.json`: latest public observation, normally every five minutes. The UI displays its timestamp and marks stale observations.
- `board.json`: queue/source projection. An addition can be applied while its collection work remains unfinished.
- Recent Ops: completed action outcomes, with titles, scope, links and Applied / Already present / Partial / Failed labels. This is not a pending list.
- System Events: meaningful operational transitions, including worker failures/recovery and corpus observation decreases.
- Corpus: durable unique-video totals since ledger initialization, separate from current disk counts and current worker-scope progress. Caption-derived text is not mislabeled as local STT.
- `history/YYYY-MM-DD.checkpoint.json` plus `.events.jsonl`: one complete daily checkpoint and compact changes with before/after hashes; 30-day rolling retention. `history/index.json` lists available days.
- `live/`: frozen legacy snapshot archive; new pings no longer add files here. Existing Git history is not rewritten.

The page shell rebuilds when source rendering code or queue structure changes; live status continues to refresh independently. Git still records changing `status.json` blobs. This reduces duplication without claiming Git is a time-series database.

Existing library/search facilities remain available under their existing access rules. Heartbeat telemetry must not expose cookies, credentials, local filesystem paths or transcript contents. See [PRINCIPLES.md](PRINCIPLES.md).
