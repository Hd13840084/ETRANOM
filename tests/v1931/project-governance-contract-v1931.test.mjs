import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

test('only Wizard and Warrior are implemented classes', () => {
  const registry = readJson('content/classes/SPECIALIZATION_REGISTRY_V1.json');
  const implemented = registry.classes.filter((c) => c.status === 'implemented');
  assert.deepEqual(implemented.map((c) => c.id).sort(), ['warrior', 'wizard']);
  assert.equal(implemented.reduce((n, c) => n + c.specializations.filter((s) => s.status === 'implemented').length, 0), 8);
});

test('future class slots remain reserved and non-playable', () => {
  const registry = readJson('content/classes/SPECIALIZATION_REGISTRY_V1.json');
  const reserved = registry.classes.filter((c) => c.status === 'reserved');
  assert.equal(reserved.length, 8);
  assert.ok(reserved.every((c) => c.specializations.length === 4 && c.specializations.every((s) => s.status === 'reserved')));
  const manifest = readJson('content/classes/SHARED_ENGINE_MANIFEST_V1913.json');
  assert.equal(manifest.specialization_scope.implemented_specializations, 8);
  assert.equal(manifest.specialization_scope.reserved_specializations, 32);
  assert.equal(manifest.specialization_scope.reserved_slots_are_playable, false);
  assert.equal(manifest.shared_runtime_entry, 'systems/combat/engines/index.js');
});

test('Chaos Warrior has one canonical specialization and a compatibility alias', () => {
  const registry = readJson('content/classes/SPECIALIZATION_REGISTRY_V1.json');
  const warrior = registry.classes.find((c) => c.id === 'warrior');
  const chaos = warrior.specializations.find((s) => s.id === 'warrior_chaos');
  assert.ok(chaos);
  assert.ok(chaos.aliases.includes('warrior_chaos_warrior'));
  assert.equal(warrior.specializations.filter((s) => s.id === 'warrior_chaos_warrior').length, 0);
});
