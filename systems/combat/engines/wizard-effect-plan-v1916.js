/**
 * ETRANOM V1916 — Wizard shared-effect plan compiler and transactional dispatcher.
 *
 * This is the first executable shared-effect boundary. It compiles authored
 * Wizard skill records into immutable plans and dispatches each operation to
 * registered standard/extension handlers. It intentionally does not replace
 * the legacy combat resolver until a mode-by-mode parity suite exists.
 */
import { IMPLEMENTED_SPECIALIZATIONS } from '../specialization-skill-bridge.js?v=1900&build=2081';
import { normalizeSpecializationSkillRecord } from '../specialization-contract-runtime.js?v=1901&build=2081';
import { getWizardSkillContractV1915 } from './wizard-shared-contract-v1915.js?v=1915&build=2081';
export const WIZARD_EFFECT_PLAN_VERSION = '1916.0.0';
export const WIZARD_STANDARD_EFFECT_KINDS = Object.freeze(new Set([
    'damage', 'heal', 'shield', 'apply_status', 'cleanse', 'resource_gain', 'resource_drain',
    'stat_modifier', 'summon', 'multi_hit', 'taunt', 'revive', 'dispel'
]));
const EXT = Object.freeze({
    arcane: 'wizard.arcane-mage', elementalist: 'wizard.elementalist',
    warlock: 'wizard.warlock', necromancer: 'wizard.necromancer'
});
const SPEC_EXT = Object.freeze({
    wizard_arcane_mage: EXT.arcane, wizard_elementalist: EXT.elementalist,
    wizard_warlock: EXT.warlock, wizard_necromancer: EXT.necromancer
});
// Operation order is gameplay-significant. Values are references to trusted
// skill/runtime context, never client-supplied damage or resource amounts.
const SKILL_PLANS = Object.freeze({
    arcane_bolt: [['damage', 'selected_target']],
    arcane_shield: [['shield', 'self']],
    arcane_explosion: [['damage', 'all_live_targets']],
    arcane_blink: [['ext:arcane.evasion_counter', 'self']],
    ancient_rune: [['damage', 'all_live_targets'], ['apply_status', 'all_live_targets']],
    prismatic_lance: [['damage', 'ordered_targets']],
    arcane_echo: [['ext:arcane.repeat_last_spell', 'runtime_selected_targets']],
    gravity_well: [['damage', 'all_live_targets'], ['apply_status', 'all_live_targets']],
    arcane_overload: [['stat_modifier', 'self']],
    arcane_singularity: [['damage', 'all_live_targets']],
    ember_bolt: [['damage', 'selected_target']],
    frozen_armor: [['shield', 'self']],
    chain_lightning: [['damage', 'ordered_targets']],
    tempest: [['damage', 'all_live_targets'], ['apply_status', 'all_live_targets']],
    earth_rupture: [['damage', 'all_live_targets'], ['apply_status', 'all_live_targets']],
    tidal_renewal: [['heal', 'self'], ['cleanse', 'self']],
    radiant_judgment: [['damage', 'selected_target'], ['cleanse', 'self']],
    darkness_chains: [['damage', 'selected_target'], ['resource_drain', 'selected_target']],
    elemental_fusion: [['ext:elementalist.dual_element_combo', 'runtime_selected_targets']],
    primordial_cataclysm: [['damage', 'all_live_targets']],
    forbidden_signature: [['damage', 'selected_target']],
    stolen_moment: [['apply_status', 'selected_target'], ['ext:warlock.stolen_moment', 'selected_target']],
    demons_testament: [['stat_modifier', 'self'], ['ext:warlock.pact_toggle', 'self']],
    reversal_of_sacrifice: [['ext:warlock.sacrifice_arm', 'self']],
    court_of_nameless: [['apply_status', 'all_live_targets'], ['ext:warlock.court_choice', 'all_live_targets']],
    hostage_heart: [['apply_status', 'selected_target'], ['ext:warlock.link', 'selected_target']],
    erasure_from_reality: [['cleanse', 'selected_target'], ['dispel', 'selected_target']],
    heir_of_hunger: [['summon', 'all_live_targets'], ['resource_gain', 'self'], ['ext:warlock.hunger_reservoir', 'self']],
    true_name_shatter: [['apply_status', 'selected_target'], ['ext:warlock.true_name_choice', 'selected_target']],
    final_covenant: [['damage', 'runtime_selected_targets'], ['heal', 'self'], ['apply_status', 'all_live_targets'], ['ext:warlock.final_covenant_choice', 'runtime_selected_targets']],
    death_claw: [['damage', 'selected_target'], ['apply_status', 'selected_target'], ['ext:necromancer.soul_on_kill', 'selected_target']],
    legion: [['ext:necromancer.permanent_recruit', 'selected_corpse']],
    death_memory: [['apply_status', 'selected_target'], ['ext:necromancer.death_memory_choice', 'selected_target']],
    bone_blossom: [['stat_modifier', 'active_legion'], ['ext:necromancer.legion_defense', 'active_legion']],
    assembly_of_souls: [['damage', 'runtime_selected_targets'], ['shield', 'self'], ['heal', 'self'], ['resource_gain', 'self'], ['ext:necromancer.soul_command', 'runtime_selected_targets']],
    life_siphon: [['damage', 'selected_target'], ['heal', 'self'], ['apply_status', 'selected_target'], ['ext:necromancer.legion_share_heal', 'active_legion']],
    kingdom_of_bones: [['stat_modifier', 'active_legion'], ['ext:necromancer.legion_offense', 'active_legion']],
    return_threshold: [['revive', 'self'], ['ext:necromancer.soul_cost', 'self']],
    soul_domination: [['apply_status', 'runtime_selected_targets'], ['ext:necromancer.control_choice', 'runtime_selected_targets']],
    eternal_sovereign: [['stat_modifier', 'self'], ['stat_modifier', 'active_legion'], ['ext:necromancer.sovereign_form', 'active_legion']]
});
const clone = value => structuredClone(value !== null && value !== void 0 ? value : {});
const asObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
export function compileWizardEffectPlanV1916(specializationId, skillId) {
    var _a, _b;
    const specId = String(specializationId || '');
    const raw = (_b = (_a = IMPLEMENTED_SPECIALIZATIONS[specId]) === null || _a === void 0 ? void 0 : _a.skills) === null || _b === void 0 ? void 0 : _b.find(row => String(row.id) === String(skillId));
    if (!raw || !specId.startsWith('wizard_'))
        return null;
    const contract = getWizardSkillContractV1915(specId, skillId);
    const normalized = normalizeSpecializationSkillRecord(raw, specId);
    const steps = SKILL_PLANS[String(skillId)];
    if (!contract || !steps)
        return Object.freeze({
            version: WIZARD_EFFECT_PLAN_VERSION, specializationId: specId, skillId: String(skillId),
            extensionId: SPEC_EXT[specId], status: 'blocked_unmapped', steps: Object.freeze([])
        });
    const compiledSteps = steps.map(([kind, scope], index) => Object.freeze({
        index, kind, scope,
        standard: !kind.startsWith('ext:'),
        handlerId: kind.startsWith('ext:') ? `${SPEC_EXT[specId]}.${kind.slice(4).split('.').at(-1)}` : kind,
        legacyType: normalized.legacyType
    }));
    const unknown = compiledSteps.filter(step => step.standard && !WIZARD_STANDARD_EFFECT_KINDS.has(step.kind));
    return Object.freeze({
        version: WIZARD_EFFECT_PLAN_VERSION, specializationId: specId, extensionId: SPEC_EXT[specId],
        skillId: String(skillId), legacyType: normalized.legacyType,
        contractType: normalized.contractType, resourceType: normalized.resourceType,
        resourceCost: normalized.resourceCost, resourceCostMode: normalized.resourceCostMode,
        cooldownTurns: normalized.cooldownTurns, target: normalized.target,
        skillDefinition: normalized, steps: Object.freeze(compiledSteps),
        status: unknown.length ? 'blocked_invalid_effect' : 'compiled',
        extensionRequired: compiledSteps.some(step => !step.standard)
    });
}
export function buildWizardEffectPlanCatalogV1916() {
    return Object.entries(IMPLEMENTED_SPECIALIZATIONS)
        .filter(([id]) => id.startsWith('wizard_'))
        .flatMap(([id, spec]) => (spec.skills || []).map(skill => compileWizardEffectPlanV1916(id, skill.id)));
}
export function auditWizardEffectPlansV1916() {
    const plans = buildWizardEffectPlanCatalogV1916();
    const counts = {};
    for (const plan of plans) {
        const row = counts[plan.specializationId] || { total: 0, compiled: 0, blocked: 0, standardSteps: 0, extensionSteps: 0 };
        row.total++;
        if (plan.status === 'compiled')
            row.compiled++;
        else
            row.blocked++;
        row.standardSteps += plan.steps.filter(step => step.standard).length;
        row.extensionSteps += plan.steps.filter(step => !step.standard).length;
        counts[plan.specializationId] = row;
    }
    return Object.freeze({ version: WIZARD_EFFECT_PLAN_VERSION, specializationCount: Object.keys(counts).length,
        skillCount: plans.length, compiledCount: plans.filter(p => p.status === 'compiled').length,
        blockedCount: plans.filter(p => p.status !== 'compiled').length,
        standardStepCount: plans.reduce((n, p) => n + p.steps.filter(s => s.standard).length, 0),
        extensionStepCount: plans.reduce((n, p) => n + p.steps.filter(s => !s.standard).length, 0),
        liveCutoverEnabled: false, bySpecialization: Object.freeze(counts) });
}
/**
 * Transactional plan dispatcher. Handlers are injected by trusted runtimes.
 * It clones state first and returns no partial state if any handler fails.
 * A handler signature is (draft, step, context) => void | draft.
 */
