import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
function readArray(name) {
  const match = source.match(new RegExp(`const ${name}=(\\[.*?\\]);\\n`));
  assert.ok(match, `${name} catalogue exists`);
  return JSON.parse(match[1]);
}
const expected = {
  burnt_forest: { level: 1, normal: 5, special: 'miniboss' },
  thorn_grove: { level: 2, normal: 5, special: 'miniboss' },
  ash_hills: { level: 3, normal: 5, special: 'miniboss' },
  vardash_river: { level: 4, normal: 5, special: 'miniboss' },
  southern_plains: { level: 5, normal: 5, special: 'miniboss' },
  rootbound_ruins: { level: 5, normal: 5, special: 'boss' },
};
const encounters = readArray('REGION_ENCOUNTERS');
for (const [regionId, rule] of Object.entries(expected)) {
  const rows = encounters.filter(x => x.regionId === regionId);
  assert.equal(rows.length, 6, `${regionId}: five normal + one special`);
  assert.equal(rows.filter(x => x.kind === 'normal').length, rule.normal);
  assert.equal(rows.filter(x => x.kind === rule.special).length, 1);
  for (const enemy of rows) {
    assert.equal(enemy.level, rule.level, `${enemy.id}: correct zone level`);
    assert.ok(enemy.hp > 0 && enemy.attack > 0 && enemy.defense >= 0);
    assert.equal(enemy.stats.hp, enemy.hp);
    assert.equal(enemy.stats.attack, enemy.attack);
    assert.ok(enemy.quality && enemy.role && enemy.description);
  }
}
assert.match(source, /enemy-combat-stats/);
assert.match(source, /playerMaxHp/);
console.log('Region combat catalogue passed: 36 enemies, levels 1–5, stats and display metadata consistent.');
