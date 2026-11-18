import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(new URL('../..',import.meta.url).pathname);
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dungeons=JSON.parse(fs.readFileSync(path.join(root,'content/packs/region_one_master_v2/dungeons/dungeons.json'),'utf8'));
test('هر دو دانجن پنج موج عادی و سپس باس مستقل دارند',()=>{
 for(const d of dungeons){assert.equal(d.wave_count,6);assert.equal(d.normal_waves,5);assert.equal(d.boss_wave,6);assert.equal(d.events_after_wave.treasure_chance_percent.length,6);assert.equal(d.events_after_wave.trap_chance_percent.length,6);assert.equal(d.failure.death_xp_penalty_percent,3);assert.equal(d.failure.death_gold_penalty_percent,1);}
 assert.match(game,/if\(run\.wave>=\(d\.normalWaves\|\|5\)\+1\)/);
 assert.match(game,/run\.wave===6\?"boss":"wave"/);
});
test('دانجن دوم فقط از محدوده‌های ۴ تا ۶ انتخاب می‌کند و باس‌ها/پرتره‌ها موجودند',()=>{
 const south=dungeons.find(d=>d.id==='dungeon_south');assert.deepEqual(south.pool_region_ids,['vardash_river','southern_plains','rootbound_ruins']);
 assert.equal(south.boss.level,5);
 assert.ok(fs.existsSync(path.join(root,'assets/monsters/dungeon_thorn_lord.webp')));
 assert.ok(fs.existsSync(path.join(root,'assets/monsters/dungeon_south_sovereign.webp')));
 assert.match(game,/run\.wave=Math\.min\(6/);
});
test('نسخه بارگذاری‌شده بازی با بسته runtime هماهنگ است',()=>{assert.match(html,/game\.js\?v=43/);});
