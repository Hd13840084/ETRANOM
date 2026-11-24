import test from 'node:test';
import assert from 'node:assert/strict';
import { IMPLEMENTED_SPECIALIZATION_DATA_V1939 } from '../systems/combat/engines/shared-engine-specialization-orchestrator-v1939.js';
import { centralSpecializationEngineV1955 } from '../systems/combat/engines/central-specialization-engine-v1955.js';
import { CentralCombatLifecycleV1956 } from '../systems/combat/engines/central-combat-lifecycle-v1956.js';
import { auditCentralSkillEffectCoverageV1957, compileCentralSkillEffectPlanV1957, createCentralSkillEffectCompilerV1957 } from '../systems/combat/engines/central-skill-effect-compiler-v1957.js';

const actor = () => ({ id:'hero', level:50, hp:1000, maxHp:1000, mp:1000, maxMp:1000, stamina:1000, maxStamina:1000, attack:100, magicPower:100, resources:{mana:1000,stamina:1000} });
const target = () => ({ id:'enemy', hp:2000, maxHp:2000, shield:0, statuses:[], modifiers:[], reactions:[] });

test('inventory covers exactly 8 implemented specializations and 80 skills', () => {
  const audit = auditCentralSkillEffectCoverageV1957();
  assert.equal(Object.keys(IMPLEMENTED_SPECIALIZATION_DATA_V1939).length, 8);
  assert.equal(audit.total, 80);
  assert.equal(audit.mapped + audit.customRequired, 80);
  assert.ok(audit.mapped > 20);
  assert.equal(audit.parityVerified, false);
  assert.equal(audit.executionAuthority, 'shadow_only');
});

test('mapped skills compile only from server-owned specialization records', () => {
  const audit = auditCentralSkillEffectCoverageV1957();
  for (const row of audit.rows.filter(r => r.mapping)) {
    const spec = IMPLEMENTED_SPECIALIZATION_DATA_V1939[row.specializationId];
    const raw = spec.skills.find(s => s.id === row.skillId);
    const prepared = centralSpecializationEngineV1955.prepareSkill({ mode:'solo', specializationId:row.specializationId,
      skillId:row.skillId, actor:actor(), targets:[target()], targetId:'enemy', requestId:`audit:${row.skillId}` });
    const compiled = compileCentralSkillEffectPlanV1957(prepared, { actor:actor(), targets:[target()] });
    assert.equal(compiled.skillId, raw.id);
    assert.ok(compiled.operations.length > 0, row.skillId);
  }
});

test('custom mechanics fail closed instead of receiving guessed generic effects', () => {
  const audit = auditCentralSkillEffectCoverageV1957();
  const row = audit.rows.find(r => r.status === 'custom_adapter_required');
  const prepared = centralSpecializationEngineV1955.prepareSkill({ mode:'solo', specializationId:row.specializationId,
    skillId:row.skillId, actor:actor(), targets:[target()], targetId:'enemy', requestId:'custom-reject' });
  assert.throws(() => compileCentralSkillEffectPlanV1957(prepared, { actor:actor(), targets:[target()] }), /skill_requires_specialized_effect_adapter/);
});

test('compiled plan executes through V1956 atomically and charges the prepared resource', () => {
  const prepared = centralSpecializationEngineV1955.prepareSkill({ mode:'solo', specializationId:'warrior_sword_ascetic',
    skillId:'black_crescent', actor:actor(), targets:[target()], targetId:'enemy', requestId:'execute-black-crescent' });
  const lifecycle = new CentralCombatLifecycleV1956({ effectCompiler:createCentralSkillEffectCompilerV1957() });
  const result = lifecycle.executePreparedSkill({ plan:prepared, state:{ actor:actor(), targets:[target()] }, requestId:'execute-black-crescent', targetId:'enemy' });
  assert.equal(result.duplicate, false);
  assert.equal(result.state.targets[0].hp, 1720);
  assert.equal(result.state.actor.stamina, 995);
});

test('compiler refuses ranked or progression-modified skills until their effects are mapped', () => {
  const prepared = centralSpecializationEngineV1955.prepareSkill({ mode:'solo', specializationId:'warrior_iron_bastion',
    skillId:'fortress_stance', actor:actor(), targets:[target()], requestId:'ranked-reject' });
  assert.throws(() => compileCentralSkillEffectPlanV1957({ ...prepared, rank:2 }, { actor:actor(), targets:[target()] }), /ranked_skill_adapter_required/);
  assert.throws(() => compileCentralSkillEffectPlanV1957({ ...prepared, domain:{active:true,stage:1} }, { actor:actor(), targets:[target()] }), /progression_effect_adapter_required/);
});

test('compiler rejects unknown and non-mapped skills', () => {
  assert.throws(() => compileCentralSkillEffectPlanV1957({ specializationId:'wizard_warlock', skillId:'stolen_moment' }), /skill_requires_specialized_effect_adapter/);
});
