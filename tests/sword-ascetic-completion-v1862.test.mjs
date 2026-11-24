import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applySwordAsceticPassiveStats,
  resolveSwordAsceticIncomingHit,
  tickSwordAsceticDomain,
  resolveSwordAsceticSkill
} from '../systems/combat/sword-ascetic-runtime.js';

const actor = (extra = {}) => ({
  id: 'hero', level: 50, attack: 100, defense: 100, accuracy: 95, hp: 500, maxHp: 500,
  stamina: 100, classProgress: { warrior_sword_ascetic: {} }, ...extra
});

test('passive talent stats apply once and preserve the source save object', () => {
  const source = actor({ classProgress: { warrior_sword_ascetic: {
    unlockedTalents: ['iron_frame', 'pain_discipline', 'sword_gaze', 'clear_intent'],
    talentRanks: { iron_frame: 1, pain_discipline: 1, sword_gaze: 1, clear_intent: 1 }
  } } });
  const first = applySwordAsceticPassiveStats(source).actor;
  const second = applySwordAsceticPassiveStats(first).actor;
  assert.equal(first.defense, 103);
  assert.equal(first.maxHp, 520);
  assert.equal(first.accuracy, 98);
  assert.equal(first.critChance, 2);
  assert.equal(second.defense, first.defense);
  assert.deepEqual(source.classProgress.warrior_sword_ascetic.talentRanks, { iron_frame: 1, pain_discipline: 1, sword_gaze: 1, clear_intent: 1 });
});

test('incoming damage applies guard reduction, evasion and echo reflection deterministically', () => {
  const defender = actor({
    classProgress: { warrior_sword_ascetic: { unlockedTalents: ['balanced_body'], talentRanks: { balanced_body: 1 } } },
    swordAsceticStates: { evasionPct: 50, turns: 1, reflectPct: 40, reflectHits: 1 }
  });
  const dodge = resolveSwordAsceticIncomingHit(defender, { id: 'enemy', hp: 300 }, 100, { evasionRoll: 10 });
  assert.equal(dodge.dodged, true);
  assert.equal(dodge.damageTaken, 0);
  const hit = resolveSwordAsceticIncomingHit(defender, { id: 'enemy', hp: 300 }, 100, { evasionRoll: 99 });
  assert.equal(hit.damageTaken, 96);
  assert.equal(hit.reflected, 38);
});

test('absolute domain stage executes final burst on expiry with boss mitigation', () => {
  const hero = actor({ classProgress: { warrior_sword_ascetic: { domain: {
    active: true, stage: 4, turnsRemaining: 1, waveCounter: 0, ascendedUsed: false
  } } } });
  const result = tickSwordAsceticDomain(hero, [
    { id: 'mob', hp: 500, defense: 0 },
    { id: 'boss', hp: 500, defense: 0, isBoss: true }
  ]);
  assert.equal(result.targets[0].hp, 268);
  assert.equal(result.targets[1].hp, 408);
  assert.ok(result.log.some(x => x.type === 'sword_domain_final_burst' && x.bossLimited));
  assert.equal(result.actor.classProgress.warrior_sword_ascetic.domain.active, false);
});

test('skill resolution still spends stamina and never spends mana', () => {
  const hero = actor({ mp: 0, maxMp: 0, classProgress: { warrior_sword_ascetic: { skillRanks: { black_crescent: 6 } } } });
  const result = resolveSwordAsceticSkill('black_crescent', {
    actor: hero, targets: [{ id: 'mob', hp: 1000, defense: 10 }], targetId: 'mob', mode: 'pvp'
  });
  assert.equal(result.actor.stamina, 95);
  assert.equal(result.actor.mp, 0);
  assert.ok(result.targets[0].hp < 1000);
});
