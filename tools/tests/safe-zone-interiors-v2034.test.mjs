import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const game=readFileSync(resolve(root,'game.js'),'utf8');
const index=readFileSync(resolve(root,'index.html'),'utf8');
test('all safe-zone buildings can open a dedicated interior scene',()=>{
  assert.match(game,/function openBuildingInterior\(building\)/);
  assert.match(game,/data-enter-building/);
  assert.match(game,/renderIsometricInteriorV2036\(/);
  assert.match(game,/data-interior-step=/);
  assert.match(game,/data-interior-exit/);
});
test('interior residents are assigned to buildings and can be spoken to inside',()=>{
  assert.match(game,/const SAFE_BUILDING_RESIDENTS=/);
  for(const id of ['smith_bram','priest_amon','grain_miller_omid','rootwood_sawyer_daran','iron_miner_kaveh']) assert.ok(game.includes("'"+id+"'"));
  assert.match(game,/data-interior-npc-talk/);
  assert.match(game,/viaBuilding:interiorView\.id/);
  assert.match(game,/journal\('در '\+interiorView\.name\+' با '/);
});
test('live entry point loads the current game module after interior upgrades',()=>assert.match(index,/game\.js\?v=2046&nav=2038/));
