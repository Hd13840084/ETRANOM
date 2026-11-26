import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCANE_MAGE } from '../../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../../systems/classes/elementalist.js';
import { WARLOCK } from '../../systems/classes/warlock.js';
import { NECROMANCER } from '../../systems/classes/necromancer.js';
import {
  auditWizardDomainFormsV1926,
  buildWizardDomainFormMatrixV1926,
  selectWizardDomainFormV1926,
  resolveWizardDomainSkillFormV1926,
  compileWizardDomainFormPlanV1926
} from '../../systems/combat/engines/wizard-domain-form-engine-v1926.js';
import { CombatAdapter } from '../../systems/combat/combat-adapters.js';

const specs = [ARCANE_MAGE, ELEMENTALIST, WARLOCK, NECROMANCER];
const baseId = form => form.skillId || form.baseSkillId;

test('V1926 confirms exactly two Wizard skill forms: normal and ascended/domain', () => {
  const audit = auditWizardDomainFormsV1926();
  assert.equal(audit.complete, true, audit.errors.join('|'));
  assert.equal(audit.skillFormCount, 2);
  assert.equal(audit.baseSkillCount, 40);
  assert.equal(audit.domainFormCount, 40);
  assert.equal(audit.mappedDomainFormCount, 40);
  assert.equal(audit.specializationCount, 4);
});

test('all four Wizard specializations explicitly declare one second-form choice per Domain activation', () => {
  const audit = auditWizardDomainFormsV1926();
  assert.deepEqual(audit.warnings, []);
  for (const spec of specs) {
    assert.equal(spec.progression.ascendedSkillChoiceCount, 1);
    assert.equal(spec.progression.ascendedSkillSelectionLimitPerDomain ?? spec.ascendedSkillRule?.selectionLimitPerDomain, 1);
    assert.equal(spec.progression.ascendedSkillUsesPerDomain ?? spec.ascendedSkillRule?.usesPerDomain, 1);
  }
});

test('all 40 authored ascended records map one-to-one to the 40 base skills', () => {
  const matrix = buildWizardDomainFormMatrixV1926();
  assert.equal(matrix.length, 40);
  assert.equal(new Set(matrix.map(row => `${row.specializationId}:${row.skillId}`)).size, 40);
  assert.ok(matrix.every(row => row.normalForm === 'authored' && row.domainForm === 'authored_ascended_skill'));
  for (const spec of specs) {
    assert.equal(spec.skills.length, 10);
    assert.equal(spec.ascendedSkills.length, 10);
    assert.deepEqual(new Set(spec.skills.map(s => s.id)), new Set(spec.ascendedSkills.map(baseId)));
  }
});

test('outside Domain every skill resolves to its normal definition', () => {
  for (const spec of specs) for (const skill of spec.skills) {
    const result = resolveWizardDomainSkillFormV1926({ specialization: spec, progress: { domainActive: false }, skillId: skill.id });
    assert.equal(result.activeForm, 'normal');
    assert.equal(result.effectiveSkill.id, skill.id);
    assert.equal(result.isDomainForm, false);
  }
});

test('inside Domain without a selected form the base skill remains normal pending selection', () => {
  const result = resolveWizardDomainSkillFormV1926({ specialization: ARCANE_MAGE, progress: { domainActive: true }, skillId: 'arcane_bolt' });
  assert.equal(result.activeForm, 'normal');
  assert.equal(result.domainFormPendingSelection, true);
});

test('selecting one ascension activates it as the mapped base skill second form', () => {
  const progress = { domainActive: true, domainActivationId: 'act-1' };
  const selected = selectWizardDomainFormV1926({ specialization: ARCANE_MAGE, progress, formId: 'asc_arcane_bolt', activationId: 'act-1' });
  const result = resolveWizardDomainSkillFormV1926({ specialization: ARCANE_MAGE, progress: selected.progress, skillId: 'arcane_bolt' });
  assert.equal(result.activeForm, 'domain');
  assert.equal(result.isDomainForm, true);
  assert.equal(result.effectiveSkill.id, 'arcane_bolt');
  assert.equal(result.effectiveSkill.domainFormId, 'asc_arcane_bolt');
  assert.equal(result.effectiveSkill.damagePct, ARCANE_MAGE.ascendedSkills.find(x => x.id === 'asc_arcane_bolt').damagePct);
  assert.equal(selected.progress.ascendedSkillUsedThisDomain, true);
});

