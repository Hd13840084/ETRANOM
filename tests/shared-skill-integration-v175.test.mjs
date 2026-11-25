import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getCombatAdapter } from '../systems/combat/combat-adapters.js';
import { listAvailableSharedSkills, resolveCombatSkill, absorbCombatDamage } from '../systems/combat/shared-skill-runtime.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../content/combat/shared_skill_catalog_v172.json',import.meta.url),'utf8'));
const actor={id:'p1',hp:40,maxHp:100,mp:100,maxMp:100,attack:50,magicPower:60,defense:20,partyMembers:[{id:'p2',hp:20,maxHp:100}]};
test('v175 catalog listing is restricted to owned, class/spec and unlocked skills',()=>{
 const all=[...catalog.class_core_skills,...catalog.specializations.flatMap(x=>x.skills)];
 assert.equal(all.length,230);
 const first=catalog.class_core_skills.find(x=>x.class_id==='wizard'&&x.implementation_status!=='shell');
 const result=listAvailableSharedSkills(catalog,{classId:'wizard',level:99,ownedSkillIds:[first.id,'not_owned']});
 assert.ok(result.some(x=>x.id===first.id));
 assert.ok(!result.some(x=>x.id==='not_owned'));
 const shellSkill=catalog.specializations.find(x=>x.specialization_id==='assassin_1').skills[0];
 assert.equal(listAvailableSharedSkills(catalog,{classId:'wizard',specializationId:'assassin_1',level:99,ownedSkillIds:[shellSkill.id]}).length,0);
});
test('v175 shared resolver executes catalog effects through Solo, Party and PvP adapters',()=>{
 for(const mode of ['solo','party','pvp']){
  const hit=getCombatAdapter(mode).skill({skill:{id:'test_hit',type:'single_damage',damagePct:100},actor,targets:[{id:'e1',hp:100,maxHp:100,defense:0}]});
  assert.ok(hit.targets[0].hp<100,mode);
  const heal=getCombatAdapter(mode).skill({skill:{id:'test_heal',type:'self_heal',healPct:50},actor,targets:[]});
  assert.equal(heal.actor.hp,70,mode);
 }
});
test('v175 damage-heal skill heals from its own authored coefficient, not target HP',()=>{
 const r=resolveCombatSkill({skill:{id:'drain',type:'damage_heal',damagePct:100,healPct:40},actor,targets:[{id:'enemy',hp:17,maxHp:100,defense:0}]});
 assert.equal(r.actor.hp,64);
 assert.ok(r.targets[0].hp<17);
});
test('v175 shield absorbs incoming damage and applies bounded reduction',()=>{
 const target={hp:100,shield:{hp:30,turns:2,reductionPct:20}};
 const after=absorbCombatDamage(target,50);
 assert.equal(after.hp,90);
 assert.equal(after.shield.hp,0);
 assert.equal(after.absorbed,40);
});
test('v175 Party skill action uses the existing server-authoritative skill RPC contract',()=>{
 const source=fs.readFileSync(new URL('../systems/party/party-combat.js',import.meta.url),'utf8');
 assert.match(source,/async actSkill\(skillId, targetIndex = null, choice = null\)/);
 const ui=fs.readFileSync(new URL('../systems/party/party-ui.js',import.meta.url),'utf8');
 assert.match(ui,/action\.startsWith\('skill:'\)[\s\S]*?combat\.actSkill\(skillId, targetIndex, choice \|\| null\)/);
 assert.match(source,/existing authoritative RPC owns class\/spec, level, mana, cooldown/);
});
test('PvP skill picker is awaited before HTML rendering and never exposes unowned skills',()=>{
 const ui=fs.readFileSync(new URL('../systems/pvp/pvp-ui.js',import.meta.url),'utf8');
 assert.match(ui,/async renderMatch\(m\)/);
 assert.match(ui,/await this\.renderSkillPicker\(m,a\)/);
 assert.match(ui,/owned\.size===0/);
 assert.match(ui,/owned\.has\(String\(x\.id\)\)/);
 assert.doesNotMatch(ui,/\(!owned\.size\|\|owned\.has/);
});
test('every canonical catalog skill type has a shared runtime execution path',()=>{
 const types=new Set(['single_damage','multi_target_damage','all_damage','all_control_damage','all_dot_control','ultimate_all_damage','shield','self_heal','heal','group_heal','summon','summon_resource','control','debuff','self_buff','evasion_counter','repeat_last_spell','damage_heal']);
 for(const skill of [...catalog.class_core_skills,...catalog.specializations.flatMap(x=>x.skills||[])]){
  assert.ok(types.has(skill.type),`unsupported catalog type ${skill.type} (${skill.id})`);
  const actor={id:'actor',hp:60,maxHp:100,mp:100,maxMp:100,attack:50,magicPower:60,partyMembers:[{id:'ally',hp:30,maxHp:100}]};
  const target={id:'enemy',hp:120,maxHp:120,attack:10,defense:5};
  assert.doesNotThrow(()=>resolveCombatSkill({mode:'solo',skill,actor,targets:[target]}),skill.id);
 }
});
