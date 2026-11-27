import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sql = fs.readFileSync(path.join(root,'database/admin/etranom_owner_control_v13_inventory_and_global_ban_guard.sql'),'utf8');
const ui = fs.readFileSync(path.join(root,'systems/admin/owner-control-v1.js'),'utf8');

test('V2018 exposes only bounded inventory/equipment operations',()=>{
  assert.match(sql,/etranom_admin_patch_player_inventory_v13/);
  assert.match(sql,/p_action in \('set_quantity','remove'\)/);
  assert.match(sql,/p_quantity>99999/);
  assert.match(sql,/p_action='unequip'/);
  assert.match(sql,/EQUIPMENT_SLOT_NOT_ALLOWED/);
  assert.match(sql,/OWNER_ACCOUNT_PROTECTED/);
  assert.match(sql,/etranom_admin_audit_logs/);
});

test('V2018 bans are enforced at persistent player-row writes',()=>{
  assert.match(sql,/etranom_reject_banned_self_write_v13/);
  assert.match(sql,/before insert or update or delete on public\.game_saves/i);
  assert.match(sql,/before insert or update or delete on public\.player_profiles/i);
  assert.match(sql,/b\.active and \(b\.expires_at is null or b\.expires_at>now\(\)\)/);
  assert.match(sql,/raise exception 'PLAYER_BANNED'/);
});

test('V2018 does not modify existing combat RPC bodies or loosen grants',()=>{
  assert.doesNotMatch(sql,/create or replace function public\.etranom_(pvp_action|pvp_skill_action|party_battle_act)/i);
  assert.match(sql,/revoke all on function public\.etranom_admin_patch_player_inventory_v13\([^;]+from public,anon/i);
  assert.match(ui,/etranom_admin_patch_player_save_v12/);
});
