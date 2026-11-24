import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCANE_MAGE, createArcaneMageProgress, normalizeArcaneMageProgress } from '../../systems/classes/arcane-mage.js';

test('Arcane Mage has ten skills with six upgrades each', () => {
  assert.equal(ARCANE_MAGE.skills.length, 10);
  assert.ok(ARCANE_MAGE.skills.every(s => s.upgrades.length === 6));
  assert.equal(ARCANE_MAGE.skills.reduce((n,s) => n + s.upgrades.length, 0), 60);
  assert.deepEqual(ARCANE_MAGE.skills.map(s => s.unlockLevel), [1,2,3,4,5,6,7,8,9,10]);
});

test('Arcane Mage has four independent eight-talent branches and ten ascended skills', () => {
  assert.equal(ARCANE_MAGE.talentBranches.length, 4);
  assert.ok(ARCANE_MAGE.talentBranches.every(b => b.talents.length === 8));
  assert.equal(ARCANE_MAGE.talentBranches.reduce((n,b) => n + b.talents.length, 0), 32);
  assert.equal(ARCANE_MAGE.ascendedSkills.length, 10);
  assert.equal(new Set(ARCANE_MAGE.ascendedSkills.map(x => x.skillId)).size, 10);
});

test('Arcane domain unlock levels and turn-based/no-distance rules are correct', () => {
  assert.deepEqual(ARCANE_MAGE.domain.stages.map(x => x.level), [25,40,50,50]);
  assert.equal(ARCANE_MAGE.combatRules.distance, false);
  assert.equal(ARCANE_MAGE.domain.use.oncePerBattle, true);
  assert.equal(ARCANE_MAGE.progression.ascendedSkillChoiceCount, 1);
  assert.equal(ARCANE_MAGE.progression.levelUpRewards.attributePoints, 5);
  assert.equal(ARCANE_MAGE.progression.levelUpRewards.skillPoints, 2);
  assert.equal(ARCANE_MAGE.combatRules.charges.outsideCombatExpirySeconds, 20);
});

test('Progress normalization preserves ranks and keeps points/progression modular', () => {
  const fresh = createArcaneMageProgress();
  assert.equal(fresh.charges, 0);
  const migrated = normalizeArcaneMageProgress({ skillRanks: { arcane_bolt: 4 }, unlockedTalents: ['arcane_force'] });
  assert.equal(migrated.skillRanks.arcane_bolt, 4);
  assert.deepEqual(migrated.unlockedTalents, ['arcane_force']);
  assert.equal(migrated.domainQuest.complete, false);
});


test('Arcane charge normalization enforces the base cap and the Ancient Reserve talent cap', () => {
  assert.equal(normalizeArcaneMageProgress({ charges: 99 }).charges, 5);
  assert.equal(normalizeArcaneMageProgress({ charges: 99, unlockedTalents: ['ancient_reserve'] }).charges, 6);
  assert.equal(normalizeArcaneMageProgress({ charges: 6 }).charges, 5);
  assert.equal(normalizeArcaneMageProgress({ charges: 6, unlockedTalents: ['ancient_reserve'] }).charges, 6);
});

test('Arcane specialization has no spatial targeting and has bounded skill ranks', () => {
  assert.equal(ARCANE_MAGE.combatRules.distance, false);
  assert.ok(ARCANE_MAGE.skills.every(s => s.manaPct > 0 && s.cooldownTurns >= 0));
  assert.equal(normalizeArcaneMageProgress({ skillRanks: { arcane_bolt: 99 } }).skillRanks.arcane_bolt, 7);
});

import {
  activateArcaneMageDomain,
  getAvailableArcaneMageAscendedSkills,
  selectArcaneMageAscendedSkill,
  consumeArcaneMageAscendedSkill,
  endArcaneMageDomain
} from '../../systems/classes/arcane-mage.js';

test('Arcane Mage chooses one second form only after Domain activation and only for that activation', () => {
  const activated = activateArcaneMageDomain(createArcaneMageProgress(), 25);
  assert.equal(activated.ok, true);
  assert.equal(activated.progress.domainActive, true);
  assert.equal(activated.progress.ascendedSkillId, null);
  assert.equal(getAvailableArcaneMageAscendedSkills(activated.progress).length, 10);

  const selected = selectArcaneMageAscendedSkill(activated.progress, 'asc_arcane_bolt');
  assert.equal(selected.ok, true);
  assert.equal(selected.progress.ascendedSkillId, 'asc_arcane_bolt');
  assert.deepEqual(getAvailableArcaneMageAscendedSkills(selected.progress).map(x => x.id), ['asc_arcane_bolt']);
  const sharedResolution = resolveWizardDomainSkillFormV1926({ specialization: ARCANE_MAGE, progress: selected.progress, skillId: 'arcane_bolt' });
  const otherSkillResolution = resolveWizardDomainSkillFormV1926({ specialization: ARCANE_MAGE, progress: selected.progress, skillId: 'arcane_shield' });
  assert.equal(sharedResolution.isDomainForm, true);
  assert.equal(sharedResolution.domainForm.id, 'asc_arcane_bolt');
  assert.equal(otherSkillResolution.isDomainForm, false);
  assert.equal(selectArcaneMageAscendedSkill(selected.progress, 'asc_arcane_shield').reason, 'ascended_skill_already_selected');

  const consumed = consumeArcaneMageAscendedSkill(selected.progress, 'asc_arcane_bolt');
  assert.equal(consumed.ok, true);
  assert.equal(consumed.progress.ascendedSkillUsedThisDomain, true);
  assert.equal(getAvailableArcaneMageAscendedSkills(consumed.progress).length, 0);
  assert.equal(consumeArcaneMageAscendedSkill(consumed.progress, 'asc_arcane_bolt').reason, 'ascended_skill_already_used');

  const ended = endArcaneMageDomain(consumed.progress);
  assert.equal(ended.domainActive, false);
  assert.equal(ended.ascendedSkillId, null);
  assert.equal(ended.ascendedSkillUsedThisDomain, false);
});

test('Arcane Mage can choose a different second form on the next battle activation', () => {
  const first = activateArcaneMageDomain(createArcaneMageProgress(), 25);
  const chosenFirst = selectArcaneMageAscendedSkill(first.progress, 'asc_arcane_bolt');
  const ended = endArcaneMageDomain(chosenFirst.progress);
  const nextBattle = { ...ended, domainUsesThisBattle: 0 };
  const second = activateArcaneMageDomain(nextBattle, 25);
  const chosenSecond = selectArcaneMageAscendedSkill(second.progress, 'asc_arcane_shield');
  assert.equal(chosenSecond.ok, true);
  assert.equal(chosenSecond.progress.ascendedSkillId, 'asc_arcane_shield');
});


test('Arcane Mage Domain remains once per battle even after its timer ends', () => {
  const activated = activateArcaneMageDomain(createArcaneMageProgress(), 25);
  const ended = endArcaneMageDomain(activated.progress);
  assert.equal(ended.domainUsesThisBattle, 1);
  assert.equal(activateArcaneMageDomain(ended, 25).reason, 'already_used_this_battle');
  const nextBattle = { ...ended, domainUsesThisBattle: 0 };
  assert.equal(activateArcaneMageDomain(nextBattle, 25).ok, true);
});

import { resolveWizardDomainSkillFormV1926 } from '../../systems/combat/engines/wizard-domain-form-engine-v1926.js';
