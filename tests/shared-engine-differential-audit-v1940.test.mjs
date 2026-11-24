import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSharedExecutionPlanV1940, compareLegacyOutcomeToSharedPlanV1940,
  SHARED_DIFFERENTIAL_AUDIT_VERSION_V1940
} from '../systems/combat/engines/shared-engine-differential-audit-v1940.js';
import {
  IMPLEMENTED_SPECIALIZATION_DATA_V1939, prepareSpecializationSharedEngineShadowV1939
} from '../systems/combat/engines/shared-engine-specialization-orchestrator-v1939.js';

const actor = () => ({ id: 'audit-actor', level: 50, hp: 1000, maxHp: 1000, mp: 5000, maxMp: 5000,
  stamina: 5000, maxStamina: 5000, attack: 300, magicPower: 300, defense: 100, speed: 20,
  resources: { mana: 5000, stamina: 5000 }, cooldowns: {}, skillCooldowns: {}, statuses: {},
  classProgress: {} });

test('V1940 deterministic plan describes resource, cooldown, effects and formula without mutating source', () => {
  const source = { id: 'sample', resourceType: 'mana', resourceCost: 20, cooldownTurns: 3, target: 'single_enemy', damagePct: 150,
    effects: [{ kind: 'damage' }, { kind: 'apply_status', durationTurns: 2 }] };
  const before = structuredClone(source);
  const plan = buildSharedExecutionPlanV1940({ specializationId: 'wizard_arcane_mage', mode: 'solo', skill: source,
    actor: actor(), targets: [{ id: 'enemy', hp: 500, defense: 50 }], statSnapshot: { stats: { attack: 300 } } });
  assert.equal(plan.version, SHARED_DIFFERENTIAL_AUDIT_VERSION_V1940);
  assert.equal(plan.cost, 20);
  assert.equal(plan.cooldownTurns, 3);
  assert.equal(plan.expectedDamage[0].amount, 400);
  assert.deepEqual(source, before);
});

test('V1940 comparator detects resource, cooldown, damage and status divergences without claiming parity', () => {
  const plan = buildSharedExecutionPlanV1940({ specializationId: 'warrior_iron_bastion', mode: 'party',
    skill: { id: 'slam', resourceType: 'stamina', resourceCost: 30, cooldownTurns: 2, damagePct: 200, effects: [{ kind: 'damage' }] },
    actor: actor(), targets: [{ id: 'enemy', hp: 900, defense: 100 }], statSnapshot: { stats: { attack: 300 } } });
  const beforeActor = { ...actor(), resources: { mana: 5000, stamina: 100 }, cooldowns: {}, statuses: {} };
  const afterActor = { ...actor(), resources: { mana: 5000, stamina: 80 }, cooldowns: { slam: 1 }, statuses: { burn: { durationTurns: 2 } } };
  const result = compareLegacyOutcomeToSharedPlanV1940({ plan, beforeActor, afterActor,
    beforeTargets: [{ id: 'enemy', hp: 900, defense: 100 }], afterTargets: [{ id: 'enemy', hp: 700, defense: 100 }], events: [{ type: 'damage' }] });
  assert.equal(result.parityProven, false);
  assert.equal(result.classification, 'requires_specialization_review');
  assert.deepEqual(result.differences.map(row => row.category), ['resource_cost', 'cooldown_commit', 'damage_formula_divergence', 'status_delta']);
});

test('all 80 specialization skills generate deterministic plans in Solo, Party and PvP (240 plans)', () => {
  let checks = 0;
  for (const [specializationId, spec] of Object.entries(IMPLEMENTED_SPECIALIZATION_DATA_V1939)) {
    for (const skill of spec.skills) for (const mode of ['solo', 'party', 'pvp']) {
      const a = actor();
      const preflight = prepareSpecializationSharedEngineShadowV1939({ mode, specializationId, skillId: skill.id,
        payload: { actor: a, targets: [{ id: 'enemy', hp: 10000, defense: 100 }], targetId: 'enemy' } });
      assert.ok(preflight.sharedPlan, `${specializationId}/${skill.id}/${mode}`);
      assert.equal(preflight.sharedPlan.skillId, String(skill.id));
      assert.equal(preflight.sharedPlan.mode, mode);
      assert.ok(Array.isArray(preflight.sharedPlan.effects));
      checks++;
    }
  }
  assert.equal(checks, 240);
});

test('authoritative Wizard execution records a passive V1940 differential observation', async () => {
  const { resolveSpecializationSkill, getSharedEngineDifferentialAuditV1940 } = await import('../systems/combat/specialization-skill-bridge.js');
  const { ARCANE_MAGE } = await import('../systems/classes/arcane-mage.js');
  const skill = ARCANE_MAGE.skills[0];
  const a = actor();
  a.classProgress = { arcaneMage: { skillRanks: {}, unlockedTalents: [], selectedTalents: [], cooldowns: {} } };
  const before = structuredClone(a);
  const result = resolveSpecializationSkill(null, 'wizard_arcane_mage', skill.id, { mode: 'solo', actor: a,
    targetId: 'audit-target', targets: [{ id: 'audit-target', hp: 5000, maxHp: 5000, defense: 50 }] });
  const audit = getSharedEngineDifferentialAuditV1940();
  assert.ok(result?.actor);
  assert.equal(audit.specializationId, 'wizard_arcane_mage');
  assert.equal(audit.skillId, String(skill.id));
  assert.equal(audit.parityProven, false);
  assert.deepEqual(a, before, 'input actor remains isolated');
});

test('authoritative Warrior execution records a passive V1940 differential observation', async () => {
  const { resolveSpecializationSkill, getSharedEngineDifferentialAuditV1940 } = await import('../systems/combat/specialization-skill-bridge.js');
  const { IRON_BASTION_DATA } = await import('../systems/combat/iron-bastion-runtime.js');
  const skill = IRON_BASTION_DATA.skills[0];
  const a = actor();
  a.stamina = 5000;
  a.resources.stamina = 5000;
  a.classProgress = { warrior_iron_bastion: { skillRanks: {}, unlockedTalents: [], talentRanks: {}, domain: { active: false }, skillCooldowns: {} } };
  const before = structuredClone(a);
  const result = resolveSpecializationSkill(null, 'warrior_iron_bastion', skill.id, { mode: 'solo', actor: a,
    targetId: 'audit-target', targets: [{ id: 'audit-target', hp: 5000, maxHp: 5000, defense: 50 }] });
  const audit = getSharedEngineDifferentialAuditV1940();
  assert.ok(result?.actor);
  assert.equal(audit.specializationId, 'warrior_iron_bastion');
  assert.equal(audit.skillId, String(skill.id));
  assert.equal(audit.parityProven, false);
  assert.deepEqual(a, before, 'input actor remains isolated');
});
