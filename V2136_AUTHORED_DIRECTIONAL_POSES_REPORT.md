# ETRANOM V2136 — authored directional pose integration

## Delivered
- Connected the existing authored 128×160 PNG pose sets to the live map-character draw path for `warrior_apocalypse_harbinger` and all four Wizard specializations (`wizard_arcane_mage`, `wizard_elementalist`, `wizard_necromancer`, `wizard_warlock`).
- Each of these five specializations now selects a matching image for all 8 directions and all 4 states (idle, walk, run, interact).
- Authored pose images use the same foot/ground anchored draw geometry and preload flow as the existing atlas renderer.
- The other 35 specializations continue using their V2055 multi-frame directional atlases; no fallback art was removed.
- Updated the game entry cache key and build manifest.

## Verification
- 9 focused Node tests passed: runtime geometry, authored-asset contract, and V2135 atlas/keyframe audit.
- JavaScript syntax check passed for the updated runtime.

## Honest limitation
The five authored sets contain one image per state/direction, not multi-frame hand animation. The same single pose is therefore held during that state. The other 35 specializations still use prototype atlas artwork. This patch integrates available authored art; it does not claim final hand-authored animation for all 40 specializations. A complete final-art pass for all 40 requires 40 distinct sets of frame-authored assets and visual QA on the target device.

## Preserved
No changes to authentication, Supabase, presence payload contracts, movement/collision, combat, progression, inventory, economy, guilds, parties, chat, marketplace, PvP, or region content.
