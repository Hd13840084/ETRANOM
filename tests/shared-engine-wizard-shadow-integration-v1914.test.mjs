import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveWizardSkillThroughSharedEngine, getSharedEngineIntegrationAuditV1914,
  sharedEngineRegistryV1914
} from '../systems/combat/engines/shared-engine-integration-v1914.js';

const wizardSpecs = ['wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer'];

test('V1914 registry still represents 40 slots with 8 implemented and 32 reserved', () => {
  assert.deepEqual(sharedEngineRegistryV1914.counts, { classes: 10, specializations: 40, implemented: 8, reserved: 32 });
});

test('wizard shadow bridge canonicalizes and preserves the legacy result in all combat modes', () => {
  for (const mode of ['solo','party','pvp']) for (const specializationId of wizardSpecs) {
    const expected = { mode, actor: { id: 'p1', hp: 77, maxHp: 100 }, targets: [{ id: 'm1', hp: 0 }], log: [{ type: 'legacy_result' }] };
    const actual = resolveWizardSkillThroughSharedEngine({
      mode, specializationId, skillId: 'shadow_test_skill',
      payload: { actor: { id: 'p1', hp: 77, maxHp: 100 }, targets: [{ id: 'm1', hp: 0 }] },
      legacyResolver: (id, skillId, payload) => ({ ...expected, mode: payload.mode, skillId, canonicalId: id })
    });
    assert.equal(actual.mode, mode);
    assert.equal(actual.canonicalId, specializationId);
    assert.deepEqual(actual.actor, expected.actor);
    assert.deepEqual(actual.targets, expected.targets);
    assert.equal(actual.log[0].type, 'legacy_result');
    const audit = getSharedEngineIntegrationAuditV1914();
    assert.equal(audit.legacyResultPreserved, true);
    assert.equal(audit.specializationId, specializationId);
    assert.equal(audit.mode, mode);
  }
});

test('V1914 bridge rejects reserved future specializations before legacy execution', () => {
  let called = false;
  assert.throws(() => resolveWizardSkillThroughSharedEngine({
    mode: 'solo', specializationId: 'gunner_1', skillId: 'x',
    legacyResolver: () => { called = true; return {}; }
  }), /not_registered_or_playable/);
  assert.equal(called, false);
});

test('V1914 bridge rejects invalid combat modes', () => {
  assert.throws(() => resolveWizardSkillThroughSharedEngine({ mode: 'raid', specializationId: 'wizard_warlock', skillId: 'x', legacyResolver: () => ({}) }), /unsupported_combat_mode/);
});
