import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  NECROMANCER_GATE_ITEM_ID, NECROMANCER_SUMMON_SEALS,
  unlockUnderworldGate, rollCompanionRank, summonCompanionWithSeal,
  resolveCompanionSkillV1984
} from '../../systems/classes/necromancer-underworld-gate-v1984.js';
import { NECROMANCER_COMMON_COMPANIONS } from '../../systems/classes/necromancer-common-companions-v1982.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');

test('five summon seals have valid 100 percent tables',()=>{
  assert.equal(NECROMANCER_SUMMON_SEALS.length,5);
  for(const seal of NECROMANCER_SUMMON_SEALS)assert.equal(Object.values(seal.rankWeights).reduce((a,b)=>a+b,0),100);
  assert.equal(rollCompanionRank('summon_seal_1',0),'common');
  assert.equal(rollCompanionRank('summon_seal_1',74.99),'common');
  assert.equal(rollCompanionRank('summon_seal_1',75),'uncommon');
  assert.equal(rollCompanionRank('summon_seal_1',95),'rare');
});
test('gate requires its special item and consumes exactly one',()=>{
  const locked=unlockUnderworldGate({},[]);assert.equal(locked.ok,false);assert.equal(locked.reason,'gate_seal_missing');
  const opened=unlockUnderworldGate({},[{id:NECROMANCER_GATE_ITEM_ID,name:'مهر',qty:2}]);
  assert.equal(opened.ok,true);assert.equal(opened.progress.underworldGateUnlocked,true);assert.equal(opened.inventory[0].qty,1);
});
test('successful summon consumes one seal and creates a unique companion instance',()=>{
  const input={progress:{underworldGateUnlocked:true,companions:[]},inventory:[{id:'summon_seal_1',qty:2}],sealId:'summon_seal_1',speciesPool:NECROMANCER_COMMON_COMPANIONS,rankRoll:2,speciesRoll:0};
  const a=summonCompanionWithSeal(input),b=summonCompanionWithSeal({...input,progress:a.progress,inventory:a.inventory,speciesRoll:.4});
  assert.equal(a.ok,true);assert.equal(b.ok,true);assert.notEqual(a.member.id,b.member.id);assert.equal(b.progress.companions.length,2);assert.equal(b.inventory.length,0);
  assert.deepEqual(Object.keys(a.member.stats).sort(),['endurance','faith','intellect','luck','perception','power','speed','vitality'].sort());
});
test('seal is preserved when the rolled rank has no authored bestiary pool',()=>{
  const result=summonCompanionWithSeal({progress:{underworldGateUnlocked:true},inventory:[{id:'summon_seal_1',qty:1}],sealId:'summon_seal_1',speciesPool:NECROMANCER_COMMON_COMPANIONS,rankRoll:80});
  assert.equal(result.ok,false);assert.equal(result.reason,'rank_content_unavailable');assert.equal(result.sealPreserved,true);assert.equal(result.inventory[0].qty,1);
});
test('multi-target damage skills resolve against up to two living enemies',()=>{
  const member={id:'c1',level:1,stats:{power:10,intellect:5,perception:10},hp:50,maxHp:50};
  const combat={targetId:'e1',enemies:[{encounterId:'e1',hp:100,maxHp:100,enemyDefense:0},{encounterId:'e2',hp:100,maxHp:100,enemyDefense:0},{encounterId:'e3',hp:100,maxHp:100,enemyDefense:0}]};
  const result=resolveCompanionSkillV1984({member,skill:{id:'multi',type:'physical_multi',target:'two_enemies',powerPct:100},combat,allies:[member],turn:1});
  assert.equal(result.ok,true);assert.equal(result.affected.length,2);assert.ok(combat.enemies[0].hp<100);assert.ok(combat.enemies[1].hp<100);assert.equal(combat.enemies[2].hp,100);
});
test('healing skills heal the lowest-health ally',()=>{
  const low={id:'low',hp:10,maxHp:100},high={id:'high',hp:90,maxHp:100},caster={id:'caster',hp:70,maxHp:100,stats:{faith:10}};
  const result=resolveCompanionSkillV1984({member:caster,skill:{id:'heal',type:'heal',target:'lowest_hp_ally',healPct:20},combat:{enemies:[{encounterId:'e',hp:100,maxHp:100}]},allies:[low,high,caster],turn:1});
  assert.equal(result.healing,20);assert.equal(low.hp,30);assert.equal(high.hp,90);
});
test('control skill transfers enemy turn to another enemy',()=>{
  const caster={id:'c',level:1,stats:{power:5,intellect:5}};
  const enemy={encounterId:'e1',hp:100,maxHp:100,enemyDefense:0},other={encounterId:'e2',hp:100,maxHp:100,enemyDefense:0};
  resolveCompanionSkillV1984({member:caster,skill:{id:'bind',type:'control',target:'single',powerPct:0,durationTurns:2},combat:{targetId:'e1',enemies:[enemy,other]},allies:[caster],turn:1});
  assert.equal(enemy.controlledByPlayer,true);assert.equal(enemy.necromancerControlledTurns,2);
});
test('debuff, silence and damage-over-time connect to combat fields used by enemy turn runtime',()=>{
  const caster={id:'c',level:1,stats:{power:8,intellect:8}};
  const enemy={encounterId:'e',hp:100,maxHp:100,enemyDefense:0};
  const combat={targetId:'e',enemies:[enemy]};
  resolveCompanionSkillV1984({member:caster,skill:{id:'weak',type:'debuff',target:'single',powerPct:0,durationTurns:2,attackReductionPct:20},combat,allies:[caster],turn:1});
  assert.equal(enemy.attackReductionPct,20);assert.equal(enemy.companionAttackReductionTurns,3);
  resolveCompanionSkillV1984({member:caster,skill:{id:'silence',type:'silence',target:'single',powerPct:0,durationTurns:1},combat,allies:[caster],turn:1});
  assert.equal(enemy.necromancerDebuff.skillReductionPct,100);
  resolveCompanionSkillV1984({member:caster,skill:{id:'rot',type:'dot_aoe',target:'all_enemies',powerPct:0,durationTurns:2},combat,allies:[caster],turn:1});
  assert.ok(enemy.necromancerBoneWound.damagePerTick>0);
});
test('project wires gate module, seal controls, reward drops and authored skill resolver',()=>{
  const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const necro=fs.readFileSync(path.join(root,'systems/classes/necromancer.js'),'utf8');
  assert.match(html,/necromancer-underworld-gate-v1984\.js/);
  assert.match(game,/data-necro-use-seal/);assert.match(game,/resolveCompanionSkillV1984/);assert.match(game,/summon_seal_5/);
  assert.match(necro,/underworld_gate/);assert.doesNotMatch(necro,/"id": "legion"/);
});
