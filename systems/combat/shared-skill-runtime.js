/** ETRANOM shared skill/equipment/item resolver.
 * Pure deterministic mechanics only: callers persist the returned state after
 * validating ownership, turn, resources, cooldown and target on the server.
 */
import { ARCANE_MAGE } from '../classes/arcane-mage.js';
import { ELEMENTALIST } from '../classes/elementalist.js';
import { WARLOCK } from '../classes/warlock.js';
import { NECROMANCER } from '../classes/necromancer.js';

const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const clone=v=>JSON.parse(JSON.stringify(v??{}));
export const SHARED_SKILL_RUNTIME_VERSION='183.0.0';
export const BASE_STAT_FIELDS=Object.freeze(['attack','defense','maxHp','maxMp','magicPower','accuracy','critChance','speed']);
export const EFFECT_FIELDS=Object.freeze(['attackPct','defensePct','magicPowerPct','healingPct','damagePct','damageReductionPct','accuracyPct','critChancePct','speedPct','manaCostReductionPct','cooldownReductionTurns','lifeStealPct','reflectPct','dotPct','attackReductionPct','defenseReductionPct']);
const TYPES=new Set(['single_damage','multi_target_damage','all_damage','all_control_damage','all_dot_control','ultimate_all_damage','shield','self_heal','heal','group_heal','summon','summon_resource','control','debuff','self_buff','evasion_counter','repeat_last_spell','damage_heal','purge','link']);
export function normalizeCombatEffects(...sources){
 const out={}; for(const src of sources){if(!src||typeof src!=='object')continue;for(const k of EFFECT_FIELDS){const v=n(src[k],0);if(v)out[k]=clamp(n(out[k])+v,-90,500);} }
 return Object.freeze(out);
}
export function collectEquipmentEffects(character={},equipment={},activePotions=[]){
 const out={}; const equipped=equipment&&typeof equipment==='object'?equipment:(character.equipment||{});
 for(const item of Object.values(equipped)){if(!item||typeof item!=='object')continue;const fx=item.combatEffects||item.effects||item.stats||{};for(const k of [...EFFECT_FIELDS,...BASE_STAT_FIELDS]){const v=n(fx[k],0);if(v)out[k]=n(out[k])+v;}}
 for(const potion of Array.isArray(activePotions)?activePotions:[]){const fx=potion?.combatEffects||potion?.effects||{};for(const k of [...EFFECT_FIELDS,...BASE_STAT_FIELDS]){const v=n(fx[k],0);if(v)out[k]=n(out[k])+v;}}
 return Object.freeze({...normalizeCombatEffects(out),...Object.fromEntries(BASE_STAT_FIELDS.filter(k=>n(out[k])!==0).map(k=>[k,n(out[k])]))});
}
export function applyCombatLoadout(base={}, effects={}){
 const out={...clone(base)}; for(const k of BASE_STAT_FIELDS){if(n(effects[k])!==0)out[k]=Math.max(k==='maxHp'||k==='maxMp'?0:0,n(out[k])+n(effects[k]));}
 for(const k of ['attackPct','defensePct','magicPowerPct','accuracyPct','critChancePct','speedPct']){const stat=k.replace('Pct','');if(n(effects[k])!==0)out[stat]=Math.max(0,n(out[stat])*(1+n(effects[k])/100));}
 return out;
}
function hpCap(x){return Math.max(1,n(x.maxHp??x.max_hp,1));}
function requestedPartyMember(actor,id){return (actor.partyMembers||[]).find(x=>id!==null&&id!==undefined&&String(x.id)===String(id)&&n(x.hp)>0)||null;}
function applyHeal(target,amount){const max=hpCap(target),before=clamp(n(target.hp),0,max),after=Math.min(max,before+Math.max(0,Math.floor(amount)));return {...target,hp:after,healed:after-before};}
function applyDamage(target,amount){const before=Math.max(0,n(target.hp)),damage=Math.min(before,Math.max(0,Math.floor(amount)));return {...target,hp:before-damage,damageTaken:damage};}
function skillDamage(skill,actor,target,effects){const power=Math.max(0,n(skill.scalingStat==='attack'?actor.attack:skill.scalingStat==='magicPower'?actor.magicPower:(actor.magicPower??actor.attack))); const pct=Math.max(0,n(skill.damagePct??skill.powerPct,100));const bonus=n(effects.damagePct)+n(skill.damageBonusPct);const statusValues=Object.values(target.statuses||{});const defenseReduction=clamp(statusValues.reduce((v,x)=>v+n(x?.defenseReductionPct),0),0,80);const def=Math.max(0,n(target.defense)*(1-defenseReduction/100));const raw=power*pct/100*(1+bonus/100);return Math.max(1,Math.floor(raw*100/(100+def*1.25)));}
/** Resolve catalog records by stable id. Catalog must be loaded from the trusted game content bundle. */
const WIZARD_SPEC_ALIASES=Object.freeze({wizard_arcane_mage:'wizard_1',wizard_elementalist:'wizard_2',wizard_warlock:'wizard_3',wizard_necromancer:'wizard_4'});
const WIZARD_SPECS=Object.freeze([
 {catalogId:'wizard_1',id:'wizard_arcane_mage',data:ARCANE_MAGE},
 {catalogId:'wizard_2',id:'wizard_elementalist',data:ELEMENTALIST},
 {catalogId:'wizard_3',id:'wizard_warlock',data:WARLOCK},
 {catalogId:'wizard_4',id:'wizard_necromancer',data:NECROMANCER}
]);
function canonicalWizardSpec(id){const raw=String(id||'');return WIZARD_SPEC_ALIASES[raw]||raw;}
function actualWizardSkills(specId=null){
 return WIZARD_SPECS.filter(s=>!specId||s.catalogId===canonicalWizardSpec(specId)||s.id===specId)
  .flatMap(s=>(s.data.skills||[]).map(skill=>({...skill,class_id:'wizard',specialization_id:s.catalogId,specialization_key:s.id,implementation_status:'implemented'})));
}
export function listAvailableSharedSkills(catalog,{classId=null,specializationId=null,level=1,ownedSkillIds=[]}={}){
 const owned=new Set((Array.isArray(ownedSkillIds)?ownedSkillIds:[]).map(String));
 if(!catalog||catalog.schema!=='etranom.shared.skill.catalog.v1'||(classId&&classId!=='wizard'))return [];
 const specId=specializationId?canonicalWizardSpec(specializationId):null;
 const core=(catalog.class_core_skills||[]).filter(x=>x.class_id==='wizard'&&x.implementation_status!=='shell');
 const rows=[...core,...actualWizardSkills(specId)];
 return rows.filter(x=>(!specId||!x.specialization_id||x.specialization_id===specId)&&n(x.unlockLevel,1)<=n(level,1)&&owned.has(String(x.id))).map(x=>Object.freeze({...x}));
}
export function findSharedSkill(catalog, skillId, specializationId=null, classId='wizard'){
 const id=String(skillId||'');if(!catalog||catalog.schema!=='etranom.shared.skill.catalog.v1'||classId!=='wizard')return null;
 const specId=specializationId?canonicalWizardSpec(specializationId):null;
 const actual=actualWizardSkills(specId).find(x=>x.id===id);if(actual)return actual;
 const base=(catalog.class_core_skills||[]).find(x=>x.id===id&&x.class_id==='wizard'&&x.implementation_status!=='shell');if(base)return base;
 return null;
}
/** Apply an incoming hit to a combatant, consuming shield before HP. */
export function absorbCombatDamage(target={},incoming=0){
 const out=clone(target),raw=Math.max(0,Math.floor(n(incoming)));let left=raw;
 const shield=out.shield&&typeof out.shield==='object'?{...out.shield}:null;
 if(shield&&n(shield.hp)>0&&n(shield.turns)>0){
  const reduction=clamp(n(shield.reductionPct),0,80)/100;
  const mitigated=Math.max(0,Math.floor(left*(1-reduction)));
  const absorbed=Math.min(n(shield.hp),mitigated);shield.hp=Math.max(0,n(shield.hp)-absorbed);left=Math.max(0,mitigated-absorbed);out.shield=shield;
 }
 const hp=Math.max(0,n(out.hp));const taken=Math.min(hp,left);out.hp=hp-taken;out.damageTaken=taken;out.absorbed=raw-left;return out;
}

