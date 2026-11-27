import test from 'node:test';
import assert from 'node:assert/strict';
import { ETRANOM_WORLD_SCALE_V2164, auditWorldScaleV2164, worldUnitsToMetersV2164, metersToWorldUnitsV2164 } from '../../systems/world/world-scale-v2164.js';
import { ETRANOM_ASSET_CONTACT_MASKS_V2164, getAssetContactMaskV2164, buildPixelContactColliderV2164, auditAssetContactMasksV2164 } from '../../systems/world/asset-contact-masks-v2164.js';
import { auditBridgePhysicsV2164, resolveBridgeDeckSampleV2164 } from '../../systems/world/bridge-physics-v2164.js';
import { createSeasonalSurfaceStateV2164, stepSeasonalSurfaceStateV2164, getSeasonalSurfaceAtV2164, auditSeasonalSurfacePhysicsV2164 } from '../../systems/world/seasonal-surface-physics-v2164.js';
import { ETRANOM_VEHICLE_SYSTEM_V2149, auditVehicleSystemV2149 } from '../../systems/world/vehicle-system-v2149.js';
import { createVehiclePhysicsStateV2164, stepVehiclePhysicsV2164, auditVehiclePhysicsV2164 } from '../../systems/world/vehicle-physics-v2164.js';
import { createBoundedLRUCacheV2164, buildWorldChunkIndexV2164, queryWorldChunkIndexV2164, createWorldPerformanceGovernorV2164, createFixedStepClockV2164, auditWorldRuntimeOptimizationV2164 } from '../../systems/world/world-runtime-optimization-v2164.js';
import { ETRANOM_INTERIOR_ARCHITECTURE_V2144 } from '../../systems/safe-zone/interior-architecture-v2144.js';
import { moveInteriorPlayerContinuousV2164 } from '../../systems/world/physics-collision-v2161.js';

test('V2164 gameplay metric scale is finite and round-trips logical units and metres', () => {
  assert.equal(auditWorldScaleV2164().ok, true);
  assert.equal(ETRANOM_WORLD_SCALE_V2164.logicalUnitsPerMeter, 40);
  assert.equal(worldUnitsToMetersV2164(72), 1.8);
  assert.equal(metersToWorldUnitsV2164(1.8), 72);
  assert.equal(worldUnitsToMetersV2164(Number.NaN), null);
});

test('native-resolution alpha contact masks and cached signed-distance fields cover the shipped collider catalog', () => {
  const audit = auditAssetContactMasksV2164();
  assert.equal(audit.ok, true, audit.errors.join(','));
  assert.equal(audit.assets, ETRANOM_ASSET_CONTACT_MASKS_V2164.count);
  assert.equal(audit.distanceFields, audit.assets);
  const asset = ETRANOM_ASSET_CONTACT_MASKS_V2164.assets[0];
  const mask = getAssetContactMaskV2164(asset);
  assert.ok(mask.bytes.length >= Math.ceil(mask.width * mask.height / 8));
  const collider = buildPixelContactColliderV2164({ id: 'test-mask', asset, x: 100, y: 100, width: 80 });
  assert.equal(collider.shape, 'alpha-mask');
  assert.equal(collider.maskDistanceField.length, collider.maskWidth * collider.maskHeight);
  assert.equal(collider.maskStatus, 'native-resolution-alpha-contact-mask');
});

test('bridge decks are bounded raised supports and all authored crossings pass their audit', () => {
  const audit = auditBridgePhysicsV2164();
  assert.equal(audit.ok, true, audit.errors.join(','));
  assert.equal(audit.bridges, 2);
  const deck = resolveBridgeDeckSampleV2164(2190, 1210, 8);
  assert.ok(deck?.onDeck);
  assert.ok(deck.deckRiseMeters > 0);
  assert.equal(resolveBridgeDeckSampleV2164(2190 + 500, 1210, 0), null);
});

test('winter snow persists by world cell, compacts underfoot, changes traction and melts in warm rain', () => {
  let state = createSeasonalSurfaceStateV2164();
  for (let i = 0; i < 12; i++) state = stepSeasonalSurfaceStateV2164(state, { season: 'winter', snow: 1, wetness: .4, rain: 0, temperatureC: -5 }, .1, 250, 250);
  const winter = getSeasonalSurfaceAtV2164(state, 250, 250, { season: 'winter', snow: 1 });
  assert.ok(winter.snowDepthM > .04);
  assert.ok(winter.speedMultiplier < 1 && winter.traction < 1);
  assert.ok(winter.compaction > 0);
  const saved = JSON.parse(JSON.stringify(state));
  assert.ok(saved.tiles['1,1'].snowDepthM > 0);
  for (let i = 0; i < 10; i++) state = stepSeasonalSurfaceStateV2164(state, { season: 'spring', snow: 0, wetness: 1, rain: 1, temperatureC: 12 }, .1, 250, 250);
  const thawed = getSeasonalSurfaceAtV2164(state, 250, 250, { season: 'spring', snow: 0 });
  assert.ok(thawed.snowDepthM < winter.snowDepthM);
  assert.equal(auditSeasonalSurfacePhysicsV2164().ok, true);
});

