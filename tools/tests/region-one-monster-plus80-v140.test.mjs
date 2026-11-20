import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = new URL('../../', import.meta.url);
const pack = new URL('content/packs/region_one_master_v2/', root);
const monsters = JSON.parse(fs.readFileSync(new URL('monsters/monsters.json', pack), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(new URL('manifest.json', pack), 'utf8'));
const game = fs.readFileSync(new URL('game.js', root), 'utf8');
const keys = ['power','speed','endurance','vitality','intellect','perception','luck','faith','hp','attack','defense'];
test('v140 applies +80% to HP, eight primary attributes, attack and defense for all 36 region-one monsters', () => {
  assert.equal(monsters.length, 36);
  assert.equal(manifest.balance_version, 140);
  assert.equal(manifest.rules.combat_scaling.monster_stat_multiplier, 1.8);
  for (const monster of monsters) {
    for (const key of keys) assert.ok(Number.isFinite(monster.stats[key]) && monster.stats[key] >= 1, `${monster.id}.${key}`);
    assert.equal(monster.version, 4);
  }
});
test('combat no longer applies the legacy 25% reduction after the authored +80% monster values', () => {
  assert.match(game, /const scale=1;for\(const k of \["hp","maxHp","mp","maxMp","attack","enemyDefense","accuracy","speed"\]\)/);
});
