/**
 * ETRANOM V1926 — Canonical Wizard Domain Form / Ascension bridge.
 *
 * Source-of-truth rule confirmed by the project owner:
 * `ascendedSkills` ARE the domain forms of the ten base skills. There is no
 * third skill layer. Each ascended record maps to exactly one base skill via
 * `skillId` or `baseSkillId`; while Domain is active, the selected record is
 * the alternate form of that base skill.
 *
 * This module is pure. It does not mutate persistence, execute combat effects,
 * or replace the legacy resolver. It provides a validated form selection and
 * an effective skill definition for the shared-runtime shadow/parity phase.
 */
import { ARCANE_MAGE } from '../../classes/arcane-mage.js?build=2081';
import { ELEMENTALIST } from '../../classes/elementalist.js?build=2081';
import { WARLOCK } from '../../classes/warlock.js?build=2081';
import { NECROMANCER } from '../../classes/necromancer.js?build=2081';
import { compileWizardEffectPlanV1916 } from './wizard-effect-plan-v1916.js?build=2081';
export const WIZARD_DOMAIN_FORM_ENGINE_VERSION_V1926 = '1926.0.0';
export const WIZARD_DOMAIN_FORM_SPECIALIZATIONS_V1926 = Object.freeze([
    ARCANE_MAGE, ELEMENTALIST, WARLOCK, NECROMANCER
]);
const arr = value => Array.isArray(value) ? value : [];
const obj = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const text = value => String(value !== null && value !== void 0 ? value : '').trim();
const clone = value => value == null ? value : structuredClone(value);
const formBaseId = form => text((form === null || form === void 0 ? void 0 : form.skillId) || (form === null || form === void 0 ? void 0 : form.baseSkillId));
const domainIsActive = progress => { var _a; return (progress === null || progress === void 0 ? void 0 : progress.domainActive) === true || ((_a = progress === null || progress === void 0 ? void 0 : progress.domain) === null || _a === void 0 ? void 0 : _a.active) === true; };
const selectedFormId = progress => { var _a, _b; return text(((_a = progress === null || progress === void 0 ? void 0 : progress.domain) === null || _a === void 0 ? void 0 : _a.ascensionId) || ((_b = progress === null || progress === void 0 ? void 0 : progress.domain) === null || _b === void 0 ? void 0 : _b.ascendedSkillId) || (progress === null || progress === void 0 ? void 0 : progress.ascendedSkillId)); };
export function getWizardDomainFormSpecializationV1926(input) {
    if (input && typeof input === 'object')
        return input;
    return WIZARD_DOMAIN_FORM_SPECIALIZATIONS_V1926.find(spec => spec.id === text(input)) || null;
}
/** Audit the authored 10 base skills <-> 10 ascended/domain forms mapping. */
export function auditWizardDomainFormsV1926(input = null) {
    var _a, _b;
    const specs = input ? [getWizardDomainFormSpecializationV1926(input)].filter(Boolean) : WIZARD_DOMAIN_FORM_SPECIALIZATIONS_V1926;
    const errors = [];
    const warnings = [];
    const bySpecialization = {};
    let baseSkillCount = 0;
    let domainFormCount = 0;
    let mappedCount = 0;
    let compiledBasePlanCount = 0;
    let blockedBasePlanCount = 0;
    for (const spec of specs) {
        const skills = arr(spec.skills);
        const forms = arr(spec.ascendedSkills);
        const skillIds = skills.map(skill => text(skill === null || skill === void 0 ? void 0 : skill.id));
        const formIds = forms.map(form => text(form === null || form === void 0 ? void 0 : form.id));
        const linkedIds = forms.map(formBaseId);
        const local = [];
        if (!text(spec.id))
            local.push('specialization_id_missing');
        if (skills.length !== 10)
            local.push(`base_skill_count:${skills.length}/10`);
        if (forms.length !== 10)
            local.push(`domain_form_count:${forms.length}/10`);
        if (skillIds.some(id => !id) || new Set(skillIds).size !== skillIds.length)
            local.push('base_skill_ids_invalid');
        if (formIds.some(id => !id) || new Set(formIds).size !== formIds.length)
            local.push('domain_form_ids_invalid');
        if (linkedIds.some(id => !id) || new Set(linkedIds).size !== linkedIds.length)
            local.push('domain_form_base_refs_invalid');
        for (const id of linkedIds)
            if (id && !skillIds.includes(id))
                local.push(`unknown_base_skill:${id}`);
        for (const id of skillIds)
            if (id && !linkedIds.includes(id))
                local.push(`missing_domain_form:${id}`);
        const plans = skills.map(skill => compileWizardEffectPlanV1916(spec.id, skill.id));
        const compiled = plans.filter(plan => (plan === null || plan === void 0 ? void 0 : plan.status) === 'compiled').length;
        const mapped = linkedIds.filter(id => id && skillIds.includes(id)).length;
        // Preserve source discrepancies as warnings; never silently normalize them.
        const progression = obj(spec.progression);
        const ascensionRule = obj(spec.ascendedSkillRule);
        const choiceCount = progression.ascendedSkillChoiceCount;
        const selectionLimit = (_a = progression.ascendedSkillSelectionLimitPerDomain) !== null && _a !== void 0 ? _a : ascensionRule.selectionLimitPerDomain;
        const usesPerDomain = (_b = progression.ascendedSkillUsesPerDomain) !== null && _b !== void 0 ? _b : ascensionRule.usesPerDomain;
        if (choiceCount != null && Number(choiceCount) !== 1)
            warnings.push(`${spec.id}:ascendedSkillChoiceCount_is_${choiceCount}_but_selection_limit_is_${selectionLimit !== null && selectionLimit !== void 0 ? selectionLimit : 'unspecified'}`);
        if (selectionLimit != null && Number(selectionLimit) !== 1)
            warnings.push(`${spec.id}:selection_limit_per_domain_is_${selectionLimit}`);
        if (usesPerDomain != null && Number(usesPerDomain) !== 1)
            warnings.push(`${spec.id}:uses_per_domain_is_${usesPerDomain}`);
        if (choiceCount == null && selectionLimit == null && usesPerDomain == null)
            warnings.push(`${spec.id}:domain_form_usage_rule_not_explicit_in_progression_metadata`);
        baseSkillCount += skills.length;
        domainFormCount += forms.length;
        mappedCount += mapped;
        compiledBasePlanCount += compiled;
        blockedBasePlanCount += plans.length - compiled;
        for (const error of local)
            errors.push(`${spec.id}:${error}`);
        bySpecialization[spec.id] = Object.freeze({
            baseSkills: skills.length,
            domainForms: forms.length,
            mappedDomainForms: mapped,
            compiledBasePlans: compiled,
            blockedBasePlans: plans.length - compiled,
            status: local.length ? 'invalid' : 'complete',
            errors: Object.freeze(local)
        });
    }
    const expected = specs.length * 10;
    return Object.freeze({
        version: WIZARD_DOMAIN_FORM_ENGINE_VERSION_V1926,
        specializationCount: specs.length,
        baseSkillCount,
        domainFormCount,
        mappedDomainFormCount: mappedCount,
        compiledBasePlanCount,
        blockedBasePlanCount,
        complete: baseSkillCount === expected && domainFormCount === expected && mappedCount === expected && errors.length === 0,
        errors: Object.freeze(errors),
        warnings: Object.freeze(warnings),
        bySpecialization: Object.freeze(bySpecialization),
        semanticRule: 'ascendedSkills_are_domain_forms',
        skillFormCount: 2,
        liveCutover: false
    });
}
/**
 * Select one of the ten domain forms for the active activation.
 * Selection state uses the existing project fields for compatibility.
 * If an activationId exists in the stored state it must match; older saved
 * progress without an activationId remains supported under the existing
 * one-selection-per-domain flags.
 */
