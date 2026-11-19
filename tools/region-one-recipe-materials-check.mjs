import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../content/packs/region_one_master_v2/',import.meta.url);
const read=n=>JSON.parse(fs.readFileSync(new URL(n,root),'utf8'));
const regions=read('regions/regions.json'),monsters=read('monsters/monsters.json'),materials=read('materials/materials.json'),recipes=read('recipes/recipes.json');
assert.equal(regions.length,6);
const materialById=new Map(materials.map(x=>[x.id,x]));
const monsterById=new Map(monsters.map(x=>[x.id,x]));
for(const z of regions){
  const group=monsters.filter(e=>e.region_id===z.id);
  assert.ok(group.length>=6,`${z.id}: missing encounters`);
  for(const e of group){
    const ids=(e.drops||[]).map(x=>x.material_id);
    const expected=['boss','area_boss'].includes(e.kind)?3:e.kind==='mini_boss'?2:1;
    assert.equal(ids.length,expected,`${e.id}: expected ${expected} material types, got ${ids.length}`);
    assert.ok(ids.every(id=>z.material_ids.includes(id)),`${e.id}: material outside its own zone`);
  }
  const produced=new Set(group.flatMap(e=>(e.drops||[]).map(x=>x.material_id)));
  assert.ok(z.material_ids.every(id=>produced.has(id)),`${z.id}: a zone material has no monster source`);
}
for(const r of recipes){
  assert.equal(r.ingredients.length,2,`${r.id}: expected two material types`);
  assert.ok(r.ingredients.every(x=>materialById.get(x.material_id)?.region_id===r.region_id),`${r.id}: cross-zone ingredients`);
  assert.ok(r.source_encounter_ids.length && r.source_encounter_ids.every(id=>monsterById.get(id)?.region_id===r.region_id),`${r.id}: cross-zone recipe source`);
}
console.log(`PASS: ${regions.length} zones, ${monsters.length} encounters, ${materials.length} materials, ${recipes.length} recipes; all material and recipe source constraints are valid.`);
