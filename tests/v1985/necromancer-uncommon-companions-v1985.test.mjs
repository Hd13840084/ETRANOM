import test from 'node:test';
import assert from 'node:assert/strict';
import { NECROMANCER_UNCOMMON_COMPANIONS } from '../../systems/classes/necromancer-uncommon-companions-v1985.js';
import { NECROMANCER_ALL_COMPANIONS, chooseNecromancerCompanionIntent } from '../../systems/classes/necromancer-companion-bestiary-v1985.js';
import { existsSync } from 'node:fs';
test('20 unique uncommon companions with full canonical data',()=>{
 assert.equal(NECROMANCER_UNCOMMON_COMPANIONS.length,20);
 assert.equal(new Set(NECROMANCER_UNCOMMON_COMPANIONS.map(x=>x.id)).size,20);
 for(const c of NECROMANCER_UNCOMMON_COMPANIONS){
  assert.equal(c.rank,'uncommon'); assert.equal(Object.keys(c.stats).join(','),'power,speed,endurance,vitality,intellect,perception,luck,faith');
  assert.equal(Object.keys(c.growthPerLevel).length,8); assert.equal(c.skills.length,3); assert.ok(c.combatAI.rules.length>=3);
  assert.ok(existsSync(new URL('../../'+c.portrait,import.meta.url))); assert.equal(c.evolution.nextRank,'rare');
 }
});
test('combined bestiary exposes Common and Uncommon to summon pool',()=>{
 assert.equal(NECROMANCER_ALL_COMPANIONS.length,40);
 assert.equal(NECROMANCER_ALL_COMPANIONS.filter(x=>x.rank==='common').length,20);
 assert.equal(NECROMANCER_ALL_COMPANIONS.filter(x=>x.rank==='uncommon').length,20);
});

test('each uncommon species has a valid AI decision and engine-supported skill type',()=>{
 const supported=new Set(['physical','magic','physical_leech','magic_leech','physical_debuff','magic_debuff','magic_aoe','physical_multi','debuff','control','silence','buff','defense','guard','shield','heal','hybrid']);
 for(const c of NECROMANCER_UNCOMMON_COMPANIONS){
  for(const skill of c.skills) assert.ok(supported.has(skill.type), `${c.id}: unsupported ${skill.type}`);
  const intent=chooseNecromancerCompanionIntent(c,{selfId:'self',selfHpPct:80,enemies:[{id:'e1',hp:30,maxHp:100},{id:'e2',hp:80,maxHp:100}],allies:[{id:'a1',hp:20,maxHp:100},{id:'self',hp:80,maxHp:100}],cooldowns:{}});
  assert.ok(intent); if(intent.action==='use_skill') assert.ok(c.skills.some(x=>x.id===intent.skillId));
 }
});
