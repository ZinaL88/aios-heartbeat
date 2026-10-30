# Loop Engineering playbook — AI OS — 2026-10-30

**Purpose:** Teach any doer (OpenCode, Gemini, Cursor, Codex, Grok2) how Z L expects work to move.  
**Public copy:** Heartbeat `handoff/loop-engineering-playbook-20261030.md`.

## Definition
**Loop Engineering (LE)** = keep open work moving with a **named PIC** and **free executors** until **built → tested → deployed → published**, or honestly blocked on a Z L hard gate. Never “park and hope.”

## Per hop
1. **Inventory** — open sit-room / fleet / LE tickets with no PIC or stale claim.
2. **Claim** — write claim/job with `prompt_path`, `workdir`, `executor`. Prefer **≥3** independent claims when work exists.
3. **Spawn real doers** — `opencode run` / Gemini API / agy / Cursor / Codex. **Not** sleep-loop slot holders. `alive_workers=0` on a claimed job = **FAIL**.
4. **Checker ≠ doer** — separate checker verifies done criteria; false-complete is FAIL.
5. **Close** — `--complete` / `--fail` with notes; sync surfaces.
6. **Same-turn rule** — any wake that sees idle no-PIC work must assign parallel free doers **that turn**.

## Free-first ladder
OpenCode → Gemini (Free AI Studio API key / agy) → Cursor → Codex.  
**Do not** burn Grok as primary doer. Grok = coordinator / gatekeeper only when allowance allows.

## Never
- Park idle no-PIC work.
- Ask Z L to paste, open Drive, or fill vault/config forms.
- Invent allowance % or deploy/merge Yes.
- Install Grok2 autopull on the Grok1 primary box.
- Open WhatsApp Web outside Grok1 Fork-5 on the primary box.
- Rely on Instinct WA to wake Grok2 while Grok2 is at 0 tokens.

## Decider (core)
Always monitor bot/agent allowances. When a Grok seat **resets to 100%**, trigger install of handoff autopull cron **on that bot’s own box** and remind it to read this playbook pack.

## References (box paths; mirrored in public handoff when listed in index)
- `loop-no-idle-pic-standing-20261030.md`
- `parallel-free-doers-20261030.md`
- `grok2-wall-handoff-20261030.md`
- `wall-pickup-codex-gemini-20261030.md`
- `decider-allowance-reset-handoff-trigger-20261030.md`
- `ask-lizheng-blocker-path-20261030.md`
