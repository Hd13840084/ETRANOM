import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWizardSharedSkillManifest,
  getWizardSharedContractAuditV1915,
  getWizardSkillContractV1915,
  resolveWizardSkillThroughSharedEngineV1915,
  getSharedEngineIntegrationAuditV1915
} from '../systems/combat/engines/wizard-shared-contract-v1915.js';

const specs = ['wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer'];

test('V1915 inventories all currently authored Wizard skills without inventing content', () => {
  const rows = buildWizardSharedSkillManifest();
  assert.equal(rows.length, 40);
  assert.deepEqual([...new Set(rows.map(x => x.specializationId))].sort(), [...specs].sort());
  assert.ok(rows.every(x => x.extensionId && x.skillId && x.legacyType));
});

test('V1915 assigns every Wizard skill to at least one standard effect family', () => {
  const rows = buildWizardSharedSkillManifest();
  const unmapped = rows.filter(row => row.standardEffects.length === 0);
  assert.deepEqual(unmapped.map(row => `${row.specializationId}:${row.skillId}`), []);
  assert.ok(rows.every(row => ['standard_effect_candidate','shared_effects_plus_extension'].includes(row.executionClass)));
});

test('V1915 audit reports four extension namespaces and explicitly blocks live cutover', () => {
  const audit = getWizardSharedContractAuditV1915();
  assert.equal(audit.specializationCount, 4);
  assert.equal(audit.skillCount, 40);
  assert.equal(audit.mappedSkillCount, 40);
  assert.equal(audit.unmappedSkillCount, 0);
  assert.equal(audit.extensionCount, 4);
  assert.equal(audit.liveCutoverReady, false);
});

test('V1915 maps every existing skill id and preserves the current legacy result', () => {
  const row = buildWizardSharedSkillManifest()[0];
  assert.equal(getWizardSkillContractV1915(row.specializationId, row.skillId).skillId, row.skillId);
  const expected = { mode: 'solo', actor: { id: 'p1', hp: 70, maxHp: 100 }, targets: [{ id: 'm1', hp: 0 }], log: [{ type: 'legacy_result' }] };
  const actual = resolveWizardSkillThroughSharedEngineV1915({
    mode: 'solo', specializationId: row.specializationId, skillId: row.skillId,
    payload: { actor: expected.actor, targets: expected.targets, requestId: 'v1915-test-1' },
    legacyResolver: (id, skillId, payload) => ({ ...expected, mode: payload.mode, canonicalId: id, skillId })
  });
  assert.equal(actual.canonicalId, row.specializationId);
  assert.deepEqual(actual.actor, expected.actor);
  assert.deepEqual(actual.targets, expected.targets);
  assert.equal(actual.log[0].type, 'legacy_result');
  const audit = getSharedEngineIntegrationAuditV1915();
  assert.equal(audit.liveExecution, false);
  assert.equal(audit.legacyResultPreserved, true);
  assert.equal(audit.skillContract.skillId, row.skillId);
});

test('V1915 rejects an unknown skill contract before it can be reported as mapped', () => {
  assert.equal(getWizardSkillContractV1915('wizard_necromancer', 'not_a_real_skill'), null);
});

test('V1915 contract wrapper preserves legacy execution for all 4 Wizard specs in Solo, Party and PvP', () => {
  for (const mode of ['solo','party','pvp']) for (const specializationId of specs) {
    const skill = buildWizardSharedSkillManifest().find(row => row.specializationId === specializationId);
    const expected = { actor: { id: 'actor-1', hp: 80, maxHp: 100 }, targets: [{ id: 'target-1', hp: 0 }], log: [{ type: 'kept' }] };
    const result = resolveWizardSkillThroughSharedEngineV1915({
      mode, specializationId, skillId: skill.skillId,
      payload: { actor: expected.actor, targets: expected.targets, requestId: `v1915:${mode}:${specializationId}` },
      legacyResolver: (canonicalId, skillId, payload) => ({ ...expected, mode: payload.mode, specializationId: canonicalId, skillId })
    });
    assert.equal(result.mode, mode);
    assert.equal(result.specializationId, specializationId);
    assert.deepEqual(result.actor, expected.actor);
    assert.deepEqual(result.targets, expected.targets);
    assert.deepEqual(result.log, expected.log);
    const audit = getSharedEngineIntegrationAuditV1915();
    assert.equal(audit.mode, mode);
    assert.equal(audit.specializationId, specializationId);
    assert.equal(audit.liveExecution, false);
  }
});
