import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditWorldPlacementV2176 } from '../../systems/world/world-placement-audit-v2176.js';
import { ETRANOM_TREES_VEGETATION_V2148 } from '../../systems/safe-zone/trees-vegetation-v2148.js';
import { ETRANOM_VEHICLE_SYSTEM_V2149 } from '../../systems/world/vehicle-system-v2149.js';
import { ETRANOM_SETTLEMENT_LAYOUT_V2173, auditSettlementLayoutV2173 } from '../../systems/world/settlement-layout-v2173.js';
import { ETRANOM_BUILDING_YARD_PLACEMENTS_V2117 } from '../../systems/safe-zone/building-yards-v2117.js';
import { ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137 } from '../../systems/safe-zone/authored-props-v2137.js';
import { ENVIRONMENTAL_PROPS_V2147 } from '../../systems/safe-zone/environmental-props-v2147.js';
import { WORLD_DIMENSIONS_V2138 } from '../../systems/world/world-structure-v2138.js';
import { ETRANOM_WORLD_SCALE_CALIBRATION_V2170 } from '../../systems/world/world-scale-calibration-v2170.js';

const source = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
function readLiteralArray(name) {
  const marker = `const ${name} = [`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing ${name} array`);
  const end = source.indexOf('];', start) + 2;
  assert.ok(end > start, `unterminated ${name} array`);
  return Function(`return (${source.slice(start + marker.length - 1, end - 1)})`)();
}

const buildings = readLiteralArray('cityPOI');
const npcs = readLiteralArray('safeNPCs');
const auditCurrentWorld = () => auditWorldPlacementV2176({
  buildings,
  npcs,
  trees: ETRANOM_TREES_VEGETATION_V2148.trees,
  understory: ETRANOM_TREES_VEGETATION_V2148.understory,
  yardProps: ETRANOM_BUILDING_YARD_PLACEMENTS_V2117,
  authoredProps: ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137,
  environmentalProps: ENVIRONMENTAL_PROPS_V2147.placements,
  vehicles: ETRANOM_VEHICLE_SYSTEM_V2149.placements,
  roads: ETRANOM_SETTLEMENT_LAYOUT_V2173.roads,
  bounds: WORLD_DIMENSIONS_V2138.runtimeBounds,
  logicalUnitsPerMeter: ETRANOM_WORLD_SCALE_CALIBRATION_V2170.logicalUnitsPerMeter,
  player: ETRANOM_WORLD_SCALE_CALIBRATION_V2170.player,
  door: ETRANOM_WORLD_SCALE_CALIBRATION_V2170.door
});

test('Stage 32 authored world placement has no building, tree-anchor, or vehicle-footprint conflicts', () => {
  const result = auditCurrentWorld();
  assert.equal(result.version, 2176);
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.deepEqual(result.conflicts.buildingOverlaps, []);
  assert.deepEqual(result.conflicts.treeBuildingAnchors, []);
  assert.deepEqual(result.conflicts.vehicleBuildingFootprints, []);
  assert.deepEqual(result.conflicts.groundPlacementAnchors, []);
  assert.equal(result.counts.buildings, 27);
  assert.equal(result.counts.trees, 41);
  assert.equal(result.counts.understory, 50);
  assert.equal(result.counts.yardProps, 27);
  assert.equal(result.counts.authoredProps, 24);
  assert.equal(result.counts.environmentalProps, 34);
  assert.equal(result.counts.vehicles, 8);
  assert.equal(result.counts.roads, 30);
});

test('Stage 32 rejects overlapping building footprints', () => {
  const result = auditWorldPlacementV2176({
    buildings: [
      { id: 'a', x: 100, y: 100, w: 100, h: 100 },
      { id: 'b', x: 150, y: 150, w: 100, h: 100 }
    ]
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(x => x.startsWith('building:footprint-overlap:')));
});

test('Stage 32 reports the calibrated physical scale and checks door clearance', () => {
  const result = auditCurrentWorld();
  assert.equal(result.scale.logicalUnitsPerMeter, 40);
  assert.equal(result.scale.playerHeightMeters, 1.8);
  assert.equal(result.scale.doorClearWidthMeters, 0.9);
  assert.equal(result.scale.doorClearHeightMeters, 2.1);
  assert.ok(result.scale.roadWidthMeters.min >= 1.4);
  assert.ok(result.scale.roadWidthMeters.max <= 2.6);
  const invalid = auditWorldPlacementV2176({
    player: { heightUnits: 72, collisionDiameterUnits: 22 },
    door: { clearWidthUnits: 18, clearHeightUnits: 60 }
  });
  assert.ok(invalid.errors.includes('scale:door-narrower-than-player-collision'));
  assert.ok(invalid.errors.includes('scale:door-lower-than-player-reference'));
});

test('The world map icon, tab route, and exact local player marker are wired into the game', () => {
  assert.match(source, /data-world-map-open/);
  assert.match(source, /activeTab = 'map'/);
  assert.match(source, /data-map-position-refresh/);
  assert.match(source, /local-player-map-marker/);
  assert.match(source, /village_grain": \[370, 300\]/);
  assert.match(source, /village_rootwood": \[630, 300\]/);
  assert.match(source, /village_ironhollow": \[625, 465\]/);
});


test('Stage 32 road widths are physically calibrated and the street layout passes its own audit', () => {
  assert.equal(auditSettlementLayoutV2173().ok, true);
  assert.equal(ETRANOM_SETTLEMENT_LAYOUT_V2173.roads.length, 30);
  assert.ok(ETRANOM_SETTLEMENT_LAYOUT_V2173.roads.every(r => r.width >= 48 && r.width <= 120));
});

test('Stage 32 reused environment and vehicle sprite assets all exist in the full package', () => {
  const treeFiles = [...new Set([...ETRANOM_TREES_VEGETATION_V2148.trees, ...ETRANOM_TREES_VEGETATION_V2148.understory].map(x => x.file))];
  const paths = [
    ...treeFiles.map(file => `../../assets/safe-zone/props-v2099/${file}`),
    ...ETRANOM_VEHICLE_SYSTEM_V2149.assetFiles.map(file => `../../${file.replace(/^\.\//, '')}`),
    ...ENVIRONMENTAL_PROPS_V2147.placements.map(item => `../../${item.assetPath.replace(/^\.\//, '')}`)
  ];
  const missing = paths.filter(file => !fs.existsSync(new URL(file, import.meta.url)));
  assert.deepEqual(missing, []);
});
