import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CLASS_SPECIALIZATION_SLOT_MANIFEST_V1928,
  auditClassSpecializationSlotsV1928,
  getSpecializationSlotV1928
} from '../../systems/combat/engines/class-specialization-slot-manifest-v1928.js';

test('10 classes reserve exactly 40 specialization slots', () => {
  const audit = auditClassSpecializationSlotsV1928();
  assert.equal(audit.complete, true, audit.errors.join(','));
  assert.equal(audit.classCount, 10);
  assert.equal(audit.specializationCount, 40);
  assert.equal(audit.implementedSpecializationCount, 8);
  assert.equal(audit.reservedSpecializationCount, 32);
});

test('Wizard and Warrior canonical specialization IDs are preserved', () => {
  const ids = CLASS_SPECIALIZATION_SLOT_MANIFEST_V1928.slice(0, 2).flatMap(item => item.specializationIds);
  assert.deepEqual(ids, [
    'wizard_arcane_mage', 'wizard_elementalist', 'wizard_warlock', 'wizard_necromancer',
    'warrior_sword_ascetic', 'warrior_iron_bastion', 'warrior_chaos', 'warrior_apocalypse_harbinger'
  ]);
});

test('the eight future class slots are reserved without fabricated names or content', () => {
  const future = CLASS_SPECIALIZATION_SLOT_MANIFEST_V1928.filter(item => item.status === 'reserved');
  assert.equal(future.length, 8);
  for (const item of future) {
    assert.equal(item.className, null);
    assert.equal(item.specializationSlots.length, 4);
    assert.ok(item.specializationSlots.every(slot => slot.contentRequired));
  }
});

test('slot lookup distinguishes reserved from implemented specializations', () => {
  assert.equal(getSpecializationSlotV1928('wizard_arcane_mage').classStatus, 'implemented');
  assert.equal(getSpecializationSlotV1928('reserved_class_03_spec_2').classStatus, 'reserved');
  assert.equal(getSpecializationSlotV1928('not_a_real_spec'), null);
});

test('validator rejects duplicate IDs and incomplete class slots', () => {
  const invalid = CLASS_SPECIALIZATION_SLOT_MANIFEST_V1928.map(item => ({ ...item, specializationIds: [...item.specializationIds] }));
  invalid[1].specializationIds[0] = invalid[0].specializationIds[0];
  assert.equal(auditClassSpecializationSlotsV1928(invalid).complete, false);
});
