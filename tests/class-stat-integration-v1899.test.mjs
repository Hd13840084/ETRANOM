import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolveActorAttackPower } from '../systems/combat/character-stat-core.js';
import { resolveCombatSkill } from '../systems/combat/shared-skill-runtime.js';

test('opt-in canonical stat channel is used by the shared skill resolver', () => {
  const actor = { id: 'p1', hp: 100, maxHp: 100, mp: 20, maxMp: 20, attack: 10, magicPower: 10,
    stats: { power: 10 }, damageArchetype: 'physical', useCanonicalStatCore: true };
  const target = { id: 'e1', hp: 500, maxHp: 500, defense: 0 };
  const result = resolveCombatSkill({ mode: 'solo', actor, targets: [target], skill: {
    id: 'canonical_strike', type: 'single_damage', scalingStat: 'attack', damagePct: 100, manaCost: 0
  }});
  const expectedPower = resolveActorAttackPower(actor).physicalSkillPower;
  assert.equal(result.targets[0].hp, 500 - Math.floor(expectedPower));
});

test('legacy skill actors retain their prior precomputed attack behavior unless explicitly opted in', () => {
  const actor = { id: 'p1', hp: 100, maxHp: 100, mp: 20, maxMp: 20, attack: 80, magicPower: 20 };
  const target = { id: 'e1', hp: 500, maxHp: 500, defense: 0 };
  const result = resolveCombatSkill({ mode: 'solo', actor, targets: [target], skill: {
    id: 'legacy_strike', type: 'single_damage', scalingStat: 'attack', damagePct: 100, manaCost: 0
  }});
  assert.equal(result.targets[0].hp, 420);
});

test('all eight current specializations and all 32 future slots require the shared contract', () => {
  const profiles = JSON.parse(fs.readFileSync(new URL('../content/classes/specialization_combat_profiles_v1.json', import.meta.url), 'utf8'));
  const roadmap = JSON.parse(fs.readFileSync(new URL('../content/classes/FUTURE_CLASS_ROADMAP_V1.json', import.meta.url), 'utf8'));
  const contract = JSON.parse(fs.readFileSync(new URL('../content/classes/CLASS_SPECIALIZATION_CONTRACT_V1.json', import.meta.url), 'utf8'));
  assert.equal(profiles.specializations.length, 8);
  assert.ok(profiles.specializations.every(x => x.stat_core_required && x.skill_effect_pipeline === 'shared'));
  assert.equal(roadmap.reserved_future_classes.length, 8);
  assert.equal(roadmap.reserved_future_classes.flatMap(x => x.specializations).length, 32);
  assert.equal(contract.shared_numeric_rules.physical.power_attack_per_point, 2.2);
  assert.equal(contract.shared_numeric_rules.magical.intellect_attack_per_point, 5);
  assert.equal(contract.implementation_requirements.must_use_shared_stat_core, true);
});
