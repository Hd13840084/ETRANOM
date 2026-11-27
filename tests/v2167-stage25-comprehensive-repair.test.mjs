import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167, auditWorldGeometryExtensionsV2167 } from '../systems/world/world-geometry-extensions-v2167.js';
import { ETRANOM_WORLD_ART_KIT_V2167, auditWorldArtKitV2167, drawWorldArtKitGroundV2167, drawWorldArtKitStructuresV2167 } from '../systems/world/world-art-kit-v2167.js';
import { auditPathSystemV2143, ETRANOM_PATH_SYSTEM_V2143, findPathV2143 } from '../systems/world/path-system-v2143.js';
import { buildWorldPhysicsWorldV2161, isWorldPositionBlockedV2161 } from '../systems/world/physics-collision-v2161.js';
import { ETRANOM_INTERIOR_VOLUME_V2167, auditInteriorVolumeV2167, renderInteriorVolumeMarkupV2167, moveInteriorPlayerOnVolumeV2167 } from '../systems/safe-zone/interior-volume-v2167.js';
import { auditBridgeMeshesV2167, ETRANOM_BRIDGE_MESHES_V2167, sampleBridgeMeshV2167 } from '../systems/world/bridge-mesh-physics-v2167.js';
import { auditBridgeRigidBody3DV2165 } from '../systems/world/bridge-rigidbody-3d-v2165.js';
import { auditSnowStructuralGeometryV2167, createSnowStructuralStateV2167, stepSnowStructuralGeometryV2167, getSnowStructuralCollisionMeshV2167 } from '../systems/world/snow-structural-geometry-v2167.js';
import { ETRANOM_VEHICLE_SYSTEM_V2149 } from '../systems/world/vehicle-system-v2149.js';
import { createVehiclePhysicsStateV2164, stepVehiclePhysicsV2164 } from '../systems/world/vehicle-physics-v2164.js';
import { auditVehicleSuspensionV2167, getVehicleWheelLayoutV2167 } from '../systems/world/vehicle-suspension-v2167.js';
import { auditStage25ComprehensiveRepairV2167 } from '../systems/world/stage25-comprehensive-repair-v2167.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('Stage 25 authors precise geometry and binds every recovered artwork item', () => {
  const geometry = auditWorldGeometryExtensionsV2167();
  const art = auditWorldArtKitV2167();
  assert.equal(geometry.ok, true, geometry.errors.join('; '));
  assert.equal(art.ok, true, art.errors.join('; '));
  assert.equal(art.intentionallyUnplaced, 0);
  assert.equal(geometry.junctions, 2);
  assert.equal(geometry.roadBranches, 2);
  assert.equal(geometry.barriers, 2);
  assert.equal(geometry.assetBindings, 5);
  for (const asset of ETRANOM_WORLD_ART_KIT_V2167.assets) {
    assert.ok(existsSync(resolve(ROOT, 'assets/safe-zone/world-kit-v2166', asset.file)), `missing art asset ${asset.file}`);
  }
  assert.equal(ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.assetBindings.length, 5);
  assert.ok(geometry.totalSurfaceTriangles >= 150);
  assert.ok(ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.junctions.every(row => row.surface.arms.length === 3 && row.surface.hub.triangles.length === 24));
  assert.ok(ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.barriers.every(row => row.surfaceMesh.vertices.length >= 8));
});

test('authored junction and curved-road meshes render without texture availability; barrier meshes render as geometry', () => {
  const ctx = new Proxy({}, { get(target, key) { if (!(key in target)) target[key] = () => {}; return target[key]; }, set(target, key, value) { target[key] = value; return true; } });
  const ground = drawWorldArtKitGroundV2167(ctx, 0, 0);
  assert.equal(ground.branches, 2);
  assert.equal(ground.curves, 1);
  assert.equal(ground.junctions, 2);
  assert.equal(ground.meshTriangles, 176);
  const fence = drawWorldArtKitStructuresV2167(ctx, 0, 600, 'summer');
  const wall = drawWorldArtKitStructuresV2167(ctx, 2000, 900, 'summer');
  assert.equal(fence.barriers, 1);
  assert.equal(wall.barriers, 1);
});

