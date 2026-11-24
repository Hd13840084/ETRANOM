import test from 'node:test';
import assert from 'node:assert/strict';
import { tickSpecializationTurn } from '../systems/combat/combat-adapters.js';

const cases = [
  ['wizard_arcane_mage', { classProgress: { wizard_arcane_mage: { cooldowns: { arcane_bolt: 2 } } } }, a => a.classProgress.wizard_arcane_mage.cooldowns.arcane_bolt],
  ['warrior_sword_ascetic', { classProgress: { warrior_sword_ascetic: { cooldowns: { black_crescent: 2 }, domain: { active: true, stage: 1, turnsRemaining: 3, waveCounter: 0 } } } }, a => a.classProgress.warrior_sword_ascetic.cooldowns.black_crescent],
  ['warrior_iron_bastion', { skillCooldowns: { ironcleave: 2 }, classProgress: { warrior_iron_bastion: { domain: { active: true, stage: 1, turnsRemaining: 3 } } } }, a => a.skillCooldowns.ironcleave],
  ['warrior_chaos', { level: 10, attack: 100, stamina: 100, classProgress: { warrior_chaos: { cooldowns: { chaos_rend: 2 }, marks: {}, links: {}, buffs: {}, domain: { active: false, stage: 0, turnsRemaining: 0 } } } }, a => a.classProgress.warrior_chaos.cooldowns.chaos_rend],
  ['warrior_apocalypse_harbinger', { attack: 100, classProgress: { warrior_apocalypse_harbinger: { cooldowns: { apoc_strike: 2 }, statuses: {}, buffs: {}, domain: { active: false, stage: 0, turnsRemaining: 0 } } } }, a => a.classProgress.warrior_apocalypse_harbinger.cooldowns.apoc_strike]
];

test('one specialization turn advances each implemented cooldown store once', () => {
  for (const [specializationId, actor, readCooldown] of cases) {
    const result = tickSpecializationTurn(structuredClone(actor), [], { specializationId, turnId: `turn-${specializationId}` });
    assert.equal(readCooldown(result.actor), 1, `${specializationId} cooldown should decrement once`);
    assert.equal(result.actor._combatLifecycleLastTickId, `turn-${specializationId}`);
  }
});

test('duplicate specialization turn id is fully idempotent', () => {
  const actor = { level: 10, attack: 100, stamina: 100, classProgress: { warrior_chaos: { cooldowns: { chaos_rend: 2 }, marks: {}, links: {}, buffs: {}, domain: { active: false, stage: 0, turnsRemaining: 0 } } } };
  const first = tickSpecializationTurn(actor, [], { specializationId: 'warrior_chaos', turnId: 'same-turn' });
  const second = tickSpecializationTurn(first.actor, [], { specializationId: 'warrior_chaos', turnId: 'same-turn' });
  assert.equal(second.duplicate, true);
  assert.equal(second.actor.classProgress.warrior_chaos.cooldowns.chaos_rend, 1);
});

test('specialization lifecycle preserves canonical Warrior signature damage values', async () => {
  const sword = (await import('../content/classes/warrior_sword_ascetic_v1.json', { with: { type: 'json' } })).default;
  const iron = (await import('../content/classes/warrior_iron_bastion_v1.json', { with: { type: 'json' } })).default;
  assert.equal(sword.skills.find(s => s.id === 'black_crescent').powerPct, 280);
  assert.equal(iron.skills.find(s => s.id === 'ironcleave').powerPct, 285);
});
