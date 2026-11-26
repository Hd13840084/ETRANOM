import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveIronBastionSkill } from '../systems/combat/iron-bastion-runtime.js';
import { resolveSwordAsceticSkill } from '../systems/combat/sword-ascetic-runtime.js';

const baseActor = (extra = {}) => ({
  id: 'hero', level: 20, hp: 1000, maxHp: 1000, mp: 0, maxMp: 0,
  stamina: 100, maxStamina: 100, ...extra
});
const target = (defense = 0) => ({ id: 'enemy', hp: 10000, maxHp: 10000, defense });
const damageFor = result => result.log
  .filter(entry => entry.type === 'damage' && String(entry.target) === 'enemy')
  .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

for (const [label, attackShape] of [
  ['power alias', { attack: 1, power: 100 }],
  ['stats.power alias', { attack: 1, stats: { power: 100 } }],
  ['combatStats.power alias', { attack: 1, combatStats: { power: 100 } }],
  ['final attack wins when higher', { attack: 130, power: 100 }]
]) {
  test(`V1896 ${label}: Iron Cleave is 285% and Black Crescent is 280%`, () => {
    const ironActor = baseActor({ ...attackShape, classProgress: { warrior_iron_bastion: { skillRanks: { ironcleave: 1 } } } });
    const iron = resolveIronBastionSkill('ironcleave', { actor: ironActor, targets: [target()], targetId: 'enemy', mode: 'solo' });
    const physicalPower = Math.max(0, ...[attackShape.attack, attackShape.power, attackShape.stats?.power, attackShape.combatStats?.power].map(v => Number(v) || 0));
    assert.equal(damageFor(iron), Math.floor(physicalPower * 2.85));

    const swordActor = baseActor({ ...attackShape, classProgress: { warrior_sword_ascetic: { skillRanks: { black_crescent: 1 } } } });
    const sword = resolveSwordAsceticSkill('black_crescent', { actor: swordActor, targets: [target()], targetId: 'enemy', mode: 'solo' });
    assert.equal(damageFor(sword), Math.floor(physicalPower * 2.8));
  });
}

test('V1896 both skills apply their percentages after the same enemy-defense mitigation', () => {
  const defense = 40;
  const power = 100;
  const iron = resolveIronBastionSkill('ironcleave', {
    actor: baseActor({ attack: 1, power }), targets: [target(defense)], targetId: 'enemy', mode: 'solo'
  });
  assert.equal(damageFor(iron), Math.floor(power * 2.85 * 100 / (100 + defense * 1.25)));

  const sword = resolveSwordAsceticSkill('black_crescent', {
    actor: baseActor({ attack: 1, power }), targets: [target(defense)], targetId: 'enemy', mode: 'solo'
  });
  const penetratedDefense = defense * (1 - 18 / 100);
  assert.equal(damageFor(sword), Math.floor(power * 2.8 * 100 / (100 + penetratedDefense * 1.25)));
});
