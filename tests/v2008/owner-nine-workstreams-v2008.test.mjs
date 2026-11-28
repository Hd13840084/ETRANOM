import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const ui=fs.readFileSync(new URL('../../systems/admin/owner-control-v1.js',import.meta.url),'utf8');
const sql=fs.readFileSync(new URL('../../database/admin/etranom_owner_control_v5_content_lifecycle.sql',import.meta.url),'utf8');
test('nine owner workstreams are exposed',()=>{for(const id of ['playerstats','items','worldedit','npcquests','classes','combatadmin','economyadmin','opsadmin'])assert.match(ui,new RegExp(id));});
test('content history and rollback RPCs are wired',()=>{assert.match(ui,/etranom_admin_content_versions_list_v1/);assert.match(ui,/etranom_admin_content_rollback_v1/);assert.match(sql,/content_rollback/);});
test('draft deletion is server-restricted',()=>{assert.match(ui,/etranom_admin_delete_draft_v1/);assert.match(sql,/ONLY_DRAFT_CAN_BE_DELETED/);});
test('new RPCs are not executable by anon or public',()=>{assert.match(sql,/revoke all on function public\.etranom_admin_content_rollback_v1[^;]+from public,anon/i);});
