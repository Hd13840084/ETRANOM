import assert from 'node:assert/strict';
import {CHAOS_WARRIOR_DATA as d,createChaosWarriorProgress,normalizeChaosWarriorProgress,resolveChaosSkill,activateChaosDomain,selectChaosAscension,tickChaosWarrior,resetChaosWarriorBattle,upgradeChaosWarriorSkill,purchaseChaosWarriorTalent,applyChaosIncomingDamage,startChaosDomainTrial,recordChaosDomainGuardianDefeat} from '../systems/combat/chaos-warrior-runtime.js';
assert.equal(d.skills.length,10);assert.deepEqual(d.talentBranches.map(x=>x.talents.length),[8,8,8,8]);assert.equal(d.ascendedSkills.length,10);assert.equal(d.domain.stages.length,4);
assert.equal(new Set(d.talentBranches.flatMap(b=>b.talents).map(t=>t.description)).size,32,'all talent descriptions must be distinct');
let actor={level:50,attack:140,stamina:1000,maxHp:1000,hp:1000,skillPoints:100,classProgress:{warrior_chaos:createChaosWarriorProgress()}};
for(const sk of d.skills){actor.classProgress.warrior_chaos.skillRanks[sk.id]=1;}
// Each of the 32 talents can be purchased independently and is persisted.
for(const t of d.talentBranches.flatMap(b=>b.talents)){const r=purchaseChaosWarriorTalent(actor,t.id);actor=r.actor;}
assert.equal(actor.classProgress.warrior_chaos.unlockedTalents.length,32);
// Skill ranks obey initial rank + six upgrades.
for(let i=0;i<6;i++)actor=upgradeChaosWarriorSkill(actor,'chaos_rend').actor;
assert.equal(actor.classProgress.warrior_chaos.skillRanks.chaos_rend,7);
assert.throws(()=>upgradeChaosWarriorSkill(actor,'chaos_rend'),/chaos_skill_max/);
// Core damage, wound tick, crowd control, link, and cooldown.
const foes=[{encounterId:'a',hp:10000,maxHp:10000},{encounterId:'b',hp:10000,maxHp:10000},{encounterId:'c',hp:10000,maxHp:10000}];
let r=resolveChaosSkill('chaos_rend',{actor,targets:foes,targetId:'a'});assert.ok(r.targets[0].hp<10000);assert.ok(r.progress.marks.a);
actor={...r.actor,stamina:1000};r=resolveChaosSkill('endless_wound',{actor,targets:r.targets,targetId:'a'});let tick=tickChaosWarrior(r.actor,r.targets);assert.ok(tick.targets[0].hp<r.targets[0].hp);
actor={...tick.actor,stamina:1000};r=resolveChaosSkill('paradox_knot',{actor,targets:tick.targets,targetId:'a'});assert.ok(r.progress.links.a&&r.progress.links.b);
actor={...r.actor,stamina:1000};const linkedBefore=r.targets[1].hp;r=resolveChaosSkill('chaos_fangs',{actor,targets:r.targets,targetId:'a'});assert.ok(r.targets[1].hp<linkedBefore,'paradox link transfers part of the damage');actor={...r.actor,stamina:1000};r=resolveChaosSkill('fractured_chance',{actor,targets:r.targets,targetId:'a'});assert.equal(r.targets[0].skipNextAction,true);
// Incoming mitigation and reflective vessel effect are connected to a callable combat hook.
let vesselActor={...actor,level:50,hp:1000,maxHp:1000,classProgress:{warrior_chaos:normalizeChaosWarriorProgress({...actor.classProgress.warrior_chaos,unlockedTalents:['chaos_talent_18'],buffs:{vessel:{turns:99,reflectPct:20}}})}};
const attacker={id:'attacker',hp:500};const incoming=applyChaosIncomingDamage(vesselActor,100,{attacker});assert.equal(incoming.damage,100);assert.ok(attacker.hp<500);const guarded=applyChaosIncomingDamage({...vesselActor,classProgress:{warrior_chaos:normalizeChaosWarriorProgress({...vesselActor.classProgress.warrior_chaos,unlockedTalents:['chaos_talent_17']})}},100);assert.equal(guarded.damage,95);
// Domain stages, one ascension only, stage IV quest gate.
let fresh={...actor,level:50,stamina:1000,classProgress:{warrior_chaos:createChaosWarriorProgress()}};
let dom=activateChaosDomain(fresh,{level:50});assert.equal(dom.domain.stage,3,'stage IV remains quest-gated');
let chosen=selectChaosAscension(dom.actor,'chaos_asc_2');let ascended=resolveChaosSkill('chaos_rend',{actor:chosen.actor,targets:[{encounterId:'x',hp:10000}],targetId:'x'});assert.equal(ascended.ascended,true);assert.equal(ascended.progress.domain.ascendedUsed,true);
assert.throws(()=>selectChaosAscension(ascended.actor,'chaos_asc_3'),/chaos_ascension_used/);
let trial=startChaosDomainTrial(fresh);for(let i=0;i<3;i++)trial=recordChaosDomainGuardianDefeat(trial.actor,1);assert.equal(trial.complete,true);fresh=trial.actor;const stage4=activateChaosDomain(fresh,{level:50});assert.equal(stage4.domain.stage,4);
let stageTickActor={...stage4.actor,attack:100,maxStamina:100,stamina:10};for(let i=0;i<7;i++){const st=tickChaosWarrior(stageTickActor,[{encounterId:'domain-target',hp:10000}]);stageTickActor=st.actor;if(i===6)assert.ok(st.log.some(x=>x.type==='chaos_domain_final_burst'));}
const reset=resetChaosWarriorBattle(stage4.actor);assert.equal(reset.progress.domain.usedThisBattle,false);assert.equal(reset.progress.domain.active,false);assert.equal(reset.progress.unlockedTalents.length,0,'fresh actor should retain no purchased talents');
console.log('Chaos Warrior V1878 full progression tests passed.');
