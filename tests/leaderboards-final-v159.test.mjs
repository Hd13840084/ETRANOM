import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const sql=fs.readFileSync(path.join(root,'database/leaderboards_all10_final_v159.sql'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('v159 exposes one authenticated 10-board RPC',()=>{
 assert.match(sql,/create or replace function public\.etranom_leaderboards\(p_board integer default 1\)/i);
 assert.match(sql,/p_board < 1 or p_board > 10/i);
 assert.match(sql,/grant execute on function public\.etranom_leaderboards\(integer\) to authenticated/i);
});
test('player boards return stable user ids for canonical display names',()=>{
 assert.ok((sql.match(/p\.user_id/g)||[]).length>=8);
 assert.match(sql,/nullif\(btrim\(p\.display_name\),''\)/i);
});
test('PvP boards exclude legacy score-only matches and require server combat logs',()=>{
 assert.match(sql,/m\.status='completed'/i);
 assert.match(sql,/jsonb_array_length\(coalesce\(m\.combat_state->'log'/i);
 assert.match(sql,/server_pvp_matches/i);
});
test('quest ranking reads the actual numeric personal quest counter safely',()=>{
 assert.match(sql,/personalQuests/i);
 assert.match(sql,/q\.value->>'completed' ~ '\^\[0-9\]\+\$'/i);
 assert.match(sql,/mainRegionQuestChains/i);
});
test('UI labels base-stat ranking honestly and renders source freshness',()=>{
 assert.match(html,/بیشترین مجموع ویژگی‌های پایه/);
 assert.match(html,/آخرین ذخیره/);
 assert.match(html,/migration نهایی رتبه‌بندی v159/);
});
