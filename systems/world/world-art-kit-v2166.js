// ETRANOM V2166 — Stage 24 visual asset recovery and authored world-art binding.
// The source sheet is cropped into independent RGBA sprites. Runtime placements
// are derived only from existing canonical road, footpath, bridge and gate data.
// No new physical walls, collision blockers or unverified street junctions are invented.
import { ETRANOM_ROAD_SYSTEM_V2142 } from './road-system-v2142.js?v=2142';
import { ETRANOM_PATH_SYSTEM_V2143 } from './path-system-v2143.js?v=2143';
import { ETRANOM_WORLD_STRUCTURE_V2138 } from './world-structure-v2138.js?v=2138';
import { ETRANOM_BRIDGE_CROSSINGS_V2162 } from './visual-physical-consistency-v2162.js?v=2162';
import { drawSeasonalPropCapV2159 } from './seasonal-world-v2159.js?v=2159';

const ASSET_ROOT = new URL('../../assets/safe-zone/world-kit-v2166/', import.meta.url).href;
const ASSET_DEFINITIONS = Object.freeze([
  ['dirt_road_straight', 'dirt_road_straight.png', 'runtime-road-surface'],
  ['dirt_road_curve', 'dirt_road_curve.png', 'catalog-only-no-authored-curve-stamp'],
  ['dirt_road_y_junction', 'dirt_road_y_junction.png', 'catalog-only-no-canonical-junction-node'],
  ['dirt_road_t_junction', 'dirt_road_t_junction.png', 'catalog-only-no-canonical-junction-node'],
  ['rough_dirt_path', 'rough_dirt_path.png', 'runtime-landmark-footpath'],
  ['cobblestone_path', 'cobblestone_path.png', 'runtime-landmark-footpath'],
  ['flagstone_path', 'flagstone_path.png', 'runtime-landmark-footpath'],
  ['wooden_footbridge', 'wooden_footbridge.png', 'runtime-registered-wood-bridge'],
  ['timber_fence_segment', 'timber_fence_segment.png', 'catalog-only-no-authored-wall-run'],
  ['mossy_stone_wall_segment', 'mossy_stone_wall_segment.png', 'catalog-only-no-authored-wall-run'],
  ['mossy_stone_arch_gate', 'mossy_stone_arch_gate.png', 'runtime-perimeter-gate'],
  ['timber_arch_gate', 'timber_arch_gate.png', 'runtime-perimeter-gate']
].map(([id, file, placement]) => Object.freeze({ id, file, url: `${ASSET_ROOT}${file}`, placement })));

const imageCache = Object.create(null);
if (typeof Image !== 'undefined') {
  for (const asset of ASSET_DEFINITIONS) {
    const image = new Image();
    image.decoding = 'async';
    image.src = asset.url;
    imageCache[asset.id] = image;
  }
}

const gatesById = Object.freeze({
  gate_nw: 'timber_arch_gate', gate_n: 'mossy_stone_arch_gate', gate_ne: 'timber_arch_gate',
  gate_e1: 'timber_arch_gate', gate_e2: 'mossy_stone_arch_gate', gate_se: 'mossy_stone_arch_gate',
  gate_s: 'mossy_stone_arch_gate', gate_sw: 'timber_arch_gate', gate_w2: 'timber_arch_gate', gate_w1: 'timber_arch_gate'
});
const pathSurfaceByLandmark = Object.freeze({
  windrise: 'rough_dirt_path', wayfarer_camp: 'rough_dirt_path', old_memorial: 'cobblestone_path',
  lookout_hill: 'flagstone_path', apple_orchard: 'rough_dirt_path'
});
const perimeterGates = ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.perimeterGates.map(gate => Object.freeze({
  id: gate.id, x: gate.x, y: gate.y, side: gate.side, asset: gatesById[gate.id] || 'mossy_stone_arch_gate',
  source: 'canonical-world-structure-v2138-perimeterGates'
}));
const landmarkFootpaths = ETRANOM_PATH_SYSTEM_V2143.edges.filter(edge => edge.kind === 'landmark-footpath').map(edge => Object.freeze({
  id: edge.id, landmarkId: edge.landmarkId, points: edge.points, width: edge.width,
  asset: pathSurfaceByLandmark[edge.landmarkId] || 'rough_dirt_path',
  source: 'canonical-path-system-v2143-authored-corridor'
}));

