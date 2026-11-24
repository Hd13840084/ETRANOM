import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const ui=fs.readFileSync(path.join(root,'systems/admin/owner-control-v1.js'),'utf8');
const sql=fs.readFileSync(path.join(root,'database/admin/etranom_owner_control_v13_inventory_and_global_ban_guard.sql'),'utf8');
test('V2019 exposes inventory/equipment controls from player list',()=>{
  assert.match(ui,/data-inventory/);
  assert.match(ui,/async function playerInventory\(playerId\)/);
  assert.match(ui,/etranom_admin_get_player_v1/);
  assert.match(ui,/etranom_admin_patch_player_inventory_v13/);
});
test('V2019 UI only offers bounded quantity, removal and unequip actions',()=>{
  assert.match(ui,/p_action:'set_quantity'/);
  assert.match(ui,/p_action:'remove'/);
  assert.match(ui,/p_action:'unequip'/);
  assert.match(ui,/qty<0\|\|qty>99999/);
  assert.match(ui,/افزودن آیتم دلخواه غیرفعال است/);
});
test('V2019 operations refresh server dossier after each mutation',()=>{
  assert.match(ui,/await playerInventory\(playerId\)/);
  assert.match(sql,/etranom_admin_patch_player_inventory_v13/);
  assert.match(sql,/etranom_admin_audit_logs/);
});