export function selectWizardDomainFormV1926({ specialization: input, progress = {}, formId, activationId = null } = {}) {
    var _a, _b, _c, _d, _e;
    const spec = getWizardDomainFormSpecializationV1926(input);
    if (!spec)
        throw new Error('wizard_specialization_not_supported');
    const audit = auditWizardDomainFormsV1926(spec);
    if (!audit.complete)
        throw new Error(`invalid_domain_form_catalog:${audit.errors.join(',')}`);
    const state = clone(obj(progress));
    if (!domainIsActive(state))
        throw new Error('domain_not_active');
    const storedActivation = text(((_a = state.domain) === null || _a === void 0 ? void 0 : _a.activationId) || state.domainActivationId || state._domainActivationId);
    if (storedActivation && text(activationId) !== storedActivation)
        throw new Error('domain_activation_mismatch');
    if (state.ascendedSkillUsedThisDomain === true || ((_b = state.domain) === null || _b === void 0 ? void 0 : _b.ascensionUsed) === true || ((_c = state.domain) === null || _c === void 0 ? void 0 : _c.ascendedUsed) === true || state.ascendedSkillId || ((_d = state.domain) === null || _d === void 0 ? void 0 : _d.ascensionId) || ((_e = state.domain) === null || _e === void 0 ? void 0 : _e.ascendedSkillId)) {
        throw new Error('domain_form_already_selected_this_activation');
    }
    const form = arr(spec.ascendedSkills).find(item => text(item.id) === text(formId));
    if (!form)
        throw new Error('domain_form_not_found');
    const baseSkillId = formBaseId(form);
    const baseSkill = arr(spec.skills).find(item => text(item.id) === baseSkillId);
    if (!baseSkill)
        throw new Error('domain_form_base_skill_not_found');
    state.ascendedSkillId = text(form.id);
    state.ascendedSkillUsedThisDomain = true;
    state.ascendedUsesThisDomain = 1;
    state.domain = {
        ...obj(state.domain),
        active: true,
        ...(storedActivation ? { activationId: storedActivation } : {}),
        ascensionUsed: true,
        ascendedUsed: true,
        ascensionId: text(form.id),
        ascendedSkillId: text(form.id),
        ascensionBaseSkillId: baseSkillId
    };
    return Object.freeze({
        progress: state,
        selectedForm: clone(form),
        baseSkill: clone(baseSkill),
        baseSkillId,
        selectedFormId: text(form.id)
    });
}
/**
 * Resolve a base skill to its active form. Outside Domain, always returns the
 * base skill. During Domain, only the selected skill receives its mapped form;
 * the other nine skills remain in their normal form. No ascension is cloned or
 * synthesized: the complete authored form object is retained.
 */
