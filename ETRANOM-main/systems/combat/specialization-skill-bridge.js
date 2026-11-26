/** ETRANOM specialization bridge. Eight designed specializations are active;
 * future class slots remain shells until their full content and server runtimes
 * are authored. Legacy records are normalized at this shared boundary.
 */
import { resolveCombatSkill } from './shared-skill-runtime.js?v=1906&build=2081';
import { resolveSpecializationCombatActor } from './character-stat-core.js?v=1901&build=2081';
import { normalizeSpecializationSkillRecord } from './specialization-contract-runtime.js?v=1901&build=2081';
import { ARCANE_MAGE } from '../classes/arcane-mage.js?build=2081';
import { ELEMENTALIST } from '../classes/elementalist.js?build=2081';
import { WARLOCK } from '../classes/warlock.js?build=2081';
import { NECROMANCER, recruitNecromancerLegion } from '../classes/necromancer.js?build=2081';
import { collectTalentEffects, applyWizardTalentEffectsToSkill, resolveSkillAtRank } from '../classes/wizard-combat-runtime.js?v=1901&build=2081';
import { prepareWizardSpecializationSkill, finalizeWizardSpecializationSkill } from './wizard-specialization-mechanics.js?build=2081';
import { SWORD_ASCETIC_DATA, resolveSwordAsceticSkill, listSwordAsceticSkills } from './sword-ascetic-runtime.js?v=1937&build=2081';
import { resolveWarriorSkillThroughSharedEngine } from './engines/shared-engine-warrior-shadow-v1938.js?v=1938&build=2081';
import { prepareSpecializationSharedEngineShadowV1939 } from './engines/shared-engine-specialization-orchestrator-v1939.js?v=1939&build=2081';
import { compareLegacyOutcomeToSharedPlanV1940 } from './engines/shared-engine-differential-audit-v1940.js?v=1940&build=2081';
import { IRON_BASTION_DATA, resolveIronBastionSkill, listIronBastionSkills, findIronBastionSkill } from './iron-bastion-runtime.js?v=1937&build=2081';
import { APOCALYPSE_HARBINGER_DATA, resolveApocalypseSkill, listApocalypseSkills, findApocalypseSkill } from './apocalypse-harbinger-runtime.js?v=1908&build=2081';
import { CHAOS_WARRIOR_DATA, resolveChaosSkill } from './chaos-warrior-runtime.js?v=1901&build=2081';
export const SPECIALIZATION_BRIDGE_VERSION = '1940.0.0';
let lastSharedEngineOrchestrationAuditV1939 = null;
let lastSharedEngineDifferentialAuditV1940 = null;
export function getSharedEngineDifferentialAuditV1940() { return lastSharedEngineDifferentialAuditV1940; }
function recordSharedEngineDifferentialOutcomeV1940(beforeActor, beforeTargets, result, mode, specializationId, skillId) {
    try {
        const plan = lastSharedEngineOrchestrationAuditV1939 === null || lastSharedEngineOrchestrationAuditV1939 === void 0 ? void 0 : lastSharedEngineOrchestrationAuditV1939.sharedPlan;
        if (!plan || plan.specializationId !== specializationId || plan.skillId !== String(skillId))
            return null;
        lastSharedEngineDifferentialAuditV1940 = compareLegacyOutcomeToSharedPlanV1940({ plan, beforeActor, afterActor: (result === null || result === void 0 ? void 0 : result.actor) || beforeActor,
            beforeTargets, afterTargets: (result === null || result === void 0 ? void 0 : result.targets) || beforeTargets, events: (result === null || result === void 0 ? void 0 : result.log) || (result === null || result === void 0 ? void 0 : result.events) || [] });
        return lastSharedEngineDifferentialAuditV1940;
    }
    catch (error) {
        lastSharedEngineDifferentialAuditV1940 = Object.freeze({ version: '1940.0.0', specializationId, mode, skillId: String(skillId),
            classification: 'audit_unavailable', parityProven: false, reason: String((error === null || error === void 0 ? void 0 : error.message) || error) });
        return lastSharedEngineDifferentialAuditV1940;
    }
}
function runSharedEngineOrchestrationShadowV1939(mode, specializationId, skillId, payload) {
    try {
        lastSharedEngineOrchestrationAuditV1939 = prepareSpecializationSharedEngineShadowV1939({ mode, specializationId, skillId, payload });
    }
    catch (error) {
        lastSharedEngineOrchestrationAuditV1939 = Object.freeze({ ok: false, mode, specializationId, skillId: String(skillId), reason: String((error === null || error === void 0 ? void 0 : error.message) || error), nonBlocking: true });
    }
    return lastSharedEngineOrchestrationAuditV1939;
}
export function getSharedEngineOrchestrationAuditV1939() { return lastSharedEngineOrchestrationAuditV1939; }
export const IMPLEMENTED_CLASS_IDS = Object.freeze(['wizard', 'warrior']);
export const IMPLEMENTED_SPECIALIZATIONS = Object.freeze({
    wizard_arcane_mage: ARCANE_MAGE,
    wizard_elementalist: ELEMENTALIST,
    wizard_warlock: WARLOCK,
    wizard_necromancer: NECROMANCER,
    warrior_sword_ascetic: SWORD_ASCETIC_DATA,
    warrior_iron_bastion: IRON_BASTION_DATA,
    warrior_apocalypse_harbinger: APOCALYPSE_HARBINGER_DATA,
    warrior_chaos: CHAOS_WARRIOR_DATA
});
const SPEC_NAME_TO_ID = Object.freeze({
    wizard_1: 'wizard_arcane_mage', wizard_2: 'wizard_elementalist', wizard_3: 'wizard_warlock', wizard_4: 'wizard_necromancer',
    'آرکین‌میج': 'wizard_arcane_mage', 'آرکین میج': 'wizard_arcane_mage', 'Arcane Mage': 'wizard_arcane_mage',
    'المنتالیست': 'wizard_elementalist', 'Elementalist': 'wizard_elementalist',
    'وارلاک': 'wizard_warlock', 'Warlock': 'wizard_warlock',
    'نکرومنسر': 'wizard_necromancer', 'Necromancer': 'wizard_necromancer',
    warrior_1: 'warrior_sword_ascetic', 'warrior_sword_ascetic': 'warrior_sword_ascetic',
    warrior_2: 'warrior_iron_bastion', 'warrior_iron_bastion': 'warrior_iron_bastion',
    warrior_4: 'warrior_apocalypse_harbinger',
    'زاهد شمشیر': 'warrior_sword_ascetic', 'Sword Ascetic': 'warrior_sword_ascetic',
    'دژ پولادین': 'warrior_iron_bastion', 'Iron Bastion': 'warrior_iron_bastion',
    warrior_3: 'warrior_chaos', 'warrior_chaos_warrior': 'warrior_chaos', 'warrior_apocalypse_harbinger': 'warrior_apocalypse_harbinger',
    'جنگجوی آشوب': 'warrior_chaos', 'Chaos Warrior': 'warrior_chaos',
    'آورنده آخرالزمان': 'warrior_apocalypse_harbinger', 'Apocalypse Harbinger': 'warrior_apocalypse_harbinger'
});
const TYPE_MAP = Object.freeze({
    damage: 'single_damage', all_damage_control: 'all_control_damage', all_damage_debuff: 'all_control_damage',
    self_heal_cleanse: 'self_heal', single_damage_cleanse: 'single_damage', single_damage_drain: 'damage_heal',
    life_steal: 'damage_heal', stance: 'self_buff', empower: 'self_buff', choice_control: 'debuff',
    debuff_choice: 'debuff', control_choice: 'control', true_name_debuff: 'debuff', ' 선택_debuff': 'debuff',
    legion_defense_buff: 'self_buff', legion_offense_buff: 'self_buff', soul_command: 'self_buff',
    ultimate_choice: 'self_buff', ultimate_form: 'self_buff', self_revive: 'self_buff',
    dual_element_combo: 'multi_target_damage', summon_resource: 'summon_resource'
});
export function getImplementedSpecializationId(value) {
    const raw = String(value || '');
    if (IMPLEMENTED_SPECIALIZATIONS[raw])
        return raw;
    return SPEC_NAME_TO_ID[raw] || null;
}
export function isImplementedSpecialization(specializationId) {
    return Object.prototype.hasOwnProperty.call(IMPLEMENTED_SPECIALIZATIONS, String(specializationId || ''));
}
export function listSpecializationHandlers() {
    return Object.entries(IMPLEMENTED_SPECIALIZATIONS).map(([specializationId, spec]) => Object.freeze({
        specializationId, classId: specializationId.startsWith('warrior_') ? 'warrior' : 'wizard', name: spec.specialization,
        skillIds: Object.freeze((spec.skills || []).map(s => String(s.id))),
        resolve(skillId, payload = {}) { const actor = resolveSpecializationCombatActor(payload.actor || {}, specializationId); const prepared = { ...payload, actor }; runSharedEngineOrchestrationShadowV1939(payload.mode || 'solo', specializationId, skillId, prepared); if (specializationId.startsWith('warrior_'))
            return resolveWarriorSkillThroughSharedEngine({ mode: payload.mode || 'solo', specializationId, skillId, payload: prepared }); return resolveWizardSpecializationSkill(specializationId, skillId, prepared); }
    }));
}
export function getSpecializationHandler(_catalog, specializationId) {
    const id = getImplementedSpecializationId(specializationId);
    return id ? listSpecializationHandlers().find(x => x.specializationId === id) || null : null;
}
export function listOwnedSpecializationSkills(_catalog, { classId = 'wizard', specializationId, level = 1, ownedSkillIds = [] } = {}) {
    const id = getImplementedSpecializationId(specializationId);
    if (!id)
        return [];
    if (id === 'warrior_sword_ascetic')
        return listSwordAsceticSkills({ level, ownedSkillIds }).map(s => normalizeSpecializationSkillRecord(s, id));
    if (id === 'warrior_iron_bastion')
        return listIronBastionSkills({ level, progress: {} }).filter(s => !ownedSkillIds.length || ownedSkillIds.includes(s.id)).map(s => normalizeSpecializationSkillRecord(s, id));
    if (id === 'warrior_apocalypse_harbinger')
        return listApocalypseSkills({ level, progress: {} }).filter(s => !ownedSkillIds.length || ownedSkillIds.includes(s.id)).map(s => normalizeSpecializationSkillRecord(s, id));
    if (id === 'warrior_chaos')
        return (IMPLEMENTED_SPECIALIZATIONS[id].skills || []).filter(s => Number(s.unlockLevel || 1) <= Number(level || 1) && (!ownedSkillIds.length || ownedSkillIds.includes(s.id))).map(s => normalizeSpecializationSkillRecord(s, id));
    if (classId !== 'wizard')
        return [];
    const owned = new Set((Array.isArray(ownedSkillIds) ? ownedSkillIds : []).map(String));
    return (IMPLEMENTED_SPECIALIZATIONS[id].skills || []).filter(s => owned.has(String(s.id)) && Number(s.unlockLevel || 1) <= Number(level || 1)).map(s => normalizeSpecializationSkillRecord(s, id));
}
function normalizeLegacySkill(skill, actor = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const rawType = String(skill.type || '');
    const type = TYPE_MAP[rawType] || rawType;
    const maxMp = Math.max(0, Number((_a = actor.maxMp) !== null && _a !== void 0 ? _a : actor.max_mp) || 0);
    const pct = Number((_d = (_c = (_b = skill.manaPct) !== null && _b !== void 0 ? _b : skill.manaCostPercent) !== null && _c !== void 0 ? _c : skill.manaCostPct) !== null && _d !== void 0 ? _d : 0) || 0;
    const manaCost = skill.manaCost != null ? Number(skill.manaCost) : Math.ceil(maxMp * pct / 100);
    const damagePct = Number((_g = (_f = (_e = skill.damagePct) !== null && _e !== void 0 ? _e : skill.damagePercent) !== null && _f !== void 0 ? _f : skill.powerPct) !== null && _g !== void 0 ? _g : (rawType === 'damage' ? 220 : rawType === 'life_steal' ? 160 : rawType === 'repeat_last_spell' ? Number(actor.lastDamagePct) || 100 : 0)) || 0;
    const healPct = rawType === 'self_heal_cleanse' ? damagePct : (rawType === 'single_damage_drain' || rawType === 'life_steal' ? 30 : Number(skill.healPct) || undefined);
    const lifeStealPct = rawType === 'single_damage_drain' || rawType === 'life_steal' ? Number(skill.lifeStealPct) || 30 : Number(skill.lifeStealPct) || 0;
    const dotPct = Number((_h = skill.dotPct) !== null && _h !== void 0 ? _h : (rawType === 'damage' ? 12 : 0)) || 0;
    return { ...skill, type, legacyType: rawType, manaCost, damagePct: damagePct || undefined, healPct, lifeStealPct, dotPct,
        scalingStat: skill.scalingStat || 'magicPower', durationTurns: Number((_k = (_j = skill.durationTurns) !== null && _j !== void 0 ? _j : skill.dotTurns) !== null && _k !== void 0 ? _k : 2) || 2 };
}
/**
 * V1927: execute the authored second form (the specialization's ascendedSkills
 * record) through the existing, still-authoritative Wizard resolver. This is
 * deliberately not a third skill layer and does not alter the shared-engine
 * cutover boundary. Base skill identity/type remain stable for legacy handlers.
 */
