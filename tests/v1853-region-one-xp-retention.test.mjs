import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const game = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const match = game.match(/function monsterXpFromHp\(definition, combatEnemy\)\s*\{([\s\S]*?)\n  \}/);
assert.ok(match, 'central monster XP helper exists');
const xpFromHp = new Function('definition', 'combatEnemy', 'state', 'ETRANOM_REGION_CONTENT', match[1]);
const zones = ['burnt_forest','thorn_grove','ash_hills','southern_plains','vardash_river','rootbound_ruins'].map(id => ({id}));
const regionOne = {regionId:'burnt_forest'};

test('region one continues to award full HP-based XP before level 5', () => {
  assert.equal(xpFromHp(regionOne, {maxHp:1500}, {character:{level:4}}, zones), 100);
});

test('region one still awards non-zero but negligible XP at level 5+', () => {
  assert.equal(xpFromHp(regionOne, {maxHp:1500}, {character:{level:5}}, zones), 2);
  assert.equal(xpFromHp(regionOne, {maxHp:1500}, {character:{level:20}}, zones), 2);
});

test('even region-one minibosses and bosses retain only 2 percent XP at level 5+', () => {
  assert.equal(xpFromHp({regionId:'thorn_grove'}, {maxHp:18016}, {character:{level:5}}, zones), 24);
  assert.equal(xpFromHp({regionId:'rootbound_ruins'}, {maxHp:99160}, {character:{level:5}}, zones), 132);
});

test('later-region enemies keep their normal HP-based XP at level 5+', () => {
  assert.equal(xpFromHp({regionId:'region_two_zone_1'}, {maxHp:1500}, {character:{level:5}}, zones), 100);
});
