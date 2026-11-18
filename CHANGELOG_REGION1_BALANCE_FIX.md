# ETRANOM – Region 1 routing, attributes and progression correction

- Preserved the selected danger-zone ID when opening normal battles, miniboss fights and the final boss. Invalid/missing zone IDs now stop combat instead of silently falling back to the first zone.
- All six subareas remain part of Danger Region 1. Their monster levels are 1, 2, 3, 4, 5 and 5, while every recipe/item found in these subareas is explicitly item level 1.
- Raised and normalized Region 1 monster HP/defense floors and gave monsters all eight canonical attributes plus meaningful MP. Enemy attack values remain intentionally conservative relative to their HP/defense.
- Synchronized the two Region 1 monster JSON packs with the same attribute/HP/MP scale used by the runtime combat catalog.
- Added explicit HP and MP bonuses to crafted gear. Vitality scales HP; Intellect and Faith scale MP. Perception also contributes to magical/faith-class attack, in addition to accuracy-related systems.
- Kept the 10-tier recipe multiplier architecture: item tier 1–10 uses 3.5^(tier-1). Region 1 is fixed to tier 1; future regions can use their corresponding tier without confusing subarea enemy level with item level.

## Verification

- `node --check game.js` passed.
- `node --test tools/tests/*.test.mjs` passed (6 test files).
- `node tools/region-one-balance-check.mjs` passed.
- `node tools/region-one-progression-check.mjs` passed.

These are local source/static and automated tests. They do not constitute a live-host deployment or a real multiplayer browser test.
