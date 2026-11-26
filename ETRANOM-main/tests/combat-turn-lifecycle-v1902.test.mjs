import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCombatSkill, tickCombatStatuses } from '../systems/combat/shared-skill-runtime.js';
import { CombatAdapter } from '../systems/combat/combat-adapters.js';

test('cooldown reduction is applied once when a shared skill is used', () => {
  const result = resolveCombatSkill({
    skill: { id: 'cooldown_probe', type: 'single_damage', damagePct: 100, manaCost: 0, cooldownTurns: 4 },
    actor: { id: 'hero', hp: 100, maxHp: 100, mp: 10, attack: 20 },
    effects: { cooldownReductionTurns: 1, cooldownReductionPct: 25 },
    targets: [{ id: 'enemy', hp: 100, maxHp: 100, defense: 0 }]
  });
  assert.equal(result.actor.skillCooldowns.cooldown_probe, 2);
});

test('authoritative player turn tick decrements cooldowns and nested specialization cooldowns', () => {
  const result = tickCombatStatuses({
    skillCooldowns: { a: 2, b: 1 },
    classProgress: { warrior_chaos: { cooldowns: { chaos_rend: 3 } } },
    statuses: { burn: { turns: 2, dotPct: 1 } }, hp: 100, maxHp: 100
  }, { turnId: 'round-7' });
  assert.deepEqual(result.combatant.skillCooldowns, { a: 1 });
  assert.deepEqual(result.combatant.classProgress.warrior_chaos.cooldowns, { chaos_rend: 2 });
  assert.equal(result.combatant.statuses.burn.turns, 1);
});

test('same authoritative turn id cannot decrement cooldowns twice', () => {
  const first = CombatAdapter.solo.tick({ skillCooldowns: { a: 2 }, hp: 100, maxHp: 100, statuses: { burn: { turns: 3, dotPct: 1 } } }, { turnId: 'turn-1' });
  const second = CombatAdapter.solo.tick(first.combatant, { turnId: 'turn-1' });
  assert.equal(first.combatant.skillCooldowns.a, 1);
  assert.equal(second.combatant.skillCooldowns.a, 1);
  assert.equal(second.combatant.statuses.burn.turns, 2);
});

test('expired or depleted shields are removed by the shared lifecycle', () => {
  const result = tickCombatStatuses({ hp: 100, maxHp: 100, shield: { hp: 0, turns: 2 } });
  assert.equal(result.combatant.shield, null);
});


test('cooldown-only lifecycle tick leaves timed statuses untouched when requested', () => {
  const result = CombatAdapter.solo.tick({
    skillCooldowns: { a: 2 }, hp: 100, maxHp: 100,
    statuses: { burn: { turns: 3, dotPct: 5 } },
    shield: { hp: 20, turns: 2 }, buffs: { haste: { turns: 2 } }
  }, { turnId: 'solo:probe:1', tickStatuses: false });
  assert.equal(result.combatant.skillCooldowns.a, 1);
  assert.equal(result.combatant.statuses.burn.turns, 3);
  assert.equal(result.combatant.shield.turns, 2);
  assert.equal(result.combatant.buffs.haste.turns, 2);
});

test('lifecycle ticks snake_case and specialization progress cooldown storage', () => {
  const result = tickCombatStatuses({
    skill_cooldowns: { top: 2 },
    class_progress: { wizard_necromancer: { skill_cooldowns: { soul_command: 3 } } },
    specialization_progress: { cooldowns: { domain_burst: 1 } }
  }, { turnId: 'compat:snake:1', tickStatuses: false });
  assert.deepEqual(result.combatant.skill_cooldowns, { top: 1 });
  assert.deepEqual(result.combatant.class_progress.wizard_necromancer.skill_cooldowns, { soul_command: 2 });
  assert.deepEqual(result.combatant.specialization_progress.cooldowns, {});
});

test('lifecycle decrements both camelCase and snake_case progress maps without touching other data', () => {
  const result = tickCombatStatuses({
    classProgress: { wizard_warlock: { skillCooldowns: { pact: 2 }, skill_cooldowns: { hunger: 4 }, unrelated: 9 } },
    specializationProgress: { cooldowns: { ascension: 2 }, marker: 'keep' }
  }, { turnId: 'compat:mixed:1', tickStatuses: false });
  const progress = result.combatant.classProgress.wizard_warlock;
  assert.deepEqual(progress.skillCooldowns, { pact: 1 });
  assert.deepEqual(progress.skill_cooldowns, { hunger: 3 });
  assert.equal(progress.unrelated, 9);
  assert.deepEqual(result.combatant.specializationProgress.cooldowns, { ascension: 1 });
  assert.equal(result.combatant.specializationProgress.marker, 'keep');
});