export function executeWizardEffectPlanV1916(plan, state, context = {}, handlers = {}) {
    if (!plan || plan.version !== WIZARD_EFFECT_PLAN_VERSION || plan.status !== 'compiled')
        throw new Error('wizard_effect_plan_not_executable');
    const mode = String(context.mode || '');
    if (!['solo', 'party', 'pvp'].includes(mode))
        throw new TypeError(`unsupported_combat_mode:${mode}`);
    const requestId = String(context.requestId || '');
    if (!requestId)
        throw new TypeError('request_id_required');
    const initial = asObject(state);
    const previous = asObject(initial._sharedEffectPlanResults)[requestId];
    if (previous)
        return { state: clone(previous.state), events: clone(previous.events), duplicate: true };
    const draft = clone(initial), events = [];
    for (const step of plan.steps) {
        const handler = handlers[step.handlerId] || handlers[step.kind];
        if (typeof handler !== 'function')
            throw new Error(`effect_handler_missing:${step.handlerId}`);
        const returned = handler(draft, step, Object.freeze({ ...context, mode, requestId, plan }));
        if (returned !== undefined) {
            if (!returned || typeof returned !== 'object' || Array.isArray(returned))
                throw new TypeError(`invalid_effect_handler_result:${step.handlerId}`);
            Object.assign(draft, returned);
        }
        events.push(Object.freeze({ type: 'shared_effect_step', index: step.index, effect: step.kind, scope: step.scope, handlerId: step.handlerId }));
    }
    draft._sharedEffectPlanResults = { ...asObject(draft._sharedEffectPlanResults), [requestId]: { state: clone(draft), events: clone(events) } };
    return { state: draft, events, duplicate: false };
}
