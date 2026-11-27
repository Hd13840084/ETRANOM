# ETRANOM V2135 — 40-specialization portrait and atlas playback repair

## What changed

### Portrait binding for all 40 specializations

A single canonical portrait resolver now maps all 40 specialization IDs to their existing artwork:

- 8 Warrior/Wizard specializations use their dedicated painted portraits in `assets/classes/`.
- 32 other specializations use their dedicated full-body art in `assets/characters/v2063-fullbody/`.

The same mapping is used by character creation class cards, specialization cards, live preview, the character profile, the solo-battle hero card, party battle cards and party roster cards. Persian catalog names and legacy display aliases resolve to the canonical specialization ID. The map movement renderer continues to use the directional V2055 atlas for both local and remote players.

### Atlas keyframe timing

A pixel-exact audit was run against all 1,280 V2055 directional/state strips (40 specializations × 8 directions × 4 states; 9,600 source frames).

- 496 walk/run strips contained an exact repeated four-frame cycle. Playback now selects one cycle over the original clip duration.
- 568 idle/interact strips contained adjacent identical frames. Adjacent duplicates are represented as weighted holds, preserving their original duration instead of wasting separate frame steps.
- 216 strips had no duplicate keyframes and remain unchanged.

All source PNGs remain untouched: no frame pixels, paths, dimensions, character identity or directions were rewritten.

## Verification

- 40 unique specialization portrait paths; all referenced files exist.
- 1,280 directional/state atlas strips present and dimensionally valid.
- 9,600 frames checked; no missing, empty or wrong-dimension frame found.
- 1,064 generated playback profiles validated.
- 13 focused Node test files passed, including atlas playback, all portrait bindings, local/remote identity resolution, motion profiles, map animation clock and party/profile UI wiring.
- JavaScript syntax checks passed for the changed entry, party and character modules.

## Important artwork limitation

This release does **not** claim that all 40 characters now have fully hand-authored animation. The repository's own V2058 art-direction manifest still records `artworkAuthoredCount: 0` and `artworkStatus: pending_manual_or_image_authored_assets`. The V2055 strips are directional animation prototypes. V2135 corrects how their existing frames and holds are played and fixes the missing portrait bindings, but it does not invent new limb, weapon, cape or attack artwork. A true final animation pass still requires authored frame art for every required direction and state.

## Preserved

No changes to authentication, player saves, Supabase schema, Presence payload shape, world coordinates, movement/collision rules, combat, damage, progression, economy, inventory, guild, party authority, chat, marketplace, PvP or danger-region content.

## Not verified

No production deployment, browser visual QA on a physical Android device, or live two-account multiplayer session was performed in this build.
