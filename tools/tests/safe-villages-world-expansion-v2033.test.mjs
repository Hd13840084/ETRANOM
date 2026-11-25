import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const game=readFileSync(resolve(root,'game.js'),'utf8');
const safe=readFileSync(resolve(root,'systems/safe-zone/safe-zone-engine.js'),'utf8');
const index=readFileSync(resolve(root,'index.html'),'utf8');
test('three safe villages and fifteen new buildings are registered',()=>{
  for(const id of ['grain','rootwood','ironhollow']) assert.match(game,new RegExp('id:"'+id+'"'));
  for(const id of ['grain_mill','grain_bakery','grain_farmstead','grain_herbgarden','grain_livestock','rootwood_sawmill','rootwood_carpenter','rootwood_herbalist','rootwood_hunters','rootwood_apiary','iron_mine','iron_smelter','iron_stonecutter','iron_hall','iron_cartwright']) assert.match(game,new RegExp('id:"'+id+'"'));
});
test('ten new residents are anchored at their village buildings',()=>{
  for(const id of ['grain_miller_omid','grain_baker_tala','grain_headman_varo','grain_herbalist_vesa','rootwood_sawyer_daran','rootwood_carpenter_nima','rootwood_hunter_sorin','iron_miner_kaveh','iron_smelter_roha','iron_stonecutter_boran']) assert.match(game,new RegExp('id:"'+id+'"'));
  assert.match(game,/const safeNPCs=\[[\s\S]*?iron_stonecutter_boran/);
});
test('world logical bounds are tripled while existing starting coordinates are retained',()=>{
  assert.match(game,/const W=9000,H=6900/);
  assert.match(game,/worldPosition:\{x:1500,y:920\}/);
  assert.match(index,/game\.js\?v=2039&nav=2038/);
});
test('new village buildings have a steward in the safe-zone contract',()=>{
  for(const id of ['grain_mill','grain_bakery','grain_farmstead','grain_herbgarden','grain_livestock','rootwood_sawmill','rootwood_carpenter','rootwood_herbalist','rootwood_hunters','rootwood_apiary','iron_mine','iron_smelter','iron_stonecutter','iron_hall','iron_cartwright']) assert.match(safe,new RegExp(id+":"));
});
