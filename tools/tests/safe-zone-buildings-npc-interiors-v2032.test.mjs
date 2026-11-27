import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const game=readFileSync(resolve(root,'game.js'),'utf8');
const index=readFileSync(resolve(root,'index.html'),'utf8');
test('safe city contains the missing fire temple, stable and granary while preserving existing services',()=>{
  for(const id of ['online_player_market','pvp_hall','inn','smith','guild','alchemy','enchanter_shop','clinic','guardhouse','fire_temple','stable','granary']) assert.match(game,new RegExp('id:"'+id+'"'));
  assert.match(game,/name:"مغازه افسونگری آمون"/);
  assert.match(game,/name:"آتشکده"/);
  assert.match(game,/name:"اصطبل دروازه شرقی"/);
  assert.match(game,/name:"انبار غله شهر"/);
});
test('existing ten named NPCs are positioned at their assigned building interiors/thresholds',()=>{
  const expected=[
    /captain_arden[\s\S]{0,150}x:1690,y:575/,
    /guard_mira[\s\S]{0,150}x:1725,y:575/,
    /elder_sena[\s\S]{0,150}x:930,y:1400/,
    /merchant_ren[\s\S]{0,150}x:1450,y:835/,
    /alchemist_liora[\s\S]{0,150}x:1330,y:1400/,
    /smith_bram[\s\S]{0,150}x:1880,y:1090/,
    /innkeeper_ella[\s\S]{0,150}x:1120,y:1090/,
    /guildmaster_toren[\s\S]{0,150}x:1690,y:1400/,
    /healer_nara[\s\S]{0,150}x:2070,y:1400/,
    /priest_amon[\s\S]{0,150}x:930,y:835/
  ];
  for(const re of expected) assert.match(game,re);
  assert.match(index,/game\.js\?v=2046&nav=2038/);
});
test('new buildings have distinct architectural drawing branches',()=>{
  for(const kind of ['fire-temple','stable','granary']) assert.ok(game.includes("kind==="+"'"+kind+"'"));
});