export const ETRANOM_WORLD_ART_KIT_V2166 = Object.freeze({
  version: 2166, stage: 24, source: 'ARTWORK_REFERENCE_NOT_YET_INTEGRATED/roads_paths_walls_gates_source_sheet.png',
  assets: ASSET_DEFINITIONS, roadBindings: ETRANOM_ROAD_SYSTEM_V2142.roads.map(road => Object.freeze({
    roadId: road.id, points: road.centerline, width: road.totalWidth, asset: 'dirt_road_straight',
    source: `canonical-road-system-v2142:${road.id}`
  })),
  footpathBindings: landmarkFootpaths, gateBindings: perimeterGates,
  bridgeBindings: ETRANOM_BRIDGE_CROSSINGS_V2162.filter(bridge => bridge.asset === 'wood_bridge.png').map(bridge => Object.freeze({
    bridgeId: bridge.id, x: bridge.x, y: bridge.y, rotation: bridge.renderRotation, asset: 'wooden_footbridge',
    source: `registered-bridge-crossing-v2162:${bridge.id}`
  })),
  intentionallyUnplaced: Object.freeze([
    'dirt_road_curve: no curve-knot stamp in the canonical road centerline contract',
    'dirt_road_y_junction: road graph has no authored three-way junction node',
    'dirt_road_t_junction: road graph has no authored T-junction node',
    'timber_fence_segment: no surveyed fence-run geometry; placing it would invent barriers',
    'mossy_stone_wall_segment: no surveyed perimeter-wall geometry; placing it would invent collision boundaries'
  ])
});

function loadedImage(id) {
  const image = imageCache[id];
  return image && image.complete && image.naturalWidth > 0 ? image : null;
}
function inView(x, y, width, height, camX, camY) {
  return x + width >= camX - 260 && x - width <= camX + 1120 && y + height >= camY - 220 && y - height <= camY + 1020;
}
function drawCentered(ctx, id, x, y, width, height, rotation = 0) {
  const image = loadedImage(id);
  if (!image) return false;
  ctx.save();
  ctx.translate(x, y);
  if (rotation) ctx.rotate(rotation);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
  return true;
}
function drawBottomAnchored(ctx, id, x, groundY, width, height) {
  const image = loadedImage(id);
  if (!image) return false;
  ctx.drawImage(image, x - width / 2, groundY - height, width, height);
  return true;
}
function drawPolylineStamps(ctx, edge, assetId, camX, camY) {
  const image = loadedImage(assetId);
  if (!image) return 0;
  let drawn = 0, travelled = 0;
  const spacing = assetId === 'rough_dirt_path' ? 64 : 72;
  for (let i = 1; i < edge.points.length; i++) {
    const a = edge.points[i - 1], b = edge.points[i];
    const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
    if (length < 1) continue;
    const angle = Math.atan2(dy, dx);
    const start = Math.max(24, spacing - (travelled % spacing));
    for (let distance = start; distance < length - 12; distance += spacing) {
      const t = distance / length, x = a[0] + dx * t, y = a[1] + dy * t;
      if (!inView(x, y, 58, 46, camX, camY)) continue;
      drawCentered(ctx, assetId, x, y, assetId === 'rough_dirt_path' ? 88 : 84, 54, angle);
      drawn++;
    }
    travelled += length;
  }
  return drawn;
}

/** Draws the independent high-detail road and pedestrian-surface sprites over the existing authored geometry. */
export function drawWorldArtKitGroundV2166(ctx, camX = 0, camY = 0) {
  if (!ctx || typeof ctx.drawImage !== 'function') return Object.freeze({ roads: 0, footpaths: 0 });
  ctx.save();
  ctx.translate(-camX, -camY);
  let roadStamps = 0, footpathStamps = 0;
  const roadImage = loadedImage('dirt_road_straight');
  if (roadImage) {
    for (const road of ETRANOM_WORLD_ART_KIT_V2166.roadBindings) {
      const points = road.points;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i], dx = b[0] - a[0], dy = b[1] - a[1];
        const length = Math.hypot(dx, dy);
        if (!inView((a[0] + b[0]) * .5, (a[1] + b[1]) * .5, length * .5 + 35, 74, camX, camY)) continue;
        drawCentered(ctx, 'dirt_road_straight', (a[0] + b[0]) * .5, (a[1] + b[1]) * .5,
          length + 30, Math.max(68, road.width * 1.65), Math.atan2(dy, dx));
        roadStamps++;
      }
    }
  }
  for (const edge of ETRANOM_WORLD_ART_KIT_V2166.footpathBindings) {
    footpathStamps += drawPolylineStamps(ctx, edge, edge.asset, camX, camY);
  }
  ctx.restore();
  return Object.freeze({ roads: roadStamps, footpaths: footpathStamps });
}

