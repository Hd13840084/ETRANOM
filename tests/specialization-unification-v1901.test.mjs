import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolveCanonicalSkillDamage, resolveSpecializationCombatActor, SPECIALIZATION_STAT_PROFILES } from '../systems/combat/character-stat-core.js';
import { normalizeSpecializationContentRecord, auditSpecializationContent } from '../systems/combat/specialization-contract-runtime.js';
import { resolveSpecializationSkill } from '../systems/combat/specialization-skill-bridge.js';
import { ARCANE_MAGE } from '../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../systems/classes/elementalist.js';
import { WARLOCK } from '../systems/classes/warlock.js';
import { NECROMANCER } from '../systems/classes/necromancer.js';
import SWORD from '../content/classes/warrior_sword_ascetic_v1.json' with { type: 'json' };
import IRON from '../content/classes/warrior_iron_bastion_v1.json' with { type: 'json' };
import CHAOS from '../content/classes/warrior_chaos_v1.json' with { type: 'json' };
import APOCALYPSE from '../content/classes/warrior_apocalypse_harbinger_v1.json' with { type: 'json' };

const SPECS = [ARCANE_MAGE, ELEMENTALIST, WARLOCK, NECROMANCER, SWORD, IRON, CHAOS, APOCALYPSE];

test('canonical skill damage formula applies percentage, additive bonus and defense in one deterministic order', () => {
  const result = resolveCanonicalSkillDamage({ attackPower: 100, damagePct: 200, percentBonus: 10, flatBonus: 5, targetDefense: 40, defenseReductionPct: 25 });
  assert.equal(result.effectiveDefense, 30);
  assert.equal(Math.round(result.raw), 225);
  assert.equal(result.damage, 163);
  const reduced = resolveCanonicalSkillDamage({ attackPower: 100, damagePct: 200, percentBonus: 10, flatBonus: 5, targetDefense: 40, defenseReductionPct: 25, targetDamageReductionPct: 25 });
  assert.equal(reduced.damage, 122);
});

test('every implemented specialization opts into the canonical stat core and uses its own offense channel', () => {
  assert.equal(Object.keys(SPECIALIZATION_STAT_PROFILES).length, 8);
  for (const spec of SPECS) {
    const actor = resolveSpecializationCombatActor({ attack: 10, magicPower: 10, stats: { power: 10, intellect: 10 } }, spec.id);
    assert.equal(actor.useCanonicalStatCore, true, spec.id);
    assert.equal(actor.canonicalStatVersion, '1.2.0', spec.id);
    assert.equal(actor.damageArchetype, SPECIALIZATION_STAT_PROFILES[spec.id].damageArchetype, spec.id);
    assert.equal(actor.baseAttack, 10, `${spec.id} preserves base physical attack`);
    assert.equal(actor.baseMagicAttack, 10, `${spec.id} preserves base magical attack`);
  }
});

test('all eight specs normalize to 10 skills, 32 talents, four domain stages and ten exclusive ascensions', () => {
  for (const spec of SPECS) {
    const report = auditSpecializationContent(spec, spec.id);
    assert.equal(report.ok, true, `${spec.id}: ${report.errors.join(', ')}`);
    const normalized = normalizeSpecializationContentRecord(spec);
    assert.equal(normalized.skills.length, 10);
    assert.ok(normalized.skills.every(skill => skill.rankCap === 7 && skill.upgrades.length === 6));
    assert.ok(normalized.skills.every(skill => Number.isFinite(skill.resourceCost) && Number.isFinite(skill.cooldownTurns)));
    assert.equal(normalized.talentBranches.length, 4);
    assert.ok(normalized.talentBranches.every(branch => branch.talents.length === 8));
    assert.equal(normalized.domain.stages.length, 4);
    assert.deepEqual(normalized.domain.stages.map(stage => stage.unlockLevel), [25, 40, 50, 50], `${spec.id} domain unlock parity`);
    assert.ok(normalized.domain.stages.every((stage, index) => stage.stage === index + 1 && stage.modeRules.solo && stage.modeRules.party && stage.modeRules.pvp));
    assert.equal(normalized.ascensions.length, 10);
    const skillIds = new Set(normalized.skills.map(skill => skill.id));
    assert.ok(normalized.ascensions.every(ascension => ascension.selectionLimitPerDomainActivation === 1 && ascension.oneUsePerDomain && skillIds.has(ascension.baseSkillId)), `${spec.id} ascension base skill mapping`);
  }
});

test('the future specialization template reserves the same complete 10/32/4/10 shape', () => {
  const template = JSON.parse(fs.readFileSync(new URL('../content/classes/SPECIALIZATION_TEMPLATE_V1.json', import.meta.url), 'utf8'));
  assert.equal(template.skills.length, 10);
  assert.equal(template.talentBranches.length, 4);
  assert.equal(template.talentBranches.reduce((sum, branch) => sum + branch.talents.length, 0), 32);
  assert.equal(template.domain.stages.length, 4);
  assert.equal(template.ascendedSkills.length, 10);
  assert.deepEqual(template.combatModes, ['solo', 'party', 'pvp']);
  assert.equal(template.mustUseCanonicalStatCore, true);
  assert.equal(template.mustUseCanonicalSkillDamage, true);
});


test('all eight specialization skill routes use the same stat and defense pipeline in Solo, Party and PvP', () => {
  const samples = [
    ['warrior_sword_ascetic', 'black_crescent'],
    ['warrior_iron_bastion', 'ironcleave'],
    ['warrior_chaos', 'chaos_rend'],
    ['warrior_apocalypse_harbinger', 'apoc_strike'],
    ['wizard_arcane_mage', 'arcane_bolt'],
    ['wizard_elementalist', 'ember_bolt'],
    ['wizard_warlock', 'forbidden_signature'],
    ['wizard_necromancer', 'death_claw']
  ];
  for (const mode of ['solo', 'party', 'pvp']) for (const [specializationId, skillId] of samples) {
    const actor = { id: 'hero', level: 50, hp: 1000, maxHp: 1000, mp: 1000, maxMp: 1000,
      stamina: 1000, maxStamina: 1000, attack: 10, magicPower: 10,
      stats: { power: 10, intellect: 10 }, skillPoints: 100 };
    const result = resolveSpecializationSkill(null, specializationId, skillId, {
      actor, targets: [{ id: 'enemy', hp: 10000, maxHp: 10000, defense: 40 }], targetId: 'enemy', mode
    });
    assert.equal(result.actor.useCanonicalStatCore, true, `${mode}/${specializationId}`);
    const target = result.targets.find(entry => entry.id === 'enemy');
    assert.ok(target.hp < 10000, `${mode}/${specializationId} did not damage the target`);
  }
});
