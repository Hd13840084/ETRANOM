import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ETRANOM_WORLD_STRUCTURE_V2138,
  auditWorldStructureV2138,
  isWorldPositionInBoundsV2138,
  resolveSafeSettlementV2138,
  worldToScreenV2138,
  screenDeltaToWorldV2138
} from '../../systems/world/world-structure-v2138.js';

test('canonical V2138 world structure is internally valid and retains the existing world footprint', () => {
  const audit = auditWorldStructureV2138();
  assert.equal(audit.ok, true, audit.errors.join(', '));
  assert.equal(audit.version, 2138);
  assert.equal(audit.settlements, 4);
  assert.equal(audit.perimeterGates, 10);
  assert.equal(audit.landmarks, 8);
  assert.equal(audit.dangerFrontiers, 6);
  assert.equal(audit.routeLinks, 3);
  assert.deepEqual(ETRANOM_WORLD_STRUCTURE_V2138.dimensions.playerSpawn, { x: 1500, y: 1050 });
  assert.equal(ETRANOM_WORLD_STRUCTURE_V2138.coordinateSystem.metersPerUnit, null);
});

test('world bounds include the legacy western frontier entry corridor without widening the world', () => {
  assert.equal(isWorldPositionInBoundsV2138(-735, 1190), true);
  assert.equal(isWorldPositionInBoundsV2138(8965, 6865), true);
  assert.equal(isWorldPositionInBoundsV2138(-901, 1190), false);
  assert.equal(isWorldPositionInBoundsV2138(8966, 6865), false);
});

test('safe settlement lookup preserves the existing ordered rectangular footprint behavior', () => {
  assert.equal(resolveSafeSettlementV2138(1500, 1050)?.id, 'city');
  assert.equal(resolveSafeSettlementV2138(490, 800)?.id, 'grain');
  assert.equal(resolveSafeSettlementV2138(2480, 900)?.id, 'rootwood');
  assert.equal(resolveSafeSettlementV2138(1900, 2140)?.id, 'ironhollow');
  assert.equal(resolveSafeSettlementV2138(NaN, 0), null);
});

test('isometric world/screen transforms are inverse to floating-point tolerance', () => {
  const world = { x: 1782.5, y: 1437.25 };
  const camera = { x: 1500, y: 1050 };
  const screen = worldToScreenV2138(world.x, world.y, camera.x, camera.y);
  const delta = screenDeltaToWorldV2138(screen.x - 360, screen.y - 325);
  assert.ok(Math.abs(delta.x - (world.x - camera.x)) < 1e-8);
  assert.ok(Math.abs(delta.y - (world.y - camera.y)) < 1e-8);
});
