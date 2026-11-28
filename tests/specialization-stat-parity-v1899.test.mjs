import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSpecializationCombatActor, SPECIALIZATION_STAT_PROFILES } from '../systems/combat/character-stat-core.js';
import { resolveSpecializationSkill } from '../systems/combat/specialization-skill-bridge.js';

const WARRIORS = ['warrior_sword_ascetic','warrior_iron_bastion','warrior_chaos','warrior_apocalypse_harbinger'];
const WIZARDS = ['wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer'];

test('all eight specializations use one physical or magical/eldritch attribute channel', () => {
  assert.equal(Object.keys(SPECIALIZATION_STAT_PROFILES).length, 8);
  for (const id of WARRIORS) {
    const actor = resolveSpecializationCombatActor({ attack: 10, magicPower: 10, stats: { power: 10, intellect: 10 } }, id);
    assert.equal(actor.attack, 38, `${id} physical skill power`);
    assert.equal(actor.physicalAttack, 32, `${id} physical basic attack`);
    assert.equal(actor.damageArchetype, 'physical');
  }
  for (const id of WIZARDS) {
    const actor = resolveSpecializationCombatActor({ attack: 10, magicPower: 10, stats: { power: 10, intellect: 10 } }, id);
    assert.equal(actor.magicPower, 60, `${id} magical/eldritch power`);
    assert.equal(actor.damageArchetype, id === 'wizard_warlock' || id === 'wizard_necromancer' ? 'eldritch' : 'magical');
  }
});

test('canonical stat adaptation is idempotent and does not compound attack on repeated routing', () => {
  for (const id of [...WARRIORS, ...WIZARDS]) {
    const once = resolveSpecializationCombatActor({ attack: 10, magicPower: 10, stats: { power: 10, intellect: 10 } }, id);
    const twice = resolveSpecializationCombatActor(once, id);
    assert.equal(twice.attack, once.attack);
    assert.equal(twice.magicPower, once.magicPower);
  }
});

test('all eight public specialization skill routes materialize canonical actor stats', () => {
  const samples = [
    ['warrior_sword_ascetic','black_crescent'],
    ['warrior_iron_bastion','ironcleave'],
    ['warrior_chaos','chaos_rend'],
    ['warrior_apocalypse_harbinger','apoc_strike'],
    ['wizard_arcane_mage','arcane_bolt'],
    ['wizard_elementalist','ember_bolt'],
    ['wizard_warlock','forbidden_signature'],
    ['wizard_necromancer','death_claw']
  ];
  for (const [specId, skillId] of samples) {
    const physical = specId.startsWith('warrior_');
    const actor = { id:'player', level:50, hp:1000, maxHp:1000, mp:1000, maxMp:1000,
      stamina:1000, maxStamina:1000, attack:10, magicPower:10,
      stats:{power:10,intellect:10}, skillPoints:100 };
    const result = resolveSpecializationSkill(null, specId, skillId, {
      actor, targets:[{id:'enemy',hp:10000,maxHp:10000,defense:10}], targetId:'enemy', mode:'solo'
    });
    assert.equal(result.actor.canonicalStatVersion, '1.2.0', `${specId} actor stat version`);
    assert.equal(result.actor.useCanonicalStatCore, true, `${specId} canonical resolver enabled`);
    if (physical) assert.equal(result.actor.attack, 38, `${specId} physical channel`);
    else assert.equal(result.actor.magicPower, 60, `${specId} magic channel`);
  }
});
