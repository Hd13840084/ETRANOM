import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_IDENTITY_ROSTER_V2047, auditCharacterIdentityRosterV2047, getCharacterIdentityV2047 } from '../../systems/characters/character-identity-roster-v2047.js';

test('V2047 defines exactly 40 specialization character identities', () => {
  assert.equal(CHARACTER_IDENTITY_ROSTER_V2047.length, 40);
  assert.equal(auditCharacterIdentityRosterV2047().complete, true);
});

test('V2047 distributes four distinct identities across ten classes', () => {
  const audit = auditCharacterIdentityRosterV2047();
  assert.equal(audit.classCount, 10);
  assert.equal(audit.specializationsPerClass, 4);
});

test('each identity has a unique specialization ID and visual signature', () => {
  const ids = CHARACTER_IDENTITY_ROSTER_V2047.map(item => item.specializationId);
  const signatures = CHARACTER_IDENTITY_ROSTER_V2047.map(item => `${item.silhouetteFa}|${item.signatureGearFa}|${item.auraFa}`);
  assert.equal(new Set(ids).size, 40);
  assert.equal(new Set(signatures).size, 40);
});

test('known wizard and warrior specialization IDs resolve without changing combat data', () => {
  assert.equal(getCharacterIdentityV2047('wizard_necromancer')?.specializationNameFa, 'نکرومنسر');
  assert.equal(getCharacterIdentityV2047('warrior_iron_bastion')?.specializationNameFa, 'دژ آهنین');
  assert.equal(CHARACTER_IDENTITY_ROSTER_V2047.every(item => item.gameplayMutation === false), true);
});

test('unknown specialization returns null', () => {
  assert.equal(getCharacterIdentityV2047('not_a_real_specialization'), null);
});
