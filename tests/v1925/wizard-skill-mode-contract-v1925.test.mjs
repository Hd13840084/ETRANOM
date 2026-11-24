import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCANE_MAGE } from '../../systems/classes/arcane-mage.js';
import { auditWizardSkillModeCatalogV1925, buildWizardSkillModeMatrixV1925, resolveWizardSkillLayersV1925 } from '../../systems/combat/engines/wizard-skill-mode-contract-v1925.js';

const active = { domainActive: true, domainActivationId: 'domain-live-1' };

test('V1925 compatibility audit reports exactly two forms for all 40 Wizard skills', () => {
  const audit = auditWizardSkillModeCatalogV1925();
  assert.equal(audit.specializationCount, 4);
  assert.equal(audit.baseSkillCount, 40);
  assert.equal(audit.formCount, 40);
  assert.equal(audit.mappedFormCount, 40);
  assert.equal(audit.skillFormCount, 2);
  assert.equal(audit.complete, true);
  assert.equal(audit.liveCutover, false);
});

test('outside Domain only the normal form is active', () => {
  const result = resolveWizardSkillLayersV1925({ specialization: ARCANE_MAGE, skillId: 'arcane_bolt', progress: {} });
  assert.equal(result.status, 'ready');
  assert.equal(result.activeForm, 'normal');
  assert.equal(result.normalForm.id, 'arcane_bolt');
  assert.equal(result.ascensionForm, null);
  assert.equal(result.effectiveSkill.id, 'arcane_bolt');
});

test('inside Domain the selected ascension is the second form of its linked skill', () => {
  const progress = { ...active, ascendedSkillId: 'asc_arcane_bolt' };
  const same = resolveWizardSkillLayersV1925({ specialization: ARCANE_MAGE, skillId: 'arcane_bolt', progress, activationId: 'domain-live-1' });
  const other = resolveWizardSkillLayersV1925({ specialization: ARCANE_MAGE, skillId: 'arcane_shield', progress, activationId: 'domain-live-1' });
  assert.equal(same.activeForm, 'ascension');
  assert.equal(same.ascensionForm.id, 'asc_arcane_bolt');
  assert.equal(same.effectiveSkill.id, 'arcane_bolt');
  assert.equal(other.activeForm, 'normal');
  assert.equal(other.ascensionForm, null);
  assert.equal(other.selectedForDifferentSkill, true);
});

test('stale activation is rejected when an activation id is stored', () => {
  assert.throws(() => resolveWizardSkillLayersV1925({ specialization: ARCANE_MAGE, skillId: 'arcane_bolt', progress: active, activationId: 'old-domain' }), /domain_activation_mismatch/);
});

test('matrix has 40 rows and no third Domain-form layer', () => {
  const matrix = buildWizardSkillModeMatrixV1925();
  assert.equal(matrix.length, 40);
  assert.ok(matrix.every(row => row.normalForm === 'authored'));
  assert.ok(matrix.every(row => row.ascensionForm === 'authored'));
  assert.ok(matrix.every(row => row.skillFormCount === 2));
  assert.ok(matrix.every(row => !Object.hasOwn(row, 'domainForm')));
});
