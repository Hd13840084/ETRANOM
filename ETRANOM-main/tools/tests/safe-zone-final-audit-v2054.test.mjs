import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditSafeZoneFinalV2054, SAFE_ZONE_FINAL_CONTRACT_V2054 } from '../../systems/safe-zone/final-audit-v2054.js';

test('V2054 final audit confirms the four settlements and all 27 matching buildings/interiors', () => {
  const audit = auditSafeZoneFinalV2054();
  assert.equal(audit.ok, true, audit.errors.join(', '));
  assert.equal(audit.buildings, SAFE_ZONE_FINAL_CONTRACT_V2054.expectedBuildings);
  assert.equal(audit.interiors, SAFE_ZONE_FINAL_CONTRACT_V2054.expectedInteriors);
  assert.equal(audit.settlements.length, 4);
  assert.equal(audit.wayfindingMarkers, 4);
});

test('all settlement districts contain buildings and all 162 furniture placements validate', () => {
  const audit = auditSafeZoneFinalV2054();
  assert.deepEqual(Object.keys(audit.distribution), [...SAFE_ZONE_FINAL_CONTRACT_V2054.settlements]);
  assert.ok(Object.values(audit.distribution).every(count => count > 0));
  assert.equal(audit.furniturePlacements, 162);
});

test('V2054 is audit-only and does not alter gameplay systems', () => {
  const source = fs.readFileSync(new URL('../../systems/safe-zone/final-audit-v2054.js', import.meta.url), 'utf8');
  assert.match(source, /Audit-only module/);
  assert.doesNotMatch(source, /localStorage|fetch\(|supabase|collisionRegistry|requestAnimationFrame/);
});
