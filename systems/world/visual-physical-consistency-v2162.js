// ETRANOM V2162 — Stage 20/24: Visual / Physical Consistency.
// Shared transforms are the single source of truth for sprite ground anchors,
// structural footprints and authored bridge crossings. All X/Y values remain
// V2138 logical-world units; no metre conversion is invented here.
import { ETRANOM_WORLD_GEOMETRY_V2140, distanceToPolylineV2140 } from './world-geometry-v2140.js?v=2140';
import { resolveBuildingDimensionsV2141, ETRANOM_BUILDING_ARCHITECTURE_V2141 } from '../safe-zone/building-architecture-v2141.js?v=2162';
import { ETRANOM_TREES_VEGETATION_V2148 } from '../safe-zone/trees-vegetation-v2148.js?v=2162';
import { ENVIRONMENTAL_PROPS_V2147 } from '../safe-zone/environmental-props-v2147.js?v=2162';
import { ETRANOM_VEHICLE_SYSTEM_V2149 } from './vehicle-system-v2149.js?v=2162';
import { ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137 } from '../safe-zone/authored-props-v2137.js?v=2162';
import { ETRANOM_BUILDING_YARD_PLACEMENTS_V2117 } from '../safe-zone/building-yards-v2117.js?v=2162';

const round = n => Math.round(Number(n) * 1000) / 1000;
const finite = (...values) => values.every(Number.isFinite);

/** Exactly mirrors the ground anchor used by drawBuildingSpriteV2100(). */
export function resolveBuildingGroundAnchorV2162(building) {
  if (!building || !finite(Number(building.x), Number(building.y), Number(building.h))) return null;
  return Object.freeze({ x: Number(building.x), y: round(Number(building.y) + Number(building.h || 120) * 0.30), z: 0, anchor: 'building-sprite-groundY-y-plus-0.30h' });
}

/** Diamond footprint matches the ground-shadow path drawn by the building renderer. */
export function resolveBuildingContactFootprintV2162(building) {
  const dimensions = resolveBuildingDimensionsV2141(building);
  const anchor = resolveBuildingGroundAnchorV2162(building);
  if (!dimensions || !anchor) return null;
  const halfLength = dimensions.length * 0.5;
  const halfDepth = dimensions.depth * 0.5;
  const points = Object.freeze([
    Object.freeze([round(anchor.x - halfLength), anchor.y]),
    Object.freeze([anchor.x, round(anchor.y - halfDepth)]),
    Object.freeze([round(anchor.x + halfLength), anchor.y]),
    Object.freeze([anchor.x, round(anchor.y + halfDepth)])
  ]);
  return Object.freeze({ buildingId: building.id, anchor, shape: 'diamond-ground-footprint', points,
    bounds: Object.freeze({ minX: anchor.x - halfLength, maxX: anchor.x + halfLength, minY: anchor.y - halfDepth, maxY: anchor.y + halfDepth }),
    length: dimensions.length, depth: dimensions.depth, wallThickness: dimensions.wallThickness,
    source: 'V2141-footprint-dimensions + V2100-render-ground-anchor' });
}

// Both bridge placements are registered against the exact waterway they visually cross.
// The walkable strip is derived from the waterway tangent, so it remains perpendicular
// to the current of the stream. The pre-authored sprite rotation is kept unchanged.
const BRIDGE_ROWS = [
  { id: 'wood-bridge-keshtezar', asset: 'wood_bridge.png', x: 760, y: 750, renderRotation: -0.12, length: 150, deckWidth: 48, waterwayId: 'keshtezar_irrigation' },
  { id: 'stone-bridge-rootwood', asset: 'stone_bridge.png', x: 2190, y: 1210, renderRotation: 0.32, length: 155, deckWidth: 50, waterwayId: 'rootwood_creek' }
];

