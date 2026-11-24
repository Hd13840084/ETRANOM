import test from 'node:test';
import assert from 'node:assert/strict';
import { IMPLEMENTED_SPECIALIZATION_DATA_V1939 } from '../systems/combat/engines/shared-engine-specialization-orchestrator-v1939.js';
import { CentralCombatLifecycleV1956 } from '../systems/combat/engines/central-combat-lifecycle-v1956.js';
import {
  auditCentralSkillEffectCoverageV1958,
  buildCentralSkillEffectCatalogV1958,
  compileCentralSkillEffectPlanV1958,
  compileCentralDomainActivationPlanV1958,
  resolveCentralDomainProfileV1958,
  createCentralSkillEffectCompilerV1958
} from '../systems/combat/engines/central-skill-effect-compiler-v1958.js';

const entries = Object.entries(IMPLEMENTED_SPECIALIZATION_DATA_V1939);
const stats = { attack: 1000, magicPower: 1000, stats: { attack: 1000, magicPower: 1000, physicalAttack: 1000, magicalAttack: 1000 } };

test('V1958 has authored base and ascended adapters for all 80 implemented skills', () => {
  const audit = auditCentralSkillEffectCoverageV1958();
  assert.equal(audit.totalSkills, 80);
  assert.equal(audit.baseAdapters, 80);
  assert.equal(audit.ascendedForms, 80);
  assert.equal(audit.missingAscendedForms, 0);
  assert.equal(audit.domainStageProfiles, 8);
});

test('all 80 base forms compile to non-empty trusted effect plans', () => {
  let count = 0;
  for (const [specializationId, spec] of entries) for (const skill of spec.skills) {
    const result = compileCentralSkillEffectPlanV1958({ specializationId, skillId: skill.id, skill, stats, domain: { active: false } }, {});
    assert.equal(result.form, 'base', `${specializationId}:${skill.id}`);
    assert.ok(result.operations.length > 0, `${specializationId}:${skill.id}`);
    assert.ok(result.operations.length <= 64);
    count++;
  }
  assert.equal(count, 80);
});

test('all 80 domain ascended forms compile and are bound to their exact base skill', () => {
  let count = 0;
  for (const [specializationId, spec] of entries) for (const skill of spec.skills) {
    const form = spec.ascendedSkills.find(row => String(row.skillId || row.baseSkillId) === skill.id);
    assert.ok(form, `${specializationId}:${skill.id} ascension missing`);
    const result = compileCentralSkillEffectPlanV1958({ specializationId, skillId: skill.id, skill, stats,
      domain: { active: true, stage: 4, ascensionId: form.id } }, {});
    assert.equal(result.form, 'ascended');
    assert.equal(result.ascendedFormId, form.id);
    assert.ok(result.operations.length > 0);
    count++;
  }
  assert.equal(count, 80);
});

test('all compiled base and ascended operations are supported by the central lifecycle', () => {
  const supported = new Set(['damage','heal','shield','apply_status','remove_status','resource_gain','resource_drain','modifier','summon','multi_hit','reaction','taunt','revive']);
  for (const [specializationId, spec] of entries) for (const skill of spec.skills) {
    const form = spec.ascendedSkills.find(row => String(row.skillId || row.baseSkillId) === skill.id);
    const base = compileCentralSkillEffectPlanV1958({ specializationId, skillId: skill.id, skill, stats, domain: { active: false } }, {});
    const asc = compileCentralSkillEffectPlanV1958({ specializationId, skillId: skill.id, skill, stats, domain: { active: true, stage: 4, ascensionId: form.id } }, {});
    for (const op of [...base.operations, ...asc.operations]) assert.ok(supported.has(op.type), `${specializationId}:${skill.id}:${op.type}`);
  }
  const catalog = buildCentralSkillEffectCatalogV1958({ referencePower: 1000 });
  assert.equal(catalog.skills, 80);
  assert.ok(catalog.rows.every(row => row.base.operations.length && row.ascended.operations.length));
});

