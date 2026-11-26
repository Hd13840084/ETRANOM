import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../content/combat/shared_skill_catalog_v172.json' with { type: 'json' };
import { listSpecializationHandlers, getSpecializationHandler, resolveSpecializationSkill, listOwnedSpecializationSkills } from '../systems/combat/specialization-skill-bridge.js';

test('all four Wizard and all four Warrior specializations remain exposed',()=>{
 const handlers=listSpecializationHandlers(catalog);
 assert.equal(handlers.length,8);
 assert.deepEqual(handlers.map(x=>x.specializationId).sort(),['warrior_apocalypse_harbinger','warrior_chaos','warrior_iron_bastion','warrior_sword_ascetic','wizard_arcane_mage','wizard_elementalist','wizard_necromancer','wizard_warlock']);
 assert.equal(handlers.filter(x=>x.classId==='wizard').length,4);
 assert.deepEqual(handlers.filter(x=>x.classId==='warrior').map(x=>x.specializationId).sort(),['warrior_apocalypse_harbinger','warrior_chaos','warrior_iron_bastion','warrior_sword_ascetic']);
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
 assert.equal(getSpecializationHandler(catalog,'warrior_1').classId,'warrior');
 assert.throws(()=>resolveSpecializationSkill(catalog,'assassin_1','assassin_1_strike',{actor:{mp:100}}),/specialization_not_implemented/);
 assert.equal(listOwnedSpecializationSkills(catalog,{classId:'assassin',specializationId:'assassin_1',level:50,ownedSkillIds:['assassin_1_strike']}).length,0);
});
test('Wizard specialization rejects a skill belonging to a different Wizard spec',()=>{
 assert.throws(()=>resolveSpecializationSkill(catalog,'wizard_1','ember_bolt',{actor:{mp:100}}),/specialization_skill_not_found/);
});

test('Chaos Warrior is routed through the common specialization bridge',()=>{
 const handler=getSpecializationHandler(catalog,'warrior_3');
 assert.ok(handler);
 assert.equal(handler.specializationId,'warrior_chaos');
 assert.ok(handler.skillIds.includes('chaos_rend'));
 const result=resolveSpecializationSkill(catalog,'warrior_chaos','chaos_rend',{
  mode:'solo',actor:{id:'hero',level:1,hp:100,maxHp:100,attack:100,stamina:100,maxStamina:100},
  targets:[{id:'mob',hp:500,maxHp:500,defense:0}]
 });
 assert.equal(result.skillId,'chaos_rend');
 assert.ok(result.targets[0].hp<500);
});

test('all four Warrior specialization IDs resolve to registered handlers',()=>{
 for (const id of ['warrior_1','warrior_2','warrior_3','warrior_4']) {
  const handler=getSpecializationHandler(catalog,id);
  assert.ok(handler,`missing handler for ${id}`);
  assert.equal(handler.classId,'warrior');
 }
});
