import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ETRANOM_MASTER_ENVIRONMENT_V2154,
  auditMasterEnvironmentV2154,
  buildWorldCollisionProxiesV2154
} from '../../systems/world/master-environment-v2154.js';
import { ETRANOM_BUILDING_ARCHITECTURE_V2141 } from '../../systems/safe-zone/building-architecture-v2141.js';
import { ETRANOM_LIGHTING_SHADOW_V2150, drawWorldCastShadowsV2154, drawLightingOverlayV2154 } from '../../systems/world/lighting-shadow-v2151.js';
import { ENVIRONMENTAL_PROPS_V2147 } from '../../systems/safe-zone/environmental-props-v2147.js';
import { ETRANOM_TREES_VEGETATION_V2148 } from '../../systems/safe-zone/trees-vegetation-v2148.js';
import { ETRANOM_VEHICLE_SYSTEM_V2149 } from '../../systems/world/vehicle-system-v2149.js';
import { getIsometricDepthKeyV2153 } from '../../systems/world/depth-sorting-v2153.js';

const root = process.cwd();
const pois = Object.keys(ETRANOM_BUILDING_ARCHITECTURE_V2141).map((id, i) => ({
  id, x: 100 + (i % 7) * 210, y: 100 + Math.floor(i / 7) * 230, w: 160 + (i % 3) * 10, h: 118 + (i % 4) * 6
}));

test('V2154 master audit cross-validates all environment stages 1–14', () => {
  const a = auditMasterEnvironmentV2154({ buildingPOIs: pois });
  assert.equal(a.ok, true, JSON.stringify(a.errors));
  assert.equal(a.runtimePOIsValidated, true);
  assert.equal(a.counts.buildings, 27);
  assert.equal(a.counts.interiorPlans, 27);
  assert.equal(a.counts.doorContracts, 27);
  assert.equal(a.counts.roads, 3);
  assert.equal(a.counts.pathEdges, 18);
  assert.equal(a.counts.lightEmitters, 19);
  assert.equal(a.counts.materials, 9);
});


test('the live game POI table resolves all 27 buildings into dimensioned collision candidates', () => {
  const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const marker = 'const cityPOI = [';
  const start = game.indexOf(marker);
  assert.notEqual(start, -1, 'cityPOI declaration must exist');
  const arrayStart = start + marker.length - 1;
  const endMarker = '];\n    const safeVillages';
  const end = game.indexOf(endMarker, arrayStart);
  assert.notEqual(end, -1, 'cityPOI declaration must terminate before safeVillages');
  const rows = new Function(`return ${game.slice(arrayStart, end + 1)}`)();
  const a = auditMasterEnvironmentV2154({ buildingPOIs: rows });
  assert.equal(a.ok, true, JSON.stringify(a.errors));
  assert.equal(a.runtimePOIsValidated, true);
  assert.equal(a.counts.collisionProxies >= 110, true);
  assert.equal(a.collisionProxies.filter(x => x.kind === 'building').length, 27);
});

test('spatial collision proxy registry covers buildings, solid props, tree trunks and parked vehicles', () => {
  const rows = buildWorldCollisionProxiesV2154(pois);
  assert.equal(rows.filter(x => x.kind === 'building').length, 27);
  assert.equal(rows.filter(x => x.kind === 'environment-prop').length, ENVIRONMENTAL_PROPS_V2147.count);
  assert.equal(rows.filter(x => x.kind === 'tree-trunk').length, ETRANOM_TREES_VEGETATION_V2148.trees.length);
  assert.equal(rows.filter(x => x.kind === 'vehicle').length, ETRANOM_VEHICLE_SYSTEM_V2149.placements.length);
  for (const row of rows) {
    assert.ok(row.id && row.kind && row.collisionProxy?.shape);
    assert.ok([row.transform.x,row.transform.y,row.transform.z,row.dimensions.length,row.dimensions.width,row.dimensions.height].every(Number.isFinite));
    assert.ok(row.dimensions.length > 0 && row.dimensions.width > 0 && row.dimensions.height > 0);
  }
  assert.ok(rows.some(x => x.kind === 'tree-trunk' && x.passability.canopy === 'overhead-occlusion-only'));
  assert.ok(rows.every(x => x.collisionProxy.status.includes('stage-19')));
});

test('all V2147, V2148 and V2149 referenced world-art files exist in the package', () => {
  for (const item of ENVIRONMENTAL_PROPS_V2147.placements) {
    assert.ok(fs.existsSync(path.join(root, item.assetPath.replace(/^\.\//,''))), item.assetPath);
  }
  for (const tree of ETRANOM_TREES_VEGETATION_V2148.placements) {
    const asset = path.join(root, 'assets/safe-zone/props-v2099', tree.file);
    assert.ok(fs.existsSync(asset), asset);
  }
  for (const vehicleAsset of ETRANOM_VEHICLE_SYSTEM_V2149.assetFiles) {
    const asset = path.join(root, vehicleAsset.replace(/^\.\//,''));
    assert.ok(fs.existsSync(asset), vehicleAsset);
  }
});

test('lighting ground shadows and final illumination are separated into correct render passes', () => {
  const calls = [];
  const gradient = { addColorStop() {} };
  const ctx = {
    canvas: { width: 800, height: 600 }, save() { calls.push('save'); }, restore() { calls.push('restore'); },
    fillRect() { calls.push('fillRect'); }, beginPath() { calls.push('path'); }, moveTo(){}, lineTo(){}, closePath(){},
    fill(){}, stroke(){}, arc(){}, createLinearGradient(){ return gradient; }, createRadialGradient(){ return gradient; }
  };
  const shadow = drawWorldCastShadowsV2154(ctx, 0, 0, 0, 0, 500);
  const overlay = drawLightingOverlayV2154(ctx, 0, 0, 0, 0, 500);
  assert.equal(shadow.ok, true);
  assert.equal(shadow.shadowCasters, ETRANOM_LIGHTING_SHADOW_V2150.shadowCasters.length);
  assert.ok(shadow.pointOccluders > 0);
  assert.equal(overlay.ok, true);
  assert.ok(overlay.emitters > 0);
  assert.ok(calls.includes('fillRect'));
});

test('depth sorting accepts calibrated screen depth without inventing an uncalibrated Z scale', () => {
  assert.equal(getIsometricDepthKeyV2153({x:10,y:10,z:100}),20);
  assert.equal(getIsometricDepthKeyV2153({x:10,y:10,z:100,depthElevationScale:0.2}),0);
  assert.equal(getIsometricDepthKeyV2153({x:10,y:10,z:100,screenDepth:7}),7);
});

test('game entry and cache-busting load the master conformance pass', () => {
  const game = fs.readFileSync(path.join(root,'game.js'),'utf8');
  const index = fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(game,/master-environment-v2154\.js\?v=2154/);
  assert.match(game,/auditMasterEnvironmentV2154\(\{ buildingPOIs: cityPOI \}\)/);
  assert.match(game,/drawWorldCastShadowsV2154/);
  assert.match(game,/drawLightingOverlayV2154/);
  assert.match(game,/environment-audio-v2160\.js\?v=2160/);
  assert.match(index,/game\.js\?v=2166-stage24-world-validation&build=20261127/);
  assert.ok(ETRANOM_MASTER_ENVIRONMENT_V2154.stageCoverage.worldStructure);
});
