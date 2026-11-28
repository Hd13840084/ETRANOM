# ETRANOM V2133 — Character gait-cycle normalization

## Scope

This release corrects playback cadence for the existing full-body directional/state sprite strips used by local and remote map avatars. It preserves all 40 specialization identities, all eight authored directions, the 1,280 PNG strips, and the V2132 ground-anchor renderer.

## Finding

An asset-level pixel comparison found that 248 walk strips and 248 run strips contain an exact four-frame sequence duplicated in the second half of the eight-frame strip. The generic atlas clock was playing all eight tiles at the original speed, so those clips completed two identical gait cycles in the time intended for one. The procedural body gait runs at 1.5 cycles/sec for walking and 2.5 cycles/sec for running, which made the authored sprite cadence visibly run ahead of the body pose.

## Fix

- The 248 exact repeated walk strips now read source frames 0–3 at 6 fps, preserving the original 0.667-second cycle duration and aligning with the existing 1.5 Hz walk pose.
- The 248 exact repeated run strips now read source frames 0–3 at 10 fps, preserving the original 0.4-second cycle duration and aligning with the existing 2.5 Hz run pose.
- The other 72 walk strips and 72 run strips have non-repeating authored frame sequences and retain their original 8-frame / 12 fps and 8-frame / 20 fps timing.
- All 320 idle strips retain their authored frame holds and idle phase timing.
- All 320 interact strips retain their authored one-shot sequence, hold frames, and return-to-idle behavior.
- The original PNG files are not modified; the renderer selects the correct source frame from the existing strip.
- Local, remote Presence and overview-map avatars continue to use the same atlas draw runtime.

## Validation

- 40 specialization folders checked.
- 1,280 directional/state PNG strips checked.
- No missing strips or incorrect dimensions.
- Exact repeated-cycle detection: 248 walk + 248 run strips.
- V2133 playback tests: 6 passed.
- V2131 animation state/timing tests: 7 passed.
- V2132 ground-anchor tests: 5 passed after updating the build-version assertion.
- World-avatar specialization/Presence tests: 3 passed.
- Focused combined suite: 21 passed, 0 failed.
- JavaScript syntax checks: passed for changed runtime, profile module and game entry.

## Not claimed

- This is playback-cadence and source-frame selection correction. It does not redraw missing hand-authored limb, cape, weapon or attack frames.
- No browser/device visual QA, live two-account Supabase session, or deployment was performed.
- The broad legacy repository suite has not been represented as clean by this focused release.

## Preserved

Authentication, player saves, Supabase schema, Presence payload shape, movement coordinates, collision, combat authority, rewards, economy, inventory, party, guild, chat, marketplace, PvP, safe-zone contents, danger-zone contents and all source artwork files.
