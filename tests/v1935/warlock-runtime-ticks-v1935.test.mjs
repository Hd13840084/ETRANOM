import test from 'node:test';
import assert from 'node:assert/strict';
import { tickWizardCombatState } from '../../systems/classes/wizard-combat-runtime.js';

test('Heart of the Bound King resolves its configured 120% stored-damage break burst at link expiry', () => {
  const combat = { enemies: [{ hp: 1000, maxHp: 1000, warlockHostage: { turns: 1, storedDamage: 100, breakDamagePct: 120 } }] };
  const result = tickWizardCombatState(combat);
  assert.equal(combat.enemies[0].hp, 880);
  assert.equal(result.damage, 120);
  assert.equal(combat.enemies[0].warlockHostage, undefined);
});

test('Court of Final Verdicts decrees expire after exactly three enemy-response ticks', () => {
  const combat = { enemies: [{ hp: 1000, maxHp: 1000, warlockCourtAll: { turns: 3, reflectPct: 15, manaDrainPct: 3 } }] };
  tickWizardCombatState(combat);
  assert.equal(combat.enemies[0].warlockCourtAll.turns, 2);
  tickWizardCombatState(combat);
  assert.equal(combat.enemies[0].warlockCourtAll.turns, 1);
  tickWizardCombatState(combat);
  assert.equal(combat.enemies[0].warlockCourtAll, undefined);
});

test('Final Covenant boss exhaustion lasts exactly two enemy-response ticks', () => {
  const combat = { warlockCovenantExhaustionTurns: 2, enemies: [] };
  tickWizardCombatState(combat);
  assert.equal(combat.warlockCovenantExhaustionTurns, 1);
  tickWizardCombatState(combat);
  assert.equal(combat.warlockCovenantExhaustionTurns, undefined);
  assert.equal(combat.warlockCovenantDebtLock, undefined);
});

test('Life Siphon returns exactly one tick per enemy response and expires after its configured duration', () => {
  const combat = { enemies: [{ encounterId: 'e1', hp: 1000, maxHp: 1000, necromancerLifeSiphon: { turns: 3, damagePct: 50, healPct: 30 } }] };
  const first = tickWizardCombatState(combat);
  assert.equal(first.lifeSiphons.length, 1);
  assert.equal(first.lifeSiphons[0].targetId, 'e1');
  assert.equal(combat.enemies[0].necromancerLifeSiphon.turns, 2);
  tickWizardCombatState(combat);
  const third = tickWizardCombatState(combat);
  assert.equal(third.lifeSiphons.length, 1);
  assert.equal(combat.enemies[0].necromancerLifeSiphon, undefined);
});
