import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCANE_MAGE } from '../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../systems/classes/elementalist.js';
import { WARLOCK } from '../systems/classes/warlock.js';
import { NECROMANCER } from '../systems/classes/necromancer.js';
import SWORD from '../content/classes/warrior_sword_ascetic_v1.json' with { type: 'json' };
import IRON from '../content/classes/warrior_iron_bastion_v1.json' with { type: 'json' };
import CHAOS from '../content/classes/warrior_chaos_v1.json' with { type: 'json' };
import APOCALYPSE from '../content/classes/warrior_apocalypse_harbinger_v1.json' with { type: 'json' };
import { auditSpecializationContent, normalizeSpecializationContentRecord } from '../systems/combat/specialization-contract-runtime.js';
import { listAllImplementedSpecializationSkills } from '../systems/combat/specialization-skill-bridge.js';

const SPECS = [ARCANE_MAGE,ELEMENTALIST,WARLOCK,NECROMANCER,SWORD,IRON,CHAOS,APOCALYPSE];

test('all eight implemented specializations meet the same 10/32/4/10 content dimensions', () => {
  for (const spec of SPECS) {
    const report = auditSpecializationContent(spec, spec.id);
    assert.equal(report.ok, true, `${spec.id}: ${report.errors.join(', ')}`);
    assert.deepEqual(report.counts, { skills:10, talentBranches:4, talents:32, domainStages:4, ascensions:10 });
  }
});

test('all 80 skills normalize to one seven-rank contract without changing their base percentages', () => {
  const normalized = SPECS.flatMap(spec => normalizeSpecializationContentRecord(spec).skills);
  assert.equal(normalized.length, 80);
  for (const skill of normalized) {
    assert.equal(skill.rankCap, 7);
    assert.equal(skill.upgrades.length, 6, `${skill.specializationId}/${skill.id}`);
    assert.ok(['stamina','mana'].includes(skill.resourceType));
    assert.ok(Number.isFinite(skill.resourceCost));
    assert.ok(Number.isFinite(skill.cooldownTurns));
  }
  const before = SPECS.flatMap(spec => spec.skills).find(skill => skill.id === 'black_crescent');
  const after = normalized.find(skill => skill.id === 'black_crescent');
  assert.equal(after.powerPct, before.powerPct);
  assert.equal(after.effects.damagePct, before.powerPct);
});

test('public skill catalog exposes all eight specialization skills through normalized records', () => {
  const skills = listAllImplementedSpecializationSkills();
  assert.equal(skills.length, 80);
  assert.ok(skills.every(skill => skill.rankCap === 7 && skill.resourceType && skill.effects && skill.contractType));
});
