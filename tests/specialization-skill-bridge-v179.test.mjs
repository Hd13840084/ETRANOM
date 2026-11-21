import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../content/combat/shared_skill_catalog_v172.json' with { type: 'json' };
import { listSpecializationHandlers, getSpecializationHandler, resolveSpecializationSkill, listOwnedSpecializationSkills } from '../systems/combat/specialization-skill-bridge.js';

test('only the four implemented Wizard specializations are exposed',()=>{
 const handlers=listSpecializationHandlers(catalog);
 assert.equal(handlers.length,4);
 assert.deepEqual(handlers.map(x=>x.specializationId).sort(),['wizard_arcane_mage','wizard_elementalist','wizard_necromancer','wizard_warlock']);
 assert.ok(handlers.every(x=>x.classId==='wizard'));
});
test('legacy Wizard skill records are resolved from their actual specialization modules',()=>{
 const arcane=getSpecializationHandler(catalog,'wizard_1');
 assert.ok(arcane);
 assert.ok(arcane.skillIds.includes('arcane_bolt'));
 const result=resolveSpecializationSkill(catalog,'wizard_arcane_mage','arcane_bolt',{mode:'solo',actor:{hp:100,maxHp:100,mp:100,maxMp:100,magicPower:40,attack:10},targets:[{id:'mob',hp:100,maxHp:100,defense:0}]});
 assert.equal(result.skillId,'arcane_bolt');
 assert.ok(result.log.some(x=>x.type==='damage'));
});
test('unimplemented shell classes and specializations cannot resolve gameplay skills',()=>{
 assert.equal(getSpecializationHandler(catalog,'assassin_1'),null);
 assert.equal(getSpecializationHandler(catalog,'warrior_1'),null);
 assert.throws(()=>resolveSpecializationSkill(catalog,'assassin_1','assassin_1_strike',{actor:{mp:100}}),/specialization_not_implemented/);
 assert.equal(listOwnedSpecializationSkills(catalog,{classId:'assassin',specializationId:'assassin_1',level:50,ownedSkillIds:['assassin_1_strike']}).length,0);
});
test('Wizard specialization rejects a skill belonging to a different Wizard spec',()=>{
 assert.throws(()=>resolveSpecializationSkill(catalog,'wizard_1','ember_bolt',{actor:{mp:100}}),/specialization_skill_not_found/);
});