/** Resolve one already-authorized skill. No client damage/heal numbers are accepted. */
export function resolveCombatSkill({mode='solo',skill,actor={},targets=[],effects={},targetId=null,rolls={}}={}){
 if(!['solo','party','pvp'].includes(mode))throw new TypeError('unsupported_combat_mode');
 if(!skill||! /^[a-z0-9_]{1,48}$/i.test(String(skill.id||'')))throw new TypeError('invalid_skill');
 const type=String(skill.type||'single_damage');if(!TYPES.has(type))throw new TypeError('unsupported_skill_type');
 const fx=normalizeCombatEffects(effects);const a=clone(actor);let enemies=(Array.isArray(targets)?targets:[]).map(clone);let log=[];let summons=Array.isArray(a.summons)?a.summons.slice(0,2):[];
 const skillId=String(skill.id);const cooldowns={...(a.skillCooldowns||{})};if(n(cooldowns[skillId])>0)throw new Error('skill_on_cooldown');
 const baseCost=Math.max(0,n(skill.manaCost??skill.manaPct,0));const cost=Math.max(0,Math.ceil(baseCost*(1-clamp(n(fx.manaCostReductionPct),0,80)/100)));if(n(a.mp)<cost)throw new Error('insufficient_mana');a.mp=Math.max(0,n(a.mp)-cost);
 if(n(skill.cooldownTurns)>0)cooldowns[skillId]=Math.floor(n(skill.cooldownTurns));a.skillCooldowns=cooldowns;
 const chosenTargetId=targetId??skill.targetId??null;
 const primary=enemies.find(t=>chosenTargetId!==null&&String(t.id)===String(chosenTargetId)&&n(t.hp)>0)||enemies.find(t=>n(t.hp)>0);
 const scale=1+n(fx.damagePct)/100;const healScale=1+n(fx.healingPct)/100;
 if(['self_heal','heal','group_heal'].includes(type)){
   const requestedAlly=(a.partyMembers||[]).find(x=>chosenTargetId!==null&&String(x.id)===String(chosenTargetId)&&n(x.hp)>0);
   const recipients=type==='group_heal'&&mode!=='pvp'? [a,...(a.partyMembers||[])]:[skill.target==='ally'&&requestedAlly?requestedAlly:a];
   for(const r of recipients){const h=applyHeal(r,Math.max(1,n(a.magicPower??a.attack)*n(skill.healPct,100)/100*healScale));if(r===a)Object.assign(a,h);else{const ix=(a.partyMembers||[]).findIndex(x=>x.id===r.id);if(ix>=0)a.partyMembers[ix]=h;}log.push({type:'heal',target:r.id||'self',amount:h.healed});}
 } else if(type==='shield'){
   const shieldTarget=skill.target==='ally'&&requestedPartyMember(a,chosenTargetId)?requestedPartyMember(a,chosenTargetId):a;
   shieldTarget.shield={hp:Math.max(n(shieldTarget.shield?.hp),Math.floor(n(a.magicPower??a.attack)*n(skill.shieldPct,100)/100)),turns:Math.max(1,Math.floor(n(skill.durationTurns,2))),reductionPct:clamp(n(skill.damageReductionPct)+n(fx.damageReductionPct),0,80)};
   if(shieldTarget!==a){const ix=(a.partyMembers||[]).findIndex(x=>String(x.id)===String(shieldTarget.id));if(ix>=0)a.partyMembers[ix]=shieldTarget;}
   log.push({type:'shield',target:shieldTarget.id||'self',amount:shieldTarget.shield.hp});
 } else if(type==='summon'||type==='summon_resource'){
   const cap=mode==='pvp'?1:3;if(summons.length>=cap)throw new Error('summon_capacity_reached');
   const summon={id:`${skill.id}_summon_${summons.length+1}`,sourceSkill:skill.id,hp:Math.max(1,Math.floor(n(a.maxHp,100)*n(skill.summonHpPct,35)/100)),attack:Math.max(1,Math.floor(n(a.attack)*n(skill.summonDamagePct,60)/100)),turns:Math.max(1,Math.floor(n(skill.durationTurns,2))),controlled:true};summons.push(summon);a.summons=summons;log.push({type:'summon',summonId:summon.id});
 } else if(type==='self_buff'||type==='evasion_counter'){
   const buffEffects=normalizeCombatEffects(skill.effects||skill,fx);
   a.buffs={...(a.buffs||{}),[skill.id]:{turns:Math.max(1,Math.floor(n(skill.durationTurns,2))),effects:buffEffects}};
   a.combatEffects=normalizeCombatEffects(a.combatEffects||{},buffEffects);log.push({type:'buff',skillId:skill.id});
 } else if(['control','debuff','all_control_damage','all_dot_control'].includes(type)){
   const selected=enemies.filter(t=>n(t.hp)>0&&(type!=='control'||t.id===primary?.id));for(const t of selected){t.statuses={...(t.statuses||{}),[skill.id]:{turns:Math.max(1,Math.floor(n(skill.durationTurns??skill.dotTurns,2))),attackReductionPct:clamp(n(skill.attackReductionPct)+n(fx.attackReductionPct),0,80),defenseReductionPct:clamp(n(skill.defenseReductionPct)+n(fx.defenseReductionPct),0,80),dotPct:Math.max(0,n(skill.dotPct))}};if(mode==='pvp')t.statuses[skill.id].hardControl=false;else t.statuses[skill.id].hardControl=type==='control'||Boolean(skill.stunTurns||skill.controlTurns);log.push({type:'control',target:t.id,hard: t.statuses[skill.id].hardControl});}
   if(n(skill.damagePct)>0){for(const t of selected){const d=skillDamage(skill,a,t,fx);Object.assign(t,applyDamage(t,d));log.push({type:'damage',target:t.id,amount:d});}}
 } else if(['single_damage','multi_target_damage','all_damage','all_control_damage','all_dot_control','ultimate_all_damage','damage_heal','repeat_last_spell'].includes(type)){
   const selected=(type==='single_damage'||type==='damage_heal')?[primary].filter(Boolean):enemies.filter(t=>n(t.hp)>0).slice(0,Math.max(1,Math.floor(n(skill.maxTargets,8))));
   for(const t of selected){const d=skillDamage(skill,a,t,fx);Object.assign(t,applyDamage(t,d));log.push({type:'damage',target:t.id,amount:d});if(n(skill.dotPct)>0)t.statuses={...(t.statuses||{}),[skill.id]:{turns:Math.max(1,Math.floor(n(skill.dotTurns,2))),dotPct:n(skill.dotPct)}};if(n(skill.attackReductionPct)>0)t.statuses={...(t.statuses||{}),[skill.id]:{turns:Math.max(1,Math.floor(n(skill.durationTurns,2))),attackReductionPct:n(skill.attackReductionPct),hardControl:false}};if(type==='damage_heal'){const h=applyHeal(a,Math.max(1,d*n(skill.healPct??skill.lifeStealPct,35)/100*healScale));Object.assign(a,h);log.push({type:'heal',target:'self',amount:h.healed});}else if(n(fx.lifeStealPct)>0||n(skill.lifeStealPct)>0){const h=applyHeal(a,d*clamp(n(fx.lifeStealPct)||n(skill.lifeStealPct),0,100)/100);Object.assign(a,h);log.push({type:'heal',target:'self',amount:h.healed});}}
 } else if(type==='purge'){
   if(primary){primary.statuses={};log.push({type:'purge',target:primary.id});}
 } else if(type==='link'){
   if(primary){primary.statuses={...(primary.statuses||{}),[skill.id]:{turns:Math.max(1,Math.floor(n(skill.durationTurns,3))),linkPct:Math.max(0,n(skill.linkPct,20)),source:'wizard'}};a.links={...(a.links||{}),[skill.id]:{targetId:primary.id,turns:Math.max(1,Math.floor(n(skill.durationTurns,3))),linkPct:Math.max(0,n(skill.linkPct,20))}};log.push({type:'link',target:primary.id});}
 }
 return Object.freeze({mode,actor:a,targets:enemies,summons,log,skillId:skill.id});
}


