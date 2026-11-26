import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(new URL('../..',import.meta.url).pathname);
const sql=fs.readFileSync(path.join(root,'database/admin/etranom_owner_control_v3_live_operations.sql'),'utf8');
const ui=fs.readFileSync(path.join(root,'systems/admin/owner-control-v1.js'),'utf8');
test('live overview only counts allow-listed real game tables',()=>{
 assert.match(sql,/etranom_admin_live_overview_v1/);
 for(const t of ['player_profiles','etranom_content_monsters','market_listings','pvp_matches','party_battle_state']) assert.ok(sql.includes(`'${t}'`));
});
test('table preview is read-only, allow-listed and permission guarded',()=>{
 assert.match(sql,/TABLE_NOT_ALLOWED/); assert.match(sql,/etranom_admin_is_authorized_v1\(required_permission\)/);
 assert.match(sql,/select to_jsonb\(x\)/i); assert.doesNotMatch(sql,/\b(update|delete|insert)\s+into\s+public\.%I/i);
});
test('admin UI exposes all major operational areas',()=>{
 for(const label of ['آمار زنده دیتابیس','بازیکنان و پرونده‌ها','مدیریت محتوا','جهان، مناطق و هیولاها','نبرد، AI و تنظیمات','اقتصاد، بازار و انجمن‌ها','چت و ارتباطات','ذخیره‌ها و تعارض‌ها','گزارش اقدامات مدیران']) assert.ok(ui.includes(label));
 assert.match(ui,/etranom_admin_live_overview_v1/); assert.match(ui,/etranom_admin_table_preview_v1/);
});

test('role management is immutable-owner guarded',()=>{ assert.match(sql,/OWNER_ONLY/); assert.match(sql,/OWNER_PROTECTED/); assert.match(sql,/etranom_admin_set_role_v1/); assert.match(ui,/مدیریت مدیران/); });
