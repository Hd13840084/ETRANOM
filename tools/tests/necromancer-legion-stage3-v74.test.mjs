import assert from 'node:assert/strict';
import { createNecromancerProgress, recruitNecromancerLegion } from '../../systems/classes/necromancer.js';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../../game.js',import.meta.url),'utf8');
let p=createNecromancerProgress();
let r=recruitNecromancerLegion(p,{id:'corpse-a',speciesId:'ash_hound',name:'سگ خاکستر',hp:40,maxHp:40},0);
assert.equal(r.ok,true); p=r.progress;
for(let i=1;i<10;i++){r=recruitNecromancerLegion(p,{id:'corpse-'+i,speciesId:'beast'+i,name:'عضو '+i,hp:40,maxHp:40},0);assert.equal(r.ok,true);p=r.progress;}
assert.equal(p.legion.length,10);assert.equal(p.activeLegionIds.length,3);
r=recruitNecromancerLegion(p,{id:'corpse-eleven',speciesId:'eleven',hp:40,maxHp:40},0);
assert.equal(r.ok,false); assert.equal(r.reason,'legion_full'); assert.equal(r.corpseConsumed,false);
assert.match(source,/c\.selectedCorpseId/);
assert.match(source,/corpse-selected/);
assert.match(source,/data-target-enemy/);
assert.match(source,/necromancer-legion-status/);
assert.match(source,/ابتدا روی کارت جسد/);
console.log('Necromancer legion UI and recruitment v74 checks passed.');
