import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SWORD_ASCETIC } from '../systems/classes/sword-ascetic-data.js';
import runtimeData from '../content/classes/warrior_sword_ascetic_v1.json' with { type: 'json' };

test('all Sword Ascetic skills expose exactly five upgrades, ranks 2 through 6', () => {
  for (const data of [SWORD_ASCETIC, runtimeData]) {
    assert.equal(data.skills.length, 10);
    for (const skill of data.skills) {
      assert.deepEqual(skill.upgrades.map(x => x.rank), [2, 3, 4, 5, 6], skill.id);
    }
  }
});

test('status UI cannot upgrade a skill beyond rank six', () => {
  const source = fs.readFileSync(new URL('../game.js', import.meta.url), 'utf8');
  assert.match(source, /rank>=6\|\|Number\(state\.skillPoints\|\|0\)<1/);
  assert.doesNotMatch(source, /function swordAsceticUpgrade\([^\n]*rank>=7/);
});

test('the data module cache key is versioned for the corrected catalog', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /sword-ascetic-data\.js\?v=1862/);
  assert.match(html, /game\.js\?v=1862&nav=1862/);
  assert.match(html, /combat-adapters\.js\?v=1863/);
});
