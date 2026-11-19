import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('content/packs/region_one_master_v2');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const manifest=read('manifest.json');
const regions=read('regions/regions.json'),monsters=read('monsters/monsters.json'),materials=read('materials/materials.json'),recipes=read('recipes/recipes.json'),items=read('items/items.json'),quests=read('quests/quests.json'),npcs=read('npcs/npcs.json'),dungeons=read('dungeons/dungeons.json'),ruins=read('ruins/ruins.json'),tower=read('tower/tower.json'),towerEnemies=read('tower/tower_encounters.json');
const assert=(v,m)=>{if(!v)throw new Error(m)};
const byId=(rows)=>new Map(rows.map(x=>[x.id,x]));
const rmap=byId(regions),mmap=byId(materials),emon=byId(monsters),imap=byId(items),nmap=byId(npcs);
assert(manifest.schema_version===2&&manifest.source_of_truth,'invalid master manifest');
assert(regions.length===6,'must contain exactly six zones');
assert(monsters.length===36,'must contain 36 regional monsters');
assert(materials.length===42,'must contain 42 regional materials');
assert(recipes.length===260&&items.length===260,'must contain 260 recipes and results');
assert(quests.filter(q=>q.kind==='main_chain').length===6,'six main quest chains required');
assert(quests.filter(q=>q.kind==='side').length===6,'six side quests required');
assert(dungeons.length===2,'two dungeons required');
assert(ruins.length===1&&ruins[0].stages.length===5,'five ruins stages required');
assert(tower.floor_count===20&&tower.floors.length===20,'20 tower floors required');
for(const z of regions){
 const group=monsters.filter(m=>m.region_id===z.id);
 assert(group.filter(m=>m.kind==='normal').length===5,`${z.id}: needs 5 normal monsters`);
 assert(group.filter(m=>m.kind==='mini_boss').length===(z.id==='rootbound_ruins'?0:1),`${z.id}: miniboss count mismatch`);
 assert(group.filter(m=>m.kind==='area_boss').length===(z.id==='rootbound_ruins'?1:0),`${z.id}: final boss count mismatch`);
 assert(z.level_min===z.level_max&&z.recipe_level===1&&z.item_level===1,`${z.id}: level/item tier mismatch`);
 const mats=new Set(z.material_ids);
 for(const m of group){
  assert(m.level===z.level_min,`${m.id}: monster level mismatch`);
  for(const key of ['power','speed','endurance','vitality','intellect','perception','luck','faith'])assert(Number.isFinite(m.stats[key]),`${m.id}: missing ${key}`);
  assert(m.stats.hp>0&&m.stats.mp>=0,`${m.id}: invalid hp/mp`);
  const expected=m.kind==='normal'?1:m.kind==='mini_boss'?2:3;
  assert(m.drops.length===expected,`${m.id}: expected ${expected} material types`);
  for(const d of m.drops)assert(mats.has(d.material_id)&&mmap.has(d.material_id),`${m.id}: foreign/missing material ${d.material_id}`);
 }
 for(const id of z.material_ids){const mat=mmap.get(id);assert(mat,`${z.id}: missing material ${id}`);assert(mat.region_id===z.id,`${id}: wrong region`);assert(mat.source_ids.length>0,`${id}: no monster source`);for(const source of mat.source_ids)assert(emon.get(source)?.region_id===z.id,`${id}: source outside region`);}
}
for(const r of recipes){
 const z=rmap.get(r.region_id);assert(z,`${r.id}: unknown region`);assert(r.item_level===1&&r.recipe_level===1&&r.max_recipe_level===10,`${r.id}: recipe levels wrong`);
 assert(imap.has(r.result_item_id),`${r.id}: missing result item`);assert(r.ingredients.length===2,`${r.id}: must require two material types`);
 for(const ing of r.ingredients)assert(mmap.get(ing.material_id)?.region_id===r.region_id,`${r.id}: ingredient from another region`);
 assert(Array.isArray(r.material_source_encounter_ids)&&r.material_source_encounter_ids.length>0,`${r.id}: no material sources`);
 for(const ing of r.ingredients){assert(r.material_source_encounter_ids.some(id=>emon.get(id)?.region_id===r.region_id&&emon.get(id).drops.some(d=>d.material_id===ing.material_id)),`${r.id}: ingredient has no same-region monster source`);}
 if(r.drop_source_type==='monster'){
  assert(r.source_encounter_ids.length===1&&r.source_encounter_ids[0]===r.drop_source_id,`${r.id}: monster drop source mismatch`);
  const m=emon.get(r.drop_source_id);assert(m?.region_id===r.region_id,`${r.id}: monster source from another region`);if(r.rarity!=='اسطوره‌ای')assert(m.drops.some(d=>r.ingredients.some(i=>i.material_id===d.material_id)),`${r.id}: monster source does not drop an ingredient`);
 } else if(r.drop_source_type==='dungeon_treasure'||r.drop_source_type==='dungeon_boss'){
  const d=dungeons.find(x=>r.drop_source_type==='dungeon_treasure'?x.id===r.drop_source_id:('dungeon_boss_'+x.id)===r.drop_source_id);assert(d&&d.region_id===r.region_id,`${r.id}: invalid dungeon source`);assert(r.source_encounter_ids.length===0,`${r.id}: dungeon recipe has regional monster drop source`);
 } else if(r.drop_source_type==='tower_boss'){
  assert(r.region_id===tower.region_id&&tower.floors.some(f=>f.type==='boss'&&f.encounter_ids.includes(r.drop_source_id)),`${r.id}: invalid tower boss source`);assert(r.rarity==='افسانه‌ای',`${r.id}: tower recipe rarity must be legendary`);assert(r.source_encounter_ids.length===0,`${r.id}: tower recipe has regional monster drop source`);
 } else assert(false,`${r.id}: unknown drop source type`);
 if(r.rarity==='اسطوره‌ای')assert(r.drop_source_type==='monster'&&r.drop_source_id==='rootbound_region_boss'&&r.drop_chance_percent===2,`${r.id}: mythic must drop only from final regional boss at 2%`);
}
for(const q of quests){assert(nmap.has(q.giver_npc_id),`${q.id}: missing NPC`);assert(rmap.has(q.region_id),`${q.id}: missing region`);}
for(const d of dungeons){assert(rmap.has(d.region_id),`${d.id}: missing entry region`);assert(d.wave_count===4&&d.normal_waves===3&&d.boss_wave===4,`${d.id}: wave structure wrong`);assert(d.boss.material_ids.length===3,`${d.id}: boss needs three materials`);assert(d.boss.material_ids.every(id=>mmap.get(id)?.region_id===d.region_id),`${d.id}: boss material source region mismatch`);}
for(const f of tower.floors)assert(f.floor>=1&&f.floor<=20&&f.encounter_ids.length>0,`tower floor ${f.floor} invalid`);
for(const e of towerEnemies){if(e.portrait)assert(fs.existsSync(path.resolve(root,'../../..',e.portrait)),`${e.id}: portrait missing`);}
console.log(`Region 1 master pack valid: ${regions.length} zones, ${monsters.length} monsters, ${materials.length} materials, ${recipes.length} recipes, ${dungeons.length} dungeons, ${ruins[0].stages.length} ruins stages, ${tower.floor_count} tower floors.`);