test('junctions physically split trunk routes and the Y/T branches are graph-connected', () => {
  const audit = auditPathSystemV2143();
  assert.equal(audit.ok, true, audit.errors.join('; '));
  assert.equal(ETRANOM_PATH_SYSTEM_V2143.coverage.stage25Branches, 2);
  for (const junction of ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.junctions) {
    const edges = ETRANOM_PATH_SYSTEM_V2143.edges.filter(edge => edge.from === junction.id || edge.to === junction.id);
    assert.equal(edges.length, 3, `${junction.id} must connect two trunk halves and its authored spur`);
    const road = ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.roads.find(item => item.from === junction.id);
    assert.ok(road, `branch missing for ${junction.id}`);
    const town = ETRANOM_PATH_SYSTEM_V2143.nodes.find(node => node.id === (junction.id.includes('_y_') ? 'settlement_ironhollow' : 'settlement_rootwood'));
    const route = findPathV2143({ x: junction.x, y: junction.y }, { x: town.x, y: town.y });
    assert.equal(route.ok, true, `trunk route disconnected from ${junction.id}`);
  }
});

test('fence and stone-wall artwork have matching blocking world colliders', () => {
  const world = buildWorldPhysicsWorldV2161();
  const barriers = world.colliders.filter(c => c.kind === 'world-barrier');
  assert.equal(barriers.length, 2);
  assert.equal(world.counts.barrierSegments, 2);
  assert.equal(isWorldPositionBlockedV2161(world, 335, 1305, { radius: 12, includeTerrain: false, ignoreWaterways: true }), true);
  assert.equal(isWorldPositionBlockedV2161(world, 335, 1250, { radius: 12, includeTerrain: false, ignoreWaterways: true }), false);
  assert.equal(isWorldPositionBlockedV2161(world, 2550, 1610, { radius: 12, includeTerrain: false, ignoreWaterways: true }), true);
  assert.equal(isWorldPositionBlockedV2161(world, 2550, 1550, { radius: 12, includeTerrain: false, ignoreWaterways: true }), false);
});

test('27 building interiors contain extruded floor, wall, partition, ceiling and stair geometry', () => {
  const audit = auditInteriorVolumeV2167();
  assert.equal(audit.ok, true, audit.errors.join('; '));
  assert.equal(audit.buildings, 27);
  assert.equal(audit.floors, 39);
  assert.ok(audit.triangles >= 2500);
  const upstairs = Object.values(ETRANOM_INTERIOR_VOLUME_V2167.buildings).find(v => v.floorCount === 2);
  assert.ok(upstairs);
  assert.equal(upstairs.stairs.length, 9);
  const markup = renderInteriorVolumeMarkupV2167(upstairs.buildingId, 1);
  assert.match(markup, /interior-volume-v2167/);
  assert.match(markup, /data-floor="1"/);
  assert.match(markup, /data-volume-face="perimeter"/);
  const movement = moveInteriorPlayerOnVolumeV2167({ x: 5, y: 7 }, .1, .1, upstairs.buildingId, 1);
  assert.equal(movement.floor, 1);
  assert.equal(movement.elevationMeters, 3.25);
});

test('bridges are triangulated and 3D rigid bodies settle on the mesh', () => {
  const meshAudit = auditBridgeMeshesV2167();
  const bodyAudit = auditBridgeRigidBody3DV2165();
  assert.equal(meshAudit.ok, true, meshAudit.errors.join('; '));
  assert.equal(bodyAudit.ok, true, bodyAudit.errors.join('; '));
  assert.equal(meshAudit.meshes, 2);
  assert.equal(meshAudit.triangles, 432);
  const vertex = ETRANOM_BRIDGE_MESHES_V2167[0].vertices[63];
  const sample = sampleBridgeMeshV2167(vertex[0], vertex[1]);
  assert.ok(sample?.triangle);
  assert.equal(sample.bridgeId, ETRANOM_BRIDGE_MESHES_V2167[0].bridgeId);
});

