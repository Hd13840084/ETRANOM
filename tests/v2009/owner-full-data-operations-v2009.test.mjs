import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const ui=fs.readFileSync(new URL('../../systems/admin/owner-control-v1.js',import.meta.url),'utf8');
const sql=fs.readFileSync(new URL('../../database/admin/etranom_owner_control_v6_full_data_operations.sql',import.meta.url),'utf8');
test('player save editor calls audited server RPC',()=>{assert.match(ui,/etranom_admin_update_player_save_v1/);assert.match(sql,/player_save_admin_update/);});
test('catalog create and delete are wired to allowlisted RPCs',()=>{assert.match(ui,/etranom_admin_insert_catalog_row_v1/);assert.match(ui,/etranom_admin_delete_catalog_row_v1/);assert.match(sql,/TABLE_NOT_ALLOWED_FOR_INSERT/);assert.match(sql,/TABLE_NOT_ALLOWED_FOR_DELETE/);});
test('dangerous generic tables are not in catalog allowlist',()=>{assert.doesNotMatch(sql,/when p_table in \([^)]*player_profiles[^)]*\) then 'players'/);});
test('RPC execution is revoked from public and anon',()=>{assert.match(sql,/revoke all on function public\.etranom_admin_update_player_save_v1\(uuid,jsonb\) from public,anon/i);});
