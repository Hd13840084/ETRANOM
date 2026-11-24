import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSpecializationRegistry } from '../systems/combat/specialization-registry.js';
import { validateSpecializationRegistryManifest, validateSpecializationContentAgainstRegistry } from '../systems/combat/specialization-contract-validator.js';

const manifest = JSON.parse(await readFile(new URL('../content/classes/SPECIALIZATION_REGISTRY_V1.json', import.meta.url), 'utf8'));

test('registry declares exactly 10 classes and 40 specialization slots', () => {
  const result = validateSpecializationRegistryManifest(manifest);
  assert.equal(result.ok, true, result.errors.join(', '));
  assert.deepEqual({ classes: result.counts.classes, specializations: result.counts.specializations, implemented: result.counts.implemented, reserved: result.counts.reserved },
    { classes: 10, specializations: 40, implemented: 8, reserved: 32 });
});

test('registry resolves all eight implemented specializations', () => {
  const registry = createSpecializationRegistry(manifest);
  assert.equal(registry.listSpecializations({ status: 'implemented' }).length, 8);
  assert.equal(registry.isPlayable('wizard_necromancer'), true);
  assert.equal(registry.isPlayable('gunner_1'), false);
});

test('legacy Chaos Warrior ID resolves to one canonical specialization', () => {
  const registry = createSpecializationRegistry(manifest);
  assert.equal(registry.resolveCanonicalId('warrior_chaos_warrior'), 'warrior_chaos');
  assert.equal(registry.counts.specializations, 40);
});

test('reserved specialization content is rejected as non-playable', () => {
  const registry = createSpecializationRegistry(manifest);
  const result = validateSpecializationContentAgainstRegistry({ registry, specializationId: 'gunner_1', content: { id: 'gunner_1', skills: [] } });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('specialization_reserved_not_playable'));
});

test('duplicate specialization IDs are rejected', () => {
  const broken = structuredClone(manifest);
  broken.classes[2].specializations[0].id = 'wizard_arcane_mage';
  assert.throws(() => createSpecializationRegistry(broken), /duplicate_specialization_id/);
});
