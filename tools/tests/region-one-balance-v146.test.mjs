import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../../',import.meta.url);
const pack=new URL('content/packs/region_one_master_v2/',root);
const monsters=JSON.parse(fs.readFileSync(new URL('monsters/monsters.json',pack),'utf8'));
const tower=JSON.parse(fs.readFileSync(new URL('tower/tower_encounters.json',pack),'utf8'));
const dungeons=JSON.parse(fs.readFileSync(new URL('dungeons/dungeons.json',pack),'utf8'));
const game=fs.readFileSync(new URL('game.js',root),'utf8');
const zones=[['burnt_forest',250,400,1350],['thorn_grove',380,620,2015],['ash_hills',650,1010,3282],['vardash_river',950,1470,4778],['southern_plains',1350,2070,6728],['rootbound_ruins',1750,2670,9200]];
test('v146 zone normal and leader HP ranges match the approved balance',()=>{
 for(const [id,min,max,leaderHp] of zones){
  const normal=monsters.filter(x=>x.region_id===id&&x.kind==='normal');
  assert.equal(normal.length,5,id);
  for(const m of normal) assert.ok(m.stats.hp>=min&&m.stats.hp<=max,`${m.id}: ${m.stats.hp}`);
  const leader=monsters.find(x=>x.region_id===id&&['mini_boss','area_boss'].includes(x.kind));
  assert.ok(leader,`${id} leader missing`);assert.equal(leader.stats.hp,leaderHp,`${id} leader HP`);
 }
});
test('v146 tower has 20 encounters and approved boss/miniboss HP values',()=>{
 assert.equal(tower.length,20);
 const bosses=tower.filter(x=>x.kind==='area_boss');assert.equal(bosses.length,5);
 assert.equal(Math.max(...bosses.map(x=>x.hp)),9800);
});
test('v146 dungeon bosses and no hidden enemy multipliers are active',()=>{
 assert.deepEqual(dungeons.map(x=>x.boss.hp),[4200,7800]);
 assert.match(game,/const REGION_COMBAT_MULTIPLIER = _regionId => 1/);
 assert.match(game,/const nonAttackScale=1/);
});
