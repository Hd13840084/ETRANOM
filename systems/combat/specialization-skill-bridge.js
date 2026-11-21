/** ETRANOM Wizard legacy bridge.
 * Only Wizard + its four designed specializations are active. The other 36
 * specialization entries in the broad catalog are scaffolding, not gameplay.
 * Legacy skill records are imported from the actual specialization modules.
 */
import { resolveCombatSkill } from './shared-skill-runtime.js';
import { ARCANE_MAGE } from '../classes/arcane-mage.js';
import { ELEMENTALIST } from '../classes/elementalist.js';
import { WARLOCK } from '../classes/warlock.js';
import { NECROMANCER, recruitNecromancerLegion } from '../classes/necromancer.js';
import { collectTalentEffects, applyWizardTalentEffectsToSkill, resolveSkillAtRank } from '../classes/wizard-combat-runtime.js';
import { prepareWizardSpecializationSkill, finalizeWizardSpecializationSkill } from './wizard-specialization-mechanics.js';

export const SPECIALIZATION_BRIDGE_VERSION = '183.0.0';
export const IMPLEMENTED_CLASS_IDS = Object.freeze(['wizard']);
export const IMPLEMENTED_SPECIALIZATIONS = Object.freeze({
  wizard_arcane_mage: ARCANE_MAGE,
  wizard_elementalist: ELEMENTALIST,
  wizard_warlock: WARLOCK,
  wizard_necromancer: NECROMANCER
});
const SPEC_NAME_TO_ID = Object.freeze({
  wizard_1:'wizard_arcane_mage',wizard_2:'wizard_elementalist',wizard_3:'wizard_warlock',wizard_4:'wizard_necromancer',
  'آرکین‌میج':'wizard_arcane_mage','آرکین میج':'wizard_arcane_mage','Arcane Mage':'wizard_arcane_mage',
  'المنتالیست':'wizard_elementalist','Elementalist':'wizard_elementalist',
  'وارلاک':'wizard_warlock','Warlock':'wizard_warlock',
  'نکرومنسر':'wizard_necromancer','Necromancer':'wizard_necromancer'
});
const TYPE_MAP = Object.freeze({
  damage:'single_damage', all_damage_control:'all_control_damage', all_damage_debuff:'all_control_damage',
  self_heal_cleanse:'self_heal', single_damage_cleanse:'single_damage', single_damage_drain:'damage_heal',
  life_steal:'damage_heal', stance:'self_buff', empower:'self_buff', choice_control:'debuff',
  debuff_choice:'debuff', control_choice:'control', true_name_debuff:'debuff', ' 선택_debuff':'debuff',
  legion_defense_buff:'self_buff', legion_offense_buff:'self_buff', soul_command:'self_buff',
  ultimate_choice:'self_buff', ultimate_form:'self_buff', self_revive:'self_buff',
  dual_element_combo:'multi_target_damage', summon_resource:'summon_resource'
});

