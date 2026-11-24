import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCANE_MAGE } from '../../systems/classes/arcane-mage.js';
import { auditWizardDomainAscensionContractV1924, buildWizardExecutionMatrixV1924, inspectWizardAscensionRequestV1924 } from '../../systems/combat/engines/wizard-domain-ascension-contract-v1924.js';
import { createDomainAscensionStateV1923, DomainAscensionEngineV1923 } from '../../systems/combat/engines/domain-ascension-engine-v1923.js';

test('V1924 compatibility audit delegates to the canonical two-form contract for all 40 Wizard skills', () => {
  const audit = auditWizardDomainAscensionContractV1924();
  assert.equal(audit.specializationCount, 4);
  assert.equal(audit.baseSkillCount, 40);
  assert.equal(audit.formCount, 40);
  assert.equal(audit.mappedFormCount, 40);
  assert.equal(audit.skillFormCount, 2);
  assert.equal(audit.complete, true);
  assert.equal(audit.liveCutover, false);
});

test('selected second form is the ascension of its matching base skill only', () => {
  const state = createDomainAscensionStateV1923('act-1924');
  const selected = DomainAscensionEngineV1923.select(ARCANE_MAGE, state, 'asc_arcane_bolt', 'act-1924');
  const same = inspectWizardAscensionRequestV1924(ARCANE_MAGE, selected.progress, 'arcane_bolt', 'act-1924');
  const other = inspectWizardAscensionRequestV1924(ARCANE_MAGE, selected.progress, 'arcane_shield', 'act-1924');
  assert.equal(same.effectiveDefinition.id, 'arcane_bolt');
  assert.equal(same.selectedFormDefinition.id, 'asc_arcane_bolt');
  assert.equal(same.activeForm, 'ascension');
  assert.equal(same.selectedForDifferentSkill, false);
  assert.equal(other.effectiveDefinition.id, 'arcane_shield');
  assert.equal(other.selectedForDifferentSkill, true);
});

test('stale activation cannot inspect or replay the selected second form', () => {
  const state = createDomainAscensionStateV1923('act-current');
  assert.throws(() => inspectWizardAscensionRequestV1924(ARCANE_MAGE, state, 'arcane_bolt', 'act-old'), /domain_activation_mismatch/);
});

test('execution matrix has one row per base skill and exactly two forms', () => {
  const matrix = buildWizardExecutionMatrixV1924();
  assert.equal(matrix.length, 40);
  assert.ok(matrix.every(row => row.authoritativeResolver === 'legacy'));
  assert.ok(matrix.every(row => row.basePlanStatus === 'compiled'));
  assert.ok(matrix.every(row => row.secondFormSource === 'ascendedSkills'));
  assert.ok(matrix.every(row => row.skillFormCount === 2));
});
