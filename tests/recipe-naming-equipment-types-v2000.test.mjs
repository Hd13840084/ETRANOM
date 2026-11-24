import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const game = fs.readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const recipes = JSON.parse(fs.readFileSync(new URL('../content/packs/region_one_master_v2/recipes/recipes.json', import.meta.url), 'utf8'));
const items = JSON.parse(fs.readFileSync(new URL('../content/packs/region_one_master_v2/items/items.json', import.meta.url), 'utf8'));
const core = new Set(['power','speed','endurance','vitality','intellect','perception','luck','faith','hp','mp']);
test('all 260 equipment recipes have unique class-free names and equipment type labels', () => {
  assert.equal(recipes.length, 260);
  assert.equal(new Set(recipes.map(x => x.name)).size, recipes.length);
  assert.ok(recipes.every(x => x.equipment_type_label_fa && !x.name.includes('• ')));
  assert.ok(!game.includes("esc(r.originalClassName||'عمومی')"));
  assert.match(game, /equipmentTypeLabel\|\|etranomEquipmentTypeLabel\(r\)/);
});
test('recipe ingredients and source metadata remain intact and outputs use official ETRANOM attributes', () => {
  const ids = new Set(items.map(x => x.id));
  assert.ok(recipes.every(r => ids.has(r.result_item_id) && Array.isArray(r.ingredients) && r.ingredients.length > 0));
  assert.ok(items.every(x => Object.keys(x.stats || {}).every(k => core.has(k))));
  assert.ok(items.some(x => Number(x.stats?.speed) > 0));
  assert.match(game, /\["power","speed","endurance","vitality","intellect","perception","luck","faith"\]/);
});
test('recipe UI shows equipment type, rarity, level and stats without class label', () => {
  assert.match(game, /equipmentTypeLabel\|\|etranomEquipmentTypeLabel\(r\)/);
  assert.match(game, /craftStatsFa\(r\.stats\)/);
  assert.match(game, /مواد همان محدوده/);
});
