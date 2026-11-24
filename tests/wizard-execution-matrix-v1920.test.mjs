import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWizardEffectPlanCatalogV1916 } from '../systems/combat/engines/wizard-effect-plan-v1916.js';
import { createWizardCompleteEffectHandlersV1918, auditWizardCompleteEffectCoverageV1918 } from '../systems/combat/engines/wizard-specialization-extensions-v1918.js';
import { executeWizardEffectPlanV1917 } from '../systems/combat/engines/wizard-effect-handlers-v1917.js';

const plans = buildWizardEffectPlanCatalogV1916();
const handlers = createWizardCompleteEffectHandlersV1918();
const modes = ['solo', 'party', 'pvp'];

function fixture(plan, mode) {
  const actor = {
    id: 'wizard-test-actor', hp: 80, maxHp: 100, mp: 50, maxMp: 60,
    mana: 50, maxMana: 60, magicPower: 40, attack: 30,
    legion: [{ id: 'legion-1', hp: 30, maxHp: 30, active: true }],
    classProgress: {
      wizard_arcane_mage: {}, wizard_elementalist: {}, wizard_warlock: {},
      wizard_necromancer: { souls: 8, legion: [{ id: 'legion-1', hp: 30, maxHp: 30, active: true }] }
    },
    necromancerProgress: { souls: 8, legion: [{ id: 'legion-1', hp: 30, maxHp: 30, active: true }] }
  };
  const targets = [
    { id: 'mob-1', hp: 100, maxHp: 100, defense: 10 },
    { id: 'corpse-1', hp: 0, maxHp: 100, defense: 10 }
  ];
  const choices = {
    true_name_shatter: 'body', final_covenant: 'annihilation',
    death_memory: 'war', assembly_of_souls: 'hunt'
  };
  const choice = choices[plan.skillId] || 'silence';
  const selectedTargetId = plan.skillId === 'legion' ? 'corpse-1' : 'mob-1';
  const selectedTargetIds = plan.skillId === 'legion' ? [] : ['mob-1'];
  const effectProvider = ({ step }) => ({
    amount: 10, resource: 'mana', status: { id: 'matrix_status', polarity: 'negative', turns: 2 },
    statusIds: [], stat: 'attack', durationTurns: 2,
    summon: { id: 'matrix_summon', hp: 20, maxHp: 20 }, maxSummons: 3,
    hits: 2, hpPct: 25, evasionCharges: 1, counterDamagePct: 10,
    repeatPct: 40, replay: { skillId: 'arcane_bolt', baseAmount: 10, targetId: 'mob-1' },
    elements: ['fire', 'wind'], choice, gain: 2, linkPct: 20,
    sharePct: 20, healedAmount: 10, defensePct: 20, attackPct: 20,
    soulCost: 3, roll: 1, chancePct: 50,
    member: { id: 'recruited-legion-member', hp: 20, maxHp: 20 },
    powerPerSoul: 2, damagePct: 20, legionPct: 20, baseAmount: 10,
    repeatSideEffectsPct: 0, shieldPct: 10, nextSpellDamagePct: 10,
    repeatableStatuses: [],
    // Keep provider output explicit and deterministic for each plan step.
    handlerId: step.handlerId
  });
  return { actor, targets, context: {
    mode, requestId: `v1920:${plan.specializationId}:${plan.skillId}:${mode}`,
    selectedTargetId, selectedTargetIds, payload: { choice }, effectProvider
  }};
}

for (const plan of plans) {
  for (const mode of modes) {
    test(`V1920 executes ${plan.specializationId}/${plan.skillId} in ${mode}`, () => {
      const { actor, targets, context } = fixture(plan, mode);
      const actorBefore = structuredClone(actor);
      const targetsBefore = structuredClone(targets);
      const result = executeWizardEffectPlanV1917(plan, { actor, targets }, context, handlers);
      assert.equal(result.duplicate, false);
      assert.equal(result.events.length, plan.steps.length);
      assert.ok(result.state && Array.isArray(result.state.targets));
      assert.deepEqual(actor, actorBefore, 'executor must not mutate actor input');
      assert.deepEqual(targets, targetsBefore, 'executor must not mutate target input');
      assert.equal(result.state._sharedEffectPlanResults[context.requestId] !== undefined, true);
    });
  }
}

test('V1920 coverage audit confirms all 40 wizard plans have registered handlers', () => {
  const audit = auditWizardCompleteEffectCoverageV1918(plans);
  assert.equal(plans.length, 40);
  assert.equal(audit.missingHandlerCount, 0);
  assert.equal(audit.completeWizardPlanCoverage, true);
  assert.equal(audit.liveCutoverReady, false);
});

test('V1920 fails closed when a required effect handler is absent', () => {
  const plan = plans.find(p => p.skillId === 'arcane_bolt');
  const { actor, targets, context } = fixture(plan, 'solo');
  assert.throws(() => executeWizardEffectPlanV1917(plan, { actor, targets }, context, {}), /effect_handler_missing/);
});

test('V1920 fails closed when a trusted effect provider is missing', () => {
  const plan = plans.find(p => p.skillId === 'arcane_bolt');
  const { actor, targets, context } = fixture(plan, 'solo');
  delete context.effectProvider;
  assert.throws(() => executeWizardEffectPlanV1917(plan, { actor, targets }, context, handlers), /trusted_effect_provider_required/);
});
