/**
 * ETRANOM V1925 compatibility facade.
 *
 * The historical V1925 three-layer model is deprecated. The project owner's
 * canonical rule is exactly two forms per skill: normal and ascended/second
 * form while Domain is active. The canonical implementation is V1926; this
 * module only preserves old export names and delegates to that implementation.
 */
import { WIZARD_DOMAIN_FORM_SPECIALIZATIONS_V1926, auditWizardDomainFormsV1926, resolveWizardDomainSkillFormV1926, buildWizardDomainFormMatrixV1926 } from './wizard-domain-form-engine-v1926.js?build=2081';
export const WIZARD_SKILL_MODE_CONTRACT_VERSION_V1925 = '1925.1.0-compat';
export const WIZARD_SKILL_MODE_SPECIALIZATIONS_V1925 = WIZARD_DOMAIN_FORM_SPECIALIZATIONS_V1926;
const text = value => String(value !== null && value !== void 0 ? value : '').trim();
export function auditWizardSkillModeCatalogV1925() {
    const audit = auditWizardDomainFormsV1926();
    return Object.freeze({
        version: WIZARD_SKILL_MODE_CONTRACT_VERSION_V1925,
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
/** Legacy export name; returns only the normal or selected ascended form. */
export function resolveWizardSkillLayersV1925({ specialization: input, specializationId, skillId, progress = {}, activationId = null } = {}) {
    var _a, _b, _c;
    const specialization = input && typeof input === 'object'
        ? input
        : WIZARD_DOMAIN_FORM_SPECIALIZATIONS_V1926.find(spec => spec.id === text(specializationId || input));
    if (!specialization || !text(specialization.id).startsWith('wizard_'))
        throw new Error('wizard_specialization_not_supported');
    const state = progress && typeof progress === 'object' ? progress : {};
    const storedActivation = text(((_a = state.domain) === null || _a === void 0 ? void 0 : _a.activationId) || state.domainActivationId || state._domainActivationId);
    if ((state.domainActive === true || ((_b = state.domain) === null || _b === void 0 ? void 0 : _b.active) === true) && storedActivation && activationId != null && text(activationId) !== storedActivation) {
        throw new Error('domain_activation_mismatch');
    }
    const result = resolveWizardDomainSkillFormV1926({ specialization, progress: state, skillId });
    return Object.freeze({
        version: WIZARD_SKILL_MODE_CONTRACT_VERSION_V1925,
        status: result.status,
        domainActive: state.domainActive === true || ((_c = state.domain) === null || _c === void 0 ? void 0 : _c.active) === true,
        specializationId: specialization.id,
        skillId: text(skillId),
        activeForm: result.isDomainForm ? 'ascension' : 'normal',
        normalForm: result.baseSkill,
        ascensionForm: result.domainForm,
        effectiveSkill: result.effectiveSkill,
        selectedFormId: result.selectedFormId || null,
        selectionPending: Boolean(result.domainFormPendingSelection),
        selectedForDifferentSkill: Boolean(result.anotherSkillSelected),
        execution: 'inspection_only'
    });
}
/** Stable 40-skill matrix with exactly two forms; no independent Domain layer. */
export function buildWizardSkillModeMatrixV1925() {
    return Object.freeze(buildWizardDomainFormMatrixV1926().map(row => Object.freeze({
        specializationId: row.specializationId,
        skillId: row.skillId,
        normalForm: 'authored',
        ascensionForm: row.domainFormId ? 'authored' : 'missing',
        ascensionFormId: row.domainFormId,
        skillFormCount: 2,
        planStatus: row.planStatus || 'compiled',
        authoritativeResolver: 'legacy'
    })));
}