/** Draws the new arch gates and the wooden bridge at the exact registered V2138/V2162 anchors. */
export function drawWorldArtKitStructuresV2166(ctx, camX = 0, camY = 0, season = 'summer') {
  if (!ctx || typeof ctx.drawImage !== 'function') return Object.freeze({ gates: 0, bridges: 0 });
  ctx.save();
  ctx.translate(-camX, -camY);
  let gates = 0, bridges = 0;
  for (const gate of ETRANOM_WORLD_ART_KIT_V2166.gateBindings) {
    if (!inView(gate.x, gate.y, 100, 150, camX, camY)) continue;
    // Ground anchor is the feet/base of the arch rather than its visual centre.
    if (drawBottomAnchored(ctx, gate.asset, gate.x, gate.y + 28, 112, 132)) {
      gates++;
      drawSeasonalPropCapV2159(ctx, gate.x, gate.y + 18, 112, 132, season, `world-kit-gate:${gate.id}`);
    }
  }
  for (const bridge of ETRANOM_WORLD_ART_KIT_V2166.bridgeBindings) {
    if (!inView(bridge.x, bridge.y, 110, 86, camX, camY)) continue;
    if (drawCentered(ctx, bridge.asset, bridge.x, bridge.y, 166, 116, bridge.rotation)) {
      bridges++;
      drawSeasonalPropCapV2159(ctx, bridge.x, bridge.y + 50, 166, 116, season, `world-kit-bridge:${bridge.bridgeId}`);
    }
  }
  ctx.restore();
  return Object.freeze({ gates, bridges });
}

export function auditWorldArtKitV2166() {
  const errors = [], assetIds = new Set(ASSET_DEFINITIONS.map(asset => asset.id));
  if (assetIds.size !== 12) errors.push(`asset-catalog-count:${assetIds.size}`);
  for (const asset of ASSET_DEFINITIONS) {
    if (!asset.file.endsWith('.png') || !asset.url.includes('/world-kit-v2166/')) errors.push(`invalid-asset-binding:${asset.id}`);
  }
  if (ETRANOM_WORLD_ART_KIT_V2166.roadBindings.length !== 3) errors.push('canonical-road-binding-count');
  if (ETRANOM_WORLD_ART_KIT_V2166.footpathBindings.length !== 5) errors.push('canonical-footpath-binding-count');
  if (ETRANOM_WORLD_ART_KIT_V2166.gateBindings.length !== 10) errors.push('canonical-gate-binding-count');
  if (ETRANOM_WORLD_ART_KIT_V2166.bridgeBindings.length !== 1) errors.push('registered-wood-bridge-binding-count');
  for (const row of [...ETRANOM_WORLD_ART_KIT_V2166.roadBindings, ...ETRANOM_WORLD_ART_KIT_V2166.footpathBindings,
    ...ETRANOM_WORLD_ART_KIT_V2166.gateBindings, ...ETRANOM_WORLD_ART_KIT_V2166.bridgeBindings]) {
    if (!assetIds.has(row.asset)) errors.push(`unregistered-placement-asset:${row.asset}`);
    if (row.source && !/(canonical|registered)-/.test(row.source)) errors.push(`unverified-placement-source:${row.source}`);
  }
  return Object.freeze({ ok: errors.length === 0, version: 2166, stage: 24, assetCount: ASSET_DEFINITIONS.length,
    roadBindings: ETRANOM_WORLD_ART_KIT_V2166.roadBindings.length, footpathBindings: ETRANOM_WORLD_ART_KIT_V2166.footpathBindings.length,
    gateBindings: ETRANOM_WORLD_ART_KIT_V2166.gateBindings.length, bridgeBindings: ETRANOM_WORLD_ART_KIT_V2166.bridgeBindings.length,
    intentionallyUnplaced: ETRANOM_WORLD_ART_KIT_V2166.intentionallyUnplaced.length, errors: Object.freeze(errors) });
}
if (typeof window !== 'undefined') {
  window.ETRANOM_WORLD_ART_KIT_V2166 = ETRANOM_WORLD_ART_KIT_V2166;
  window.ETRANOM_WORLD_ART_KIT_AUDIT_V2166 = auditWorldArtKitV2166();
}
