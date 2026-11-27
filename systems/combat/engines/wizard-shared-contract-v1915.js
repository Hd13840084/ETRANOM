/**
 * ETRANOM V1915 — Wizard skill/effect compatibility contract.
 *
 * This module is deliberately non-mutating. It inventories every active Wizard
 * skill and assigns its legacy mechanic to the shared effect vocabulary plus a
 * specialization extension. It does not claim that a mapped effect is already
 * executed by the shared runtime; live execution remains behind the V1914
 * compatibility resolver until per-skill parity tests pass.
 */
import { IMPLEMENTED_SPECIALIZATIONS } from '../specialization-skill-bridge.js?v=1900&build=2081';
import { normalizeSpecializationSkillRecord } from '../specialization-contract-runtime.js?v=1901&build=2081';
import { resolveWizardSkillThroughSharedEngine, getSharedEngineIntegrationAuditV1914 } from './shared-engine-integration-v1914.js?v=1914&build=2081';
export const WIZARD_SHARED_CONTRACT_VERSION = '1915.0.0';
const TYPE_EFFECTS = Object.freeze({
    single_damage: ['damage'], damage: ['damage'],
    shield: ['shield'],
    all_damage: ['damage'], multi_target_damage: ['damage'],
    ultimate_all_damage: ['damage'],
    all_control_damage: ['damage', 'apply_status'],
    all_damage_control: ['damage', 'apply_status'],
    all_damage_debuff: ['damage', 'apply_status'],
    all_dot_control: ['damage', 'apply_status'],
    single_damage_cleanse: ['damage', 'cleanse'],
    single_damage_drain: ['damage', 'resource_gain'], life_steal: ['damage', 'heal'],
    self_heal_cleanse: ['heal', 'cleanse'], self_revive: ['revive'],
    evasion_counter: ['stat_modifier', 'damage'],
    self_buff: ['stat_modifier'], stance: ['stat_modifier'], empower: ['stat_modifier'],
    legion_defense_buff: ['stat_modifier'], legion_offense_buff: ['stat_modifier'],
    control: ['apply_status'], choice_control: ['apply_status'], control_choice: ['apply_status'],
    debuff_choice: ['apply_status'], true_name_debuff: ['apply_status'],
    purge: ['cleanse', 'dispel'],
    dual_element_combo: ['damage', 'apply_status'],
    repeat_last_spell: ['damage'],
    link: ['apply_status'],
    summon_resource: ['summon', 'resource_gain'], permanent_recruit: ['summon'], soul_command: ['summon'],
    ultimate_choice: ['damage', 'stat_modifier'], ultimate_form: ['stat_modifier']
});
const EXTENSION_BY_SPEC = Object.freeze({
    wizard_arcane_mage: 'wizard.arcane-mage',
    wizard_elementalist: 'wizard.elementalist',
    wizard_warlock: 'wizard.warlock',
    wizard_necromancer: 'wizard.necromancer'
});
const SPECIAL_EXTENSION_TYPES = new Set([
    'evasion_counter', 'dual_element_combo', 'repeat_last_spell', 'link',
    'summon_resource', 'permanent_recruit', 'soul_command', 'true_name_debuff',
    'ultimate_choice', 'ultimate_form', 'choice_control', 'control_choice',
    'debuff_choice', 'legion_defense_buff', 'legion_offense_buff'
]);
const safeObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
export function buildWizardSharedSkillManifest() {
    const rows = [];
    for (const [specializationId, spec] of Object.entries(IMPLEMENTED_SPECIALIZATIONS)) {
        if (!specializationId.startsWith('wizard_'))
            continue;
        const extensionId = EXTENSION_BY_SPEC[specializationId];
        for (const raw of Array.isArray(spec.skills) ? spec.skills : []) {
            const skill = normalizeSpecializationSkillRecord(raw, specializationId);
            const effects = TYPE_EFFECTS[skill.type] || [];
            const requiresExtension = SPECIAL_EXTENSION_TYPES.has(skill.type) || effects.length === 0;
            rows.push(Object.freeze({
                specializationId,
                extensionId,
                skillId: skill.id,
                legacyType: skill.type,
                contractType: skill.contractType,
                resourceType: skill.resourceType,
                resourceCostMode: skill.resourceCostMode,
                cooldownTurns: skill.cooldownTurns,
                standardEffects: Object.freeze([...effects]),
                executionClass: requiresExtension ? 'shared_effects_plus_extension' : 'standard_effect_candidate',
                extensionRequired: requiresExtension,
                catalogEffects: Object.freeze({ ...safeObject(skill.effects) })
            }));
        }
    }
    return Object.freeze(rows);
}
const manifest = buildWizardSharedSkillManifest();
const byKey = new Map(manifest.map(row => [`${row.specializationId}:${row.skillId}`, row]));
export function getWizardSharedContractAuditV1915() {
    const bySpecialization = {};
    for (const row of manifest) {
        const current = bySpecialization[row.specializationId] || { skills: 0, standardCandidates: 0, extensionRequired: 0, unmapped: 0 };
        current.skills++;
        if (row.executionClass === 'standard_effect_candidate')
            current.standardCandidates++;
        if (row.extensionRequired)
            current.extensionRequired++;
        if (!row.standardEffects.length)
            current.unmapped++;
        bySpecialization[row.specializationId] = current;
    }
    return Object.freeze({
        contractVersion: WIZARD_SHARED_CONTRACT_VERSION,
        specializationCount: Object.keys(bySpecialization).length,
        skillCount: manifest.length,
        mappedSkillCount: manifest.filter(row => row.standardEffects.length > 0).length,
        unmappedSkillCount: manifest.filter(row => row.standardEffects.length === 0).length,
        extensionCount: new Set(manifest.map(row => row.extensionId)).size,
        bySpecialization: Object.freeze(bySpecialization),
        liveCutoverReady: false,
        gameplayResolver: 'legacy_compatibility_v1914'
    });
}
export function getWizardSkillContractV1915(specializationId, skillId) {
    return byKey.get(`${String(specializationId)}:${String(skillId)}`) || null;
}
/**
 * V1915 wrapper keeps the proven V1914 gameplay result unchanged while adding
 * an auditable skill-contract record. The shared runtime is not authoritative
 * for the effect yet; this boundary is the migration/parity gate.
 */
export function resolveWizardSkillThroughSharedEngineV1915({ mode, specializationId, skillId, payload = {}, legacyResolver } = {}) {
    var _a;
    const contract = getWizardSkillContractV1915(specializationId, skillId);
    const result = resolveWizardSkillThroughSharedEngine({ mode, specializationId, skillId, payload, legacyResolver });
    const previousAudit = getSharedEngineIntegrationAuditV1914();
    const audit = Object.freeze({
        ...previousAudit,
        contractVersion: WIZARD_SHARED_CONTRACT_VERSION,
        skillContract: contract,
        sharedEffectMappingComplete: Boolean((_a = contract === null || contract === void 0 ? void 0 : contract.standardEffects) === null || _a === void 0 ? void 0 : _a.length),
        extensionRequired: Boolean(contract === null || contract === void 0 ? void 0 : contract.extensionRequired),
        liveExecution: false,
        legacyResultPreserved: true
    });
    lastAudit = audit;
    return result;
}
let lastAudit = null;
export function getSharedEngineIntegrationAuditV1915() {
    return lastAudit || Object.freeze({ ...getSharedEngineIntegrationAuditV1914(), contractVersion: WIZARD_SHARED_CONTRACT_VERSION, liveExecution: false });
}
