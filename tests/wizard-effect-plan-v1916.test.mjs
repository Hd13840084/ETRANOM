import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WIZARD_EFFECT_PLAN_VERSION, WIZARD_STANDARD_EFFECT_KINDS,
  compileWizardEffectPlanV1916, buildWizardEffectPlanCatalogV1916,
  auditWizardEffectPlansV1916, executeWizardEffectPlanV1916
} from '../systems/combat/engines/wizard-effect-plan-v1916.js';

const specs = ['wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer'];

test('V1916 compiles all 40 authored Wizard skills into ordered immutable plans', () => {
  const plans = buildWizardEffectPlanCatalogV1916();
  assert.equal(plans.length, 40);
  assert.ok(plans.every(p => p.version === WIZARD_EFFECT_PLAN_VERSION && p.status === 'compiled' && p.steps.length));
  assert.deepEqual([...new Set(plans.map(p => p.specializationId))].sort(), [...specs].sort());
  assert.ok(plans.every(p => Object.isFrozen(p) && Object.isFrozen(p.steps)));
});

test('V1916 uses only the closed standard vocabulary or a namespaced specialization extension', () => {
  for (const plan of buildWizardEffectPlanCatalogV1916()) for (const step of plan.steps) {
    if (step.standard) assert.ok(WIZARD_STANDARD_EFFECT_KINDS.has(step.kind));
    else assert.match(step.handlerId, /^wizard\.(arcane-mage|elementalist|warlock|necromancer)\./);
  }
});

test('V1916 preserves explicit multi-step ordering for damage then control and heal then cleanse', () => {
  const rune = compileWizardEffectPlanV1916('wizard_arcane_mage','ancient_rune');
  assert.deepEqual(rune.steps.map(s => s.kind), ['damage','apply_status']);
  const renewal = compileWizardEffectPlanV1916('wizard_elementalist','tidal_renewal');
  assert.deepEqual(renewal.steps.map(s => s.kind), ['heal','cleanse']);
});

test('V1916 requires extension handlers for specialization-only mechanics', () => {
  const recruit = compileWizardEffectPlanV1916('wizard_necromancer','legion');
  assert.equal(recruit.steps[0].handlerId, 'wizard.necromancer.permanent_recruit');
  assert.throws(() => executeWizardEffectPlanV1916(recruit, {}, {mode:'solo',requestId:'r1'}, {}), /effect_handler_missing/);
});

test('V1916 dispatches operations in order and does not mutate caller state', () => {
  const plan = compileWizardEffectPlanV1916('wizard_arcane_mage','ancient_rune');
  const source = { hp: 50, targetHp: 100 };
  const calls = [];
  const result = executeWizardEffectPlanV1916(plan, source, {mode:'solo',requestId:'r2'}, {
    damage(state, step) { calls.push(step.kind); state.targetHp -= 20; },
    apply_status(state, step) { calls.push(step.kind); state.marked = true; }
  });
  assert.deepEqual(calls, ['damage','apply_status']);
  assert.equal(result.state.targetHp, 80);
  assert.equal(result.state.marked, true);
  assert.equal(source.targetHp, 100);
});

test('V1916 dispatcher is idempotent by request id', () => {
  const plan = compileWizardEffectPlanV1916('wizard_arcane_mage','arcane_bolt');
  let calls = 0;
  const handlers = { damage(state) { calls++; state.hp -= 5; } };
  const first = executeWizardEffectPlanV1916(plan, {hp:20}, {mode:'party',requestId:'same'}, handlers);
  const second = executeWizardEffectPlanV1916(plan, first.state, {mode:'party',requestId:'same'}, handlers);
  assert.equal(calls, 1);
  assert.equal(second.duplicate, true);
  assert.equal(second.state.hp, 15);
});

test('V1916 rolls back by withholding draft when a later handler fails', () => {
  const plan = compileWizardEffectPlanV1916('wizard_arcane_mage','ancient_rune');
  const source = { hp: 10 };
  assert.throws(() => executeWizardEffectPlanV1916(plan, source, {mode:'pvp',requestId:'rollback'}, {
    damage(state) { state.hp = 0; }, apply_status() { throw new Error('extension_failure'); }
  }), /extension_failure/);
  assert.equal(source.hp, 10);
});

test('V1916 rejects invalid mode, missing request id, and unknown specialization skills', () => {
  const plan = compileWizardEffectPlanV1916('wizard_arcane_mage','arcane_bolt');
  assert.equal(compileWizardEffectPlanV1916('wizard_necromancer','not_real'), null);
  assert.throws(() => executeWizardEffectPlanV1916(plan, {}, {mode:'raid',requestId:'x'}, {damage(){}}), /unsupported_combat_mode/);
  assert.throws(() => executeWizardEffectPlanV1916(plan, {}, {mode:'solo'}, {damage(){}}), /request_id_required/);
});

test('V1916 audit reports complete four-specialization plan coverage without enabling live cutover', () => {
  const audit = auditWizardEffectPlansV1916();
  assert.equal(audit.specializationCount, 4);
  assert.equal(audit.skillCount, 40);
  assert.equal(audit.compiledCount, 40);
  assert.equal(audit.blockedCount, 0);
  assert.ok(audit.standardStepCount > 0 && audit.extensionStepCount > 0);
  assert.equal(audit.liveCutoverEnabled, false);
});
