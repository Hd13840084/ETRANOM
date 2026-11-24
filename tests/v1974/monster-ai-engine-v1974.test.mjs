import test from 'node:test';
import assert from 'node:assert/strict';
import { decideMonsterActionV1974, selectMonsterTargetV1974, createMonsterAIEngineV1974 } from '../../systems/combat/monster-ai-engine-v1974.js';

test('dead monster does not choose an action',()=>assert.equal(decideMonsterActionV1974({hp:0},[{id:'p',hp:10}]).reason,'monster_defeated'));
test('no living targets returns none',()=>assert.equal(decideMonsterActionV1974({hp:10},[{id:'p',hp:0}]).reason,'no_valid_targets'));
test('taunt takes priority over threat and low hp',()=>{
 const target=selectMonsterTargetV1974({role:'شکارچی سریع'},[{id:'a',hp:1,maxHp:10,threat:999},{id:'b',hp:10,maxHp:10,taunt:true}]);
 assert.equal(target.id,'b');
});
test('assassin prefers weakened targets',()=>{
 const target=selectMonsterTargetV1974({role:'شکارچی سریع'},[{id:'a',hp:10,maxHp:10},{id:'b',hp:2,maxHp:10}]);
 assert.equal(target.id,'b');
});
test('boss phase and enrage are deterministic',()=>{
 const result=decideMonsterActionV1974({id:'boss',kind:'boss',hp:10,maxHp:100},[{id:'p',hp:100}],{config:{enrageAt:.2,enrageAction:'heavy_attack',enrageDamageMultiplier:1.5}});
 assert.equal(result.action,'heavy_attack'); assert.equal(result.phase.enraged,true);
});
test('ready skill can be selected through injected trusted chooser',()=>{
 const result=decideMonsterActionV1974({id:'m',hp:50,maxHp:100,role:'striker'},[{id:'p',hp:100}],{chooseSkill:()=>({id:'claw',definition:{type:'attack',effects:{mp_cost:4,damage_multiplier:1.7}}})});
 assert.equal(result.action,'skill'); assert.equal(result.skillId,'claw'); assert.equal(result.damageMultiplier,1.7);
});
test('defensive buff is held until health threshold',()=>{
 const chooser=()=>({id:'guard',definition:{type:'buff',effects:{damage_multiplier:1,mp_cost:0}}});
 assert.equal(decideMonsterActionV1974({hp:90,maxHp:100},[{id:'p',hp:100}],{chooseSkill:chooser}).action,'attack');
 assert.equal(decideMonsterActionV1974({hp:40,maxHp:100},[{id:'p',hp:100}],{chooseSkill:chooser}).action,'skill');
});
test('guardian defends at configured critical health',()=>{
 const result=decideMonsterActionV1974({hp:20,maxHp:100,role:'مدافع سنگین'},[{id:'p',hp:100}],{config:{guardianDefendBelow:.3}});
 assert.equal(result.action,'defend');
});
test('factory exposes versioned tactical decisions',()=>{
 const ai=createMonsterAIEngineV1974();
 assert.equal(ai.version,'1974.0.0');
 assert.equal(ai.decide({hp:100,maxHp:100},[{id:'p',hp:100}]).action,'attack');
});
test('decision does not mutate monster or target state',()=>{
 const m={id:'m',hp:100,maxHp:100,skillCooldowns:{x:2}},p={id:'p',hp:20,maxHp:100};
 decideMonsterActionV1974(m,[p]);
 assert.deepEqual(m.skillCooldowns,{x:2}); assert.equal(p.hp,20);
});
