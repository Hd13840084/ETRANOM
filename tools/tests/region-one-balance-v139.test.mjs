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
test('v139 removes hidden zone multipliers and keeps beginner-zone enemies in a bounded HP range',()=>{
 assert.match(runtime,/function regionCombatMultiplier\(_regionId\)[\s\S]*?return 1;/);
 const first=monsters.filter(m=>m.region_id==='burnt_forest'&&m.kind==='normal');
 assert.equal(first.length,5); assert.ok(first.every(m=>m.stats.hp>=180&&m.stats.hp<=260));
 const mini=monsters.find(m=>m.id==='ashroot_warden'); assert.ok(mini.stats.hp<=900);
});
test('zone progression grows gradually and bosses remain proportionate',()=>{
 const zones=['burnt_forest','thorn_grove','ash_hills','vardash_river','southern_plains','rootbound_ruins'];
 const avg=id=>{const a=monsters.filter(m=>m.region_id===id&&m.kind==='normal');return a.reduce((s,m)=>s+m.stats.hp,0)/a.length;};
 for(let i=1;i<zones.length;i++)assert.ok(avg(zones[i])>avg(zones[i-1]));
 for(const id of zones){const normals=monsters.filter(m=>m.region_id===id&&m.kind==='normal');const leader=monsters.find(m=>m.region_id===id&&m.kind!=='normal');const ratio=id==='rootbound_ruins'?5.2:3.1;assert.ok(leader.stats.hp>Math.max(...normals.map(m=>m.stats.hp))*(ratio-.25));assert.ok(leader.stats.hp<Math.max(...normals.map(m=>m.stats.hp))*(ratio+.25));}
});
test('item and recipe balance metadata is applied without changing progression caps',()=>{
 assert.equal(items.length,260);assert.ok(items.every(i=>i.balance_version===139));
 assert.equal(recipes.length,260);assert.ok(recipes.every(r=>r.recipe_level===1&&r.max_recipe_level===10&&r.item_level===1&&r.balance_version===139));
});
test('equip and unequip handlers restore the previous page scroll position',()=>{
 assert.match(game,/data-equip-item[\s\S]*?window\.scrollTo\(0,pageY\)/);
 assert.match(game,/data-unequip-slot[\s\S]*?window\.scrollTo\(0,pageY\)/);
});
