import test from 'node:test';
import assert from 'node:assert/strict';
import { ETRANOM_BUILDING_ARCHITECTURE_V2141, getBuildingArchitectureV2141, resolveBuildingDimensionsV2141, auditBuildingArchitectureV2141 } from '../../systems/safe-zone/building-architecture-v2141.js';

const IDS = [
'online_player_market','pvp_hall','inn','smith','guild','alchemy','enchanter_shop','clinic','guardhouse','fire_temple','stable','granary',
'grain_mill','grain_bakery','grain_farmstead','grain_herbgarden','grain_livestock','rootwood_sawmill','rootwood_carpenter','rootwood_herbalist','rootwood_hunters','rootwood_apiary',
'iron_mine','iron_smelter','iron_stonecutter','iron_hall','iron_cartwright'
];

test('V2141 provides a complete dark-fantasy architecture contract for all 27 existing POIs', () => {
  const audit = auditBuildingArchitectureV2141(IDS);
  assert.equal(audit.ok, true, audit.errors.join(', '));
  assert.equal(Object.keys(ETRANOM_BUILDING_ARCHITECTURE_V2141).length, 27);
  assert.equal(audit.collisionImplementation, 'stage-19-live-polygon-aligned-to-render-ground-anchor');
  assert.equal(audit.navigationImplementation, 'deferred-stage-06');
});

test('every building declares structural, facade, roof, opening and interior metadata', () => {
  for (const id of IDS) {
    const spec = getBuildingArchitectureV2141(id);
    assert.ok(spec, id);
    assert.ok(spec.facadeMaterial && spec.roof && spec.foundation, id);
    assert.ok(spec.wall.thicknessRatio > 0, id);
    assert.equal(spec.openings.primaryDoor, true, id);
    assert.equal(spec.openings.windowPassability, 'blocked', id);
    assert.equal(spec.interior.supportedByExistingInteriorCatalog, true, id);
  }
});

test('POI dimensions resolve into finite positive logical footprints without claiming metre calibration', () => {
  const dims = resolveBuildingDimensionsV2141({ id: 'guild', w: 190, h: 140 });
  assert.ok(dims.length > 0 && dims.depth > 0 && dims.wallThickness > 0 && dims.wallHeight > 0);
  assert.equal(dims.floors, 2);
  assert.equal(resolveBuildingDimensionsV2141({ id: 'unknown', w: 100, h: 100 }), null);
  assert.equal(resolveBuildingDimensionsV2141({ id: 'guild', w: 0, h: 100 }), null);
});
