/**
 * ETRANOM V1924 compatibility facade.
 *
 * Historical V1924 treated Domain Form and Ascension as separate concepts.
 * That model was superseded by the project owner's correction and the
 * canonical V1926 contract: each skill has exactly two forms, normal and its
 * ascended/second form while Domain is active. This file remains only to keep
 * old import names stable; all resolution delegates to V1926. It does not
 * create a new engine or a third skill layer.
 */
import { WIZARD_DOMAIN_FORM_SPECIALIZATIONS_V1926, auditWizardDomainFormsV1926, resolveWizardDomainSkillFormV1926 } from './wizard-domain-form-engine-v1926.js?build=2081';
import { compileWizardEffectPlanV1916 } from './wizard-effect-plan-v1916.js?build=2081';
export const WIZARD_DOMAIN_ASCENSION_CONTRACT_VERSION_V1924 = '1924.1.0-compat';
export const WIZARD_SPECIALIZATIONS_V1924 = WIZARD_DOMAIN_FORM_SPECIALIZATIONS_V1926;
const arr = value => Array.isArray(value) ? value : [];
const text = value => String(value !== null && value !== void 0 ? value : '').trim();
const baseId = form => text((form === null || form === void 0 ? void 0 : form.skillId) || (form === null || form === void 0 ? void 0 : form.baseSkillId));
export function auditWizardDomainAscensionContractV1924() {
    const audit = auditWizardDomainFormsV1926();
    return Object.freeze({
        version: WIZARD_DOMAIN_ASCENSION_CONTRACT_VERSION_V1924,
        specializationCount: audit.specializationCount,
        baseSkillCount: audit.baseSkillCount,
        formCount: audit.domainFormCount,
        mappedFormCount: audit.mappedDomainFormCount,
        skillFormCount: 2,
        complete: audit.complete,
        errors: audit.errors,
        warnings: audit.warnings,
        bySpecialization: audit.bySpecialization,
        executionAuthority: 'legacy_resolver',
        liveCutover: false
    });
}
/** Compatibility name; the selected ascension is the skill's second form. */
export function inspectWizardAscensionRequestV1924(specialization, progress, requestedBaseSkillId, activationId = null) {
    var _a, _b, _c;
    const spec = WIZARD_DOMAIN_FORM_SPECIALIZATIONS_V1926.find(item => item.id === (specialization === null || specialization === void 0 ? void 0 : specialization.id));
    if (!spec)
        throw new Error('wizard_specialization_not_supported');
    const state = progress && typeof progress === 'object' ? progress : {};
    const storedActivation = text(((_a = state.domain) === null || _a === void 0 ? void 0 : _a.activationId) || state.domainActivationId || state._domainActivationId);
    if ((state.domainActive === true || ((_b = state.domain) === null || _b === void 0 ? void 0 : _b.active) === true) && storedActivation && activationId != null && text(activationId) !== storedActivation) {
        throw new Error('domain_activation_mismatch');
    }
    const resolved = resolveWizardDomainSkillFormV1926({ specialization: spec, progress: state, skillId: requestedBaseSkillId });
    const selected = resolved.isDomainForm ? resolved.domainForm : null;
    return Object.freeze({
        domainActive: state.domainActive === true || ((_c = state.domain) === null || _c === void 0 ? void 0 : _c.active) === true,
        selectedAscension: selected,
        effectiveDefinition: resolved.effectiveSkill,
        selectedFormDefinition: selected,
        selectedForDifferentSkill: Boolean(resolved.anotherSkillSelected),
        activeForm: resolved.isDomainForm ? 'ascension' : 'normal',
        execution: 'inspection_only'
    });
}
/** Stable 40-skill matrix; one normal and one ascended/second form per skill. */
export function buildWizardExecutionMatrixV1924() {
    return Object.freeze(WIZARD_DOMAIN_FORM_SPECIALIZATIONS_V1926.flatMap(spec => arr(spec.skills).map(skill => {
        const form = arr(spec.ascendedSkills).find(item => baseId(item) === text(skill.id)) || null;
        const plan = compileWizardEffectPlanV1916(spec.id, skill.id);
        return Object.freeze({
            specializationId: spec.id,
            skillId: text(skill.id),
            basePlanStatus: (plan === null || plan === void 0 ? void 0 : plan.status) || 'missing',
            basePlanSteps: arr(plan === null || plan === void 0 ? void 0 : plan.steps).length,
            normalForm: 'authored',
            secondFormId: (form === null || form === void 0 ? void 0 : form.id) || null,
            secondFormSource: form ? 'ascendedSkills' : 'missing',
            skillFormCount: 2,
            authoritativeResolver: 'legacy'
        });
    })));
}
