import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../../content/packs/region_one_master_v2/',import.meta.url);
const read=n=>JSON.parse(fs.readFileSync(new URL(n,root),'utf8'));
const recipes=read('recipes/recipes.json'),regions=read('regions/regions.json'),monsters=read('monsters/monsters.json'),dungeons=read('dungeons/dungeons.json'),tower=read('tower/tower.json');
assert.equal(recipes.length,260);
assert.equal(new Set(recipes.map(r=>r.id)).size,260);
const classes=[...new Set(recipes.map(r=>r.class_name))];
assert.equal(classes.length,10);
for(const c of classes)assert.equal(recipes.filter(r=>r.class_name===c).length,26,`${c}: class recipe count`);
const types=Object.fromEntries(['monster','dungeon_treasure','dungeon_boss','tower_boss'].map(t=>[t,recipes.filter(r=>r.drop_source_type===t).length]));
assert.deepEqual(types,{monster:204,dungeon_treasure:20,dungeon_boss:20,tower_boss:16});
for(const d of dungeons){
 const a=recipes.filter(r=>r.drop_source_type==='dungeon_treasure'&&r.drop_source_id===d.id);
 const b=recipes.filter(r=>r.drop_source_type==='dungeon_boss'&&r.drop_source_id==='dungeon_boss_'+d.id);
 assert.equal(a.length,10,`${d.id}: treasure recipe count`);assert.equal(b.length,10,`${d.id}: boss recipe count`);
 assert.deepEqual(new Set([...a,...b].map(r=>r.region_id)),new Set([d.region_id]));
 assert.equal(d.recipe_distribution.total_recipe_count,20);
}
const floors=tower.floors.filter(f=>f.type==='boss');
assert.deepEqual(floors.map(f=>f.recipe_ids.length),[4,3,3,3,3]);
for(const f of floors){const id=`tower_boss_floor${String(f.floor).padStart(2,'0')}`;for(const r of recipes.filter(x=>x.drop_source_id===id)){assert.equal(r.drop_source_type,'tower_boss');assert.equal(r.rarity,'افسانه‌ای');}}
const mythic=recipes.filter(r=>r.rarity==='اسطوره‌ای');assert.equal(mythic.length,21);assert.ok(mythic.every(r=>r.drop_source_type==='monster'&&r.drop_source_id==='rootbound_region_boss'&&r.drop_chance_percent===2));
const monsterMap=new Map(monsters.map(m=>[m.id,m]));
const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
assert.match(game,/r\.className===\(state\.character\.archetype\|\|\"جنگجو\"\)/);
for(const r of recipes){assert.equal(r.ingredients.length,2);for(const ing of r.ingredients)assert.ok(r.material_source_encounter_ids.some(id=>monsterMap.get(id)?.region_id===r.region_id&&monsterMap.get(id).drops.some(d=>d.material_id===ing.material_id)),`${r.id}: ingredient source mismatch`);}
for(const z of regions){const ids=recipes.filter(r=>r.drop_source_type==='monster'&&monsterMap.get(r.drop_source_id)?.region_id===z.id);assert.equal(z.recipe_distribution.monster_recipe_count,ids.length);}
console.log(`PASS v48: ${recipes.length} recipes assigned: ${types.monster} regional monsters, ${types.dungeon_treasure} dungeon treasures, ${types.dungeon_boss} dungeon bosses, ${types.tower_boss} tower bosses; 21 mythic recipes only on final region boss at 2%.`);