function nearestWaterwayFrame(row) {
  const waterway = ETRANOM_WORLD_GEOMETRY_V2140.waterways.find(w => w.id === row.waterwayId);
  if (!waterway) return null;
  let nearest = null;
  for (let i = 1; i < waterway.points.length; i++) {
    const a = waterway.points[i - 1], b = waterway.points[i];
    const vx = b[0] - a[0], vy = b[1] - a[1], length2 = vx * vx + vy * vy || 1;
    const t = Math.max(0, Math.min(1, ((row.x - a[0]) * vx + (row.y - a[1]) * vy) / length2));
    const px = a[0] + vx * t, py = a[1] + vy * t, distance = Math.hypot(row.x - px, row.y - py);
    if (!nearest || distance < nearest.distance) {
      const length = Math.hypot(vx, vy) || 1;
      nearest = { distance, point: Object.freeze({ x: round(px), y: round(py) }), tangent: Object.freeze({ x: vx / length, y: vy / length }), normal: Object.freeze({ x: -vy / length, y: vx / length }), segmentIndex: i - 1 };
    }
  }
  return nearest;
}

export const ETRANOM_BRIDGE_CROSSINGS_V2162 = Object.freeze(BRIDGE_ROWS.map(row => {
  const frame = nearestWaterwayFrame(row);
  return Object.freeze({ ...row, groundAnchor: 'deck-center', crossingFrame: frame,
    crossingTolerance: 18, status: frame && frame.distance <= 18 ? 'registered-to-waterway' : 'unverified-water-alignment' });
}));

/** Check a point against the limited deck corridor, not a broad circular no-collision zone. */
export function isPointOnBridgeDeckV2162(x, y, waterwayId, playerRadius = 0) {
  const px = Number(x), py = Number(y), r = Math.max(0, Number(playerRadius) || 0);
  if (!finite(px, py)) return false;
  const bridge = ETRANOM_BRIDGE_CROSSINGS_V2162.find(item => item.waterwayId === waterwayId && item.status === 'registered-to-waterway');
  if (!bridge?.crossingFrame) return false;
  const dx = px - bridge.x, dy = py - bridge.y;
  const { tangent, normal } = bridge.crossingFrame;
  const alongCurrent = dx * tangent.x + dy * tangent.y;
  const acrossCurrent = dx * normal.x + dy * normal.y;
  return Math.abs(alongCurrent) <= bridge.deckWidth * 0.5 + r && Math.abs(acrossCurrent) <= bridge.length * 0.5 + r;
}

