import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SWORD_ASCETIC } from '../systems/classes/sword-ascetic-data.js';
import runtimeData from '../content/classes/warrior_sword_ascetic_v1.json' with { type: 'json' };

test('all Sword Ascetic skills expose exactly six upgrades, ranks 2 through 7', () => {
  for (const data of [SWORD_ASCETIC, runtimeData]) {
    assert.equal(data.skills.length, 10);
    for (const skill of data.skills) {
      assert.deepEqual(skill.upgrades.map(x => x.rank), [2, 3, 4, 5, 6, 7], skill.id);
    }
  }
});

test('status UI cannot upgrade a skill beyond rank seven', () => {
  const source = fs.readFileSync(new URL('../game.js', import.meta.url), 'utf8');
  assert.match(source, /rank>=7\|\|Number\(state\.skillPoints\|\|0\)<1/);
  assert.doesNotMatch(source, /function swordAsceticUpgrade\([^\n]*rank>=8/);
});

test('the data module cache key is versioned for the corrected catalog', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /sword-ascetic-data\.js\?v=1901/);
  assert.match(html, /game\.js\?v=1904&nav=1904/);
  assert.match(html, /combat-adapters\.js\?v=1906/);
});
