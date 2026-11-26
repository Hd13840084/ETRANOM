import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(new URL('../..', import.meta.url).pathname);
const sql = fs.readFileSync(path.join(root,'database/party_group_battle_phase7_v157.sql'),'utf8');
const ui = fs.readFileSync(path.join(root,'systems/party/party-ui.js'),'utf8');
const css = fs.readFileSync(path.join(root,'systems/party/party.css'),'utf8');
test('cooldowns become usable on the first round after the configured cooldown expires',()=>{
 assert.match(sql,/v_cooldowns->>v_skill_id\)::integer,0\)>=st\.round_no/);
});
test('unique kill ledger is inserted before persistent save rewards are written',()=>{
 const ledger=sql.indexOf('insert into public.party_battle_kill_ledger');
 const saveUpdate=sql.indexOf('update public.game_saves gs set save_data=jsonb_set(v_save_data');
 assert.ok(ledger>=0 && saveUpdate>ledger);
 assert.match(sql,/if v_ledger_rows = 1 then[\s\S]*?update public\.game_saves gs set save_data/);
});
test('group kill rewards persist XP, coins, materials and discovered recipes to the killer save',()=>{
 assert.match(sql,/character,xp/);
 assert.match(sql,/knownRecipes/);
 assert.match(sql,/party_battle_reward_ledger/);
});
test('victory and defeat display the current session reward receipt',()=>{
 assert.match(ui,/async showBattleRewards\(snapshot\)/);
 assert.match(ui,/row\.session_id\) === String\(snapshot\?\.session_id\)/);
 assert.match(ui,/گزارش پاداش شخصی تو/);
 assert.match(css,/\.etr-party-reward-summary/);
});
