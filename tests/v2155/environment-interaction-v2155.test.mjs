import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ETRANOM_BUILDING_ARCHITECTURE_V2141 } from '../../systems/safe-zone/building-architecture-v2141.js';
import { ETRANOM_VEHICLE_SYSTEM_V2149 } from '../../systems/world/vehicle-system-v2149.js';
import {
  buildEnvironmentInteractionCatalogV2155,
  executeEnvironmentInteractionV2155,
  getEnvironmentEntityStateV2155,
  getBuildingDoorVisualStateV2155,
  auditEnvironmentInteractionV2155,
  drawInteractionLightingV2155
} from '../../systems/world/environment-interaction-v2155.js';

const root = process.cwd();
const pois = Object.keys(ETRANOM_BUILDING_ARCHITECTURE_V2141).map((id, i) => ({
  id, name: `Building ${i + 1}`, x: 200 + (i % 7) * 220, y: 180 + Math.floor(i / 7) * 240, w: 160, h: 120
}));
const catalog = buildEnvironmentInteractionCatalogV2155(pois);
const fakeContext = () => {
  const calls = [];
  const gradient = { addColorStop() {} };
  return { calls, save(){calls.push('save');}, restore(){calls.push('restore');}, fillRect(){calls.push('fillRect');}, createRadialGradient(){calls.push('gradient');return gradient;}, set fillStyle(v){calls.push('fillStyle');} };
};

test('Stage 15 catalog resolves every authored building door, prop and vehicle exactly once', () => {
  const audit = auditEnvironmentInteractionV2155(catalog);
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  assert.equal(audit.buildingDoors, 27);
  assert.equal(audit.vehicles, ETRANOM_VEHICLE_SYSTEM_V2149.placements.length);
  assert.equal(audit.entities, 27 + 34 + ETRANOM_VEHICLE_SYSTEM_V2149.placements.length);
  assert.equal(audit.lightControls, 2);
  assert.equal(audit.noticeBoards, 1);
});

test('building door opens, animates, enters and closes through a saved runtime state', () => {
  const state = {};
  const id = 'building:inn:door';
  const open = executeEnvironmentInteractionV2155(state, catalog, id, 'enter', { now: 1000 });
  assert.equal(open.ok, true);
  assert.equal(open.enterBuilding, true);
  assert.equal(open.entityState.doorOpen, true);
  assert.equal(getBuildingDoorVisualStateV2155(state, 'inn', 1000).angleRadians, 0);
  assert.ok(getBuildingDoorVisualStateV2155(state, 'inn', 1320).angleRadians > 1);
  const close = executeEnvironmentInteractionV2155(state, catalog, id, 'toggle-door', { now: 1400 });
  assert.equal(close.entityState.doorOpen, false);
  assert.equal(getBuildingDoorVisualStateV2155(state, 'inn', 1720).angleRadians, 0);
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(getEnvironmentEntityStateV2155(restored, id).doorOpen, false);
  assert.equal(restored.environmentInteractions.log.length, 2);
});

test('notice board reads and shrine activations persist without granting fabricated rewards', () => {
  const state = {};
  const board = catalog.find(x => x.sourceId === 'notice_board.png');
  const read = executeEnvironmentInteractionV2155(state, catalog, board.id, 'read', { now: 10 });
  assert.equal(read.ok, true);
  assert.match(read.message, /تابلوی اعلانات/);
  assert.equal(getEnvironmentEntityStateV2155(state, board.id).readCount, 1);
  const shrine = catalog.find(x => x.sourceId === 'wayside_shrine.png');
  const activate = executeEnvironmentInteractionV2155(state, catalog, shrine.id, 'activate', { now: 20 });
  assert.equal(activate.ok, true);
  assert.equal(getEnvironmentEntityStateV2155(state, shrine.id).activated, true);
  assert.equal(state.gold, undefined);
  assert.equal(state.inventory, undefined);
});

test('lantern toggles drive the final night illumination pass', () => {
  const state = {};
  const lamps = catalog.filter(x => x.actions.includes('toggle-light'));
  const before = fakeContext();
  const initial = lamps.reduce((total, lamp) => total + drawInteractionLightingV2155(before, state, catalog, lamp.x - 100, lamp.y - 100, 22, 0, 100).lit, 0);
  assert.equal(initial, lamps.length);
  const change = executeEnvironmentInteractionV2155(state, catalog, lamps[0].id, 'toggle-light', { now: 200 });
  assert.equal(change.ok, true);
  assert.equal(getEnvironmentEntityStateV2155(state, lamps[0].id).lit, false);
  const after = fakeContext();
  const final = lamps.reduce((total, lamp) => total + drawInteractionLightingV2155(after, state, catalog, lamp.x - 100, lamp.y - 100, 22, 0, 200).lit, 0);
  assert.equal(final, lamps.length - 1);
  assert.ok(after.calls.includes('fillRect'));
});

test('vehicles can be inspected but movement actions remain rejected', () => {
  const state = {};
  const vehicle = catalog.find(x => x.kind === 'vehicle');
  const inspect = executeEnvironmentInteractionV2155(state, catalog, vehicle.id, 'inspect', { now: 42 });
  assert.equal(inspect.ok, true);
  const move = executeEnvironmentInteractionV2155(state, catalog, vehicle.id, 'drive', { now: 43 });
  assert.equal(move.ok, false);
  assert.equal(move.code, 'action-not-supported');
});

test('game integration uses Stage 15 for proximity interaction, entry, door visuals and save calls', () => {
  const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const entrance = fs.readFileSync(path.join(root, 'systems/safe-zone/entrance-system-v2145.js'), 'utf8');
  assert.match(game, /environment-interaction-v2155\.js\?v=2155/);
  assert.match(game, /buildEnvironmentInteractionCatalogV2155\(cityPOI\)/);
  assert.match(game, /executeEnvironmentInteractionV2155\(state, environmentInteractionCatalogV2155/);
  assert.match(game, /drawAuthoredEntranceV2145\(ctx, o, getBuildingDoorVisualStateV2155\(state, o\.id\)\)/);
  assert.doesNotMatch(game, /getBuildingDoorVisualStateV2155\(state, o\.id, t\)/);
  assert.match(game, /drawInteractionLightingV2155/);
  assert.match(game, /data-stage15-action/);
  assert.match(game, /2166-stage24-world-validation/);
  assert.match(entrance, /doorState=null/);
});
