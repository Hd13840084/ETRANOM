import test from 'node:test';
import assert from 'node:assert/strict';
import { runWizardSharedPlanShadowV1919, auditWizardShadowAdapterModesV1919 } from '../systems/combat/engines/wizard-shadow-adapter-v1919.js';

const actor = { id: 'hero-1', hp: 100, maxHp: 100, mp: 50, maxMp: 50, attack: 20, magicPower: 20 };
const targets = [{ id: 'mob-1', hp: 100, maxHp: 100, defense: 0 }];

test('V1919 runs compiled plan in isolation and keeps legacy result authoritative', () => {
  const result = runWizardSharedPlanShadowV1919({
    mode: 'solo', specializationId: 'wizard_arcane_mage', skillId: 'arcane_bolt',
    actor, targets, selectedTargetId: 'mob-1', requestId: 'req-v1919-1',
    effectProvider: ({ step }) => step.kind === 'damage' ? { amount: 10 } : {}
  });
  assert.equal(result.version, '1919.0.0');
  assert.equal(result.authoritativeSource, 'legacy_resolver');
  assert.equal(result.persisted, false);
  assert.equal(result.liveCutover, false);
  assert.equal(result.shadow.state.targets[0].hp, 90);
  assert.equal(targets[0].hp, 100, 'input target must not be mutated');
  assert.ok(result.authoritativeResult);
});

test('V1919 rejects client-only execution without trusted provider', () => {
  assert.throws(() => runWizardSharedPlanShadowV1919({
    mode: 'party', specializationId: 'wizard_arcane_mage', skillId: 'arcane_bolt',
    actor, targets, requestId: 'req-v1919-2'
  }), /trusted_effect_provider_required/);
});

test('V1919 supports all three mode labels without enabling cutover', () => {
  const audit = auditWizardShadowAdapterModesV1919();
  assert.deepEqual(audit.supportedModes, ['solo', 'party', 'pvp']);
  assert.equal(audit.legacyRemainsAuthoritative, true);
  assert.equal(audit.enablesLiveCutover, false);
});