// Asset-level contact rules: circles are used for compact round bases; elongated
// footprints use ellipses/rectangles. These are explicitly authored gameplay
// footprints, not a claim that alpha pixels equal physical geometry.
const ASSET_CONTACT_PROFILES = Object.freeze({
  'gothic_props_05.png': { shape: 'ellipse', rx: .22, ry: .15 },
  'gothic_props_06.png': { shape: 'ellipse', rx: .22, ry: .15 },
  'gothic_props_09.png': { shape: 'ellipse', rx: .19, ry: .13 },
  'gothic_props_10.png': { shape: 'ellipse', rx: .19, ry: .13 },
  'farm_props_05.png': { shape: 'ellipse', rx: .23, ry: .16 },
  'farm_props_06.png': { shape: 'ellipse', rx: .23, ry: .16 },
  'farm_props_07.png': { shape: 'ellipse', rx: .24, ry: .17 },
  'farm_props_08.png': { shape: 'ellipse', rx: .24, ry: .17 },
  'farm_props_09.png': { shape: 'ellipse', rx: .25, ry: .17 },
  'farm_props_10.png': { shape: 'ellipse', rx: .25, ry: .17 },
  'rocks_ore_03.png': { shape: 'ellipse', rx: .31, ry: .22 },
  'rocks_ore_04.png': { shape: 'ellipse', rx: .31, ry: .22 },
  'rocks_ore_06.png': { shape: 'ellipse', rx: .31, ry: .22 },
  'rocks_ore_08.png': { shape: 'ellipse', rx: .31, ry: .22 },
  'lantern_post.png': { shape: 'circle', radius: .075 },
  'notice_board.png': { shape: 'rect', halfX: .15, halfY: .11 },
  'wayside_shrine.png': { shape: 'ellipse', rx: .25, ry: .19 },
  'rain_barrel.png': { shape: 'circle', radius: .17 },
  'market_cart.png': { shape: 'rect', halfX: .27, halfY: .16 },
  'stone_water_trough.png': { shape: 'rect', halfX: .25, halfY: .17 },
  'root_stump.png': { shape: 'ellipse', rx: .24, ry: .17 },
  'firewood_rack.png': { shape: 'rect', halfX: .23, halfY: .13 },
  'roofed_well.png': { shape: 'ellipse', rx: .25, ry: .22 },
  'direction_sign.png': { shape: 'circle', radius: .075 },
  lantern_post: { shape: 'circle', radius: .075 }, direction_sign: { shape: 'circle', radius: .075 },
  roofed_well: { shape: 'ellipse', rx: .25, ry: .22 }, notice_board: { shape: 'rect', halfX: .15, halfY: .11 },
  wayside_shrine: { shape: 'ellipse', rx: .25, ry: .19 }, stone_water_trough: { shape: 'rect', halfX: .25, halfY: .17 },
  firewood_rack: { shape: 'rect', halfX: .23, halfY: .13 }, root_stump: { shape: 'ellipse', rx: .24, ry: .17 },
  market_cart: { shape: 'rect', halfX: .27, halfY: .16 }, rain_barrel: { shape: 'circle', radius: .17 },
  gate_fence: { shape: 'rect', halfX: .28, halfY: .09 }, weapon_rack: { shape: 'rect', halfX: .18, halfY: .12 },
  grain_cart: { shape: 'rect', halfX: .25, halfY: .16 }, guild_banner: { shape: 'circle', radius: .07 }
});

export function resolvePropContactProfileV2162(asset, category, width) {
  const name = String(asset || '').split('/').pop();
  const w = Math.max(1, Number(width) || 1);
  const profile = ASSET_CONTACT_PROFILES[name];
  if (profile?.shape === 'circle') return Object.freeze({ shape: 'circle', radius: Math.max(4, w * profile.radius), status: 'asset-specific-authored' });
  if (profile?.shape === 'ellipse') return Object.freeze({ shape: 'ellipse', rx: Math.max(4, w * profile.rx), ry: Math.max(4, w * profile.ry), status: 'asset-specific-authored' });
  if (profile?.shape === 'rect') return Object.freeze({ shape: 'rect', halfX: Math.max(4, w * profile.halfX), halfY: Math.max(4, w * profile.halfY), status: 'asset-specific-authored' });
  const ratios = { light: .085, landmark: .24, debris: .20, rock: .28, ore: .28, flora: 0, vegetation: 0 };
  const ratio = ratios[category] ?? .22;
  return Object.freeze({ shape: 'circle', radius: Math.max(category === 'light' ? 4 : 7, w * ratio), status: 'category-derived-fallback' });
}