test('snow load changes roof and branch meshes and exposes corresponding collision surfaces', () => {
  const audit = auditSnowStructuralGeometryV2167();
  assert.equal(audit.ok, true, audit.errors.join('; '));
  const building = [{ id: 'snow-test-roof', x: 200, y: 200, w: 240, h: 160 }];
  const trees = [{ id: 'snow-test-tree', x: 350, y: 250, width: 110 }];
  const state = stepSnowStructuralGeometryV2167(createSnowStructuralStateV2167(), { season: 'winter', snow: 1, temperatureC: -8 }, .1, building, trees);
  const roofMesh = getSnowStructuralCollisionMeshV2167(state, 'roof:snow-test-roof');
  const canopyMesh = getSnowStructuralCollisionMeshV2167(state, 'canopy:snow-test-tree');
  assert.equal(roofMesh.contactMode, 'triangle-surface');
  assert.equal(roofMesh.triangles.length, 4);
  assert.equal(canopyMesh.contactMode, 'branch-triangle-strips');
  assert.equal(canopyMesh.branches.length, 8);
});

test('vehicle simulation consumes per-wheel spring, damper and tyre telemetry', () => {
  const audit = auditVehicleSuspensionV2167(ETRANOM_VEHICLE_SYSTEM_V2149.placements);
  assert.equal(audit.ok, true, audit.errors.join('; '));
  assert.equal(audit.wheelCount, 24);
  const placement = ETRANOM_VEHICLE_SYSTEM_V2149.placements.find(p => p.terrainClass !== 'water');
  const wheelLayout = getVehicleWheelLayoutV2167(placement);
  assert.equal(wheelLayout.length, placement.wheelCount);
  assert.ok(wheelLayout.every(w => Number.isFinite(w.x) && Number.isFinite(w.y)));
  const runtime = createVehiclePhysicsStateV2164(ETRANOM_VEHICLE_SYSTEM_V2149.placements);
  let last;
  for (let i = 0; i < 120; i++) {
    last = stepVehiclePhysicsV2164(runtime, placement.id, { throttle: .6, steer: .12 }, 1 / 60, {
      placements: ETRANOM_VEHICLE_SYSTEM_V2149.placements,
      resolveSurface: () => ({ supportElevation: 0, traction: 1, surface: 'asphalt' })
    });
  }
  const live = runtime.vehicles[placement.id];
  assert.equal(last.ok, true);
  assert.ok(live.suspensionTelemetry?.wheelTelemetry?.length >= 2);
  assert.ok(live.wheelSpin?.length >= 2);
  assert.ok(Number.isFinite(live.roll) && Number.isFinite(live.pitch));
});

test('integrated Stage 25 audit passes all new system gates', () => {
  const audit = auditStage25ComprehensiveRepairV2167();
  assert.equal(audit.ok, true, audit.errors.join('; '));
  assert.equal(audit.completed.recoveredArtAssets, 5);
  assert.equal(audit.completed.interiorBuildings, 27);
  assert.equal(audit.completed.bridgeTriangles, 432);
  assert.equal(audit.completed.vehicleWheels, 24);
});

test('game entry references only existing Stage 25 exports and versioned state keys', () => {
  const game = readFileSync(resolve(ROOT, 'game.js'), 'utf8');
  assert.match(game, /drawWorldArtKitGroundV2167/);
  assert.match(game, /auditStage25ComprehensiveRepairV2167/);
  assert.match(game, /snowStructuralStateV2167/);
  assert.doesNotMatch(game, /state\.snowStructuralStateV2165\s*=\s*stepSnowStructuralGeometryV2167/);
});
