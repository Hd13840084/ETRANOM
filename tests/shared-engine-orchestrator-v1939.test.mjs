import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSharedEngineOrchestratorInventoryV1939,
  IMPLEMENTED_SPECIALIZATION_DATA_V1939,
  inspectSpecializationEngineConnectionsV1939,
  prepareSpecializationSharedEngineShadowV1939,
  sharedSpecializationRegistryV1939
} from '../systems/combat/engines/shared-engine-specialization-orchestrator-v1939.js';
import {
  ResourceEngine, CooldownEngine, StatusEngine, DomainEngine, AscensionEngine,
  StatEngine, SkillUpgradeEngine, TalentEngine, CombatLifecycleEngine, CombatResultEngine
} from '../systems/combat/engines/shared-engine-runtime-v1913.js';

const inventory = getSharedEngineOrchestratorInventoryV1939();
const specIds = inventory.specializations.map(x => x.specializationId);

test('V1939 registry preserves 8 implemented + 32 reserved slots', () => {
  assert.deepEqual(inventory.registry, { classes: 10, specializations: 40, implemented: 8, reserved: 32 });
  assert.equal(sharedSpecializationRegistryV1939.resolveCanonicalId('warrior_chaos_warrior'), 'warrior_chaos');
  assert.equal(sharedSpecializationRegistryV1939.isPlayable('gunner_1'), false);
});

test('all eight implemented specializations expose the full shared engine inventory', () => {
  for (const id of specIds) {
    const row = inspectSpecializationEngineConnectionsV1939(id);
    assert.equal(row.skills, 10, `${id}: skill count`);
    assert.equal(row.talents, 32, `${id}: talent count`);
    assert.equal(row.talentBranches, 4, `${id}: talent branches`);
    assert.equal(row.domainStages, 4, `${id}: domain stages`);
    assert.equal(row.ascensionForms, 10, `${id}: ascensions`);
    assert.ok(row.engines.includes('StatEngine'));
    assert.ok(row.engines.includes('SkillEngine'));
    assert.ok(row.engines.includes('DomainEngine'));
    assert.ok(row.engines.includes('CombatLifecycleEngine'));
  }
});

test('all eight specializations preflight in Solo, Party and PvP without mutating input', () => {
  for (const id of specIds) {
    // The first authored skill is used as the deterministic representative for each specialization.
    const source = IMPLEMENTED_SPECIALIZATION_DATA_V1939[id];
    const skillId = source?.skills?.[0]?.id;
    assert.ok(skillId, `${id}: first skill exists`);
    for (const mode of ['solo','party','pvp']) {
      const actor = { id: `actor-${id}`, level: 50, hp: 1000, maxHp: 1000, mp: 10000, maxMp: 10000,
        stamina: 10000, maxStamina: 10000, attack: 100, magicPower: 100, defense: 100, speed: 20,
        stats: { power: 30, intellect: 30, vitality: 30, faith: 20, endurance: 20, perception: 20, luck: 20, speed: 20 },
        resources: { mana: 10000, stamina: 10000 }, classProgress: { [id]: { skillRanks: {}, talentRanks: {}, unlockedTalents: [], cooldowns: {}, skillCooldowns: {} } } };
      const before = structuredClone(actor);
      const result = prepareSpecializationSharedEngineShadowV1939({ mode, specializationId: id, skillId, payload: { actor, targetId: 'target-1', targets: [{ id: 'target-1', hp: 1000 }] } });
      assert.equal(result.ok, true, `${id}/${mode}`);
      assert.equal(result.mode, mode);
      assert.ok(result.stats.stats);
      assert.equal(result.lifecycleEngineAvailable, true);
      assert.ok(Object.values(result.engineBindings).every(Boolean), `${id}/${mode}: every shared engine bound`);
      assert.deepEqual(actor, before, 'shadow must not mutate actor');
    }
  }
});

test('all 80 authored skills pass the shared preflight in all three combat modes (240 checks)', () => {
  let checks = 0;
  for (const id of specIds) for (const skill of IMPLEMENTED_SPECIALIZATION_DATA_V1939[id].skills) for (const mode of ['solo','party','pvp']) {
    const actor = { id: 'matrix-actor', level: 50, hp: 10000, maxHp: 10000, mp: 100000, maxMp: 100000,
      stamina: 100000, maxStamina: 100000, attack: 1000, magicPower: 1000,
      stats: { power: 100, intellect: 100, vitality: 100, faith: 100, endurance: 100, perception: 100, luck: 100, speed: 100 },
      resources: { mana: 100000, stamina: 100000 }, classProgress: { [id]: { skillRanks: {}, talentRanks: {}, unlockedTalents: [], cooldowns: {}, skillCooldowns: {} } } };
    const result = prepareSpecializationSharedEngineShadowV1939({ mode, specializationId: id, skillId: skill.id,
      payload: { actor, targetId: 'matrix-target', targets: [{ id: 'matrix-target', hp: 100000 }] } });
    assert.equal(result.ok, true, `${id}/${skill.id}/${mode}`);
    assert.ok(Object.values(result.engineBindings).every(Boolean));
    checks++;
  }
  assert.equal(checks, 240);
});

test('resource, cooldown, status, domain, ascension, stat, talent, upgrade and result engines compose safely', () => {
  const actor = { id: 'hero', level: 50, resources: { mana: 100, stamina: 80 }, cooldowns: {} };
  const reserved = ResourceEngine.reserve(actor, 'mana', 20, 'tx-1');
  const committed = ResourceEngine.commit(reserved.actor, 'tx-1');
  assert.equal(committed.actor.resources.mana, 80);
  const cd = CooldownEngine.start(committed.actor, 'skill-a', 2, 'action-a');
  assert.equal(cd.actor.cooldowns['skill-a'], 2);
  const status = StatusEngine.apply(cd.actor, { id: 'burn', durationTurns: 2, tickPolicy: 'turn_start', value: 3 });
  assert.ok(status.target.statuses.burn);
  const domain = DomainEngine.activate({ ...status.target, resources: { mana: 100 } }, { stages: [{ stage: 1, unlockLevel: 1, activationCost: 10, durationTurns: 3 }] }, { stage: 1, level: 50, mode: 'solo', activationId: 'domain-1' });
  const ascension = AscensionEngine.select(domain.actor, [{ id: 'form-a', effects: { attack: 10 } }], 'form-a', 'domain-1');
  assert.equal(ascension.actor.domain.ascensionId, 'form-a');
  assert.equal(StatEngine.buildSnapshot({ attack: 10 }, [{ id: 'talent', effects: { attack: 5 } }]).stats.attack, 15);
  assert.equal(TalentEngine.validate({ branches: [{ talents: [{ id: 't1', unlockLevel: 1 }] }] }, ['t1'], { points: 1, level: 50 }).ok, true);
  assert.equal(SkillUpgradeEngine.resolve({ upgrades: Array.from({ length: 6 }, (_, i) => ({ id: `u${i+1}`, effects: { attack: 1 } })) }, 2).modifiers.attack, 1);
  const life = new CombatLifecycleEngine().runTurn({ mode: 'solo', actor: ascension.actor, targets: [{ id: 'enemy', hp: 10 }], turnId: 'turn-1', action: (a, ts) => ({ actor: a, targets: ts }) });
  assert.equal(life.duplicate, false);
  assert.equal(CombatResultEngine.create({ mode: 'solo', actor: life.actor, targets: life.targets }).schema, 'etranom.combat.result.v1');
});