export function auditVisualPhysicalConsistencyV2162({ buildings = [], physicsWorld = null } = {}) {
  const errors = [];
  const anchors = buildings.map(resolveBuildingGroundAnchorV2162);
  const footprints = buildings.map(resolveBuildingContactFootprintV2162);
  if (buildings.length !== 27) errors.push(`building-source-count:${buildings.length}`);
  if (anchors.some(a => !a || !finite(a.x, a.y))) errors.push('invalid-building-ground-anchor');
  if (footprints.some(f => !f || f.points.length !== 4)) errors.push('invalid-building-contact-footprint');
  if (Object.keys(ETRANOM_BUILDING_ARCHITECTURE_V2141).length !== 27) errors.push('architecture-registry-count');
  if (ETRANOM_TREES_VEGETATION_V2148.trees.length !== 41) errors.push(`tree-registry-count:${ETRANOM_TREES_VEGETATION_V2148.trees.length}`);
  if (!ETRANOM_VEHICLE_SYSTEM_V2149.placements.every(v => finite(v.x, v.y, v.rotation, v.length, v.width))) errors.push('vehicle-transform-contract');
  const bridgeMisses = ETRANOM_BRIDGE_CROSSINGS_V2162.filter(b => b.status !== 'registered-to-waterway');
  if (bridgeMisses.length) errors.push(`bridge-waterway-registration:${bridgeMisses.map(b => b.id).join(',')}`);
  if (physicsWorld) {
    const buildingColliders = physicsWorld.colliders.filter(c => c.kind === 'building-shell');
    if (buildingColliders.length !== buildings.length) errors.push(`building-collider-count:${buildingColliders.length}`);
    for (const f of footprints) {
      if (!f) continue;
      const c = buildingColliders.find(item => item.buildingId === f.buildingId);
      if (!c || c.shape !== 'polygon' || Math.abs(c.anchorY - f.anchor.y) > .01) errors.push(`building-render-collider-anchor:${f.buildingId}`);
    }
    if (physicsWorld.bridgeCrossings?.length !== ETRANOM_BRIDGE_CROSSINGS_V2162.length) errors.push('bridge-crossing-runtime-registry');
  }
  return Object.freeze({ ok: errors.length === 0, version: 2162, stage: 20, buildingAnchors: anchors.length,
    buildingFootprints: footprints.length, treePlacements: ETRANOM_TREES_VEGETATION_V2148.trees.length,
    environmentalProps: ENVIRONMENTAL_PROPS_V2147.placements.length,
    authoredProps: ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137.length,
    yardProps: ETRANOM_BUILDING_YARD_PLACEMENTS_V2117.length,
    vehiclePlacements: ETRANOM_VEHICLE_SYSTEM_V2149.placements.length,
    bridgeCrossings: ETRANOM_BRIDGE_CROSSINGS_V2162.length,
    metricCalibration: 'not-certified-logical-world-units-retained',
    propFootprints: 'asset-specific-profiles-with-explicit-category-fallbacks',
    errors: Object.freeze(errors) });
}

export const ETRANOM_VISUAL_PHYSICAL_CONSISTENCY_V2162 = Object.freeze({
  version: 2162, stage: 20, stageName: 'Visual / Physical Consistency',
  coordinateUnit: 'V2138-logical-world-units; V2164-gameplay-scale-40-units-per-metre',
  buildingAnchorContract: 'V2100-render-groundY-y-plus-0.30h',
  buildingFootprintContract: 'V2141-dimensions-as-four-point-ground-diamond',
  propAnchorContract: 'asset-renderer-bottom-center-or-authored-ground-anchor',
  vegetationContract: 'root-contact-trunk-collider; canopy-remains-passable',
  vehicleContract: 'rendered-rotation-matches-collision-rotation',
  bridgeCrossings: ETRANOM_BRIDGE_CROSSINGS_V2162,
  surfaceContract: 'V2146-terrain + V2142-roads + V2143-paths + V2157-weather + V2159-seasonal-response',
  sourceStages: Object.freeze([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19]),
  exclusions: Object.freeze(['geodetic-survey-scale-is-not-available', 'interior-locomotion-is-discrete-grid-with-continuous-V2164-foot-motion', 'alpha-masks-cover-contact-slices-not-full-3D-meshes'])
});

if (typeof window !== 'undefined') {
  window.ETRANOM_VISUAL_PHYSICAL_CONSISTENCY_V2162 = ETRANOM_VISUAL_PHYSICAL_CONSISTENCY_V2162;
  window.ETRANOM_AUDIT_VISUAL_PHYSICAL_CONSISTENCY_V2162 = auditVisualPhysicalConsistencyV2162;
}
