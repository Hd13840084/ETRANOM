import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ETRANOM_BUILDING_ARCHITECTURE_V2141 } from '../../systems/safe-zone/building-architecture-v2141.js';
import { ETRANOM_ENVIRONMENT_INTERACTION_CATALOG_V2155, buildEnvironmentInteractionCatalogV2155, auditEnvironmentInteractionV2155 } from '../../systems/world/environment-interaction-v2155.js';
import { ETRANOM_MASTER_ENVIRONMENT_V2154, auditMasterEnvironmentV2154 } from '../../systems/world/master-environment-v2154.js';
import { ENVIRONMENTAL_PROPS_V2147 } from '../../systems/safe-zone/environmental-props-v2147.js';
import { ETRANOM_TREES_VEGETATION_V2148 } from '../../systems/safe-zone/trees-vegetation-v2148.js';
import { ETRANOM_VEHICLE_SYSTEM_V2149 } from '../../systems/world/vehicle-system-v2149.js';

const root = process.cwd();
const readLivePOIs = () => {
  const source = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const marker = 'const cityPOI = [';
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, 'live cityPOI declaration exists');
  const arrayStart = start + marker.length - 1;
  const end = source.indexOf('];\n    const safeVillages', arrayStart);
  assert.notEqual(end, -1, 'live cityPOI declaration has expected boundary');
  return new Function(`return ${source.slice(arrayStart, end + 1)}`)();
};

test('V2156 final audit validates the actual live world POIs across stages 1–14', () => {
  const pois = readLivePOIs();
  const result = auditMasterEnvironmentV2154({ buildingPOIs: pois });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.runtimePOIsValidated, true);
  assert.equal(result.counts.buildings, 27);
  assert.equal(result.counts.interiorPlans, 27);
  assert.equal(result.counts.doorContracts, 27);
  assert.equal(result.counts.roads, 3);
  assert.equal(result.counts.pathNodes, 29);
  assert.equal(result.counts.pathEdges, 18);
});

test('V2156 final audit validates all 69 live Stage 15 interaction targets', () => {
  const catalog = buildEnvironmentInteractionCatalogV2155(readLivePOIs());
  const result = auditEnvironmentInteractionV2155(catalog);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.buildingDoors, 27);
  assert.equal(result.environmentProps, ENVIRONMENTAL_PROPS_V2147.placements.length);
  assert.equal(result.environmentProps, 34);
  assert.equal(result.vehicles, ETRANOM_VEHICLE_SYSTEM_V2149.placements.length);
  assert.equal(result.vehicles, 8);
  assert.equal(result.entities, 69);
  assert.equal(new Set(catalog.map(x => x.id)).size, catalog.length);
  assert.equal(ETRANOM_ENVIRONMENT_INTERACTION_CATALOG_V2155.length, 42, 'the exported empty-input template is not mistaken for the live catalog');
});

test('V2156 preserves all authored environmental art references and project entry integrations', () => {
  const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(game, /master-environment-v2154\.js\?v=2154/);
  assert.match(game, /environment-interaction-v2155\.js\?v=2155/);
  assert.match(index, /game\.js\?v=2166-stage24-world-validation/);
  for (const item of ENVIRONMENTAL_PROPS_V2147.placements) assert.ok(fs.existsSync(path.join(root, item.assetPath.replace(/^\.\//, ''))), item.assetPath);
  for (const tree of ETRANOM_TREES_VEGETATION_V2148.placements) assert.ok(fs.existsSync(path.join(root, 'assets/safe-zone/props-v2099', tree.file)), tree.file);
  for (const file of ETRANOM_VEHICLE_SYSTEM_V2149.assetFiles) assert.ok(fs.existsSync(path.join(root, file.replace(/^\.\//, ''))), file);
  assert.equal(Object.keys(ETRANOM_BUILDING_ARCHITECTURE_V2141).length, 27);
  assert.equal(ETRANOM_TREES_VEGETATION_V2148.trees.length, 41);
  assert.equal(ETRANOM_TREES_VEGETATION_V2148.understory.length, 50);
  assert.ok(ETRANOM_MASTER_ENVIRONMENT_V2154.stageCoverage.depthSorting);
});
