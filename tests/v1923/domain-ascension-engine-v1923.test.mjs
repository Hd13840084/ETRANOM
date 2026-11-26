import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCANE_MAGE } from '../../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../../systems/classes/elementalist.js';
import { WARLOCK } from '../../systems/classes/warlock.js';
import { NECROMANCER } from '../../systems/classes/necromancer.js';
import {
  auditDomainAscensionCatalogV1923,
  DomainAscensionEngineV1923,
  createDomainAscensionStateV1923
} from '../../systems/combat/engines/domain-ascension-engine-v1923.js';

const wizardSpecs = [ARCANE_MAGE, ELEMENTALIST, WARLOCK, NECROMANCER];

test('all four wizard specializations have ten base skills and ten mapped ascension forms', () => {
  for (const spec of wizardSpecs) {
    const audit = auditDomainAscensionCatalogV1923(spec);
    assert.equal(audit.ok, true, `${spec.id}: ${audit.errors.join('|')}`);
    assert.equal(audit.baseSkillCount, 10);
    assert.equal(audit.ascensionFormCount, 10);
    assert.equal(audit.mappedCount, 10);
  }
});

test('domain inactive exposes no ascension forms and resolves base skill', () => {
  const state = { domainActive: false };
  assert.equal(DomainAscensionEngineV1923.availableForms(ARCANE_MAGE, state).length, 0);
  assert.equal(DomainAscensionEngineV1923.resolveSkill(ARCANE_MAGE, state, 'arcane_bolt').id, 'arcane_bolt');
});

test('domain activation exposes all ten forms, but selection consumes exactly one', () => {
  const state = createDomainAscensionStateV1923('activation-1');
  assert.equal(DomainAscensionEngineV1923.availableForms(ARCANE_MAGE, state).length, 10);
  const chosen = DomainAscensionEngineV1923.select(ARCANE_MAGE, state, 'asc_arcane_bolt', 'activation-1');
  assert.equal(chosen.selectedForm.id, 'asc_arcane_bolt');
  assert.equal(chosen.progress.ascendedSkillUsedThisDomain, true);
  assert.equal(DomainAscensionEngineV1923.availableForms(ARCANE_MAGE, chosen.progress).length, 0);
  assert.equal(DomainAscensionEngineV1923.resolveSkill(ARCANE_MAGE, chosen.progress, 'arcane_bolt').id, 'asc_arcane_bolt');
  assert.equal(DomainAscensionEngineV1923.resolveSkill(ARCANE_MAGE, chosen.progress, 'arcane_shield').id, 'arcane_shield');
});

test('a second ascension selection in the same activation is rejected', () => {
  const state = createDomainAscensionStateV1923('activation-2');
  const chosen = DomainAscensionEngineV1923.select(ARCANE_MAGE, state, 'asc_arcane_bolt', 'activation-2');
  assert.throws(() => DomainAscensionEngineV1923.select(ARCANE_MAGE, chosen.progress, 'asc_arcane_shield', 'activation-2'), /ascended_skill_already_used/);
});

test('activation IDs cannot be replayed across domain activations', () => {
  const state = createDomainAscensionStateV1923('activation-new');
  assert.throws(() => DomainAscensionEngineV1923.select(ARCANE_MAGE, state, 'asc_arcane_bolt', 'activation-old'), /domain_activation_mismatch/);
});

test('domain end reverts selected form and clears temporary selection', () => {
  const state = createDomainAscensionStateV1923('activation-3');
  const chosen = DomainAscensionEngineV1923.select(ARCANE_MAGE, state, 'asc_arcane_bolt', 'activation-3');
  const ended = DomainAscensionEngineV1923.endDomain(chosen.progress);
  assert.equal(ended.domainActive, false);
  assert.equal(ended.ascendedSkillId, null);
  assert.equal(ended.ascendedSkillUsedThisDomain, false);
  assert.equal(DomainAscensionEngineV1923.resolveSkill(ARCANE_MAGE, ended, 'arcane_bolt').id, 'arcane_bolt');
});

test('all specialization-specific ascension mappings resolve their own base skill', () => {
  for (const spec of wizardSpecs) {
    const state = createDomainAscensionStateV1923(`${spec.id}-activation`);
    const form = spec.ascendedSkills[0];
    const selected = DomainAscensionEngineV1923.select(spec, state, form.id, `${spec.id}-activation`);
    const baseId = form.skillId || form.baseSkillId;
    assert.equal(DomainAscensionEngineV1923.resolveSkill(spec, selected.progress, baseId).id, form.id);
  }
});