export function getImplementedSpecializationId(value) {
  const raw=String(value||'');
  if (IMPLEMENTED_SPECIALIZATIONS[raw]) return raw;
  return SPEC_NAME_TO_ID[raw] || null;
}
export function isImplementedSpecialization(specializationId) {
  return Object.prototype.hasOwnProperty.call(IMPLEMENTED_SPECIALIZATIONS,String(specializationId||''));
}
export function listSpecializationHandlers() {
  return Object.entries(IMPLEMENTED_SPECIALIZATIONS).map(([specializationId,spec])=>Object.freeze({
    specializationId,classId:'wizard',name:spec.specialization,
    skillIds:Object.freeze((spec.skills||[]).map(s=>String(s.id))),
    resolve(skillId,payload={}) { return resolveWizardSpecializationSkill(specializationId,skillId,payload); }
  }));
}
export function getSpecializationHandler(_catalog,specializationId) {
  const id=getImplementedSpecializationId(specializationId);
  return id ? listSpecializationHandlers().find(x=>x.specializationId===id) || null : null;
}
export function listOwnedSpecializationSkills(_catalog,{classId='wizard',specializationId,level=1,ownedSkillIds=[]}={}) {
  if (classId!=='wizard') return [];
  const id=getImplementedSpecializationId(specializationId); if(!id) return [];
  const owned=new Set((Array.isArray(ownedSkillIds)?ownedSkillIds:[]).map(String));
  return (IMPLEMENTED_SPECIALIZATIONS[id].skills||[]).filter(s=>owned.has(String(s.id))&&Number(s.unlockLevel||1)<=Number(level||1));
}
function normalizeLegacySkill(skill,actor={}) {
  const rawType=String(skill.type||'');
  const type=TYPE_MAP[rawType]||rawType;
  const maxMp=Math.max(0,Number(actor.maxMp??actor.max_mp)||0);
  const pct=Number(skill.manaPct??skill.manaCostPercent??skill.manaCostPct??0)||0;
  const manaCost=skill.manaCost!=null?Number(skill.manaCost):Math.ceil(maxMp*pct/100);
  const damagePct=Number(skill.damagePct??skill.damagePercent??skill.powerPct??(rawType==='damage'?220:rawType==='life_steal'?160:rawType==='repeat_last_spell'?Number(actor.lastDamagePct)||100:0))||0;
  const healPct=rawType==='self_heal_cleanse'?damagePct:(rawType==='single_damage_drain'||rawType==='life_steal'?30:Number(skill.healPct)||undefined);
  const lifeStealPct=rawType==='single_damage_drain'||rawType==='life_steal'?Number(skill.lifeStealPct)||30:Number(skill.lifeStealPct)||0;
  const dotPct=Number(skill.dotPct??(rawType==='damage'?12:0))||0;
  return {...skill,type,legacyType:rawType,manaCost,damagePct:damagePct||undefined,healPct,lifeStealPct,dotPct,
    scalingStat:skill.scalingStat||'magicPower',durationTurns:Number(skill.durationTurns??skill.dotTurns??2)||2};
}
export function resolveWizardSpecializationSkill(specializationId,skillId,payload={}) {
  const specId=getImplementedSpecializationId(specializationId);
  if(!specId) throw new Error('specialization_not_implemented');
  const spec=IMPLEMENTED_SPECIALIZATIONS[specId];
  const baseSkill=(spec.skills||[]).find(s=>String(s.id)===String(skillId));
  if(!baseSkill) throw new Error('specialization_skill_not_found');
  const actor={...(payload.actor||{})};
  const allProgress=actor.classProgress||actor.class_progress||{};
  const progress=allProgress[specId]||actor.specializationProgress||actor.necromancerProgress||{};
  const talentEffects=collectTalentEffects(spec,progress);
  const rank=Math.max(1,Number(progress.skillRanks?.[baseSkill.id])||1);
  const rankedSkill=resolveSkillAtRank(baseSkill,rank);
  const skill=applyWizardTalentEffectsToSkill(rankedSkill,talentEffects,specId);
  actor.wizardTalentEffects=talentEffects;
  if(specId==='wizard_necromancer' && skill.type==='permanent_recruit') {
    const corpse=(payload.targets||[]).find(t=>String(t.id)===String(payload.targetId)&&Number(t.hp)<=0);
    if(!corpse) throw new Error('necromancer_recruit_requires_selected_corpse');
    const result=recruitNecromancerLegion(progress,corpse,Number(payload.recruitRoll??Math.random()*100),talentEffects);
    if(!result.ok) return Object.freeze({mode:payload.mode||'solo',actor:{...actor,classProgress:{...allProgress,[specId]:result.progress},necromancerProgress:result.progress},targets:payload.targets||[],log:[{type:'recruit_failed',reason:result.reason,chance:result.chance}],skillId});
    return Object.freeze({mode:payload.mode||'solo',actor:{...actor,classProgress:{...allProgress,[specId]:result.progress},necromancerProgress:result.progress},targets:payload.targets||[],log:[{type:'recruit',memberId:result.member.id,chance:result.chance}],skillId});
  }
  const rawType=String(skill.type||'');
  const prepared=prepareWizardSpecializationSkill(specId,skill,actor,payload);
  const normalized=normalizeLegacySkill(prepared.skill,prepared.actor);
  let result=resolveCombatSkill({...payload,actor:prepared.actor,skill:normalized});
  result=finalizeWizardSpecializationSkill(specId,skill,result,{...payload,choice:prepared.choice});
  if(rawType==='self_revive'){const nextActor={...result.actor,revive:{armed:true,hpPct:Number(skill.reviveHealthPct)||25,turns:Number(skill.durationTurns)||3}};result=Object.freeze({...result,actor:nextActor,log:[...result.log,{type:'revive_armed',hpPct:nextActor.revive.hpPct}]});}
  if(rawType==='self_heal_cleanse'||rawType==='single_damage_cleanse'){const nextActor={...result.actor,statuses:{}};result=Object.freeze({...result,actor:nextActor,log:[...result.log,{type:'cleanse'}]});}
  return result;
}
export function resolveSpecializationSkill(_catalog,specializationId,skillId,payload={}) {
  return resolveWizardSpecializationSkill(specializationId,skillId,payload);
}
export function listAllImplementedWizardSkills() {
  return Object.entries(IMPLEMENTED_SPECIALIZATIONS).flatMap(([specializationId,spec])=>(spec.skills||[]).map(skill=>({...skill,specializationId,classId:'wizard'})));
}
