import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NECROMANCER_MYTHIC_COMPANIONS } from '../../systems/classes/necromancer-mythic-companions-v1992.js';
import { NECROMANCER_ALL_COMPANIONS, chooseNecromancerCompanionIntent } from '../../systems/classes/necromancer-companion-bestiary-v1992.js';
const statKeys=['power','speed','endurance','vitality','intellect','perception','luck','faith'];
test('20 Mythic companions with unique IDs and names across all six ranks',()=>{
 assert.equal(NECROMANCER_MYTHIC_COMPANIONS.length,20);
 assert.equal(NECROMANCER_ALL_COMPANIONS.length,120);
 const ids=NECROMANCER_ALL_COMPANIONS.map(x=>x.id), names=NECROMANCER_ALL_COMPANIONS.map(x=>x.nameEn.toLowerCase());
 assert.equal(new Set(ids).size,ids.length,'duplicate companion IDs'); assert.equal(new Set(names).size,names.length,'duplicate companion names');
});
test('every Mythic has eight official stats, level growth, three skills and a real portrait asset',()=>{
 for(const c of NECROMANCER_MYTHIC_COMPANIONS){
  assert.equal(c.rank,'mythic'); assert.deepEqual(Object.keys(c.stats).sort(),[...statKeys].sort());
  assert.deepEqual(Object.keys(c.growthPerLevel).sort(),[...statKeys].sort());
  assert.equal(c.skills.length,3); assert.ok(c.mythology&&c.lore&&c.role&&c.passive.description);
  assert.ok(fs.existsSync(new URL('../../'+c.portrait,import.meta.url)),c.nameEn+' portrait missing');
  assert.equal(c.levelMin,1); assert.equal(c.levelMax,100); assert.equal(c.evolution.nextRank,'divine');
 }
});
test('all Mythic skill types are supported by the current battle resolver',()=>{
 const allowed=new Set(['magic','spirit','physical','hybrid','dot','dot_aoe','debuff','control','silence','heal','shield','guard','buff','magic_aoe','physical_multi']);
 for(const c of NECROMANCER_MYTHIC_COMPANIONS) for(const s of c.skills) assert.ok(allowed.has(s.type),c.nameEn+': '+s.type);
});
test('Mythic AI returns a usable skill intent for each companion',()=>{
 for(const c of NECROMANCER_MYTHIC_COMPANIONS){
  const intent=chooseNecromancerCompanionIntent(c,{enemies:[{id:'enemy-1',hp:100,maxHp:100},{id:'enemy-2',hp:40,maxHp:100}],allies:[{id:'ally-1',hp:100,maxHp:100}],selfHpPct:100,cooldowns:{}});
  assert.ok(intent); if(intent.action==='use_skill') assert.ok(c.skills.some(s=>s.id===intent.skillId));
 }
});
test('index points to the V1992 bestiary',()=>{
 const html=fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');
 assert.match(html,/necromancer-companion-bestiary-v1994\.js\?v=1998/);
});
