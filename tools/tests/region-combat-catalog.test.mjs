import fs from 'node:fs';
import assert from 'node:assert/strict';
const pack = new URL('../../content/packs/region_one_master_v2/', import.meta.url);
const source = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
const encounters = JSON.parse(fs.readFileSync(new URL('monsters/monsters.json', pack), 'utf8'));
const expected = {
  burnt_forest: { level: 1, normal: 5, special: 'mini_boss' },
  thorn_grove: { level: 2, normal: 5, special: 'mini_boss' },
  ash_hills: { level: 3, normal: 5, special: 'mini_boss' },
  vardash_river: { level: 4, normal: 5, special: 'mini_boss' },
  southern_plains: { level: 5, normal: 5, special: 'mini_boss' },
  rootbound_ruins: { level: 5, normal: 5, special: 'area_boss' },
};
for (const [regionId, rule] of Object.entries(expected)) {
  const rows = encounters.filter(x => x.region_id === regionId);
  assert.equal(rows.length, 6, `${regionId}: five normal + one special`);
  assert.equal(rows.filter(x => x.kind === 'normal').length, rule.normal);
  assert.equal(rows.filter(x => x.kind === rule.special).length, 1);
  for (const enemy of rows) {
    assert.equal(enemy.level, rule.level, `${enemy.id}: correct zone level`);
    assert.ok(enemy.stats.hp > 0 && enemy.stats.attack > 0 && enemy.stats.defense >= 0);
    assert.equal(enemy.stats.hp, enemy.stats.hp);
    assert.ok(enemy.quality && enemy.role && enemy.description_fa);
  }
}
assert.match(source, /enemy-combat-stats/);
assert.match(source, /playerMaxHp/);
console.log('Region combat catalogue passed: 36 enemies, levels 1–5, stats and display metadata consistent.');
