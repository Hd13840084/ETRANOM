import test from 'node:test';
import assert from 'node:assert/strict';
import {
  centralSpecializationEngineV1955,
  CENTRAL_CLASS_ENGINE_VERSION_V1955
} from '../systems/combat/engines/central-specialization-engine-v1955.js';
import { IMPLEMENTED_SPECIALIZATION_DATA_V1939 } from '../systems/combat/engines/shared-engine-specialization-orchestrator-v1939.js';

const actorFor = (id, overrides = {}) => ({
  id: `actor-${id}`, level: 50, hp: 5000, maxHp: 5000, mp: 5000, maxMp: 5000,
  stamina: 5000, maxStamina: 5000, attack: 100, magicPower: 100, defense: 100, speed: 20,
  stats: { power: 30, intellect: 30, vitality: 30, faith: 20, endurance: 20, perception: 20, luck: 20, speed: 20 },
  resources: { mana: 5000, stamina: 5000 },
  classProgress: { [id]: { skillRanks: {}, selectedUpgrades: {}, talentPoints: 999, unlockedTalents: [], selectedTalents: [], cooldowns: {} } },
  ...overrides
});

test('V1955 engine preserves 10 classes, 40 slots, 8 implemented and 32 reserved', () => {
  const audit = centralSpecializationEngineV1955.audit();
  assert.equal(CENTRAL_CLASS_ENGINE_VERSION_V1955, '1955.0.0');
  assert.deepEqual(audit.registry, { classes: 10, specializations: 40, implemented: 8, reserved: 32 });
  assert.equal(audit.ok, true, audit.errors.join('; '));
});

test('all 8 existing specializations expose the shared 10/32/4/10 contract', () => {
  for (const id of Object.keys(IMPLEMENTED_SPECIALIZATION_DATA_V1939)) {
    const row = centralSpecializationEngineV1955.inspect(id);
    assert.equal(row.playable, true, id);
    assert.equal(row.dimensions.skills, 10, id);
    assert.equal(row.dimensions.talentBranches, 4, id);
    assert.equal(row.dimensions.domainStages, 4, id);
    assert.equal(row.dimensions.ascensions, 10, id);
  }
});

test('all 80 current skills prepare in Solo, Party and PvP without mutating actors', () => {
  let checks = 0;
  for (const [id, spec] of Object.entries(IMPLEMENTED_SPECIALIZATION_DATA_V1939)) {
    for (const skill of spec.skills) for (const mode of ['solo', 'party', 'pvp']) {
      const actor = actorFor(id);
      const before = structuredClone(actor);
      const plan = centralSpecializationEngineV1955.prepareSkill({
        mode, specializationId: id, skillId: skill.id, actor,
        targetId: 'target-1', targets: [{ id: 'target-1', hp: 5000 }],
        requestId: `v1955:${mode}:${id}:${skill.id}`
      });
      assert.equal(plan.executionStatus, 'prepared_only');
      assert.equal(plan.mode, mode);
      assert.equal(plan.specializationId, id);
      assert.equal(plan.skillId, skill.id);
      assert.ok(plan.stats.stats);
      assert.deepEqual(actor, before);
      checks++;
    }
  }
  assert.equal(checks, 240);
});

test('Wizard percent resource costs and Warrior flat stamina costs are distinguished', () => {
  const wizard = centralSpecializationEngineV1955.prepareSkill({
    mode: 'solo', specializationId: 'wizard_arcane_mage', skillId: 'arcane_bolt',
    actor: actorFor('wizard_arcane_mage'), targetId: 'e', targets: [{ id: 'e', hp: 100 }], requestId: 'mana-percent'
  });
  assert.equal(wizard.resource.resource, 'mana');
  assert.equal(wizard.resource.costMode, 'percent_of_max');
  assert.equal(wizard.resource.cost, 150);

  const warrior = centralSpecializationEngineV1955.prepareSkill({
    mode: 'solo', specializationId: 'warrior_sword_ascetic', skillId: 'black_crescent',
    actor: actorFor('warrior_sword_ascetic'), targetId: 'e', targets: [{ id: 'e', hp: 100 }], requestId: 'stamina-flat'
  });
  assert.equal(warrior.resource.resource, 'stamina');
  assert.equal(warrior.resource.costMode, 'flat');
  assert.equal(warrior.resource.cost, 5);
});

test('all-enemy skills can prepare without an explicit target selection', () => {
  for (const [id, spec] of Object.entries(IMPLEMENTED_SPECIALIZATION_DATA_V1939)) {
    for (const skill of spec.skills.filter(row => String(row.target || '').includes('همه') || String(row.target || '').toLowerCase().includes('all'))) {
      const plan = centralSpecializationEngineV1955.prepareSkill({
        mode: 'solo', specializationId: id, skillId: skill.id, actor: actorFor(id),
        targets: [{ id: 'enemy-a', hp: 100 }, { id: 'enemy-b', hp: 100 }], requestId: `aoe:${id}:${skill.id}`
      });
      assert.equal(plan.targetId, null, `${id}/${skill.id}`);
    }
  }
});

test('reserved future specializations remain non-playable', () => {
  assert.throws(() => centralSpecializationEngineV1955.prepareSkill({
    mode: 'solo', specializationId: 'gunner_1', skillId: 'anything', actor: actorFor('gunner_1'), requestId: 'reserved'
  }), /specialization_not_playable/);
});

test('preflight rejects invalid mode, missing target, cooldown and insufficient resource', () => {
  const actor = actorFor('wizard_arcane_mage');
  assert.throws(() => centralSpecializationEngineV1955.prepareSkill({ mode: 'raid', specializationId: 'wizard_arcane_mage', skillId: 'arcane_bolt', actor, requestId: 'bad-mode' }), /unsupported_combat_mode/);
  assert.throws(() => centralSpecializationEngineV1955.prepareSkill({ mode: 'solo', specializationId: 'wizard_arcane_mage', skillId: 'arcane_bolt', actor, requestId: 'no-target' }), /skill_target_required/);
  assert.throws(() => centralSpecializationEngineV1955.prepareSkill({ mode: 'solo', specializationId: 'wizard_arcane_mage', skillId: 'arcane_bolt', actor: { ...actor, cooldowns: { arcane_bolt: 2 } }, targetId: 'e', targets: [{ id: 'e', hp: 20 }], requestId: 'cooldown' }), /skill_on_cooldown/);
  assert.throws(() => centralSpecializationEngineV1955.prepareSkill({ mode: 'solo', specializationId: 'wizard_arcane_mage', skillId: 'arcane_bolt', actor: { ...actor, mp: 0, resources: { mana: 0 } }, targetId: 'e', targets: [{ id: 'e', hp: 20 }], requestId: 'no-mana' }), /insufficient_resource/);
});
