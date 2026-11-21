import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const recipes=JSON.parse(fs.readFileSync(path.join(root,'content/packs/region_one_master_v2/recipes/recipes.json'),'utf8'));
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const runtime=fs.readFileSync(path.join(root,'systems/content/region-one-runtime.js'),'utf8');
test('all 260 canonical recipes are public and preserve original class metadata',()=>{
 assert.equal(recipes.length,260); assert.equal(new Set(recipes.map(x=>x.id)).size,260);
 assert.ok(recipes.every(x=>x.access_scope==='public' && x.class_name==='عمومی' && x.original_class_name));
});
test('all original drop sources and rarity rules remain intact',()=>{
 assert.equal(recipes.filter(x=>x.drop_source_type==='monster').length,204);
 assert.equal(recipes.filter(x=>x.drop_source_type==='dungeon_treasure').length,20);
 assert.equal(recipes.filter(x=>x.drop_source_type==='dungeon_boss').length,20);
 assert.equal(recipes.filter(x=>x.drop_source_type==='tower_boss').length,16);
 const mythic=recipes.filter(x=>x.rarity==='اسطوره‌ای');
 assert.equal(mythic.length,21); assert.ok(mythic.every(x=>x.drop_source_id==='rootbound_region_boss' && x.drop_chance_percent===2));
});
test('client crafting and recipe discovery no longer gate by class',()=>{
 assert.match(game,/function recipeClassMatches\(_recipe,_cls\)\{return true;\}/);
 assert.doesNotMatch(game,/r\.className===\(state\.character\.archetype/);
 assert.doesNotMatch(game,/if\(!recipeClassMatches\(r,cls\)\)/);
 assert.match(runtime,/className: 'عمومی'.*accessScope: 'public'/);
});
