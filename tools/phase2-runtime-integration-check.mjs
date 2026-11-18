import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(new URL('..',import.meta.url).pathname);
globalThis.window=globalThis;
globalThis.fetch=async input=>{
  const file=path.resolve(root,String(input).replace(/^\.\//,''));
  try{return new Response(await fs.readFile(file),{status:200,headers:{'content-type':'application/json'}})}
  catch{return new Response('not found',{status:404});}
};
const {loadRegionOneRuntime}=await import('../systems/content/region-one-runtime.js');
const data=await loadRegionOneRuntime();
assert.equal(data.regions.length,6);
assert.equal(data.monsters.length,36);
assert.equal(data.materials.length,42);
assert.equal(data.recipes.length,260);
assert.equal(data.dungeons.length,2);
assert.equal(data.ruins.stages.length,5);
assert.equal(data.towerFloors.length,20);
assert.equal(data.towerEncounters.length,20);
assert.equal(data.mainQuestChains.length,6);
assert.equal(data.mainQuestSteps.length,6);
assert.equal(data.npcQuests.length,6);
assert.equal(Object.keys(data.monsterSkillMap).length,21);
const regionIds=new Set(data.regions.map(x=>x.id));
assert.deepEqual(data.regions.map(x=>x.id),['burnt_forest','thorn_grove','ash_hills','vardash_river','southern_plains','rootbound_ruins']);
const materialById=new Map(data.materials.map(x=>[x.id,x]));
for(const monster of data.monsters){
  assert.ok(regionIds.has(monster.regionId),`unknown monster region ${monster.id}`);
  const expected=monster.kind==='miniboss'?2:['boss','area_boss'].includes(monster.kind)?3:1;
  assert.equal(monster.materialIds.length,expected,`${monster.id} material type count`);
  for(const id of monster.materialIds)assert.equal(materialById.get(id)?.region_id,monster.regionId,`${monster.id} has cross-zone material ${id}`);
}
const monsterById=new Map(data.monsters.map(x=>[x.id,x]));
for(const recipe of data.recipes){
  assert.ok(regionIds.has(recipe.regionId));
  assert.equal(recipe.materials.length,2,`${recipe.id} must consume two material types`);
  for(const material of recipe.materials)assert.equal(materialById.get(material.id)?.region_id,recipe.regionId,`${recipe.id} cross-zone ingredient`);
  assert.ok(recipe.sourceEncounterIds.length,`${recipe.id} has no drop source`);
  for(const sourceId of recipe.sourceEncounterIds)assert.equal(monsterById.get(sourceId)?.regionId,recipe.regionId,`${recipe.id} cross-zone source`);
}
for(const floor of data.towerFloors)for(const id of floor.encounter_ids)assert.ok(data.towerEncounters.some(x=>x.id===id),`tower floor ${floor.floor} missing encounter ${id}`);
const game=await fs.readFile(path.join(root,'game.js'),'utf8');
const index=await fs.readFile(path.join(root,'index.html'),'utf8');
assert.ok(game.includes('window.ETRANOM_RUNTIME_CONTENT?.regions'),'game.js does not consume runtime region catalog');
assert.ok(game.includes('window.ETRANOM_RUNTIME_CONTENT?.monsters'),'game.js does not consume runtime monster catalog');
assert.ok(game.includes('window.ETRANOM_RUNTIME_CONTENT?.recipes?.length'),'game.js does not consume runtime recipe catalog');
assert.ok(game.includes('window.ETRANOM_RUNTIME_CONTENT?.dungeons'),'game.js does not consume runtime dungeon catalog');
assert.ok(game.includes('window.ETRANOM_RUNTIME_CONTENT?.mainQuestChains'),'game.js does not consume runtime main quests');
assert.ok(game.includes('window.ETRANOM_RUNTIME_CONTENT?.npcQuests'),'game.js does not consume runtime NPC quests');
assert.ok(game.includes('window.ETRANOM_RUNTIME_CONTENT?.monsterSkillMap'),'game.js does not consume runtime monster skills');
assert.ok(index.includes('await loadRegionOneRuntime()'),'runtime pack is not loaded before game.js');
assert.ok(game.includes("activeDangerRegionId=id;nearWestRegionId=id;state.selectedDangerRegion=id;state.currentDangerRegion=id;state.currentWorldNode='danger_zone_'+id"),'selected zone is not atomically applied before battle');
console.log('PASS phase 2 runtime integration:',data.regions.length,'zones,',data.monsters.length,'monsters,',data.recipes.length,'recipes,',data.dungeons.length,'dungeons,',data.towerFloors.length,'tower floors,',data.mainQuestChains.length,'main quests and',data.npcQuests.length,'side quests.');