export function resolveWizardAuthoredDomainFormV1927(spec, baseSkill, currentSkill, progress = {}) {
    var _a, _b, _c;
    const domainActive = (progress === null || progress === void 0 ? void 0 : progress.domainActive) === true || ((_a = progress === null || progress === void 0 ? void 0 : progress.domain) === null || _a === void 0 ? void 0 : _a.active) === true;
    if (!domainActive)
        return currentSkill;
    const selectedId = String((progress === null || progress === void 0 ? void 0 : progress.ascendedSkillId) || ((_b = progress === null || progress === void 0 ? void 0 : progress.domain) === null || _b === void 0 ? void 0 : _b.ascensionId) || ((_c = progress === null || progress === void 0 ? void 0 : progress.domain) === null || _c === void 0 ? void 0 : _c.ascendedSkillId) || '').trim();
    if (!selectedId)
        return currentSkill;
    const forms = Array.isArray(spec === null || spec === void 0 ? void 0 : spec.ascendedSkills) ? spec.ascendedSkills : [];
    const selected = forms.find(form => String((form === null || form === void 0 ? void 0 : form.id) || '') === selectedId);
    if (!selected)
        throw new Error('wizard_domain_form_selection_invalid');
    const mappedBaseId = String(selected.skillId || selected.baseSkillId || '').trim();
    if (mappedBaseId !== String((baseSkill === null || baseSkill === void 0 ? void 0 : baseSkill.id) || ''))
        return currentSkill;
    return {
        ...currentSkill,
        ...selected,
        id: String(baseSkill.id),
        baseSkillId: String(baseSkill.id),
        type: currentSkill.type,
        legacyType: currentSkill.legacyType || currentSkill.type,
        domainFormId: selected.id,
        domainFormName: selected.name || null,
        isDomainForm: true,
        domainFormSource: 'ascendedSkills'
    };
}
export function resolveWizardSpecializationSkill(specializationId, skillId, payload = {}) {
    var _a, _b;
    const specId = getImplementedSpecializationId(specializationId);
    if (!specId)
        throw new Error('specialization_not_implemented');
    const spec = IMPLEMENTED_SPECIALIZATIONS[specId];
    const baseSkill = (spec.skills || []).find(s => String(s.id) === String(skillId));
    if (!baseSkill)
        throw new Error('specialization_skill_not_found');
    const actor = resolveSpecializationCombatActor({ ...(payload.actor || {}) }, specId);
    const allProgress = actor.classProgress || actor.class_progress || {};
    // Arcane Mage has a historical canonical persistence key (`arcaneMage`);
    // the other Wizard specializations use their canonical specialization IDs.
    const specializationProgressKey = {
        wizard_arcane_mage: 'arcaneMage', wizard_elementalist: 'elementalist',
        wizard_warlock: 'warlock', wizard_necromancer: 'necromancer'
    }[specId];
    const legacyProgressKey = {
        wizard_arcane_mage: 'arcaneMageProgress', wizard_elementalist: 'elementalistProgress',
        wizard_warlock: 'warlockProgress', wizard_necromancer: 'necromancerProgress'
    }[specId];
    const progress = actor[legacyProgressKey] || allProgress[specializationProgressKey] || allProgress[specId] || actor.specializationProgress || {};
    const talentEffects = collectTalentEffects(spec, progress);
    const rank = Math.max(1, Number((_a = progress.skillRanks) === null || _a === void 0 ? void 0 : _a[baseSkill.id]) || 1);
    const rankedSkill = resolveSkillAtRank(baseSkill, rank);
    const talentedSkill = applyWizardTalentEffectsToSkill(rankedSkill, talentEffects, specId);
    const skill = resolveWizardAuthoredDomainFormV1927(spec, baseSkill, talentedSkill, progress);
    actor.wizardTalentEffects = talentEffects;
    if (specId === 'wizard_necromancer' && skill.type === 'permanent_recruit') {
        const corpse = (payload.targets || []).find(t => String(t.id) === String(payload.targetId) && Number(t.hp) <= 0);
        if (!corpse)
            throw new Error('necromancer_recruit_requires_selected_corpse');
        const result = recruitNecromancerLegion(progress, corpse, Number((_b = payload.recruitRoll) !== null && _b !== void 0 ? _b : Math.random() * 100), talentEffects);
        if (!result.ok)
            return Object.freeze({ mode: payload.mode || 'solo', actor: { ...actor, classProgress: { ...allProgress, [specId]: result.progress }, necromancerProgress: result.progress }, targets: payload.targets || [], log: [{ type: 'recruit_failed', reason: result.reason, chance: result.chance }], skillId });
        return Object.freeze({ mode: payload.mode || 'solo', actor: { ...actor, classProgress: { ...allProgress, [specId]: result.progress }, necromancerProgress: result.progress }, targets: payload.targets || [], log: [{ type: 'recruit', memberId: result.member.id, chance: result.chance }], skillId });
    }
    const rawType = String(skill.type || '');
    const prepared = prepareWizardSpecializationSkill(specId, skill, actor, payload);
    const normalized = normalizeLegacySkill(prepared.skill, prepared.actor);
    let result = resolveCombatSkill({ ...payload, actor: prepared.actor, skill: normalized });
    result = finalizeWizardSpecializationSkill(specId, skill, result, { ...payload, choice: prepared.choice });
    if (rawType === 'self_revive') {
        const nextActor = { ...result.actor, revive: { armed: true, hpPct: Number(skill.reviveHealthPct) || 25, turns: Number(skill.durationTurns) || 3 } };
        result = Object.freeze({ ...result, actor: nextActor, log: [...result.log, { type: 'revive_armed', hpPct: nextActor.revive.hpPct }] });
    }
    if (rawType === 'self_heal_cleanse' || rawType === 'single_damage_cleanse') {
        const nextActor = { ...result.actor, statuses: {} };
        result = Object.freeze({ ...result, actor: nextActor, log: [...result.log, { type: 'cleanse' }] });
    }
    return result;
}
export function resolveSpecializationSkill(_catalog, specializationId, skillId, payload = {}) {
    const id = getImplementedSpecializationId(specializationId);
    if (!id)
        throw new Error('specialization_not_implemented');
    const prepared = { ...payload, actor: resolveSpecializationCombatActor(payload.actor || {}, id) };
    const beforeActor = structuredClone(prepared.actor || {}), beforeTargets = structuredClone(prepared.targets || []), mode = payload.mode || 'solo';
    runSharedEngineOrchestrationShadowV1939(mode, id, skillId, prepared);
    const result = id.startsWith('warrior_')
        ? resolveWarriorSkillThroughSharedEngine({ mode, specializationId: id, skillId, payload: prepared })
        : resolveWizardSpecializationSkill(id, skillId, prepared);
    recordSharedEngineDifferentialOutcomeV1940(beforeActor, beforeTargets, result, mode, id, skillId);
    return result;
}
export function listAllImplementedWizardSkills() {
    return Object.entries(IMPLEMENTED_SPECIALIZATIONS).filter(([id]) => id.startsWith('wizard_')).flatMap(([specializationId, spec]) => (spec.skills || []).map(skill => normalizeSpecializationSkillRecord(skill, specializationId)));
}
export function listAllImplementedSpecializationSkills() {
    return Object.entries(IMPLEMENTED_SPECIALIZATIONS).flatMap(([specializationId, spec]) => (spec.skills || []).map(skill => normalizeSpecializationSkillRecord(skill, specializationId)));
}
