import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import {
  buildWorldPhysicsWorldV2161,
  auditWorldPhysicsV2161,
  isWorldPositionBlockedV2161,
  resolveWorldMovementV2161
} from '../../systems/world/physics-collision-v2161.js';
import {
  ETRANOM_VISUAL_PHYSICAL_CONSISTENCY_V2162,
  ETRANOM_BRIDGE_CROSSINGS_V2162,
  resolveBuildingGroundAnchorV2162,
  resolveBuildingContactFootprintV2162,
  resolvePropContactProfileV2162,
  isPointOnBridgeDeckV2162,
  auditVisualPhysicalConsistencyV2162
} from '../../systems/world/visual-physical-consistency-v2162.js';
import { ETRANOM_WORLD_STRUCTURE_V2138 } from '../../systems/world/world-structure-v2138.js';
import { ETRANOM_VEHICLE_SYSTEM_V2149 } from '../../systems/world/vehicle-system-v2149.js';
import { auditBuildingArchitectureV2141 } from '../../systems/safe-zone/building-architecture-v2141.js';
import { auditTreesVegetationV2148 } from '../../systems/safe-zone/trees-vegetation-v2148.js';
import { auditEnvironmentalPropsV2147 } from '../../systems/safe-zone/environmental-props-v2147.js';

