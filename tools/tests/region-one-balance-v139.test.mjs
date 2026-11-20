import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../../',import.meta.url);
const pack=new URL('content/packs/region_one_master_v2/',root);
const monsters=JSON.parse(fs.readFileSync(new URL('monsters/monsters.json',pack),'utf8'));
const items=JSON.parse(fs.readFileSync(new URL('items/items.json',pack),'utf8'));
const recipes=JSON.parse(fs.readFileSync(new URL('recipes/recipes.json',pack),'utf8'));
const runtime=fs.readFileSync(new URL('systems/content/region-one-runtime.js',root),'utf8');
const game=fs.readFileSync(new URL('game.js',root),'utf8');
test('v142 doubles combat stats for all 36 region-one monsters and keeps runtime mirrors synchronized',()=>{
 assert.match(runtime,/function regionCombatMultiplier\(_regionId\)[\s\S]*?return 1;/);
 assert.equal(monsters.length,36);
 for(const m of monsters){
  for(const key of ['hp','mp','attack','defense','accuracy','speed']){
   assert.ok(m.stats[key]>=0,`${m.id} missing ${key}`);
  }
  assert.equal(m.hp,m.stats.hp); assert.equal(m.maxHp,m.stats.hp);
  assert.equal(m.attack,m.stats.attack); assert.equal(m.defense,m.stats.defense);
  assert.equal(m.accuracy,m.stats.accuracy); assert.equal(m.speed,m.stats.speed);
  assert.equal(m.mp,m.stats.mp); assert.equal(m.maxMp,m.stats.mp);
 }
 const first=monsters.filter(m=>m.region_id==='burnt_forest'&&m.kind==='normal');
 assert.equal(first.length,5); assert.ok(first.every(m=>m.stats.hp>=500));
});
test('item and recipe balance metadata is applied without changing progression caps',()=>{
 assert.equal(items.length,260);assert.ok(items.every(i=>i.balance_version===139));
 assert.equal(recipes.length,260);assert.ok(recipes.every(r=>r.recipe_level===1&&r.max_recipe_level===10&&r.item_level===1&&r.balance_version===139));
});
test('equip and unequip handlers restore the previous page scroll position',()=>{
 assert.match(game,/data-equip-item[\s\S]*?window\.scrollTo\(0,pageY\)/);
 assert.match(game,/data-unequip-slot[\s\S]*?window\.scrollTo\(0,pageY\)/);
});