export function resolveWizardDomainSkillFormV1926({ specialization: input, progress = {}, skillId } = {}) {
    var _a, _b;
    const spec = getWizardDomainFormSpecializationV1926(input);
    if (!spec)
        throw new Error('wizard_specialization_not_supported');
    const baseSkill = arr(spec.skills).find(skill => text(skill.id) === text(skillId));
    if (!baseSkill)
        throw new Error('wizard_base_skill_not_found');
    const state = obj(progress);
    if (!domainIsActive(state)) {
        return Object.freeze({ status: 'ready', activeForm: 'normal', specializationId: spec.id, skillId: text(skillId), baseSkill: clone(baseSkill), effectiveSkill: clone(baseSkill), domainForm: null, isDomainForm: false });
    }
    const selectedId = selectedFormId(state);
    if (!selectedId) {
        return Object.freeze({ status: 'ready', activeForm: 'normal', specializationId: spec.id, skillId: text(skillId), baseSkill: clone(baseSkill), effectiveSkill: clone(baseSkill), domainForm: null, isDomainForm: false, domainFormPendingSelection: true });
    }
    const form = arr(spec.ascendedSkills).find(item => text(item.id) === selectedId);
    if (!form)
        throw new Error('selected_domain_form_not_found');
    if (formBaseId(form) !== text(skillId)) {
        return Object.freeze({ status: 'ready', activeForm: 'normal', specializationId: spec.id, skillId: text(skillId), baseSkill: clone(baseSkill), effectiveSkill: clone(baseSkill), domainForm: null, isDomainForm: false, anotherSkillSelected: true });
    }
    // Keep the base ID/type identity for legacy handler compatibility, but use
    // every authored domain-form value (cost, cooldown, effects, stages, target).
    const effectiveSkill = {
        ...clone(baseSkill),
        ...clone(form),
        id: text(baseSkill.id),
        baseSkillId: text(baseSkill.id),
        domainFormId: text(form.id),
        domainFormName: (_a = form.name) !== null && _a !== void 0 ? _a : null,
        domainFormNameEn: (_b = form.en) !== null && _b !== void 0 ? _b : null,
        isDomainForm: true,
        domainFormSource: 'ascendedSkills'
    };
    return Object.freeze({
        status: 'ready', activeForm: 'domain', specializationId: spec.id,
        skillId: text(skillId), baseSkill: clone(baseSkill), domainForm: clone(form),
        effectiveSkill: Object.freeze(effectiveSkill), isDomainForm: true,
        selectedFormId: selectedId
    });
}
/** Return the exact shared effect plan for the base identity plus authored form. */
export function compileWizardDomainFormPlanV1926(specializationId, skillId, progress = {}) {
    var _a;
    const spec = getWizardDomainFormSpecializationV1926(specializationId);
    if (!spec)
        return null;
    const resolved = resolveWizardDomainSkillFormV1926({ specialization: spec, progress, skillId });
    const basePlan = compileWizardEffectPlanV1916(spec.id, skillId);
    if (!basePlan || basePlan.status !== 'compiled')
        return basePlan;
    return Object.freeze({
        ...basePlan,
        version: basePlan.version,
        skillDefinition: Object.freeze(clone(resolved.effectiveSkill)),
        activeForm: resolved.activeForm,
        domainFormId: ((_a = resolved.domainForm) === null || _a === void 0 ? void 0 : _a.id) || null,
        isDomainForm: resolved.isDomainForm,
        domainFormSource: resolved.isDomainForm ? 'authored_ascended_skill' : null
    });
}
/** Stable 40-skill release matrix. */
export function buildWizardDomainFormMatrixV1926() {
    return Object.freeze(WIZARD_DOMAIN_FORM_SPECIALIZATIONS_V1926.flatMap(spec => arr(spec.skills).map(skill => {
        var _a;
        const form = arr(spec.ascendedSkills).find(item => formBaseId(item) === text(skill.id)) || null;
        return Object.freeze({
            specializationId: spec.id,
            skillId: text(skill.id),
            normalForm: 'authored',
            domainForm: form ? 'authored_ascended_skill' : 'missing',
            domainFormId: (form === null || form === void 0 ? void 0 : form.id) || null,
            domainFormName: (form === null || form === void 0 ? void 0 : form.name) || null,
            executionPlan: ((_a = compileWizardEffectPlanV1916(spec.id, skill.id)) === null || _a === void 0 ? void 0 : _a.status) || 'missing',
            sharedRuntimeStatus: 'shadow_only',
            authoritativeResolver: 'legacy'
        });
    })));
}
export function getWizardDomainFormProgressV1926(actor = {}, specializationId) {
    const all = obj(actor.classProgress || actor.class_progress);
    if (specializationId === 'wizard_arcane_mage')
        return obj(actor.arcaneMageProgress || all.arcaneMage || all[specializationId] || actor.specializationProgress);
    return obj(all[specializationId] || actor.specializationProgress || actor.necromancerProgress);
}
