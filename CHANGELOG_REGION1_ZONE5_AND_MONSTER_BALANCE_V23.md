# ETRANOM – Region 1 zone 5 routing and monster balance v23

- Zone selection now persists in a dedicated active danger-region context as well as the saved state. The normal battle button validates and passes its exact zone ID; invalid IDs no longer fall back to Burnt Forest.
- Runtime encounter catalog and both Region 1 monster JSON packs are synchronized. Every enemy now has all eight canonical attributes, meaningful HP and MP, and zone-level scaling for levels 1–5.
- Normal enemies scale by zone level and quality; minibosses and the final boss have distinct HP/MP/defense bands. Enemy attack remains deliberately lower than their durability.
- Region 1 item/recipe tier remains level 1 across all six subareas; the ten-tier progression and rarity system are retained.

## Validation
Static/runtime catalogue tests and syntax checks are run before packaging. Browser/mobile playtesting is still required to confirm the zone 5 interaction in the deployed environment.
