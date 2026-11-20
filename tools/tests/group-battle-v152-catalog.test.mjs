import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'content/classes/party_battle_skills_v152.json'), 'utf8'));
test('v152 skill catalog preserves the four existing wizard runtime specializations', () => {
  assert.deepEqual(Object.keys(catalog.specializations).sort(), ['wizard_arcane_mage','wizard_elementalist','wizard_necromancer','wizard_warlock'].sort());
  for (const spec of Object.values(catalog.specializations)) assert.equal(spec.skills.length, 10);
});
test('v152 skill ids are unique and core combat metadata remains available', () => {
  const all = Object.values(catalog.specializations).flatMap(x => x.skills);
  assert.equal(all.length, 40);
  assert.equal(new Set(all.map(x => x.id)).size, 40);
  for (const skill of all) {
    assert.ok(skill.id && skill.name && skill.type);
    assert.ok(Number.isFinite(Number(skill.unlockLevel)));
    assert.ok(Number.isFinite(Number(skill.cooldownTurns ?? 0)));
    assert.ok(skill.description);
  }
});
test('v152 catalog includes advanced effects and summon/control skill types without flattening them', () => {
  const types = new Set(Object.values(catalog.specializations).flatMap(x => x.skills.map(s => s.type)));
  for (const expected of ['shield','all_damage','permanent_recruit','life_steal','ultimate_all_damage']) assert.ok(types.has(expected));
});
