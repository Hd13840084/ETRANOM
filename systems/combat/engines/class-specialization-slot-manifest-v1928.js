/**
 * ETRANOM V1928 — 10-class / 40-specialization capacity manifest.
 * The first two classes are the currently authored Wizard and Warrior.
 * The remaining eight class identities are deliberately reserved: this file
 * creates capacity/contracts only and invents no names, skills, stats or lore.
 */
export const CLASS_SPECIALIZATION_SLOT_MANIFEST_VERSION_V1928 = '1928.0.0';

const implemented = [
  { classId: 'wizard', className: 'Wizard', status: 'implemented', specializationIds: [
    'wizard_arcane_mage', 'wizard_elementalist', 'wizard_warlock', 'wizard_necromancer'
  ]},
  { classId: 'warrior', className: 'Warrior', status: 'implemented', specializationIds: [
    'warrior_sword_ascetic', 'warrior_iron_bastion', 'warrior_chaos', 'warrior_apocalypse_harbinger'
  ]}
];

const reserved = Array.from({ length: 8 }, (_, index) => {
  const n = String(index + 3).padStart(2, '0');
  return {
    classId: `reserved_class_${n}`,
    className: null,
    status: 'reserved',
    specializationIds: [1, 2, 3, 4].map(slot => `reserved_class_${n}_spec_${slot}`)
  };
});

export const CLASS_SPECIALIZATION_SLOT_MANIFEST_V1928 = Object.freeze(
  [...implemented, ...reserved].map(entry => Object.freeze({
    ...entry,
    specializationIds: Object.freeze([...entry.specializationIds]),
    specializationSlots: Object.freeze(entry.specializationIds.map((id, index) => Object.freeze({
      specializationId: id,
      slot: index + 1,
      status: entry.status,
      contentRequired: entry.status === 'reserved'
    })))
  }))
);

const asText = value => String(value ?? '').trim();

export function auditClassSpecializationSlotsV1928(manifest = CLASS_SPECIALIZATION_SLOT_MANIFEST_V1928) {
  const errors = [];
  const classIds = manifest.map(item => asText(item?.classId));
  if (manifest.length !== 10) errors.push(`class_count:${manifest.length}/10`);
  if (classIds.some(id => !id) || new Set(classIds).size !== classIds.length) errors.push('class_ids_missing_or_duplicate');
  let specializationCount = 0;
  let implementedCount = 0;
  let reservedCount = 0;
  for (const item of manifest) {
    const ids = Array.isArray(item?.specializationIds) ? item.specializationIds.map(asText) : [];
    if (ids.length !== 4) errors.push(`${item?.classId || 'unknown'}:specialization_slots:${ids.length}/4`);
    if (ids.some(id => !id) || new Set(ids).size !== ids.length) errors.push(`${item?.classId || 'unknown'}:specialization_ids_missing_or_duplicate`);
    if (item.status === 'implemented') implementedCount += ids.length;
    else if (item.status === 'reserved') reservedCount += ids.length;
    else errors.push(`${item?.classId || 'unknown'}:invalid_status`);
    specializationCount += ids.length;
  }
  const allSpecIds = manifest.flatMap(item => item.specializationIds || []).map(asText);
  if (new Set(allSpecIds).size !== allSpecIds.length) errors.push('global_specialization_id_collision');
  if (specializationCount !== 40) errors.push(`specialization_count:${specializationCount}/40`);
  if (implementedCount !== 8) errors.push(`implemented_count:${implementedCount}/8`);
  if (reservedCount !== 32) errors.push(`reserved_count:${reservedCount}/32`);
  const reservedHaveNoInventedContent = manifest.filter(item => item.status === 'reserved').every(item =>
    item.className == null && item.specializationSlots.every(slot => slot.contentRequired === true)
  );
  if (!reservedHaveNoInventedContent) errors.push('reserved_slots_contain_unapproved_content');
  return Object.freeze({
    version: CLASS_SPECIALIZATION_SLOT_MANIFEST_VERSION_V1928,
    classCount: manifest.length,
    specializationCount,
    implementedClassCount: manifest.filter(item => item.status === 'implemented').length,
    implementedSpecializationCount: implementedCount,
    reservedClassCount: manifest.filter(item => item.status === 'reserved').length,
    reservedSpecializationCount: reservedCount,
    futureClassesPrepared: reservedCount === 32 && reservedHaveNoInventedContent,
    complete: errors.length === 0,
    errors: Object.freeze(errors),
    manifest
  });
}

export function getSpecializationSlotV1928(specializationId, manifest = CLASS_SPECIALIZATION_SLOT_MANIFEST_V1928) {
  const id = asText(specializationId);
  for (const classEntry of manifest) {
    const slot = classEntry.specializationSlots.find(item => item.specializationId === id);
    if (slot) return Object.freeze({ ...slot, classId: classEntry.classId, classStatus: classEntry.status });
  }
  return null;
}
