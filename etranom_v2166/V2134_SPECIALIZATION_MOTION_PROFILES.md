# ETRANOM V2134 — specialization-aware map-character motion

## Scope

This release improves the motion envelope of the existing 40 map-character specializations. It does not replace the V2133 gait-cycle selection, V2132 foot anchors, V2131 actor clocks, source sprites, Presence payloads, or world movement.

## Implementation

- Added bounded motion profiles for all 10 character families and all 40 specialization IDs.
- Agile silhouettes receive slightly more lateral sway and tilt; heavy/armored silhouettes receive a steadier upper-body envelope and a wider contact shadow; cloth/mystic families retain restrained motion and a distinct interaction reach.
- The profile is resolved by the exact specialization identity, then applied to the existing state pose for idle, walk, run, and interact.
- Local and remote map avatars call the same profile module.
- Small deterministic per-specialization multipliers prevent every member of a class from having precisely identical movement amplitude.
- All scale, sway, tilt and anchor-related outputs are clamped to narrow ranges to prevent visual wobble and foot drift.

## Source-art limitations discovered during review

The existing asset manifest `assets/characters/v2058-art-direction-manifest.json` still identifies the atlas artwork as pending authored artwork (`artworkAuthoredCount: 0`). Existing strips are usable multi-frame prototypes, not a complete set of hand-drawn limb/weapon/cape animation. The 8 Warrior/Wizard specialization identities also use simplified vector-style bases rather than the 32 painterly full-body concept bases available under `assets/characters/v2063-fullbody/`. This release does not disguise that limitation or overwrite those identities. Independent weapon, cape, hand and attack-frame animation requires new art layers/frames.

## Validation

- 40 specialization IDs found in roster.
- 10 class-level motion profiles.
- All 4 states tested for each specialization (160 profile/state cases).
- Deterministic output confirmed.
- Unknown specialization falls back to the shared base pose.
- Local and remote map renderer imports/uses the same profile module.
- Targeted V2134 test suite: 5 passed, 0 failed.
- Syntax checks passed for changed JavaScript files.

## Preserved

No changes to authentication, saved character data, Supabase schema or Presence metadata shape, world movement coordinates, collision rules, combat authority, damage, progression, economy, inventory, guild, party, chat, marketplace, PvP, or environment contents.

## Not yet verified

No browser/device visual QA, live two-account Presence session, or production deployment was performed. The wider legacy test suite is not claimed to be clean by this focused release.
