import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatAdapter } from '../systems/combat/combat-adapters.js';
import { getSpecializationHandler, listOwnedSpecializationSkills } from '../systems/combat/specialization-skill-bridge.js';
import { SWORD_ASCETIC_DATA } from '../systems/combat/sword-ascetic-runtime.js';

const catalog = { schema: 'etranom.shared.skill.catalog.v1' };
const actor = () => ({ id: 'hero', level: 10, hp: 500, maxHp: 500, mp: 0, maxMp: 0, stamina: 100, maxStamina: 100, attack: 100, defense: 40, classProgress: { warrior_sword_ascetic: { skillRanks: {}, talents: {} } } });
const targets = () => [{ id: 'mob1', hp: 1000, maxHp: 1000, defense: 20 }, { id: 'mob2', hp: 1000, maxHp: 1000, defense: 20 }];

test('Sword Ascetic is exposed as the first implemented Warrior specialization without relabeling Wizard', () => {
  const handler = getSpecializationHandler(catalog, 'warrior_1');
  assert.ok(handler);
  assert.equal(handler.classId, 'warrior');
  assert.equal(handler.specializationId, 'warrior_sword_ascetic');
  assert.equal(handler.skillIds.length, 10);
  assert.equal(listOwnedSpecializationSkills(catalog, { classId: 'warrior', specializationId: 'warrior_1', level: 4, ownedSkillIds: SWORD_ASCETIC_DATA.skills.map(skill => skill.id) }).length, 4);
  assert.equal(SWORD_ASCETIC_DATA.specialization, 'زاهد شمشیر');
});

test('all three combat adapters resolve Sword Ascetic attacks and spend stamina, not mana', () => {
  for (const mode of ['solo', 'party', 'pvp']) {
    const result = CombatAdapter[mode].specializationSkill(catalog, 'warrior_1', 'black_crescent', { actor: actor(), targets: targets(), targetId: 'mob1' });
    assert.equal(result.mode, mode);
    assert.ok(result.log.some(entry => entry.type === 'damage'));
    assert.equal(result.actor.stamina, 95);
    assert.equal(result.actor.mp, 0);
  }
});

test('level locks and insufficient stamina are enforced', () => {
  assert.throws(() => CombatAdapter.solo.specializationSkill(catalog, 'warrior_1', 'mind_blade', { actor: { ...actor(), level: 8 }, targets: targets() }), /sword_ascetic_skill_locked/);
  assert.throws(() => CombatAdapter.solo.specializationSkill(catalog, 'warrior_1', 'black_crescent', { actor: { ...actor(), stamina: 0 }, targets: targets() }), /insufficient_stamina/);
});

test('Echo arms a one-hit reflect state and Crimson Blossom resolves multiple hits', () => {
  const echo = CombatAdapter.solo.specializationSkill(catalog, 'warrior_1', 'echo', { actor: actor(), targets: targets() });
  assert.equal(echo.actor.swordAsceticStates.reflectPct, 40);
  const reflected = CombatAdapter.solo.incomingSpecializationHit(echo.actor, { id: 'foe', hp: 300 }, 100, { specializationId: 'warrior_sword_ascetic' });
  assert.equal(reflected.reflected, 40);
  assert.equal(reflected.attacker.hp, 260);
  const blossom = CombatAdapter.party.specializationSkill(catalog, 'warrior_1', 'crimson_blossom', { actor: actor(), targets: targets(), targetId: 'mob1' });
  assert.ok(blossom.log.filter(entry => entry.type === 'sword_multi_hit').length >= 2);
  const mist = CombatAdapter.solo.specializationSkill(catalog, 'warrior_1', 'mist_step', { actor: actor(), targets: targets() });
  const dodged = CombatAdapter.solo.incomingSpecializationHit(mist.actor, { id: 'foe', hp: 300 }, 100, { specializationId: 'warrior_sword_ascetic', evasionRoll: 10 });
  assert.equal(dodged.dodged, true);
  assert.equal(dodged.damageTaken, 0);
});

test('Thousand Swords domain is one-use per battle and only one ascension can be cast', () => {
  const start = CombatAdapter.solo.activateDomain({ ...actor(), level: 25 }, { specializationId: 'warrior_sword_ascetic' });
  assert.equal(start.domain.stage, 1);
  const ascended = CombatAdapter.solo.specializationSkill(catalog, 'warrior_1', 'asc_black_crescent', { actor: start.actor, targets: targets(), targetId: 'mob1' });
  assert.ok(ascended.log.some(entry => entry.type === 'sword_ascended_skill_used'));
  assert.throws(() => CombatAdapter.solo.specializationSkill(catalog, 'warrior_1', 'asc_echo', { actor: ascended.actor, targets: targets() }), /only_one_ascension_per_domain/);
  assert.throws(() => CombatAdapter.solo.activateDomain(ascended.actor, { specializationId: 'warrior_sword_ascetic' }), /already_used/);
});

test('domain turn tick ends the domain and clears ascension lock', () => {
  let state = CombatAdapter.solo.activateDomain({ ...actor(), level: 25 }, { specializationId: 'warrior_sword_ascetic' });
  for (let i = 0; i < 5; i++) state = CombatAdapter.solo.tickDomain(state.actor, targets(), { specializationId: 'warrior_sword_ascetic' });
  assert.equal(state.actor.swordAsceticProgress.domain.active, false);
  assert.ok(state.log.some(entry => entry.type === 'sword_domain_ended'));
});

test('all ten base skills resolve through solo, party and PvP adapters', () => {
  for (const mode of ['solo', 'party', 'pvp']) {
    for (const skill of SWORD_ASCETIC_DATA.skills) {
      const hero = { ...actor(), level: 10, stamina: 500, maxStamina: 500 };
      const result = CombatAdapter[mode].specializationSkill(catalog, 'warrior_1', skill.id, {
        actor: hero, targets: targets(), targetId: 'mob1'
      });
      assert.equal(result.mode, mode, `${mode}:${skill.id}`);
      assert.equal(result.skillId, skill.id, `${mode}:${skill.id}`);
    }
  }
});

test('skill rank is capped at the seven-rank shared contract', () => {
  const base = actor();
  const rankSeven = CombatAdapter.solo.specializationSkill(catalog, 'warrior_1', 'black_crescent', {
    actor: { ...base, classProgress: { warrior_sword_ascetic: { skillRanks: { black_crescent: 7 } } } },
    targets: targets(), targetId: 'mob1'
  });
  const overRanked = CombatAdapter.solo.specializationSkill(catalog, 'warrior_1', 'black_crescent', {
    actor: { ...base, classProgress: { warrior_sword_ascetic: { skillRanks: { black_crescent: 99 } } } },
    targets: targets(), targetId: 'mob1'
  });
  assert.deepEqual(overRanked.targets, rankSeven.targets);
});
