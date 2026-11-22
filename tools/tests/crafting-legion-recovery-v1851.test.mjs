import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const game = readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
const necro = readFileSync(new URL('../../systems/classes/necromancer.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

test('recipe state accepts legacy object records and mirrors learned potion recipes into inventory', () => {
  assert.match(game, /function recipeIdsFromStore\(value\)/);
  assert.match(game, /recipeId\|\|x\?\.recipe_id/);
  assert.match(game, /POTION_RECIPES\.some\(r=>r\.id===String\(item\.id\)\)/);
  assert.match(game, /item\.itemType='potion_recipe'/);
  assert.match(game, /item\.itemType='equipment_recipe'/);
});

test('recipe inventory classification and crafting ledgers include equipment and potion blueprints', () => {
  assert.match(game, /item\?\.recipeType\|\|item\?\.itemType==='equipment_recipe'\|\|item\?\.itemType==='potion_recipe'/);
  assert.match(game, /function smithyCraftingPanel\(\)[\s\S]*?const known=ETRANOM_RECIPES\.filter[\s\S]*?knownPotions=POTION_RECIPES\.filter/);
  assert.match(game, /آمار فارسی:/);
  assert.match(game, /function craftingView\(\)[\s\S]*?دفتر جامع ساخت و کیمیاگری/);
});

test('Necromancer Legion base recruitment chance is tiered: normal 35%, miniboss 12%, boss 7%', () => {
  assert.match(necro, /"baseRecruitChancePercent": 35/);
  assert.match(necro, /"minibossRecruitChancePercent": 12/);
  assert.match(necro, /"bossRecruitChancePercent": 7/);
  assert.match(necro, /\?7:\(kind==="miniboss"\|\|kind==="mini_boss"\)\?12:35/);
  assert.doesNotMatch(game, /e\.recruitAttempted\|\|\[\s*['"]boss['"],\s*['"]area_boss['"]\s*\]\.includes\(e\.encounterKind\)/);
});

test('victory restores HP, MP and stamina after battle events and records recovered values', () => {
  assert.match(game, /const postBattleResources=restoreAllResources\(\)/);
  assert.match(game, /report\.hp=postBattleResources\.hp/);
  assert.match(game, /report\.mp=postBattleResources\.mp/);
  assert.match(game, /report\.stamina=postBattleResources\.stamina/);
});

test('updated app and Necromancer module use cache-busted v1853 imports', () => {
  assert.match(html, /necromancer\.js\?v=1853/);
  assert.match(html, /game\.js\?v=1853&nav=1853/);
});
