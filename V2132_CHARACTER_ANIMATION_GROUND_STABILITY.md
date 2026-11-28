# ETRANOM V2132 — Character Animation Ground Stability

## What changed

- Preserved the V2131 state-aware animation clock, all 40 specialization bindings, all eight directions, and idle/walk/run/interact clips.
- Added a ground-anchored destination rectangle. Scale changes now pivot around the bottom-center contact point rather than the sprite's top-left corner.
- Audited each frame's alpha bounds in all 1,280 directional/state strips and generated per-frame bottom-edge corrections. These offsets stabilize the feet when authored frames have slightly different transparent margins.
- Applied the same ground-anchor geometry to the local player, remote player atlas rendering, and static-art fallbacks.
- Updated the older specialization regression test to assert the current canonical resolver instead of a stale direct-field implementation.

## Asset audit

- 40/40 specialization portraits found.
- 1,280/1,280 directional/state strips found.
- No missing strips, incorrect dimensions, or fully transparent frames.
- Frame-bottom correction metadata covers all 1,280 strips; maximum correction is 6 source pixels.
- Existing frame variation remains uneven. This release stabilizes playback; it does not redraw or invent new hand-authored animation frames.

## Focused tests

- Animation and timing tests: passed.
- Ground-anchor geometry tests: passed.
- Frame foot-correction tests: passed.
- Local/remote specialization binding tests: passed.
- 100-player Presence simulation test: passed (simulation only).
- Combined focused suite: 16 passed, 0 failed.
- JavaScript syntax checks: passed.

## Not claimed

- No browser/device visual test was run.
- No two-account live Supabase session was run.
- No deployment or GitHub push was performed.
- The legacy full repository suite was not rerun in this build; V2131 recorded 133 legacy failures, so this build does not claim a clean full-suite result.

## Preserved

Authentication, player saves, database schema, combat authority, rewards, economy, inventory, party, guild, chat, marketplace, PvP, movement coordinates, and collision rules were not changed.
