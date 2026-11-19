import assert from 'node:assert/strict';
import { createNecromancerProgress, recruitNecromancerLegion } from '../../systems/classes/necromancer.js';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../../game.js',import.meta.url),'utf8');
let p=createNecromancerProgress();
let r=recruitNecromancerLegion(p,{id:'corpse-a',speciesId:'ash_hound',name:'سگ خاکستر',hp:40,maxHp:40,attack:8},34.99);
assert.equal(r.ok,true); assert.equal(r.chance,35); p=r.progress;
r=recruitNecromancerLegion(p,{id:'corpse-b',speciesId:'ash_crow'},35);
assert.equal(r.ok,false); assert.equal(r.reason,'recruit_failed'); assert.equal(r.corpseConsumed,true);
for(let i=0;i<2;i++){r=recruitNecromancerLegion(p,{id:'corpse-'+i+'x',speciesId:'beast'+i},0);assert.equal(r.ok,true);p=r.progress;}
assert.equal(p.legion.length,3);
r=recruitNecromancerLegion(p,{id:'corpse-four',speciesId:'four'},0);
assert.equal(r.reason,'legion_full'); assert.equal(r.corpseConsumed,false);
assert.match(source,/c\.selectedCorpseId/);
assert.match(source,/corpse-selected/);
assert.match(source,/data-target-enemy/);
assert.match(source,/necromancer-legion-status/);
assert.match(source,/ابتدا روی کارت جسد/);
console.log('Necromancer legion UI and recruitment v74 checks passed.');
