import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const ui=fs.readFileSync(new URL('../../systems/admin/owner-control-v1.js',import.meta.url),'utf8');
const sql=fs.readFileSync(new URL('../../database/admin/etranom_owner_control_v4_live_data_editor.sql',import.meta.url),'utf8');
test('live editor is wired into owner navigation',()=>{assert.match(ui,/liveEditor\('world'\)/);assert.match(ui,/etranom_admin_update_row_v1/);assert.match(ui,/schema\|\|\[\]\)\.filter\(c=>c\.is_editable/);});
test('live editor uses allowlisted table groups',()=>{assert.match(ui,/EDITABLE_TABLES/);assert.match(sql,/TABLE_NOT_EDITABLE/);});
test('database editor enforces permission and protected columns',()=>{assert.match(sql,/etranom_admin_is_authorized_v1/);assert.match(sql,/PROTECTED_OR_UNKNOWN_COLUMNS/);});
test('updates write before/after audit record',()=>{assert.match(sql,/live_row_update/);assert.match(sql,/before/);assert.match(sql,/after/);});
