import test from 'node:test';
import assert from 'node:assert/strict';
import { ETRANOM_WORLD_SCALE_CALIBRATION_V2170, auditWorldScaleCalibrationV2170, worldUnitsToMetersV2170 } from '../../systems/world/world-scale-calibration-v2170.js';
import { ETRANOM_VEHICLE_SYSTEM_V2149, auditVehicleSystemV2149 } from '../../systems/world/vehicle-system-v2149.js';
import { ETRANOM_TREES_VEGETATION_V2148, auditTreesVegetationV2148 } from '../../systems/safe-zone/trees-vegetation-v2148.js';
import { ENVIRONMENTAL_PROPS_V2147, auditEnvironmentalPropsV2147 } from '../../systems/safe-zone/environmental-props-v2147.js';
import { ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137 } from '../../systems/safe-zone/authored-props-v2137.js';
import { ETRANOM_BUILDING_YARD_PLACEMENTS_V2117 } from '../../systems/safe-zone/building-yards-v2117.js';
import { OUTDOOR_VILLAGE_LIFE_V2115 } from '../../systems/safe-zone/outdoor-village-life-v2115.js';
import { SETTLEMENT_MICRO_LANDSCAPE_PLACEMENTS_V2170 } from '../../systems/safe-zone/settlement-micro-landscape-v2110.js';
import { ISOMETRIC_CAMERA_V2139, auditIsometricCameraV2139 } from '../../systems/world/isometric-camera-v2139.js';
import { readFileSync } from 'node:fs';
const game = readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
test('metric contract matches player and door clearance', () => {
  assert.equal(auditWorldScaleCalibrationV2170().ok, true);
  assert.equal(worldUnitsToMetersV2170(72), 1.8);
  assert.equal(ETRANOM_WORLD_SCALE_CALIBRATION_V2170.door.clearWidthUnits, 36);
  assert.ok(ETRANOM_WORLD_SCALE_CALIBRATION_V2170.door.clearWidthUnits > ETRANOM_WORLD_SCALE_CALIBRATION_V2170.player.collisionDiameterUnits);
});
test('camera is tight isometric framing', () => {
  assert.equal(auditIsometricCameraV2139().ok, true);
  assert.equal(ISOMETRIC_CAMERA_V2139.zoom, 2.8);
});
test('all four settlements have authored scale inventories', () => {
  assert.deepEqual([...ETRANOM_WORLD_SCALE_CALIBRATION_V2170.settlements], ['ashen_city','farmland','rootwood','ironstone']);
  assert.equal(ETRANOM_TREES_VEGETATION_V2148.placements.length, 91);
  assert.equal(ENVIRONMENTAL_PROPS_V2147.placements.length, 34);
  assert.equal(ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137.length, 24);
  assert.equal(ETRANOM_BUILDING_YARD_PLACEMENTS_V2117.length, 27);
  assert.equal(SETTLEMENT_MICRO_LANDSCAPE_PLACEMENTS_V2170.length, 32);
  assert.equal(OUTDOOR_VILLAGE_LIFE_V2115.residents, 23);
});
test('vehicles use compact metric profiles and matching collision footprints', () => {
  assert.equal(auditVehicleSystemV2149().ok, true);
  assert.equal(ETRANOM_VEHICLE_SYSTEM_V2149.placements.length, 8);
  for (const v of ETRANOM_VEHICLE_SYSTEM_V2149.placements) {
    assert.ok(v.width <= 90, `${v.id} width ${v.width}`);
    assert.equal(v.footprint.width, v.width);
    assert.equal(v.footprint.length, v.length);
  }
});
test('building proximity is excluded from quick interaction targets', () => {
  assert.doesNotMatch(game, /nearest\(cityPOI,\s*'building'/);
  assert.doesNotMatch(game, /nearBuilding/);
  assert.match(game, /const near = \[n, m, ep, vh\]/);
});
