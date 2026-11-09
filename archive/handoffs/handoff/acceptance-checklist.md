# acceptance-checklist — handoff pack gate ACCEPT list · 2026-10-30 HKT

Mirrors the ACCEPT list from `/workspace/briefs/handoff-pack-gate-review-20261030.md` (Grok1 gate review, NOT ACCEPTED → refine). For Grok2 self-check + doer self-check. The gate stamp itself is `ACCEPTED` in the gate-review brief by the Grok1 reviewer — the doer does not self-accept; this file is never stamped ACCEPTED.

## ACCEPT only when ALL true

- [ ] **1. Live Pages `index.json`:** schema `aios-wall-handoff-pack/v1`, `prefer[0] == "pages_base"`, autopull tries Pages → CDN → raw in that order.
- [ ] **2. `GROK2-BOX-START.md` exists** (renamed away from PASTE): numbered steps for the Grok2 box only — curl the index, install autopull, cron `*/30`, read LE + wall playbook, claim idle work. No "paste into chat" wording anywhere in the pack bootstrap.
- [ ] **3. Explicit wrong-host ban:** never install the Grok2 puller (or its cron) on the Grok1 primary box. One-time `curl` fetch test from the primary is the only tolerated probe, documented as no-install.
- [ ] **4. Explicit token-0 path:** while Grok2 sits at 0% allowance, the seed is the product Decider detecting the reset → 100% and firing the autopull install on that box. Nothing in the pack tells Grok2 to wait on Instinct WA.
- [ ] **5. File map complete:** `index.json` file map covers every file Grok2 must read; autopull pulls all of them; curl proof HTTP 200 for each on Pages.
- [ ] **6. Live strip fresh:** live strip refreshed < 30 minutes; no secrets anywhere in the pack (paths only, never values).
- [ ] **7. Checker note PASS:** under `fleet-monitor/checker-passes/` with curl evidence.
- [ ] **8. Grok1 gate stamp `ACCEPTED`:** in the gate-review brief (`handoff-pack-gate-review-20261030.md`). Doer does not self-accept; Grok2 never self-accepts.

## Doer refine gaps (from gate review §Gaps)

- [ ] A. Push `prefer` pages-first + autopull order (Pages → CDN → raw).
- [ ] B. `GROK2-BOX-START.md` exists and `index.json` `bootstrap` points at it; old bootstrap kept only as deprecated alias; paste wording removed.
- [ ] C. This checklist exists, mirroring the ACCEPT list for self-check.
- [ ] D. Any dry-run on the primary is only a curl-fetch test — no cron install on the primary — documented.
- [ ] E. Decider reset brief (`decider-allowance-reset-handoff-trigger-20261030.md`) cross-linked as the token-0 thaw trigger.

| Item | Gate owner |
|------|-----------|
| Items 1–7 | Doer closes, Grok1 checker verifies |
| Item 8 | Grok1 reviewer only |
