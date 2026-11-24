import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getRegionLevelRangeV1980, getZoneLevelRangeV1980, validateRegionZonesV1980 } from '../../systems/progression/world-level-map-v1980.js';
import { calculateMonsterGoldRewardV1971, calculateMonsterXpRewardV1971 } from '../../systems/combat/monster-reward-engine-v1971.js';
const root='content/packs/region_one_master_v2/';
const zones=JSON.parse(fs.readFileSync(root+'regions/regions.json','utf8'));
const monsters=JSON.parse(fs.readFileSync(root+'monsters/monsters.json','utf8'));
const tower=JSON.parse(fs.readFileSync(root+'tower/tower.json','utf8'));
const dungeons=JSON.parse(fs.readFileSync(root+'dungeons/dungeons.json','utf8'));
test('ten regions cover 1-100 without gaps or overlap',()=>{
 for(let r=1;r<=10;r++) assert.deepEqual(getRegionLevelRangeV1980(r),{levelMin:(r-1)*10+1,levelMax:r*10});
 assert.throws(()=>getRegionLevelRangeV1980(11));
});
test('each region has six zones with approved 2,2,2,2,1,1 level allocation',()=>{
 assert.deepEqual([1,2,3,4,5,6].map(z=>getZoneLevelRangeV1980(1,z)),[
  {levelMin:1,levelMax:2,recommendedLevel:1},{levelMin:3,levelMax:4,recommendedLevel:3},
  {levelMin:5,levelMax:6,recommendedLevel:5},{levelMin:7,levelMax:8,recommendedLevel:7},
  {levelMin:9,levelMax:9,recommendedLevel:9},{levelMin:10,levelMax:10,recommendedLevel:10}
 ]);
 assert.equal(validateRegionZonesV1980(zones,1).valid,true);
});
test('all 36 region-one monsters are assigned inside their zone level range',()=>{
 for(const z of zones){const group=monsters.filter(m=>m.region_id===z.id);assert.equal(group.length,6);for(const m of group)assert.ok(m.level>=z.level_min&&m.level<=z.level_max,`${m.id} outside ${z.id}`);}
 assert.equal(Math.max(...monsters.map(m=>m.level)),10);
});
test('20-floor tower keeps its pattern and scales across five two-level bands',()=>{
 assert.equal(tower.floor_count,20);assert.equal(tower.floors.length,20);
 for(const f of tower.floors)assert.equal(f.level,[2,4,6,8,10][Math.floor((f.floor-1)/4)]);
});
test('dungeons align with their updated region-level bands',()=>{
 assert.deepEqual(dungeons.find(d=>d.id==='dungeon_thorn').level_weights.map(x=>x.level),[3,4]);
 assert.deepEqual(dungeons.find(d=>d.id==='dungeon_south').level_weights.map(x=>x.level),[7,8,9,10]);
});

test('reward mechanics respect the new level 100 range and region-one level 10 boundary',()=>{
 const low=calculateMonsterGoldRewardV1971({level:10,kind:'normal',hp:2000,stats:{power:20,attack:30,defense:20}});
 const high=calculateMonsterGoldRewardV1971({level:100,kind:'normal',hp:2000,stats:{power:20,attack:30,defense:20}});
 assert.ok(high>low);
 const enemy={maxHp:150};
 assert.equal(calculateMonsterXpRewardV1971({regionId:'burnt_forest',hp:150,maxHp:150},enemy,{playerLevel:9,isRegionOneEnemy:true}),10);
 assert.equal(calculateMonsterXpRewardV1971({regionId:'burnt_forest',hp:150,maxHp:150},enemy,{playerLevel:10,isRegionOneEnemy:true}),1);
});
test('live Solo progression uses level 10 as the Region 1 XP soft-cap and applies the agreed death penalty',()=>{
 const game=fs.readFileSync('game.js','utf8');
 assert.match(game,/isRegionOneEnemy&&\(Number\(state\?\.character\?\.level\)\|\|1\)>=10\)return Math\.max\(1,Math\.floor\(baseXp\*0\.02\)\)/);
 assert.match(game,/const xpLost=Math\.floor\(xpBefore\*\.03\),goldLost=Math\.floor\(goldBefore\*\.01\)/);
 assert.match(game,/const level=Number\(enemy\.level\)\|\|REGION_LEVEL_BY_ID\[enemy\.regionId\]\|\|1/);
});
