import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCANE_MAGE, normalizeArcaneMageProgress } from '../../systems/classes/arcane-mage.js';
import { ELEMENTALIST, normalizeElementalistProgress } from '../../systems/classes/elementalist.js';
import { WARLOCK, normalizeWarlockProgress } from '../../systems/classes/warlock.js';
import { NECROMANCER, normalizeNecromancerProgress } from '../../systems/classes/necromancer.js';

const roundTrip = (normalize, value) => normalize(JSON.parse(JSON.stringify(value)));

test('Arcane Mage durable progress retains charges, talents, Domain selection and cooldowns', () => {
  const p = roundTrip(normalizeArcaneMageProgress, { charges: 5, unlockedTalents: ['ancient_reserve'], domainStage: 'mastery', domainQuest: { guardianDefeats: 2 }, domainActive: true, domainUsesThisBattle: 1, ascendedSkillId: ARCANE_MAGE.ascendedSkills[0].id, ascendedSkillUsedThisDomain: false, skillCooldowns: { arcane_bolt: 4 }, lastSpellId: 'arcane_bolt' });
  assert.equal(p.charges, 5);
  assert.equal(p.domainActive, true);
  assert.equal(p.ascendedSkillId, ARCANE_MAGE.ascendedSkills[0].id);
  assert.equal(p.skillCooldowns.arcane_bolt, 4);
  assert.equal(p.domainQuest.guardianDefeats, 2);
});

test('Elementalist durable progress retains mastery, talents, Domain selection and cooldowns', () => {
  const p = roundTrip(normalizeElementalistProgress, { elementMastery: { fire: 61, darkness: 42 }, unlockedTalents: ['twilight_balance'], domainStage: 'ascension', domainActive: true, domainUsesThisBattle: 1, ascendedSkillId: ELEMENTALIST.ascendedSkills[8].id, ascendedSkillUsedThisDomain: true, skillCooldowns: { elemental_fusion: 8 } });
  assert.equal(p.elementMastery.fire, 61);
  assert.equal(p.elementMastery.darkness, 42);
  assert.equal(p.domainActive, true);
  assert.equal(p.ascendedSkillId, ELEMENTALIST.ascendedSkills[8].id);
  assert.equal(p.skillCooldowns.elemental_fusion, 8);
});

test('Warlock durable progress retains pact economy, hunger reservoir and Domain state', () => {
  const p = roundTrip(normalizeWarlockProgress, { pactDebt: 6, pactCredit: 3, hungerReservoir: 9, unlockedTalents: ['scribe_of_oaths'], domainStage: 'mastery', domainActive: true, domainUsesThisBattle: 1, ascendedSkillId: WARLOCK.ascendedSkills[9].id, ascendedSkillUsedThisDomain: true, skillCooldowns: { final_covenant: 5 }, domainQuest: { judgeDefeated: true } });
  assert.equal(p.pactDebt, 6);
  assert.equal(p.pactCredit, 3);
  assert.equal(p.hungerReservoir, 9);
  assert.equal(p.domainActive, true);
  assert.equal(p.ascendedSkillId, WARLOCK.ascendedSkills[9].id);
  assert.equal(p.domainQuest.judgeDefeated, true);
});

test('Necromancer durable progress retains souls, legion identity, active roster and revive state', () => {
  const member = { id: 'legion-test-1', speciesId: 'ash_hound', hp: 41, maxHp: 50, permanent: true, deathForm: { active: true, formId: 'ash_hound_death_form' } };
  const p = roundTrip(normalizeNecromancerProgress, { storedSouls: 7, legion: [member], activeLegionIds: [member.id], reviveUsedThisBattle: true, reviveArmed: true, domainActive: true, domainUsesThisBattle: 1, ascendedSkillId: NECROMANCER.ascendedSkills[7].id, ascendedSkillUsedThisDomain: true, skillCooldowns: { return_threshold: 6 }, domainQuest: { complete: true } });
  assert.equal(p.storedSouls, 7);
  assert.equal(p.legion[0].id, member.id);
  assert.deepEqual(p.activeLegionIds, [member.id]);
  assert.equal(p.reviveUsedThisBattle, true);
  assert.equal(p.domainActive, true);
  assert.equal(p.ascendedSkillId, NECROMANCER.ascendedSkills[7].id);
  assert.equal(p.domainQuest.complete, true);
});
