import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatAdapter } from '../systems/combat/combat-adapters.js';
import { tickCombatStatuses } from '../systems/combat/shared-skill-runtime.js';

test('shared adapters automatically include equipped and active potion effects', () => {
  const result = CombatAdapter.solo.skill({
    skill: { id: 'gear_strike', type: 'single_damage', damagePct: 100, manaCost: 0 },
    actor: { id: 'a', hp: 100, maxHp: 100, mp: 10, maxMp: 10, attack: 20, equipment: { weapon: { effects: { attack: 5, damagePct: 10 } } } },
    activePotions: [{ effects: { attackPct: 10 } }],
    targets: [{ id: 'e', hp: 100, maxHp: 100, defense: 0 }]
  });
  assert.ok(result.targets[0].hp < 75);
});

test('status tick applies DOT and expires durations, shields, buffs and summons', () => {
  const result = tickCombatStatuses({
    hp: 100, maxHp: 100,
    statuses: { burn: { turns: 1, dotPct: 5 }, slow: { turns: 2, attackReductionPct: 10 } },
    shield: { hp: 10, turns: 1 },
    buffs: { haste: { turns: 1, effects: { speedPct: 10 } } },
    summons: [{ id: 's1', hp: 10, turns: 1 }, { id: 's2', hp: 10, turns: 2 }]
  });
  assert.equal(result.combatant.hp, 95);
  assert.deepEqual(Object.keys(result.combatant.statuses), ['slow']);
  assert.equal(result.combatant.statuses.slow.turns, 1);
  assert.equal(result.combatant.shield, null);
  assert.deepEqual(result.combatant.buffs, {});
  assert.deepEqual(result.combatant.summons.map(x => x.id), ['s2']);
  assert.equal(result.log[0].amount, 5);
});

test('PvP group healing cannot heal the opposing player through target injection', () => {
  const result = CombatAdapter.pvp.skill({
    skill: { id: 'pvp_group_heal', type: 'group_heal', healPct: 25, manaCost: 0 },
    actor: { id: 'a', hp: 40, maxHp: 100, mp: 10, maxMp: 10, magicPower: 20, partyMembers: [{ id: 'b', hp: 1, maxHp: 100 }] },
    targetId: 'b', targets: [{ id: 'b', hp: 100, maxHp: 100 }]
  });
  assert.equal(result.actor.hp, 45);
  assert.equal(result.actor.partyMembers[0].hp, 1);
  assert.equal(result.targets[0].hp, 100);
});
