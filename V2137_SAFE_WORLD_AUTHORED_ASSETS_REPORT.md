# ETRANOM V2137 — Safe-world authored sprite pass

## Base and scope
- Base: V2136 full game archive.
- Scope: add real standalone transparent PNG environment props to Ash City, Farmland, Rootwood and Ironstone; bind them to the existing isometric render pipeline.
- Existing buildings, NPCs, terrain tiles, routes, settlement positions, interactions and gameplay rules are preserved.

## New art
A new 4×3 authored sprite sheet was generated specifically for the safe-world environment and sliced into 12 independent RGBA PNG assets:
1. lantern post
2. stone bridge
3. roofed well
4. direction sign
5. market cart
6. stone water trough
7. wayside shrine
8. notice board
9. root stump
10. wildflower patch
11. firewood rack
12. rain barrel

The 12 crops are stored under `assets/safe-zone/props-v2137/`. Each is individually loaded as an image, with alpha transparency retained. The render module defines 24 deterministic placements distributed across the four safe settlements, with a foreground depth pass for player occlusion.

## Runtime integration
- Added `systems/safe-zone/authored-props-v2137.js`.
- Imported and called its background and foreground render functions from `game.js`.
- Updated the `game.js` cache-busting token in `index.html` to V2137.
- Rendering is decorative only. No movement, collision, route, POI, NPC, combat, economy, save, authentication, multiplayer or database logic was changed.

## Validation performed
- `node --check game.js`: PASS.
- `node --check systems/safe-zone/authored-props-v2137.js`: PASS.
- All 12 referenced PNG files exist, are RGBA, contain non-empty alpha bounds and exceed 100×100 pixels: PASS.
- 24 deterministic placements are defined: PASS.
- ZIP integrity checks: performed during packaging.

## Important completion boundary
This is an additional authored-asset tranche, not a claim that every visual primitive in the safe world has been converted to standalone artwork. Existing code still draws some roads, irrigation channels, water, fences, gates, ambient residents, lighting and finishing effects procedurally; those require their own asset conversion and visual integration passes. No browser or physical Android visual QA was available in this run. The map should be reviewed in-game for exact scale, overlaps, depth sorting and placement before production deployment.