/** Advance duration-based combat effects once at the authoritative round boundary.
 * Applies damage-over-time before decrementing durations; callers persist the returned state.
 */
export function tickCombatStatuses(combatant={}){
 const out=clone(combatant),logs=[];
 const statuses={...(out.statuses||{})};
 for(const [id,status] of Object.entries(statuses)){
  const turns=Math.max(0,n(status?.turns));
  if(turns<=0){delete statuses[id];continue;}
  const dot=Math.max(0,n(status.dotPct));
  if(dot>0&&n(out.hp)>0){const amount=Math.min(n(out.hp),Math.max(1,Math.floor(n(out.maxHp??out.max_hp,100)*dot/100)));out.hp=Math.max(0,n(out.hp)-amount);logs.push({type:'dot',statusId:id,amount});}
  const next=turns-1;if(next<=0)delete statuses[id];else statuses[id]={...status,turns:next};
 }
 out.statuses=statuses;
 if(out.shield&&n(out.shield.turns)>0){out.shield={...out.shield,turns:n(out.shield.turns)-1};if(out.shield.turns<=0)out.shield=null;}
 for(const key of ['buffs']){if(out[key]&&typeof out[key]==='object'){for(const [id,buff] of Object.entries(out[key])){const turns=Math.max(0,n(buff?.turns)-1);if(turns<=0)delete out[key][id];else out[key][id]={...buff,turns};}}}
 if(Array.isArray(out.summons))out.summons=out.summons.map(x=>({...x,turns:Math.max(0,n(x.turns)-1)})).filter(x=>x.turns>0&&n(x.hp)>0);
 return Object.freeze({combatant:out,log:logs});
}
