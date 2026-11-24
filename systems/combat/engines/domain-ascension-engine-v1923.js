/**
 * ETRANOM V1923 — Domain/Ascension bridge for authored specialization data.
 *
 * Important distinction preserved from the content files:
 * - A specialization's normal skill remains the default skill definition.
 * - Its matching ascended skill is a domain-only alternate form.
 * - The ten ascended forms become selectable while the domain is active.
 * - Exactly one ascended form may be selected/consumed per domain activation.
 * - The ascended form is not a second independent button/skill slot; it maps
 *   back to its base skill through skillId/baseSkillId.
 *
 * This module is pure and does not persist state or replace a live resolver.
 */

const arr = value => Array.isArray(value) ? value : [];
const obj = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const str = value => String(value ?? '').trim();
const clone = value => value == null ? value : structuredClone(value);

function baseIdOf(form) {
  return str(form?.skillId || form?.baseSkillId);
}

export function auditDomainAscensionCatalogV1923(specialization) {
  const errors = [];
  const skills = arr(specialization?.skills);
  const ascensions = arr(specialization?.ascendedSkills);
  const skillIds = skills.map(skill => str(skill?.id));
  const baseIds = ascensions.map(baseIdOf);

  if (!str(specialization?.id)) errors.push('specialization_id_required');
  if (skills.length !== 10) errors.push(`base_skill_count:${skills.length}/10`);
  if (ascensions.length !== 10) errors.push(`ascension_form_count:${ascensions.length}/10`);
  if (skillIds.some(id => !id)) errors.push('base_skill_id_missing');
  if (new Set(skillIds).size !== skillIds.length) errors.push('duplicate_base_skill_id');
  if (baseIds.some(id => !id)) errors.push('ascension_base_skill_reference_missing');
  if (new Set(baseIds).size !== baseIds.length) errors.push('duplicate_ascension_base_skill_reference');
  for (const id of baseIds) if (id && !skillIds.includes(id)) errors.push(`ascension_references_unknown_base_skill:${id}`);
  for (const id of skillIds) if (id && !baseIds.includes(id)) errors.push(`base_skill_missing_ascension_form:${id}`);
  for (const form of ascensions) if (!str(form?.id)) errors.push('ascension_id_missing');
  if (new Set(ascensions.map(x => str(x?.id))).size !== ascensions.length) errors.push('duplicate_ascension_id');

  return Object.freeze({
    ok: errors.length === 0,
    specializationId: str(specialization?.id) || null,
    baseSkillCount: skills.length,
    ascensionFormCount: ascensions.length,
    mappedCount: baseIds.filter(id => id && skillIds.includes(id)).length,
    errors: Object.freeze(errors)
  });
}

export class DomainAscensionEngineV1923 {
  static availableForms(specialization, progress) {
    const state = obj(progress);
    if (state.domainActive !== true && state.domain?.active !== true) return Object.freeze([]);
    if (state.ascendedSkillUsedThisDomain === true || state.domain?.ascensionUsed === true) return Object.freeze([]);
    return Object.freeze(arr(specialization?.ascendedSkills).map(clone));
  }

  /**
   * Selects and consumes the one allowed ascended form for this activation.
   * The caller must pass a server-created activationId; a client cannot create
   * or override authoritative domain state.
   */
  static select(specialization, progress, ascensionId, activationId) {
    const audit = auditDomainAscensionCatalogV1923(specialization);
    if (!audit.ok) throw new Error(`invalid_ascension_catalog:${audit.errors.join(',')}`);

    const state = clone(obj(progress));
    const active = state.domainActive === true || state.domain?.active === true;
    if (!active) throw new Error('domain_not_active');
    const storedActivationId = str(state.domain?.activationId || state.domainActivationId || state._domainActivationId);
    if (!str(activationId) || !storedActivationId || storedActivationId !== str(activationId)) {
      throw new Error('domain_activation_mismatch');
    }
    if (state.ascendedSkillUsedThisDomain === true || state.domain?.ascensionUsed === true || state.ascendedSkillId) {
      throw new Error('ascended_skill_already_used');
    }

    const form = arr(specialization.ascendedSkills).find(item => str(item.id) === str(ascensionId));
    if (!form) throw new Error('ascension_not_found');
    const baseSkillId = baseIdOf(form);
    const baseSkill = arr(specialization.skills).find(item => str(item.id) === baseSkillId);
    if (!baseSkill) throw new Error('ascension_base_skill_not_found');

    state.ascendedSkillId = str(form.id);
    state.ascendedSkillUsedThisDomain = true;
    state.ascendedUsesThisDomain = 1;
    state.domain = {
      ...obj(state.domain),
      active: true,
      activationId: str(activationId),
      ascensionUsed: true,
      ascensionId: str(form.id),
      ascensionBaseSkillId: baseSkillId
    };
    return Object.freeze({ progress: state, baseSkill: clone(baseSkill), selectedForm: clone(form) });
  }

  /** Resolve the selected form for the matching base skill; all other skills
   * continue using their ordinary definition during the same domain. */
  static resolveSkill(specialization, progress, skillId) {
    const baseSkill = arr(specialization?.skills).find(item => str(item.id) === str(skillId));
    if (!baseSkill) return null;
    const state = obj(progress);
    const active = state.domainActive === true || state.domain?.active === true;
    if (!active) return clone(baseSkill);
    const selectedId = str(state.domain?.ascensionId || state.ascendedSkillId);
    if (!selectedId) return clone(baseSkill);
    const form = arr(specialization?.ascendedSkills).find(item => str(item.id) === selectedId);
    if (!form || baseIdOf(form) !== str(skillId)) return clone(baseSkill);
    return clone(form);
  }

  /** End-of-domain cleanup: clear only temporary ascension selection state. */
  static endDomain(progress) {
    const state = clone(obj(progress));
    state.domainActive = false;
    state.ascendedSkillId = null;
    state.ascendedSkillUsedThisDomain = false;
    state.ascendedUsesThisDomain = 0;
    if (state.domain && typeof state.domain === 'object') {
      state.domain = { ...state.domain, active: false, ascensionUsed: false, ascensionId: null, ascensionBaseSkillId: null };
    }
    return state;
  }
}

export function createDomainAscensionStateV1923(activationId, existing = {}) {
  if (!str(activationId)) throw new TypeError('domain_activation_id_required');
  return {
    ...clone(obj(existing)),
    domainActive: true,
    domainActivationId: str(activationId),
    ascendedSkillId: null,
    ascendedSkillUsedThisDomain: false,
    ascendedUsesThisDomain: 0,
    domain: { ...obj(existing?.domain), active: true, activationId: str(activationId), ascensionUsed: false, ascensionId: null, ascensionBaseSkillId: null }
  };
}
