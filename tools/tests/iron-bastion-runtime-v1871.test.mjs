import test from 'node:test';
import assert from 'node:assert/strict';
import {
  IRON_BASTION_DATA, createIronBastionProgress, normalizeIronBastionProgress,
  purchaseIronBastionTalent, upgradeIronBastionSkill, activateIronBastionDomain,
  selectIronBastionAscension, resolveIronBastionSkill, tickIronBastionDomain,
  endIronBastionDomain, resolveIronBastionIncomingHit
} from '../../systems/combat/iron-bastion-runtime.js';
import { resolveSpecializationSkill, isImplementedSpecialization, listSpecializationHandlers } from '../../systems/combat/specialization-skill-bridge.js';
import { getCombatAdapter } from '../../systems/combat/combat-adapters.js';

const actor=(level=50,skillPoints=50)=>({id:'hero',level,attack:120,defense:80,maxHp:1200,hp:1200,stamina:100,maxStamina:100,skillPoints,combatEffects:{attackPct:3},classProgress:{warrior_iron_bastion:createIronBastionProgress()}});

test('V1871 design contract has 10 skills, 32 talents, four branches and ten ascensions',()=>{
 assert.equal(IRON_BASTION_DATA.skills.length,10);
 assert.deepEqual(IRON_BASTION_DATA.skills.map(x=>x.unlockLevel),[1,2,3,4,5,6,7,8,9,10]);
 assert.equal(IRON_BASTION_DATA.talentBranches.length,4);
 assert.equal(IRON_BASTION_DATA.talentBranches.reduce((n,b)=>n+b.talents.length,0),32);
 assert.equal(IRON_BASTION_DATA.ascendedSkills.length,10);
});

test('skill rank upgrades and talents spend skill points only',()=>{
 let a=actor(10,4);a.attributePoints=99;
 a=upgradeIronBastionSkill(a,'ironcleave').actor;
 assert.equal(a.classProgress.warrior_iron_bastion.skillRanks.ironcleave,2);
 assert.equal(a.skillPoints,3);assert.equal(a.attributePoints,99);
 a=purchaseIronBastionTalent(a,'tempered_plate').actor;
 assert.equal(a.skillPoints,2);assert.equal(a.classProgress.warrior_iron_bastion.unlockedTalents[0],'tempered_plate');a.skillPoints=0;
 assert.throws(()=>purchaseIronBastionTalent(a,'tempered_plate'),/already_unlocked/);
 assert.throws(()=>purchaseIronBastionTalent(a,'deep_stance'),/insufficient_skill_points/);
});

test('one selected ascension per domain changes display name and expires back to base',()=>{
 let a=actor(25);const before={...a.combatEffects};
 a=activateIronBastionDomain(a).actor;
 a=selectIronBastionAscension(a,'asc_ironcleave').actor;
 const cast=resolveIronBastionSkill('asc_ironcleave',{actor:a,targets:[{id:'enemy',hp:2000,maxHp:2000,defense:20}],targetId:'enemy',mode:'solo'});
 assert.equal(cast.displaySkillName,'حکم اعدام تایتان');
 assert.equal(cast.ascended,true);
 assert.equal(cast.actor.classProgress.warrior_iron_bastion.domain.ascendedUsed,true);
 assert.throws(()=>resolveIronBastionSkill('asc_ironcleave',{actor:cast.actor,targets:[{id:'enemy2',hp:2000,defense:20}],mode:'solo'}),/only_one_ascension/);
 const ended=endIronBastionDomain(cast.actor,'victory');
 assert.equal(ended.actor.classProgress.warrior_iron_bastion.domain.active,false);
 assert.deepEqual(ended.actor.combatEffects,before);
});

test('ascension cannot be cast without domain and explicit selection',()=>{
 const a=actor(25);
 assert.throws(()=>resolveIronBastionSkill('asc_ironcleave',{actor:a,targets:[{id:'e',hp:1000}],mode:'solo'}),/requires_domain/);
 const active=activateIronBastionDomain(a).actor;
 assert.throws(()=>resolveIronBastionSkill('asc_ironcleave',{actor:active,targets:[{id:'e',hp:1000}],mode:'solo'}),/not_selected/);
});

test('domain stage four requires completed trial',()=>{
 const a=actor(50);assert.equal(activateIronBastionDomain(a).stage.stage,3);
 const p=normalizeIronBastionProgress({...a.classProgress.warrior_iron_bastion,domainQuest:{complete:true}});
 const b={...a,classProgress:{warrior_iron_bastion:p}};assert.equal(activateIronBastionDomain(b).stage.stage,4);
});

test('incoming reflect is single-hit and capped against bosses',()=>{
 const a=actor();a.ironBastionStates={reflectPct:40,reflectTurns:1};
 const out=resolveIronBastionIncomingHit(a,{id:'boss',hp:1000,isBoss:true},100,{mode:'pve'});
 assert.equal(out.reflected,18);assert.equal(out.attacker.hp,982);assert.equal(out.actor.ironBastionStates.reflectTurns,0);
});

test('bridge and solo/party/PvP adapters recognize Iron Bastion',()=>{
 assert.equal(isImplementedSpecialization('warrior_iron_bastion'),true);
 assert.ok(listSpecializationHandlers().some(x=>x.specializationId==='warrior_iron_bastion'));
 for(const mode of ['solo','party','pvp']){
  const adapter=getCombatAdapter(mode);
  const result=adapter.specializationSkill(null,'warrior_iron_bastion','ironcleave',{actor:actor(1),targets:[{id:'e',hp:1000,defense:10}],targetId:'e'});
  assert.equal(result.skillId,'ironcleave');assert.ok(result.targets[0].hp<1000);
 }
});

test('domain bonuses are applied on activation and cleanup preserves unrelated combat effects',()=>{
 let a=actor(25);a.combatEffects={defensePct:5,attackPct:2};
 const active=activateIronBastionDomain(a).actor;
 assert.equal(active.combatEffects.defensePct,15);
 assert.equal(active.combatEffects.controlResistPct,8);
 const withOtherBuff={...active,combatEffects:{...active.combatEffects,speedPct:7,attackPct:9}};
 const ended=endIronBastionDomain(withOtherBuff,'victory').actor;
 assert.equal(ended.combatEffects.defensePct,5);
 assert.equal(ended.combatEffects.attackPct,9);
 assert.equal(ended.combatEffects.speedPct,7);
 assert.equal(ended.combatEffects.controlResistPct,undefined);
});

test('domain expiration removes only its own bonuses and restores base state',()=>{
 let a=actor(25);a.combatEffects={defensePct:4};
 a=activateIronBastionDomain(a).actor;
 a.combatEffects={...a.combatEffects,attackPct:6};
 const out=tickIronBastionDomain(a,[]);
 assert.equal(out.actor.classProgress.warrior_iron_bastion.domain.active,true);
 let current=out.actor;
 for(let i=0;i<4;i++)current=tickIronBastionDomain(current,[]).actor;
 assert.equal(current.classProgress.warrior_iron_bastion.domain.active,false);
 assert.equal(current.combatEffects.defensePct,4);
 assert.equal(current.combatEffects.attackPct,6);
});
