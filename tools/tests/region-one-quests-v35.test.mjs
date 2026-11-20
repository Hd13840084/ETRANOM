import fs from 'node:fs';
import assert from 'node:assert/strict';
const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
const questData=JSON.parse(fs.readFileSync(new URL('../../content/packs/region_one_complete_v1/quests/quests.json',import.meta.url),'utf8'));
const encMatch=game.match(/const FIRST_REGION_ENCOUNTERS=(\[.*?\]);/s);
assert.ok(encMatch,'Encounter catalog must exist');
const encounters=JSON.parse(encMatch[1]);
const encounterById=new Map(encounters.map(e=>[e.id,e]));
const regionIds=['burnt_forest','thorn_grove','ash_hills','vardash_river','southern_plains','rootbound_ruins'];
assert.equal(questData.main_quest.steps.length,6);
assert.equal(questData.npc_side_quests.length,6);
for(const step of questData.main_quest.steps){
  assert.ok(regionIds.includes(step.region_id),`Unknown main quest region ${step.region_id}`);
  const elite=encounterById.get(step.elite_id);
  assert.ok(elite,`Missing elite ${step.elite_id}`);
  assert.equal(elite.regionId,step.region_id,`Elite must belong to ${step.region_id}`);
  assert.ok(['miniboss','boss','area_boss'].includes(elite.kind));
  for(const mat of step.materials){
    const sources=encounters.filter(e=>e.materialIds?.includes(mat.id)||e.materialId===mat.id);
    assert.ok(sources.length,`No encounter drops ${mat.id}`);
    assert.ok(sources.every(e=>e.regionId===step.region_id),`Cross-region material ${mat.id}`);
  }
}
for(const q of questData.npc_side_quests){
  const monster=encounterById.get(q.monster_id);
  assert.ok(monster,`Missing side quest monster ${q.monster_id}`);
  assert.equal(monster.regionId,q.region_id);
  const mat=q.materials[0];
  const sources=encounters.filter(e=>e.materialIds?.includes(mat.id)||e.materialId===mat.id);
  assert.ok(sources.length,`No source for side quest material ${mat.id}`);
  assert.ok(sources.every(e=>e.regionId===q.region_id),`Side quest material from wrong region ${mat.id}`);
}
assert.match(game,/function regionTwoUnlocked\(\)\{return !!state\?\.mainRegionOneQuest\?\.completed;\}/);
assert.match(game,/isRegionTwoTarget\(gateNode\)&&!regionTwoUnlocked\(\)/);
assert.match(game,/isRegionTwoTarget\(regionId\)&&!regionTwoUnlocked\(\)/);
assert.match(game,/progress\.kills=Math\.min\(q\.killQty/);
assert.match(game,/region1-main-quest/);
assert.match(game,/region1-npc-quest/);
console.log('PASS: six main quest stages, six NPC quests, same-region material sources, elite IDs, kill-credit and region-two gate checks.');
