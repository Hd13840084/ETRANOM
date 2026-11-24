import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../database/pvp_real_combat_phase1_v147.sql',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../systems/pvp/pvp-ui.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const game=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
test('accepting a challenge creates an active match, not an instant winner',()=>{
 assert.match(sql,/status in \('active','completed','abandoned','draw'\)/);
 assert.match(sql,/status,completed_at,turn_player,turn_no,combat_state/);
 assert.match(sql,/'schema','etranom-pvp-combat-v1'/);
 assert.doesNotMatch(sql,/sa:=greatest\(1,coalesce\(pa\.player_level/);
 assert.doesNotMatch(sql,/winner:=case when sa>sb/);
});
test('match snapshot is participant scoped',()=>{
 assert.match(sql,/where id=p_match and auth\.uid\(\) in\(player_a,player_b\)/);
});
test('client exposes active match snapshot and no longer claims an automatic result',()=>{
 assert.match(html,/etranom_pvp_match_snapshot/);
 assert.match(ui,/pvpSubscribeMatch/);
 assert.match(ui,/renderMatch/);
 assert.match(ui,/active_matches/);
});
test('safe-zone PvP hall no longer exposes a local launch/service control',()=>{
 const panel=game.slice(game.indexOf('function renderInteractionPanel(){'),game.indexOf('function renderHubTabs(){'));
 assert.doesNotMatch(panel,/data-pvp-launch|باز کردن تالار PvP/);
 assert.match(ui,/renderMatch/);
});
