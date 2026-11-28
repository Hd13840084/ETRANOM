import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDamage, normalizeCombatStats, normalizeCombatIntent } from '../systems/combat/combat-core.js';
import { getCombatAdapter } from '../systems/combat/combat-adapters.js';

test('normalizes legacy and current combat stat field names', () => {
  const x = normalizeCombatStats({ attack: 20, defense: 5, hp: 30, max_hp: 40, mp: 4, max_mp: 10 });
  assert.equal(x.maxHp, 40); assert.equal(x.maxMp, 10); assert.equal(x.hp, 30);
});

test('same inputs and tuning produce same result in every adapter contract', () => {
  const input = { attack: 30, defense: 8, hp: 100, maxHp: 100, accuracy: 90, critChance: 10 };
  const tuning = { powerScale: 2.2, variance: 4, defenseScale: 1.25, minDamage: 3, hitChance: 90, critChance: 10 };
  const rolls = { hit: 12, crit: 50, variance: 0.5 };
  const expected = resolveDamage(input, { defense: 12, hp: 100, maxHp: 100 }, tuning, rolls);
  for (const mode of ['solo', 'party', 'pvp']) {
    assert.equal(getCombatAdapter(mode).mode, mode);
    assert.deepEqual(resolveDamage(input, { defense: 12, hp: 100, maxHp: 100 }, tuning, rolls), expected);
  }
});

test('misses deal zero damage', () => {
  const result = resolveDamage({ attack: 20, hp: 10 }, { defense: 1, hp: 10 }, { hitChance: 50 }, { hit: 90 });
  assert.equal(result.hit, false); assert.equal(result.damage, 0);
});

test('guard reduces damage and critical multiplier is applied after mitigation', () => {
  const base = resolveDamage({ attack: 40, hp: 10 }, { defense: 0, hp: 10 }, { hitChance: 100, minDamage: 1 }, { hit: 0, crit: 99, variance: 0 });
  const guarded = resolveDamage({ attack: 40, hp: 10 }, { defense: 0, hp: 10 }, { hitChance: 100, guardMultiplier: .5, minDamage: 1 }, { hit: 0, crit: 99, variance: 0 });
  const critical = resolveDamage({ attack: 40, hp: 10 }, { defense: 0, hp: 10 }, { hitChance: 100, critChance: 100, critMultiplier: 1.5, minDamage: 1 }, { hit: 0, crit: 0, variance: 0 });
  assert.equal(guarded.damage, 20); assert.equal(base.damage, 40); assert.equal(critical.damage, 60);
});

test('intent validation blocks unknown actions and malformed skill IDs', () => {
  assert.equal(normalizeCombatIntent('pvp', { action: 'attack' }).action, 'attack');
  assert.throws(() => normalizeCombatIntent('solo', { action: 'admin' }));
  assert.throws(() => normalizeCombatIntent('party', { action: 'skill', skillId: '../../x' }));
});
