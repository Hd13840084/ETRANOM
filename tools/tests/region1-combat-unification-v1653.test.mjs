import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../../',import.meta.url);
const pack=new URL('content/packs/region_one_master_v2/',root);
const monsters=JSON.parse(fs.readFileSync(new URL('monsters/monsters.json',pack),'utf8'));
const dungeons=JSON.parse(fs.readFileSync(new URL('dungeons/dungeons.json',pack),'utf8'));
const tower=JSON.parse(fs.readFileSync(new URL('tower/tower.json',pack),'utf8'));
const towerEnc=JSON.parse(fs.readFileSync(new URL('tower/tower_encounters.json',pack),'utf8'));
const game=fs.readFileSync(new URL('game.js',root),'utf8');
const party=fs.readFileSync(new URL('systems/party/party-ui.js',root),'utf8');
const css=fs.readFileSync(new URL('systems/party/party.css',root),'utf8');
const sql=fs.readFileSync(new URL('database/region1_combat_unification_v1653.sql',root),'utf8');
const runtime=fs.readFileSync(new URL('systems/content/region-one-runtime.js',root),'utf8');
const sharedUi=fs.readFileSync(new URL('systems/combat/shared-combat-ui.js',root),'utf8');
test('all 36 Region 1 monsters retain zone levels and exact material type counts',()=>{
 assert.equal(monsters.length,36);
 for(const m of monsters){
  assert.equal(m.level,m.subarea_id==='burnt_forest_core'?1:m.subarea_id==='thorn_grove_core'?2:m.subarea_id==='ash_hills_core'?3:m.subarea_id==='vardash_river_core'?4:5);
  assert.equal(m.drops.length,m.kind==='normal'?1:m.kind==='mini_boss'?2:3,m.id);
  assert.ok(m.drops.every(d=>d.quantity===1));
  assert.ok(m.stats.attack<=48,`${m.id} attack should remain below the level-5 epic/legendary target`);
  assert.equal(m.hp,m.stats.hp);assert.equal(m.attack,m.stats.attack);assert.equal(m.defense,m.stats.defense);
 }
});
test('both Region 1 dungeons use five waves and their own region pool',()=>{
 assert.equal(dungeons.length,2);
 for(const d of dungeons){assert.equal(d.wave_count,6);assert.equal(d.normal_waves,5);assert.equal(d.boss_wave,6);assert.equal(d.enemy_count.second_enemy_chance_percent,35);assert.ok(d.boss.hp<10000);}
 assert.deepEqual(dungeons[0].pool_region_ids,['thorn_grove']);assert.deepEqual(dungeons[1].pool_region_ids,['vardash_river','southern_plains','rootbound_ruins']);
});
test('tower retains 20 floors and all floor encounter stats are tuned',()=>{assert.equal(tower.floors.length,20);assert.equal(towerEnc.length,20);assert.ok(towerEnc.every(e=>e.hp<=9800&&e.attack<=48));
 for(const e of towerEnc) assert.equal(e.material_ids.length,e.kind==='normal'?1:e.kind==='mini_boss'?2:3,e.id);
 assert.match(runtime,/materialIds: \[\.\.\.\(e\.material_ids \|\| \[\]\)\]/);});
test('solo and party battle buttons share the new order and group art leaves portrait clear',()=>{
 assert.match(game,/renderCombatActionBar\(\{/);
 assert.ok(sharedUi.indexOf("id: 'attack'")<sharedUi.indexOf("id: 'skill'"));
 assert.ok(sharedUi.indexOf("id: 'skill'")<sharedUi.indexOf("id: 'items'"));
 assert.match(party,/renderCombatActionBar\(\{/);
 assert.match(party,/portraitBySpec/);assert.match(party,/selfStamina/);assert.match(sql,/max_stamina/);
 assert.match(css,/enemy-overlay-stats\{position:static!important/);
 assert.match(game,/if\(run\.stage==="boss"\|\|run\.wave>=normalWaves\)/);
 assert.match(game,/d\.treasureChances\?\.\[wave-1\]/);
 assert.match(game,/entry\.wave=bossWave/);assert.match(runtime,/enemyCount: d\.enemy_count/);assert.match(game,/second_enemy_chance_percent\?\?60/);
});
test('group catalog migration syncs actual monster IDs and raises party coins without changing XP helper',()=>{
 assert.match(sql,/\('ash_crow'/);assert.match(sql,/\('thorn_grove_monster_1'/);assert.match(sql,/\('rootbound_region_boss'/);
 assert.match(sql,/etranom_party_battle_act/);assert.match(sql,/\*1\.20/);
 assert.match(sql,/attack_power\*2\.2\+random\(\)\*4/);
 assert.match(sql,/v_hit_chance:=greatest\(65,least\(98,85/);
 assert.match(sql,/wizard_power/);
 assert.match(sql,/'defense',greatest\(0,coalesce\(\(v_monster\.stats->>'defense'/);
 assert.match(game,/if\(!def\)return \[\];/);
 assert.doesNotMatch(sql,/create or replace function public.etranom_monster_xp_from_hp/);
});
