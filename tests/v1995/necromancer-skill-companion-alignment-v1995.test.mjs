import test from 'node:test';
import assert from 'node:assert/strict';
import { NECROMANCER, getNecromancerBattleCompanions } from '../../systems/classes/necromancer.js';
import { chooseNecromancerCompanionIntent } from '../../systems/classes/necromancer-common-companions-v1995.js';
import { NECROMANCER_ALL_COMPANIONS } from '../../systems/classes/necromancer-companion-bestiary-v1994.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('V1995 declares unlimited collection and fixed three deployed companions',()=>{
  assert.equal(NECROMANCER.companionSynergy.collectionCapacity,null);
  assert.equal(NECROMANCER.companionSynergy.deployedCapacity,3);
  assert.equal(NECROMANCER.companionSynergy.battleStartAutoHeal,false);
  assert.equal(Object.keys(NECROMANCER.companionSynergy.rules).length,10);
});
test('battle helper returns only living deployed members, not reserve collection',()=>{
  const roster=[{id:'a',hp:10},{id:'b',hp:0},{id:'c',hp:20},{id:'d',hp:30}];
  const got=getNecromancerBattleCompanions({companions:roster,activeLegionIds:['a','b','c','d']},{summonedLegionIds:['a','b','d']});
  assert.deepEqual(got.map(x=>x.id),['a','d']);
});
test('companion AI prioritizes a Death Claw marked enemy',()=>{
  const c={id:'test',skills:[{id:'hit',name:'Hit',type:'physical',target:'single',powerPct:100,cooldownTurns:0}]};
  const intent=chooseNecromancerCompanionIntent(c,{enemies:[{id:'low',hp:1,maxHp:100},{id:'marked',hp:90,maxHp:100,marked:true}],allies:[],cooldowns:{}});
  assert.equal(intent.targetId,'marked');
});

test('all 140 companion identities remain connected and all ranks are represented',()=>{
  assert.equal(NECROMANCER_ALL_COMPANIONS.length,140);
  for(const rank of ['common','uncommon','rare','epic','legendary','mythic','divine'])assert.equal(NECROMANCER_ALL_COMPANIONS.filter(x=>x.rank===rank).length,20);
});
test('the full Necromancer kit remains intact and linked to the companion contract',()=>{
  assert.equal(NECROMANCER.skills.length,10);
  assert.equal(NECROMANCER.talents.length,32);
  assert.equal(NECROMANCER.ascendedSkills.length,10);
  for(const skillId of ['death_claw','death_memory','bone_blossom','assembly_of_souls','life_siphon','kingdom_of_bones','return_threshold','soul_domination','eternal_sovereign','underworld_gate'])assert.ok(NECROMANCER.companionSynergy.rules[skillId]);
});
test('runtime preserves defeated companions and does not refill their HP at battle start',()=>{
  const here=path.dirname(fileURLToPath(import.meta.url)),game=fs.readFileSync(path.resolve(here,'../../game.js'),'utf8');
  assert.match(game,/wp\.legion=\(wp\.legion\|\|\[\]\)\.map\(m=>\(\{\.\.\.m,incapacitated:Number\(m\.hp\)<=0,deathForm:null,necromancerFatigueTurns:0\}\)\)/);
  assert.doesNotMatch(game,/wp\.legion=\(wp\.legion\|\|\[\]\)\.filter\(m=>Number\(m\.hp/);
  assert.match(game,/necromancerBattleCompanions\(progress,state\.combat\)/);
});
