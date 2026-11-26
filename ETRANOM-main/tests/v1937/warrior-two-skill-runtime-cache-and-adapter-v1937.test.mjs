import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CombatAdapter } from '../../systems/combat/combat-adapters.js';
import { resolveIronBastionSkill } from '../../systems/combat/iron-bastion-runtime.js';
import { resolveSwordAsceticSkill } from '../../systems/combat/sword-ascetic-runtime.js';

const baseActor = (extra = {}) => ({
  id: 'hero', level: 20, hp: 1000, maxHp: 1000, mp: 0, maxMp: 0,
  stamina: 100, maxStamina: 100, ...extra
});
const targets = () => [{ id: 'enemy', hp: 10000, maxHp: 10000, defense: 0 }];
const damage = result => result.log
  .filter(x => x.type === 'damage' && String(x.target) === 'enemy')
  .reduce((sum, x) => sum + Number(x.amount || 0), 0);

test('V1937 direct Iron Bastion and Sword Ascetic resolvers preserve 285% and 280% aliases', () => {
  const actor = baseActor({ attack: 1, power: 100 });
  const iron = resolveIronBastionSkill('ironcleave', { actor, targets: targets(), targetId: 'enemy' });
  const sword = resolveSwordAsceticSkill('black_crescent', { actor, targets: targets(), targetId: 'enemy' });
  assert.equal(damage(iron), 285);
  assert.equal(damage(sword), 280);
});

test('V1937 all three adapters execute the two skills using canonical physical skill power', () => {
  for (const mode of ['solo', 'party', 'pvp']) {
    const actor = baseActor({ attack: 1, power: 100 });
    const iron = CombatAdapter[mode].specializationSkill({}, 'warrior_iron_bastion', 'ironcleave', {
      actor, targets: targets(), targetId: 'enemy'
    });
    const sword = CombatAdapter[mode].specializationSkill({}, 'warrior_sword_ascetic', 'black_crescent', {
      actor, targets: targets(), targetId: 'enemy'
    });
    // Shared character-stat contract resolves physicalSkillPower = baseAttack(1) + power(100) * 2.8 = 281.
    assert.equal(iron.actor.attack, 281, `${mode}: canonical Iron attack`);
    assert.equal(sword.actor.attack, 281, `${mode}: canonical Sword attack`);
    assert.equal(damage(iron), Math.floor(281 * 2.85), `${mode}: Iron Cleave`);
    assert.equal(damage(sword), Math.floor(281 * 2.8), `${mode}: Black Crescent`);
  }
});

test('V1944 cache keys point at the corrected Warrior runtimes through current page and adapter entry points', () => {
  const html = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const bridge = fs.readFileSync(new URL('../../systems/combat/specialization-skill-bridge.js', import.meta.url), 'utf8');
  const adapters = fs.readFileSync(new URL('../../systems/combat/combat-adapters.js', import.meta.url), 'utf8');
  assert.match(html, /sword-ascetic-runtime\.js\?v=1937/);
  assert.match(html, /iron-bastion-runtime\.js\?v=1937/);
  assert.match(html, /combat-adapters\.js\?v=1967/);
  assert.match(bridge, /sword-ascetic-runtime\.js\?v=1937/);
  assert.match(bridge, /iron-bastion-runtime\.js\?v=1937/);
  assert.match(adapters, /specialization-skill-bridge\.js\?v=1940/);
  assert.match(adapters, /sword-ascetic-runtime\.js\?v=1937/);
  assert.match(adapters, /iron-bastion-runtime\.js\?v=1937/);
});