test('all eight vehicles have runtime state, ground vehicles move and oriented footprint collision stops them', () => {
  const placements = ETRANOM_VEHICLE_SYSTEM_V2149.placements;
  assert.equal(auditVehicleSystemV2149().ok, true);
  assert.equal(auditVehiclePhysicsV2164(placements).ok, true);
  const runtime = createVehiclePhysicsStateV2164(placements);
  const land = placements.find(p => p.terrainClass === 'land');
  const free = stepVehiclePhysicsV2164(runtime, land.id, { throttle: 1 }, .08, {
    placements, resolveSurface: () => ({ traction: 1, speedMultiplier: 1, accelerationMultiplier: 1, elevation: 0 }), isBlocked: () => false
  });
  assert.equal(free.ok, true);
  assert.equal(free.moved, true);
  assert.ok(free.speedMps > 0);
  const supportedRuntime = createVehiclePhysicsStateV2164(placements);
  const supported = stepVehiclePhysicsV2164(supportedRuntime, land.id, { throttle: 1 }, .08, {
    placements, resolveSurface: () => ({ traction: 1, speedMultiplier: 1, accelerationMultiplier: 1, elevation: 4, supportElevation: 12 }), isBlocked: () => false
  });
  assert.equal(supported.vehicle.z, 12, 'vehicle body must follow the accepted raised support/deck height');
  const blockedRuntime = createVehiclePhysicsStateV2164(placements);
  let samples = 0;
  const blocked = stepVehiclePhysicsV2164(blockedRuntime, land.id, { throttle: 1 }, .08, {
    placements, resolveSurface: () => ({ traction: 1, speedMultiplier: 1, accelerationMultiplier: 1, elevation: 0 }), isBlocked: () => { samples++; return samples === 9; }
  });
  assert.equal(blocked.collision, true);
  assert.ok(samples >= 9);
  assert.equal(blocked.vehicle.x, land.x);
});

test('the authored creek boat starts on the navigable water polyline and can move along it', () => {
  const placements = ETRANOM_VEHICLE_SYSTEM_V2149.placements;
  const boat = placements.find(p => p.terrainClass === 'water');
  assert.ok(boat);
  const runtime = createVehiclePhysicsStateV2164(placements);
  assert.equal(runtime.vehicles[boat.id].routeDistance, 0);
  const result = stepVehiclePhysicsV2164(runtime, boat.id, { throttle: 1 }, .08, {
    placements, resolveSurface: () => ({ traction: 1, speedMultiplier: 1, accelerationMultiplier: 1, elevation: 0 }), isBlocked: () => false
  });
  assert.equal(result.ok, true, result.reason);
  assert.equal(result.moved, true);
  assert.ok(result.vehicle.routeProgress > 0);
});

test('continuous interior foot movement stays in bounds and honours solid floorplans for all 27 buildings', () => {
  const ids = Object.keys(ETRANOM_INTERIOR_ARCHITECTURE_V2144);
  assert.equal(ids.length, 27);
  for (const id of ids) {
    const start = { x: 5, y: 7 };
    const result = moveInteriorPlayerContinuousV2164(start, .16, 0, id);
    assert.ok(Number.isFinite(result.player.x) && Number.isFinite(result.player.y), id);
    assert.ok(result.player.x >= .22 && result.player.x <= 9.78, id);
    assert.ok(result.player.y >= .22 && result.player.y <= 7.78, id);
    assert.ok(Math.abs(result.player.x - start.x) <= .161, id);
  }
  const move = moveInteriorPlayerContinuousV2164({ x: 5, y: 7 }, .42, 0, ids[0]);
  assert.equal(move.moved, true);
  assert.ok(move.player.x > 5);
});

test('LRU, spatial chunk index, adaptive render governor and fixed-step clock are bounded', () => {
  const cache = createBoundedLRUCacheV2164(8);
  for (let i = 0; i < 20; i++) cache.set(i, i);
  assert.equal(cache.size, 8);
  const index = buildWorldChunkIndexV2164([{ id: 'a', x: 10, y: 10 }, { id: 'b', x: 500, y: 500 }, { id: 'c', x: 15, y: 12 }], 128);
  assert.deepEqual(queryWorldChunkIndexV2164(index, { left: 0, right: 100, top: 0, bottom: 100 }).map(x => x.id), ['a', 'c']);
  const governor = createWorldPerformanceGovernorV2164();
  let profile;
  for (let i = 0; i < 50; i++) profile = governor.observe(i * 34);
  assert.notEqual(profile.quality, 'high');
  const fixed = createFixedStepClockV2164(1 / 30, 4);
  let steps = 0;
  const tick = fixed.advance(.1, () => steps++);
  assert.ok(steps > 0 && steps <= 4);
  assert.equal(tick.steps, steps);
  assert.equal(auditWorldRuntimeOptimizationV2164().ok, true);
});
