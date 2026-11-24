import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveWarriorSkillThroughSharedEngine,
  getSharedEngineWarriorAuditV1938,
  sharedEngineWarriorRegistryV1938
} from '../systems/combat/engines/shared-engine-warrior-shadow-v1938.js?v=1938';
import { resolveSpecializationSkill } from '../systems/combat/specialization-skill-bridge.js';
import { IRON_BASTION_DATA } from '../systems/combat/iron-bastion-runtime.js';
import { SWORD_ASCETIC_DATA } from '../systems/combat/sword-ascetic-runtime.js';
import { CHAOS_WARRIOR_DATA } from '../systems/combat/chaos-warrior-runtime.js';
import { APOCALYPSE_HARBINGER_DATA } from '../systems/combat/apocalypse-harbinger-runtime.js';

const specs = [
  ['warrior_sword_ascetic', 'black_crescent'],
  ['warrior_iron_bastion', 'ironcleave'],
  ['warrior_chaos', 'chaos_rend'],
  ['warrior_apocalypse_harbinger', 'apoc_strike']
];
const makeActor = () => ({
  id: 'hero', level: 50, hp: 10000, maxHp: 10000,
  mp: 0, maxMp: 0, stamina: 500, maxStamina: 500,
  attack: 120, power: 120, defense: 80, skillPoints: 100,
  classProgress: {}
});
const makeTargets = () => [{ id: 'enemy-1', hp: 100000, maxHp: 100000, defense: 20 }];

test('V1938 registry retains 40 slots, 8 implemented, and canonical Chaos alias', () => {
  assert.deepEqual(sharedEngineWarriorRegistryV1938.counts, {
    classes: 10, specializations: 40, implemented: 8, reserved: 32
  });
  assert.equal(sharedEngineWarriorRegistryV1938.resolveCanonicalId('warrior_chaos_warrior'), 'warrior_chaos');
});

test('V1938 shadow preflight for all four Warrior specs is validation-only and non-mutating', () => {
  for (const mode of ['solo', 'party', 'pvp']) for (const [specializationId, skillId] of specs) {
    const actor = makeActor();
    const before = structuredClone(actor);
    const result = resolveWarriorSkillThroughSharedEngine({
      mode, specializationId, skillId,
      payload: { actor, targets: makeTargets(), targetId: 'enemy-1', requestId: `${mode}:${specializationId}:${skillId}` },
      legacyResolver: (_skillId, payload) => ({ mode: payload.mode, actor: payload.actor, targets: payload.targets, log: [{ type: 'legacy_stub' }] })
    });
    assert.ok(result, `${mode}:${specializationId}:${skillId}`);
    const audit = getSharedEngineWarriorAuditV1938();
    assert.equal(audit.mode, mode);
    assert.equal(audit.specializationId, specializationId);
    assert.equal(audit.skillId, skillId);
    assert.equal(audit.legacyResultPreserved, true);
    assert.equal(audit.engineVersion, '1913.0.0');
    assert.equal(actor.stamina, before.stamina, 'shadow preparation must not spend stamina');
    assert.deepEqual(actor.classProgress, before.classProgress, 'shadow preparation must not mutate class progress');
  }
});

test('V1938 public bridge routes all four Warrior skills through the shadow layer without changing legacy outcomes', () => {
  for (const mode of ['solo', 'party', 'pvp']) for (const [specializationId, skillId] of specs) {
    const result = resolveSpecializationSkill({}, specializationId, skillId, {
      mode, actor: makeActor(), targets: makeTargets(), targetId: 'enemy-1'
    });
    assert.ok(Array.isArray(result.targets));
    assert.ok(result.targets[0].hp < 100000, `${mode}:${specializationId}:${skillId} must still deal damage`);
    const audit = getSharedEngineWarriorAuditV1938();
    assert.equal(audit.specializationId, specializationId);
    assert.equal(audit.legacyResultPreserved, true);
  }
});



test('V1938 shadow projection reads specialization-owned cooldown stores without mutating them', () => {
  for (const [specializationId, skillId] of specs) {
    const actor = makeActor();
    actor.classProgress[specializationId] = { cooldowns: { [skillId]: 2 }, skillCooldowns: { [skillId]: 2 } };
    const before = structuredClone(actor);
    resolveWarriorSkillThroughSharedEngine({
      mode: 'solo', specializationId, skillId,
      payload: { actor, targets: makeTargets(), targetId: 'enemy-1' },
      legacyResolver: (_id, payload) => ({ actor: payload.actor, targets: payload.targets, log: [] })
    });
    const audit = getSharedEngineWarriorAuditV1938();
    assert.equal(audit.preflight.ok, false, specializationId);
    assert.match(audit.preflight.reason, /skill_on_cooldown/);
    assert.deepEqual(actor.classProgress, before.classProgress, 'cooldown projection must be read-only');
  }
});

test('V1938 every base Warrior skill passes shared preflight in all three combat modes', () => {
  const catalogs = [
    ['warrior_sword_ascetic', SWORD_ASCETIC_DATA],
    ['warrior_iron_bastion', IRON_BASTION_DATA],
    ['warrior_chaos', CHAOS_WARRIOR_DATA],
    ['warrior_apocalypse_harbinger', APOCALYPSE_HARBINGER_DATA]
  ];
  let checked = 0;
  for (const mode of ['solo', 'party', 'pvp']) for (const [specializationId, data] of catalogs) {
    for (const skill of data.skills) {
      const result = resolveSpecializationSkill({}, specializationId, skill.id, {
        mode,
        actor: { ...makeActor(), stamina: 10000, maxStamina: 10000 },
        targets: [
          { id: 'enemy-1', hp: 1000000, maxHp: 1000000, defense: 50 },
          { id: 'enemy-2', hp: 1000000, maxHp: 1000000, defense: 50 }
        ],
        targetId: 'enemy-1', requestId: `${mode}:${specializationId}:${skill.id}`
      });
      assert.ok(result, `${mode}:${specializationId}:${skill.id}`);
      const audit = getSharedEngineWarriorAuditV1938();
      assert.equal(audit.preflight.ok, true, `${mode}:${specializationId}:${skill.id}: ${audit.preflight.reason || ''}`);
      assert.equal(audit.legacyResultPreserved, true);
      checked++;
    }
  }
  assert.equal(checked, 120);
});

test('V1938 shadow layer rejects unsupported modes and reserved specializations before resolver execution', () => {
  let called = false;
  assert.throws(() => resolveWarriorSkillThroughSharedEngine({
    mode: 'raid', specializationId: 'warrior_chaos', skillId: 'chaos_rend', legacyResolver: () => { called = true; return {}; }
  }), /unsupported_combat_mode/);
  assert.throws(() => resolveWarriorSkillThroughSharedEngine({
    mode: 'solo', specializationId: 'gunner_1', skillId: 'x', legacyResolver: () => { called = true; return {}; }
  }), /not_registered_or_playable/);
  assert.equal(called, false);
});
