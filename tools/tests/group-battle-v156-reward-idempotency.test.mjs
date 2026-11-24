import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(new URL('../..', import.meta.url).pathname);
const sql = fs.readFileSync(path.join(root, 'database/party_group_battle_phase6_v156.sql'), 'utf8');

test('v156 gates reward ledger writes on successful unique kill-ledger insert', () => {
  assert.match(sql, /on conflict\s*\(session_id,monster_index\)\s*do nothing;\s*get diagnostics v_ledger_rows = row_count;/i);
  assert.match(sql, /if v_ledger_rows = 1 then[\s\S]*?insert into public\.party_battle_reward_ledger/i);
});

test('v156 preserves killer-only reward attribution and per-monster unique key', () => {
  assert.match(sql, /values\(p_session_id,idx,coalesce\(monster->>'id','monster'\),uid,material_drops,v_recipe,xp_gain,coins\)/i);
  assert.match(sql, /on conflict\(session_id,monster_index\) do nothing/i);
  assert.match(sql, /values\(p_session_id,uid,xp_gain,coins,material_drops\)/i);
});

test('v156 does not replace or weaken the existing action RPC contract', () => {
  assert.match(sql, /etranom_party_battle_act\(p_session_id uuid,p_action text,p_target_index integer default null\)/i);
  assert.match(sql, /already_acted_this_round/i);
  assert.match(sql, /player_defeated/i);
  assert.match(sql, /party_target_invalid_or_defeated/i);
});
