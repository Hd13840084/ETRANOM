import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const contract = JSON.parse(await readFile(new URL('../content/classes/CLASS_SPECIALIZATION_CONTRACT_V1.json', import.meta.url)));
const future = JSON.parse(await readFile(new URL('../content/classes/FUTURE_CLASS_ROADMAP_V1.json', import.meta.url)));
const profiles = JSON.parse(await readFile(new URL('../content/classes/specialization_combat_profiles_v1.json', import.meta.url)));

test('shared specialization contract mandates the same core systems in all combat modes', () => {
  assert.deepEqual(contract.combat_modes, ['solo', 'party', 'pvp']);
  for (const field of ['skills', 'skill_upgrades', 'talent_trees', 'domain', 'ascensions', 'resource_rules', 'cooldowns', 'status_effects', 'combat_adapters', 'progression', 'save_schema']) assert.ok(contract.required_shared_systems.includes(field));
  assert.equal(contract.talent_tree.branches, 4);
  assert.equal(contract.talent_tree.nodes_per_branch, 8);
  assert.equal(contract.domain.stages, 4);
  assert.equal(contract.ascensions.options, 10);
});

test('future roadmap reserves exactly eight classes and 32 specialization slots', () => {
  assert.equal(future.reserved_future_classes.length, 8);
  assert.equal(future.reserved_future_classes.reduce((n, c) => n + c.specializations.length, 0), 32);
  assert.equal(future.total_reserved_specializations, 32);
});

test('the eight current Wizard and Warrior specializations all declare a damage archetype', () => {
  assert.equal(profiles.specializations.length, 8);
  assert.deepEqual(profiles.specializations.filter(x => x.class_id === 'warrior').map(x => x.damage_archetype), ['physical', 'physical', 'physical', 'physical']);
  assert.deepEqual(profiles.specializations.filter(x => x.class_id === 'wizard').map(x => x.damage_archetype), ['magical', 'magical', 'eldritch', 'eldritch']);
});
