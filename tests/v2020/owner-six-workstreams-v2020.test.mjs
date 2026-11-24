import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const ui=fs.readFileSync(path.join(root,'systems/admin/owner-control-v1.js'),'utf8');
const sql=fs.readFileSync(path.join(root,'database/admin/etranom_owner_control_v14_six_workstreams_preflight.sql'),'utf8');
test('V2020 retains typed player and inventory mutation contracts',()=>{
 assert.match(ui,/etranom_admin_patch_player_save_v12/);
 assert.match(ui,/etranom_admin_patch_player_inventory_v13/);
 assert.match(sql,/etranom_admin_patch_player_inventory_v13/);
 assert.match(sql,/etranom_admin_patch_player_save_v12/);
});
test('V2020 preflight covers all six owner workstreams without modifying data',()=>{
 for(const token of ['player_profiles','game_saves','etranom_shared_skill_catalog','pvp_matches','market_transactions','etranom_platform_treasury']) assert.ok(sql.includes(token),token);
 assert.match(sql,/select check_id, ok, detail/);
 assert.doesNotMatch(sql,/\b(insert into|update public\.|delete from|create or replace function)\b/i);
});
test('V2020 keeps ban trigger readiness checks',()=>{
 assert.match(sql,/etranom_ban_guard_game_saves_v13/);
 assert.match(sql,/etranom_ban_guard_player_profiles_v13/);
});
