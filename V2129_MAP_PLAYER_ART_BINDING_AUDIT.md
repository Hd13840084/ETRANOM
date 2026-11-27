# ETRANOM V2129 — Player Map Character Art Binding

## What changed

- Local player, remote players received through Supabase Presence, and player markers on the overview map now resolve through the same canonical 40-specialization identity roster.
- Legacy numbered IDs (`warrior_1..4`, `wizard_1..4`) are mapped to their canonical visual identities rather than silently falling back to the first specialization of the class.
- Persian specialization labels from the current specialization catalog are mapped to the matching canonical image IDs. This supports older saves that only retained the display name.
- The overview-map player marker uses the 40-image `v2067-map-art` pack, with the existing `v2063-fullbody` artwork as an error fallback.
- Live-world canvas rendering continues to use specialization-specific directional atlas art first, with the same `v2067-map-art` image as fallback; local and remote avatars use the same ID resolver.
- Presence now publishes the canonical specialization ID, so other clients receive the same character artwork identity instead of depending on a client-specific legacy string.
- The game entry and binding module URLs were cache-busted to prevent an older resolver from remaining active after deployment.

## Existing-art limitations observed during inspection

- The project contains 40 individual full-body map-art PNGs at 384×512.
- It also contains all 1,280 directional/state atlas strips (40 specializations × 8 directions × 4 states).
- The atlas manifest describes these strips as procedural pose prototypes. Their dimensions and paths are valid, but repeated frames across animation states were already recorded by the previous art acceptance audit. This implementation binds and displays the supplied images; it does not claim that every strip contains independently hand-animated walking frames.
- Five specializations have separate authored directional-pose folders in the existing source assets (the four wizard specializations and Warrior Apocalypse Harbinger). The remaining specializations use their existing directional atlas plus full-body map-art fallback.

## Scope preservation

No combat rules, character stats, account/authentication, saves, database schema, guild/party systems, chat, marketplace, or multiplayer channel contract was intentionally changed. The Presence payload continues to use the existing `specialization_id` field, now sent in canonical form.

## V2129 validation

- Automated V2129 test file: 4 passed, 0 failed.
- Art audit: 40/40 map-art PNGs and 1,280/1,280 directional/state atlas strips found with expected dimensions.
- Legacy IDs and Persian catalog display names: 40/40 resolve to the intended canonical specialization identity.
- Static runtime checks: local canvas avatar, remote canvas avatar, overview-map marker, local Presence publication and cache-busted game entry all reference the canonical binding.
- JavaScript syntax checks passed for the changed runtime files; 29 relative imports from `game.js` were checked and none were missing.
- Authenticated browser/device test with two simultaneous player accounts was not performed. Therefore live visual confirmation of local and remote movement remains outstanding.
