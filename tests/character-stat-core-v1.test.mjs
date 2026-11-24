import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCharacterStats, resolveSkillEffect, resolveActorAttackPower, resolvePercentEffect, ATTRIBUTE_RULES } from '../systems/combat/character-stat-core.js';

test('power scales physical attack and martial skill power with canonical coefficients', () => {
  const s = resolveCharacterStats({ stats: { power: 10 }, baseAttack: 20, damageArchetype: 'physical' });
  assert.equal(s.physicalAttack, 42);
  assert.equal(s.physicalSkillPower, 48);
  assert.equal(s.attackPower, 42);
});

test('intellect scales magical and eldritch attack, not physical attack', () => {
  const mage = resolveCharacterStats({ stats: { intellect: 10, power: 4 }, damageArchetype: 'eldritch' });
  assert.equal(mage.magicalAttack, 50);
  assert.equal(mage.attackPower, 50);
  assert.equal(mage.physicalAttack, 8.8);
});

test('hybrid archetype uses the mean of physical and magical channels', () => {
  const s = resolveCharacterStats({ stats: { power: 10, intellect: 10 }, damageArchetype: 'hybrid' });
  assert.equal(s.attackPower, 36);
});

test('secondary attributes apply caps and consistent effects', () => {
  const s = resolveCharacterStats({ stats: { speed: 300, endurance: 300, vitality: 5, luck: 100, perception: 100, faith: 100, intellect: 2 }, baseMaxHp: 100, faithClass: true });
  assert.equal(s.evasionPct, 45);
  assert.equal(s.damageReductionPct, 60);
  assert.equal(s.maxHp, 150);
  assert.equal(s.maxMana, 816);
  assert.equal(s.critChancePct, 23);
  assert.equal(s.magicResistancePct, 20);
  assert.equal(s.healingBonusPct, 20);
});

test('skill effects clamp percentage and chance and normalize duration/cost', () => {
  const e = resolveSkillEffect(100, { percent: 125, flat: 5, chancePct: 150, durationTurns: 2.8, cooldownTurns: -1, resourceCost: -5, targetCount: 3.9 });
  assert.deepEqual(e, { value: 230, chancePct: 100, durationTurns: 2, cooldownTurns: 0, resourceCost: 0, targetCount: 3 });
});

test('attribute rules are immutable and complete for the eight core attributes', () => {
  assert.deepEqual(Object.keys(ATTRIBUTE_RULES), ['power', 'intellect', 'speed', 'endurance', 'vitality', 'perception', 'luck', 'faith']);
  assert.equal(Object.isFrozen(ATTRIBUTE_RULES), true);
});

test('canonical actor offense uses the same physical and magical channels for all specializations', () => {
  const warrior = resolveActorAttackPower({ stats: { power: 20 }, attack: 30, damageArchetype: 'physical' });
  const mage = resolveActorAttackPower({ stats: { intellect: 20 }, magicPower: 30, damageArchetype: 'magical' });
  const eldritch = resolveActorAttackPower({ stats: { intellect: 20 }, magicPower: 30, damageArchetype: 'eldritch' });
  assert.equal(warrior.attackPower, 74);
  assert.equal(warrior.skillPower, 86);
  assert.equal(mage.attackPower, 130);
  assert.equal(eldritch.attackPower, mage.attackPower);
});

test('percentage effect pipeline applies the percentage exactly once and floors deterministically', () => {
  assert.equal(resolvePercentEffect(125, 40, 2), 177);
  assert.equal(resolvePercentEffect(125, -150, 0), 0);
});
