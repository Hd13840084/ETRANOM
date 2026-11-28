// ETRANOM V2167 — Stage 25 integrated world-kit geometry and art binding.
// The source sheet is cropped into independent RGBA sprites. Runtime placements
// are derived only from existing canonical road, footpath, bridge and gate data.
// V2167 adds reviewed junction branches and finite fence/wall segments with matching world colliders.
import { ETRANOM_ROAD_SYSTEM_V2142 } from './road-system-v2142.js?v=2142';
import { ETRANOM_PATH_SYSTEM_V2143 } from './path-system-v2143.js?v=2143';
import { ETRANOM_WORLD_STRUCTURE_V2138 } from './world-structure-v2138.js?v=2138';
import { ETRANOM_BRIDGE_CROSSINGS_V2162 } from './visual-physical-consistency-v2162.js?v=2162';
import { drawSeasonalPropCapV2159 } from './seasonal-world-v2159.js?v=2159';
import { ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167, auditWorldGeometryExtensionsV2167 } from './world-geometry-extensions-v2167.js?v=2167';

const ASSET_ROOT = new URL('../../assets/safe-zone/world-kit-v2166/', import.meta.url).href;
const ASSET_DEFINITIONS = Object.freeze([
  ['dirt_road_straight', 'dirt_road_straight.png', 'runtime-road-surface'],
  ['dirt_road_curve', 'dirt_road_curve.png', 'runtime-authored-curved-road'],
  ['dirt_road_y_junction', 'dirt_road_y_junction.png', 'runtime-authored-y-junction'],
  ['dirt_road_t_junction', 'dirt_road_t_junction.png', 'runtime-authored-t-junction'],
  ['rough_dirt_path', 'rough_dirt_path.png', 'runtime-landmark-footpath'],
  ['cobblestone_path', 'cobblestone_path.png', 'runtime-landmark-footpath'],
  ['flagstone_path', 'flagstone_path.png', 'runtime-landmark-footpath'],
  ['wooden_footbridge', 'wooden_footbridge.png', 'runtime-registered-wood-bridge'],
  ['timber_fence_segment', 'timber_fence_segment.png', 'runtime-authored-fence-run'],
  ['mossy_stone_wall_segment', 'mossy_stone_wall_segment.png', 'runtime-authored-stone-wall-run'],
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

export const ETRANOM_WORLD_ART_KIT_V2167 = Object.freeze({
  version: 2167, stage: 25, source: 'ARTWORK_REFERENCE_NOT_YET_INTEGRATED/roads_paths_walls_gates_source_sheet.png',
  assets: ASSET_DEFINITIONS, roadBindings: ETRANOM_ROAD_SYSTEM_V2142.roads.map(road => Object.freeze({
    roadId: road.id, points: road.centerline, width: road.totalWidth, asset: 'dirt_road_straight',
    source: `canonical-road-system-v2142:${road.id}`
  })),
  footpathBindings: landmarkFootpaths, gateBindings: perimeterGates,
  bridgeBindings: ETRANOM_BRIDGE_CROSSINGS_V2162.filter(bridge => bridge.asset === 'wood_bridge.png').map(bridge => Object.freeze({
    bridgeId: bridge.id, x: bridge.x, y: bridge.y, rotation: bridge.renderRotation, asset: 'wooden_footbridge',
    source: `registered-bridge-crossing-v2162:${bridge.id}`
  })),
  extensionGeometry: ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167,
  junctionBindings: ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.junctions.map(j => Object.freeze({id:j.id,x:j.x,y:j.y,rotation:j.rotation,asset:j.asset,source:'authored-v2167-road-graph-junction'})),
  roadBranchBindings: ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.roads,
  curveBindings: ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.curves.map(curve => Object.freeze({ ...curve, ...ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.assetBindings.find(binding => binding.geometryId === curve.id) })),
  barrierBindings: ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.barriers,
  intentionallyUnplaced: Object.freeze([])
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


function drawBarrierRun(ctx,barrier,camX,camY){
  const image=loadedImage(barrier.asset);if(!image)return 0;let count=0;
  const [a,b]=barrier.points,dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)-.42;
  const pieces=Math.max(1,Math.ceil(length/barrier.spacing));
  for(let i=0;i<pieces;i++){const t=(i+.5)/pieces,x=a[0]+dx*t,y=a[1]+dy*t;if(!inView(x,y,90,70,camX,camY))continue;
    const w=barrier.asset==='timber_fence_segment'?Math.min(174,length/pieces+18):Math.min(166,length/pieces+18);
    if(drawCentered(ctx,barrier.asset,x,y,w,Math.round(w*.72),angle))count++;
  }
  return count;
}

// Render the authored mesh as actual world-space triangles. Z is a vertical screen offset
// in this Canvas/isometric renderer; collision and mesh data keep the full XYZ values.
function drawTriangleMesh(ctx, mesh, fillStyle, strokeStyle = null, zScale = 1) {
  if (!mesh?.vertices?.length || !mesh?.triangles?.length) return 0;
  let drawn = 0;
  ctx.fillStyle = fillStyle;
  if (strokeStyle) { ctx.strokeStyle = strokeStyle; ctx.lineWidth = 1.25; }
  for (const tri of mesh.triangles) {
    const a = mesh.vertices[tri[0]], b = mesh.vertices[tri[1]], c = mesh.vertices[tri[2]];
    if (!a || !b || !c) continue;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1] - (a[2] || 0) * zScale);
    ctx.lineTo(b[0], b[1] - (b[2] || 0) * zScale);
    ctx.lineTo(c[0], c[1] - (c[2] || 0) * zScale);
    ctx.closePath(); ctx.fill(); if (strokeStyle) ctx.stroke(); drawn++;
  }
  return drawn;
}
function drawJunctionMesh(ctx, junction) {
  let count = 0;
  for (const arm of junction.surface?.arms || []) count += drawTriangleMesh(ctx, arm, 'rgba(132,103,70,.92)', 'rgba(74,57,42,.45)');
  count += drawTriangleMesh(ctx, junction.surface?.hub, 'rgba(145,113,77,.96)', 'rgba(74,57,42,.55)');
  return count;
}
function drawBarrierGeometry(ctx, barrier) {
  const [a,b] = barrier.points, dx=b[0]-a[0], dy=b[1]-a[1], length=Math.hypot(dx,dy)||1;
  const ux=dx/length, uy=dy/length, nx=-uy, ny=ux, half=(barrier.thickness*40)*.5;
  const height=barrier.height*40, isFence=barrier.kind==='timber-fence';
  const railLevels=isFence?[.28,.72]:[.12,.88];
  ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round';
  if (!isFence) {
    ctx.fillStyle='rgba(89,91,79,.96)'; ctx.strokeStyle='rgba(45,48,43,.9)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(a[0]+nx*half,a[1]+ny*half); ctx.lineTo(b[0]+nx*half,b[1]+ny*half);
    ctx.lineTo(b[0]+nx*half,b[1]+ny*half-height); ctx.lineTo(a[0]+nx*half,a[1]+ny*half-height); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(127,130,112,.96)';
    ctx.beginPath(); ctx.moveTo(a[0]-nx*half,a[1]-ny*half); ctx.lineTo(b[0]-nx*half,b[1]-ny*half);
    ctx.lineTo(b[0]-nx*half,b[1]-ny*half-height); ctx.lineTo(a[0]-nx*half,a[1]-ny*half-height); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else {
    ctx.strokeStyle='rgba(116,77,43,.98)'; ctx.lineWidth=7;
    for (const level of railLevels) { const lift=height*level; ctx.beginPath(); ctx.moveTo(a[0],a[1]-lift); ctx.lineTo(b[0],b[1]-lift); ctx.stroke(); }
    ctx.strokeStyle='rgba(70,48,31,.95)'; ctx.lineWidth=9;
    for (const p of barrier.surfaceMesh.postCentres) { ctx.beginPath(); ctx.moveTo(p[0],p[1]+height*.5); ctx.lineTo(p[0],p[1]-height*.5); ctx.stroke(); }
  }
  // The mesh provides post/segment topology. The source sprite adds material detail without
  // changing the collision shape or the authored endpoints.
  const image=loadedImage(barrier.asset);
  const pieces=Math.max(1,Math.ceil(length/barrier.spacing));
  if(image) for(let i=0;i<pieces;i++){const t=(i+.5)/pieces,x=a[0]+dx*t,y=a[1]+dy*t;if(!Number.isFinite(x+y))continue;
    const w=barrier.asset==='timber_fence_segment'?Math.min(174,length/pieces+18):Math.min(166,length/pieces+18);
    ctx.save();ctx.translate(x,y-height*.5);ctx.rotate(Math.atan2(dy,dx)-.42);ctx.globalAlpha=.68;ctx.drawImage(image,-w/2,-w*.36,w,w*.72);ctx.restore();
  }
  ctx.restore(); return 1; // one authored barrier run rendered, whether or not its texture has loaded
}

/** Draws the independent high-detail road and pedestrian-surface sprites over the existing authored geometry. */
export function drawWorldArtKitGroundV2166(ctx, camX = 0, camY = 0) {
  if (!ctx || typeof ctx.drawImage !== 'function') return Object.freeze({ roads: 0, footpaths: 0, branches:0, curves:0, junctions:0 });
  ctx.save();
  ctx.translate(-camX, -camY);
  let roadStamps = 0, footpathStamps = 0, branches=0, curves=0, junctions=0;
  // Mesh-first geometry keeps curved roads, branches and junctions physically coherent
  // even during image loading or when an artwork file is unavailable.
  let meshTriangles = 0;
  for (const edge of ETRANOM_WORLD_ART_KIT_V2167.roadBranchBindings) { meshTriangles += drawTriangleMesh(ctx, edge.surfaceMesh, 'rgba(128,99,68,.9)', 'rgba(69,51,37,.35)'); branches++; }
  for (const curve of ETRANOM_WORLD_ART_KIT_V2167.curveBindings) { meshTriangles += drawTriangleMesh(ctx, curve.surfaceMesh, 'rgba(133,104,73,.94)', 'rgba(70,53,39,.4)'); curves++; }
  for (const junction of ETRANOM_WORLD_ART_KIT_V2167.junctionBindings) { meshTriangles += drawJunctionMesh(ctx, ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.junctions.find(j => j.id === junction.id)); junctions++; }
  const roadImage = loadedImage('dirt_road_straight');
  if (roadImage) {
    for (const road of ETRANOM_WORLD_ART_KIT_V2167.roadBindings) {
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
  for (const edge of ETRANOM_WORLD_ART_KIT_V2167.footpathBindings) {
    footpathStamps += drawPolylineStamps(ctx, edge, edge.asset, camX, camY);
  }
  // Draw road branches along the exact same polylines that are registered in pathfinding.
  for(const edge of ETRANOM_WORLD_ART_KIT_V2167.roadBranchBindings){
    for(let i=1;i<edge.points.length;i++){const a=edge.points[i-1],b=edge.points[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<1||!inView((a[0]+b[0])*.5,(a[1]+b[1])*.5,len*.5+40,70,camX,camY))continue;
      drawCentered(ctx,'dirt_road_straight',(a[0]+b[0])*.5,(a[1]+b[1])*.5,len+16,Math.max(54,edge.width*1.9),Math.atan2(dy,dx));}
  }
  for(const curve of ETRANOM_WORLD_ART_KIT_V2167.curveBindings){const p=curve.anchor;if(inView(p[0],p[1],120,90,camX,camY))drawCentered(ctx,'dirt_road_curve',p[0],p[1],curve.width,curve.height,curve.rotation);}
  for(const junction of ETRANOM_WORLD_ART_KIT_V2167.junctionBindings){if(inView(junction.x,junction.y,130,110,camX,camY))drawCentered(ctx,junction.asset,junction.x,junction.y,junction.asset==='dirt_road_y_junction'?222:208,160,junction.rotation);}
  ctx.restore();
  return Object.freeze({ roads: roadStamps, footpaths: footpathStamps, branches, curves, junctions, meshTriangles });
}

/** Draws the new arch gates and the wooden bridge at the exact registered V2138/V2162 anchors. */
export function drawWorldArtKitStructuresV2166(ctx, camX = 0, camY = 0, season = 'summer') {
  if (!ctx || typeof ctx.drawImage !== 'function') return Object.freeze({ gates: 0, bridges: 0, barriers:0 });
  ctx.save();
  ctx.translate(-camX, -camY);
  let gates = 0, bridges = 0, barriers=0;
  for (const gate of ETRANOM_WORLD_ART_KIT_V2167.gateBindings) {
    if (!inView(gate.x, gate.y, 100, 150, camX, camY)) continue;
    // Ground anchor is the feet/base of the arch rather than its visual centre.
    if (drawBottomAnchored(ctx, gate.asset, gate.x, gate.y + 28, 112, 132)) {
      gates++;
      drawSeasonalPropCapV2159(ctx, gate.x, gate.y + 18, 112, 132, season, `world-kit-gate:${gate.id}`);
    }
  }
  for (const bridge of ETRANOM_WORLD_ART_KIT_V2167.bridgeBindings) {
    if (!inView(bridge.x, bridge.y, 110, 86, camX, camY)) continue;
    if (drawCentered(ctx, bridge.asset, bridge.x, bridge.y, 166, 116, bridge.rotation)) {
      bridges++;
      drawSeasonalPropCapV2159(ctx, bridge.x, bridge.y + 50, 166, 116, season, `world-kit-bridge:${bridge.bridgeId}`);
    }
  }
  for(const barrier of ETRANOM_WORLD_ART_KIT_V2167.barrierBindings){if(inView((barrier.points[0][0]+barrier.points[1][0])*.5,(barrier.points[0][1]+barrier.points[1][1])*.5,barrier.points[1][0]-barrier.points[0][0],120,camX,camY))barriers+=drawBarrierGeometry(ctx,barrier);}
  ctx.restore();
  return Object.freeze({ gates, bridges, barriers });
}

export function auditWorldArtKitV2167() {
  const errors = [], assetIds = new Set(ASSET_DEFINITIONS.map(asset => asset.id));
  if (assetIds.size !== 12) errors.push(`asset-catalog-count:${assetIds.size}`);
  const geometryAudit=auditWorldGeometryExtensionsV2167();if(!geometryAudit.ok)errors.push(...geometryAudit.errors.map(e=>`geometry:${e}`));
  for (const asset of ASSET_DEFINITIONS) {
    if (!asset.file.endsWith('.png') || !asset.url.includes('/world-kit-v2166/')) errors.push(`invalid-asset-binding:${asset.id}`);
  }
  if (ETRANOM_WORLD_ART_KIT_V2167.roadBindings.length !== 3) errors.push('canonical-road-binding-count');
  if (ETRANOM_WORLD_ART_KIT_V2167.footpathBindings.length !== 5) errors.push('canonical-footpath-binding-count');
  if (ETRANOM_WORLD_ART_KIT_V2167.gateBindings.length !== 10) errors.push('canonical-gate-binding-count');
  if (ETRANOM_WORLD_ART_KIT_V2167.bridgeBindings.length !== 1) errors.push('registered-wood-bridge-binding-count');
  if(ETRANOM_WORLD_ART_KIT_V2167.junctionBindings.length!==2)errors.push('authored-junction-binding-count');
  if(ETRANOM_WORLD_ART_KIT_V2167.barrierBindings.length!==2)errors.push('authored-barrier-binding-count');
  if(ETRANOM_WORLD_ART_KIT_V2167.curveBindings.length!==1)errors.push('authored-curve-binding-count');
  if(ETRANOM_WORLD_ART_KIT_V2167.extensionGeometry.assetBindings.length!==5)errors.push('extension-asset-binding-count');
  const geometryIds=new Set([...ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.junctions,...ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.roads,...ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.curves,...ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.barriers].map(row=>row.id));
  for(const binding of ETRANOM_WORLD_ART_KIT_V2167.extensionGeometry.assetBindings){if(!assetIds.has(binding.asset))errors.push(`unregistered-extension-asset:${binding.asset}`);if(!geometryIds.has(binding.geometryId))errors.push(`missing-extension-geometry:${binding.geometryId}`);}
  for (const row of [...ETRANOM_WORLD_ART_KIT_V2167.roadBindings, ...ETRANOM_WORLD_ART_KIT_V2167.footpathBindings,
    ...ETRANOM_WORLD_ART_KIT_V2167.gateBindings, ...ETRANOM_WORLD_ART_KIT_V2167.bridgeBindings]) {
    if (!assetIds.has(row.asset)) errors.push(`unregistered-placement-asset:${row.asset}`);
    if (row.source && !/(canonical|registered)-/.test(row.source)) errors.push(`unverified-placement-source:${row.source}`);
  }
  return Object.freeze({ ok: errors.length === 0, version: 2167, stage: 25, assetCount: ASSET_DEFINITIONS.length,
    roadBindings: ETRANOM_WORLD_ART_KIT_V2167.roadBindings.length, footpathBindings: ETRANOM_WORLD_ART_KIT_V2167.footpathBindings.length,
    gateBindings: ETRANOM_WORLD_ART_KIT_V2167.gateBindings.length, bridgeBindings: ETRANOM_WORLD_ART_KIT_V2167.bridgeBindings.length,
    junctionBindings:ETRANOM_WORLD_ART_KIT_V2167.junctionBindings.length,curveBindings:ETRANOM_WORLD_ART_KIT_V2167.curveBindings.length,barrierBindings:ETRANOM_WORLD_ART_KIT_V2167.barrierBindings.length,
    intentionallyUnplaced: ETRANOM_WORLD_ART_KIT_V2167.intentionallyUnplaced.length, errors: Object.freeze(errors) });
}
if (typeof window !== 'undefined') {
  window.ETRANOM_WORLD_ART_KIT_V2167 = ETRANOM_WORLD_ART_KIT_V2167;
  window.ETRANOM_WORLD_ART_KIT_AUDIT_V2167 = auditWorldArtKitV2167();
}

// V2167 semantic exports retain compatibility with the existing draw routines.
export const drawWorldArtKitGroundV2167 = drawWorldArtKitGroundV2166;
export const drawWorldArtKitStructuresV2167 = drawWorldArtKitStructuresV2166;
