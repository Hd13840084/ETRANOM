import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderCombatActionBar } from '../systems/combat/shared-combat-ui.js';
const sql=fs.readFileSync(new URL('../database/pvp_live_session_ui_phase2_v148.sql',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../systems/pvp/pvp-ui.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('match table visibility is restricted to its two participants',()=>{
 assert.match(sql,/auth\.uid\(\) in \(player_a, player_b\)/);
 assert.doesNotMatch(sql,/using\s*\(true\)/i);
});
test('match snapshot returns only combat-relevant player save fields',()=>{
 for(const field of ['character','equipment','inventory','classProgress']) assert.match(sql,new RegExp("'"+field+"'"));
 assert.match(sql,/private flags|unrelated save data/);
});
test('client subscribes to realtime match updates and has polling fallback',()=>{
 assert.match(html,/pvpSubscribeMatch:/);
 assert.match(html,/postgres_changes/);
 assert.match(ui,/setInterval\(refresh,2200\)/);
 assert.match(ui,/renderMatch\(m\)/);
});
test('match view shows both player cards, event log and the shared four-button bar',()=>{
 assert.match(ui,/نبرد PvP/);
 assert.match(ui,/گزارش نبرد/);
 assert.match(ui,/حمله عادی/);
 assert.match(ui,/دفاع/);
 const actions=renderCombatActionBar({attribute:'data-pvp-action',disabled:{skill:true,items:true}});
 assert.match(actions,/data-pvp-action="attack"/);
 assert.match(actions,/data-pvp-action="skill"/);
 assert.match(actions,/data-pvp-action="items"/);
});
