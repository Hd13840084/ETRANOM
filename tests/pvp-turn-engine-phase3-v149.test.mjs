import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderCombatActionBar } from '../systems/combat/shared-combat-ui.js';
const sql=fs.readFileSync(new URL('../database/pvp_turn_engine_phase3_v149.sql',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../systems/pvp/pvp-ui.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('PvP actions are server-authoritative and limited to explicit intents',()=>{
 assert.match(sql,/function public\.etranom_pvp_action\(p_match uuid, p_action text\)/);
 assert.match(sql,/p_action not in \('attack','guard'\)/);
 assert.match(sql,/for update/);
 assert.match(sql,/m\.turn_player <> uid/);
 assert.doesNotMatch(sql,/p_damage|client_damage|p_winner/);
});
test('damage, guard mitigation, turn rotation and match completion happen in SQL',()=>{
 assert.match(sql,/random\(\)/);
 assert.match(sql,/guard_next/);
 assert.match(sql,/turn_player=next_player/);
 assert.match(sql,/status='completed'/);
 assert.match(sql,/pvp_player_stats/);
});
test('client invokes the secure action RPC and renders HP/MP bars',()=>{
 assert.match(html,/etranom_pvp_action/);
 assert.match(ui,/pvpAction/);
 const pvpActions=renderCombatActionBar({attribute:'data-pvp-action'});
 assert.match(pvpActions,/data-pvp-action="attack"/);
 assert.match(pvpActions,/data-pvp-action="guard"/);
 assert.match(pvpActions,/data-pvp-action="skill"/);
 assert.match(pvpActions,/data-pvp-action="items"/);
 assert.match(ui,/max_hp/);
 assert.match(ui,/max_mp/);
 assert.match(ui,/گزارش نبرد/);
});