const root = resolve('.');
const gameSource = readFileSync(resolve(root, 'game.js'), 'utf8');
function readArray(marker) {
  const at = gameSource.indexOf(marker);
  assert.ok(at >= 0, `missing ${marker}`);
  const start = gameSource.indexOf('[', at);
  let depth = 0, quote = '', escape = false, lineComment = false, blockComment = false;
  for (let i = start; i < gameSource.length; i++) {
    const c = gameSource[i], next = gameSource[i + 1];
    if (lineComment) { if (c === '\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && next === '/') { blockComment = false; i++; } continue; }
    if (quote) { if (escape) { escape = false; continue; } if (c === '\\') { escape = true; continue; } if (c === quote) quote = ''; continue; }
    if (c === '/' && next === '/') { lineComment = true; i++; continue; }
    if (c === '/' && next === '*') { blockComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '[') depth++;
    if (c === ']' && --depth === 0) return vm.runInNewContext(`(${gameSource.slice(start, i + 1)})`);
  }
  throw new Error(`unclosed source array: ${marker}`);
}

const buildings = readArray('const cityPOI =');
const npcs = readArray('const safeNPCs =');
const landmarks = ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.landmarks.map(item => ({ ...item }));
const world = buildWorldPhysicsWorldV2161({ buildings, npcs, landmarks });

test('V2162 consistency module remains integrated under the V2165 Stage-23 startup build and refreshed cache', () => {
  const index = readFileSync(resolve(root, 'index.html'), 'utf8');
  assert.match(index, /game\.js\?v=2166-stage24-world-validation/);
  assert.match(gameSource, /__ETRANOM_GAME_BUILD__\s*=\s*'2166-stage24-world-validation'/);
  assert.match(gameSource, /auditVisualPhysicalConsistencyV2162\(\{\s*buildings:\s*cityPOI,\s*physicsWorld:\s*worldPhysicsV2161\s*\}\)/);
  for (const file of ['visual-physical-consistency-v2162.js', 'physics-collision-v2161.js']) {
    assert.ok(readFileSync(resolve(root, 'systems/world', file), 'utf8').length > 1000);
  }
});

test('the actual runtime registries build exactly 210 valid, unique colliders across all prior environment stages', () => {
  assert.equal(buildings.length, 27);
  assert.equal(npcs.length, 20);
  assert.equal(world.colliders.length, 210);
  assert.deepEqual(world.counts, {
    buildings: 27, treeTrunks: 41, environmentalAndAuthoredProps: 88, vehicles: 8,
    waterFeatures: 4, bridgeCrossings: 2, landmarks: 4, npcs: 20, understory: 11, total: 210
  });
  assert.equal(new Set(world.colliders.map(c => c.id)).size, world.colliders.length);
  assert.ok(world.colliders.every(c => c.bounds && [c.bounds.minX, c.bounds.minY, c.bounds.maxX, c.bounds.maxY].every(Number.isFinite)));
  assert.equal(auditWorldPhysicsV2161(world, { buildingCount: 27 }).ok, true);
  const audit = auditVisualPhysicalConsistencyV2162({ buildings, physicsWorld: world });
  assert.equal(audit.ok, true, audit.errors.join(', '));
  assert.equal(audit.buildingAnchors, 27);
  assert.equal(audit.buildingFootprints, 27);
  assert.equal(audit.bridgeCrossings, 2);
  assert.equal(audit.vehiclePlacements, 8);
});

test('each of the 27 building shell colliders uses its rendered ground anchor and authored four-point footprint', () => {
  for (const building of buildings) {
    const expectedAnchor = resolveBuildingGroundAnchorV2162(building);
    const expectedFootprint = resolveBuildingContactFootprintV2162(building);
    const shell = world.colliders.find(c => c.id === `building:${building.id}:shell`);
    assert.ok(shell, building.id);
    assert.equal(shell.shape, 'polygon', building.id);
    assert.equal(shell.anchorY, expectedAnchor.y, building.id);
    assert.equal(shell.anchorX, expectedAnchor.x, building.id);
    assert.deepEqual(shell.points.map(p => [...p]), expectedFootprint.points.map(p => [...p]), building.id);
    assert.equal(shell.windowsBlocked, true, building.id);
    assert.ok(shell.wallThickness > 0, building.id);
  }
  assert.equal(auditBuildingArchitectureV2141(buildings.map(b => b.id)).ok, true);
});

test('all 27 main doors are blocked when closed and passable when open; building shell and windows remain solid', () => {
  for (const building of buildings) {
    const shell = world.colliders.find(c => c.buildingId === building.id && c.kind === 'building-shell');
    const makeState = doorOpen => ({ environmentInteractions: { entities: { [`building:${building.id}:door`]: { doorOpen } } } });
    assert.equal(isWorldPositionBlockedV2161(world, shell.doorway.x, shell.doorway.frontY, { gameState: makeState(false) }), true, `${building.id}: closed door`);
    assert.equal(isWorldPositionBlockedV2161(world, shell.doorway.x, shell.doorway.frontY, { gameState: makeState(true) }), false, `${building.id}: open door`);
    assert.equal(isWorldPositionBlockedV2161(world, shell.anchorX, shell.anchorY, { gameState: makeState(true) }), true, `${building.id}: shell`);
  }
});

test('each live collider has a solid contact sample and visual-only flowers/ground dressing are not fabricated as blockers', () => {
  for (const collider of world.colliders) {
    let x, y;
    if (collider.shape === 'segment') { x = (collider.ax + collider.bx) / 2; y = (collider.ay + collider.by) / 2; }
    else if (collider.shape === 'polygon') { x = collider.anchorX; y = collider.anchorY; }
    else if (collider.shape === 'alpha-mask') {
      const i = Array.from(collider.maskBytes).findIndex((byte, k) => byte !== 0); assert.ok(i >= 0, collider.id);
      let bit = 0; while (bit < 8 && !(collider.maskBytes[i] & (1 << (7-bit)))) bit++;
      const index = i*8+bit, px=index%collider.maskWidth, py=Math.floor(index/collider.maskWidth);
      x = collider.x-collider.imageWidth*.5+(px+.5)*collider.imageWidth/collider.maskWidth;
      y = collider.y-collider.contactHeight+(py+.5)*collider.contactHeight/collider.maskHeight;
    } else { x = collider.x; y = collider.y; }
    assert.ok(Number.isFinite(x) && Number.isFinite(y), collider.id);
    const bypassedByBridge = collider.kind === 'water-channel' && isPointOnBridgeDeckV2162(x, y, collider.waterwayId, 0);
    assert.equal(isWorldPositionBlockedV2161(world, x, y, { radius: 0, includeTerrain: false }), !bypassedByBridge, collider.id);
  }
  assert.equal(world.colliders.some(c => c.source === 'V2039-ground-dressing'), false);
  assert.equal(world.colliders.some(c => /flower|wildflower|mushroom/i.test(c.asset || '')), false);
  assert.equal(auditTreesVegetationV2148().collisionIntegrated, true);
  assert.equal(auditEnvironmentalPropsV2147().ok, true);
});

test('both bridge decks are registered to their matching waterways and traversable with an actual swept player move', () => {
  assert.equal(ETRANOM_BRIDGE_CROSSINGS_V2162.length, 2);
  for (const bridge of ETRANOM_BRIDGE_CROSSINGS_V2162) {
    assert.equal(bridge.status, 'registered-to-waterway', bridge.id);
    assert.ok(bridge.crossingFrame.distance <= bridge.crossingTolerance, bridge.id);
    assert.equal(isWorldPositionBlockedV2161(world, bridge.x, bridge.y, { radius: 8, includeTerrain: false }), false, `${bridge.id}: deck centre`);
    const n = bridge.crossingFrame.normal;
    const start = { x: bridge.x - n.x * 65, y: bridge.y - n.y * 65 };
    const move = resolveWorldMovementV2161(world, start, { dx: n.x * 130, dy: n.y * 130, radius: 8, maxStep: 3 });
    assert.ok(move.moved, `${bridge.id}: movement did not start`);
    assert.ok(Math.hypot(move.deltaX, move.deltaY) > 120, `${bridge.id}: crossing was blocked`);
    assert.equal(move.blockedX, false, `${bridge.id}: blocked x-axis`);
    assert.equal(move.blockedY, false, `${bridge.id}: blocked y-axis`);
  }
});

test('all eight vehicle collision yaw values match their renderer and bridge approaches are clear', () => {
  const vehicleSource = readFileSync(resolve(root, 'systems/world/vehicle-system-v2149.js'), 'utf8');
  assert.match(vehicleSource, /ctx\.rotate\(Number\(p\.rotation\)\s*\|\|\s*0\)/);
  for (const vehicle of ETRANOM_VEHICLE_SYSTEM_V2149.placements) {
    const collider = world.colliders.find(c => c.id === `vehicle:${vehicle.id}`);
    assert.ok(collider, vehicle.id);
    assert.equal(collider.rotation, vehicle.rotation, vehicle.id);
    assert.equal(vehicle.collision.renderRotation, 'shared-placement-rotation', vehicle.id);
  }
  for (const bridge of ETRANOM_BRIDGE_CROSSINGS_V2162) {
    assert.equal(world.colliders.some(c => c.kind === 'parked-vehicle' && Math.hypot(c.x - bridge.x, c.y - bridge.y) < 75), false, bridge.id);
  }
});

test('authored prop contact profiles are positive and explicitly identify exact-asset versus category fallback', () => {
  for (const [asset, category, width] of [
    ['gothic_props_09.png', 'landmark', 72], ['rocks_ore_03.png', 'rock', 60],
    ['lantern_post.png', 'light', 90], ['market_cart', 'yard', 100], ['unlisted-prop.png', 'debris', 80]
  ]) {
    const profile = resolvePropContactProfileV2162(asset, category, width);
    assert.ok(['circle', 'ellipse', 'rect'].includes(profile.shape));
    assert.ok(['asset-specific-authored', 'category-derived-fallback'].includes(profile.status));
    for (const [key, value] of Object.entries(profile)) if (key !== 'shape' && key !== 'status') assert.ok(value > 0, `${asset}:${key}`);
  }
  assert.match(ETRANOM_VISUAL_PHYSICAL_CONSISTENCY_V2162.coordinateUnit, /40-units-per-metre/);
  assert.ok(ETRANOM_VISUAL_PHYSICAL_CONSISTENCY_V2162.sourceStages.includes(19));
  assert.equal(ETRANOM_VISUAL_PHYSICAL_CONSISTENCY_V2162.sourceStages.includes(16), false);
});