test('domain stages resolve for every implemented specialization and activation effects compile', () => {
  for (const [specializationId] of entries) for (let stage = 1; stage <= 4; stage++) {
    const profile = resolveCentralDomainProfileV1958(specializationId, stage);
    const plan = compileCentralDomainActivationPlanV1958(specializationId, stage);
    assert.equal(profile.stage, stage);
    assert.ok(profile.durationTurns >= 4);
    assert.ok(plan.operations.length > 0);
  }
});

test('ascended form cannot be compiled outside domain or against a different base skill', () => {
  const spec = IMPLEMENTED_SPECIALIZATION_DATA_V1939.wizard_arcane_mage;
  const form = spec.ascendedSkills[0];
  assert.throws(() => compileCentralSkillEffectPlanV1958({ specializationId: 'wizard_arcane_mage', skillId: 'arcane_bolt', skill: spec.skills[0], stats,
    domain: { active: false, ascensionId: form.id } }, {}), /ascension_form_skill_mismatch/);
  assert.throws(() => compileCentralSkillEffectPlanV1958({ specializationId: 'wizard_arcane_mage', skillId: 'arcane_shield', skill: spec.skills[1], stats,
    domain: { active: true, ascensionId: form.id } }, {}), /ascension_form_skill_mismatch/);
});

test('authored numeric ascension powers are retained for Arcane Mage, Elementalist and Iron Bastion', () => {
  const mage = IMPLEMENTED_SPECIALIZATION_DATA_V1939.wizard_arcane_mage;
  const bolt = compileCentralSkillEffectPlanV1958({ specializationId: 'wizard_arcane_mage', skillId: 'arcane_bolt', skill: mage.skills[0], stats,
    domain: { active: true, stage: 4, ascensionId: 'asc_arcane_bolt' } }, {});
  assert.equal(bolt.operations.find(op => op.type === 'damage')?.amount, 8000 * 1.45);
  const elemental = IMPLEMENTED_SPECIALIZATION_DATA_V1939.wizard_elementalist;
  const ember = compileCentralSkillEffectPlanV1958({ specializationId: 'wizard_elementalist', skillId: 'ember_bolt', skill: elemental.skills[0], stats,
    domain: { active: true, stage: 1, ascensionId: 'asc_ember_bolt' } }, {});
  assert.ok(Math.abs(ember.operations.find(op => op.type === 'damage')?.amount - 3300 * 1.15) < 1e-8);
  const iron = IMPLEMENTED_SPECIALIZATION_DATA_V1939.warrior_iron_bastion;
  const cleave = compileCentralSkillEffectPlanV1958({ specializationId: 'warrior_iron_bastion', skillId: 'ironcleave', skill: iron.skills[0], stats,
    domain: { active: true, stage: 1, ascensionId: 'asc_ironcleave' } }, {});
  assert.ok(Math.abs(cleave.operations.find(op => op.type === 'damage')?.amount - 3000 * 1.10) < 1e-8);
});

test('V1958 compiler is injected into V1956 lifecycle and executes a server-owned skill plan', () => {
  const spec = IMPLEMENTED_SPECIALIZATION_DATA_V1939.wizard_elementalist;
  const skill = spec.skills.find(row => row.id === 'ember_bolt');
  const plan = { schema: 'etranom.central-skill-plan.v1', mode: 'solo', actorId: 'hero-1', specializationId: 'wizard_elementalist',
    skillId: skill.id, requestId: 'v1958-smoke-1', targetId: 'enemy-1', skill, stats, rank: 1,
    domain: { active: false }, resource: { resource: 'mana', cost: 0 }, cooldown: { turns: 0 }, executionStatus: 'prepared_only' };
  const lifecycle = new CentralCombatLifecycleV1956({ effectCompiler: createCentralSkillEffectCompilerV1958() });
  const result = lifecycle.executePreparedSkill({ plan, requestId: plan.requestId, targetId: 'enemy-1', state: {
    actor: { id: 'hero-1', hp: 1000, maxHp: 1000, mp: 1000, maxMp: 1000 },
    targets: [{ id: 'enemy-1', hp: 10000, maxHp: 10000, shield: 0 }]
  } });
  assert.equal(result.duplicate, false);
  assert.equal(result.state.targets[0].hp, 8500);
});