test('the other nine base skills remain normal when one domain form is selected', () => {
  const selected = selectWizardDomainFormV1926({ specialization: ELEMENTALIST, progress: { domainActive: true }, formId: 'asc_ember_bolt' });
  const other = ELEMENTALIST.skills.find(s => s.id !== 'ember_bolt');
  const result = resolveWizardDomainSkillFormV1926({ specialization: ELEMENTALIST, progress: selected.progress, skillId: other.id });
  assert.equal(result.activeForm, 'normal');
  assert.equal(result.anotherSkillSelected, true);
});

test('one domain activation cannot select a second form', () => {
  const selected = selectWizardDomainFormV1926({ specialization: WARLOCK, progress: { domainActive: true }, formId: WARLOCK.ascendedSkills[0].id });
  assert.throws(() => selectWizardDomainFormV1926({ specialization: WARLOCK, progress: selected.progress, formId: WARLOCK.ascendedSkills[1].id }), /already_selected/);
});

test('selection requires active Domain and validates activation ID when present', () => {
  assert.throws(() => selectWizardDomainFormV1926({ specialization: NECROMANCER, progress: {}, formId: NECROMANCER.ascendedSkills[0].id }), /domain_not_active/);
  assert.throws(() => selectWizardDomainFormV1926({ specialization: NECROMANCER, progress: { domainActive: true, domain: { activationId: 'new' } }, formId: NECROMANCER.ascendedSkills[0].id, activationId: 'old' }), /activation_mismatch/);
});

test('unknown selected form IDs are rejected rather than silently substituted', () => {
  assert.throws(() => resolveWizardDomainSkillFormV1926({ specialization: ARCANE_MAGE, progress: { domainActive: true, ascendedSkillId: 'not-real' }, skillId: 'arcane_bolt' }), /selected_domain_form_not_found/);
});

test('shared plan preserves base skill identity and embeds the exact authored domain form', () => {
  const selected = selectWizardDomainFormV1926({ specialization: WARLOCK, progress: { domainActive: true }, formId: 'edict_of_the_true_name' });
  const plan = compileWizardDomainFormPlanV1926('wizard_warlock', 'forbidden_signature', selected.progress);
  assert.equal(plan.status, 'compiled');
  assert.equal(plan.skillId, 'forbidden_signature');
  assert.equal(plan.skillDefinition.domainFormId, 'edict_of_the_true_name');
  assert.equal(plan.isDomainForm, true);
  assert.ok(plan.steps.length > 0);
});

test('all three combat adapters expose the same domain-form contract without changing authority', () => {
  for (const mode of ['solo', 'party', 'pvp']) {
    const adapter = CombatAdapter[mode];
    assert.equal(typeof adapter.wizardDomainForm, 'function');
    assert.equal(typeof adapter.wizardDomainFormPlan, 'function');
    assert.equal(typeof adapter.selectWizardDomainForm, 'function');
    const actor = { classProgress: { wizard_necromancer: { domainActive: true, ascendedSkillId: 'death_claw_ascended' } } };
    const resolved = adapter.wizardDomainForm('wizard_necromancer', 'death_claw', actor);
    assert.equal(resolved.activeForm, 'domain');
    assert.equal(adapter.wizardDomainFormPlan('wizard_necromancer', 'death_claw', actor).isDomainForm, true);
  }
});

test('Arcane Mage canonical persistence key arcaneMage is read by the shared bridge', () => {
  const actor = { classProgress: { arcaneMage: { domainActive: true, ascendedSkillId: 'asc_arcane_shield' } } };
  const result = CombatAdapter.solo.wizardDomainForm('wizard_arcane_mage', 'arcane_shield', actor);
  assert.equal(result.activeForm, 'domain');
  assert.equal(result.domainForm.id, 'asc_arcane_shield');
});
