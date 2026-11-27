// ETRANOM V2164 — walkable raised bridge decks with ramps and edge containment.
import { ETRANOM_BRIDGE_CROSSINGS_V2162 } from './visual-physical-consistency-v2162.js?v=2162';
import { sampleTerrainElevationV2146 } from './terrain-topography-v2146.js?v=2146';

const clamp = (v, a, b) => Math.max(a, Math.min(b, Number(v) || 0));
export function resolveBridgeDeckSampleV2164(x, y, radius = 0) {
  const px = Number(x), py = Number(y), r = Math.max(0, Number(radius) || 0);
  if (!Number.isFinite(px) || !Number.isFinite(py)) return null;
  for (const bridge of ETRANOM_BRIDGE_CROSSINGS_V2162) {
    if (bridge.status !== 'registered-to-waterway' || !bridge.crossingFrame) continue;
    const dx = px - bridge.x, dy = py - bridge.y, { tangent, normal } = bridge.crossingFrame;
    const across = dx * tangent.x + dy * tangent.y;
    const along = dx * normal.x + dy * normal.y;
    const halfLength = bridge.length * .5, halfWidth = bridge.deckWidth * .5;
    if (Math.abs(across) > halfWidth + r || Math.abs(along) > halfLength + r) continue;
    const t = clamp((along + halfLength) / (2 * halfLength), 0, 1);
    // Raised crown plus gentle bank ramps; z is in world height units, not horizontal coordinates.
    const deckRise = 2.5 + 6.5 * Math.sin(Math.PI * t);
    const slope = (6.5 * Math.PI * Math.cos(Math.PI * t)) / (2 * halfLength);
    const bankApproach = Math.max(0, Math.min(1, (Math.abs(along) - halfLength * .72) / (halfLength * .28)));
    return Object.freeze({ bridgeId: bridge.id, waterwayId: bridge.waterwayId, onDeck: true,
      deckElevation: sampleTerrainElevationV2146(px, py) + deckRise,
      deckRiseUnits: deckRise, deckRiseMeters: deckRise / 40, along, across, t,
      longitudinalSlope: slope, bankApproach, halfWidth, halfLength,
      guardClearance: Math.max(0, halfWidth - Math.abs(across)), support: 'solid-deck',
      surface: 'wood-deck' });
  }
  return null;
}
export function auditBridgePhysicsV2164() {
  const errors = [];
  if (ETRANOM_BRIDGE_CROSSINGS_V2162.length !== 2) errors.push('bridge-count');
  for (const bridge of ETRANOM_BRIDGE_CROSSINGS_V2162) {
    if (bridge.status !== 'registered-to-waterway') { errors.push(`unregistered:${bridge.id}`); continue; }
    const sample = resolveBridgeDeckSampleV2164(bridge.x, bridge.y, 0);
    if (!sample?.onDeck || !(sample.deckRiseMeters > 0)) errors.push(`deck-not-raised:${bridge.id}`);
    if (resolveBridgeDeckSampleV2164(bridge.x + bridge.deckWidth * 2, bridge.y, 0)) errors.push(`deck-too-wide:${bridge.id}`);
  }
  return Object.freeze({ ok: errors.length === 0, version: 2164, stage: 22, bridges: ETRANOM_BRIDGE_CROSSINGS_V2162.length,
    deckModel: 'heightfield-crowned-deck-with-bank-ramps-and-edge-containment', errors: Object.freeze(errors) });
}
