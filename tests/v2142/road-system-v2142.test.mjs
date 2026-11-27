import test from 'node:test';
import assert from 'node:assert/strict';
import { ETRANOM_ROAD_SYSTEM_V2142, auditRoadSystemV2142 } from '../../systems/world/road-system-v2142.js';

test('V2142 defines all canonical settlement connector roads and gate approaches', () => {
  const audit = auditRoadSystemV2142();
  assert.equal(audit.ok, true, audit.errors.join(', '));
  assert.equal(audit.roads, 3);
  assert.equal(audit.gateApproaches, 10);
});

test('road cross-sections have positive widths and preserve canonical route identities', () => {
  for (const road of ETRANOM_ROAD_SYSTEM_V2142.roads) {
    assert.ok(road.carriagewayWidth > 0);
    assert.ok(road.totalWidth > road.carriagewayWidth);
    assert.ok(road.centerline.length >= 2);
    assert.equal(road.passability.navigation, 'stage-06');
    assert.equal(road.passability.collision, 'stage-19');
  }
});

test('gate approaches preserve sealed-gate rules and do not claim physical collision', () => {
  for (const approach of ETRANOM_ROAD_SYSTEM_V2142.gateApproaches) {
    assert.equal(approach.passability.gateRules, 'preserved');
    assert.equal(approach.collision, 'stage-19');
    assert.ok(approach.width > 0);
  }
});
