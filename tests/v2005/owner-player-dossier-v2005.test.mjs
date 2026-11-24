import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(new URL('../..', import.meta.url).pathname);
const sql = fs.readFileSync(path.join(root,'database/admin/etranom_owner_control_v2_player_dossier.sql'),'utf8');
const ui = fs.readFileSync(path.join(root,'systems/admin/owner-control-v1.js'),'utf8');
const index = fs.readFileSync(path.join(root,'index.html'),'utf8');
test('player dossier RPC is permission-guarded and read-only',()=>{
  assert.match(sql,/etranom_admin_is_authorized_v1\('players'\)/);
  assert.match(sql,/from public\.player_profiles p\s+where p\.user_id = p_player_id/);
  assert.match(sql,/from public\.game_saves s\s+where s\.user_id = p_player_id/);
  assert.doesNotMatch(sql,/\b(update|delete|insert)\s+into\s+public\.(player_profiles|game_saves)/i);
  assert.match(sql,/player_dossier_view/);
});
test('player UI exposes dossier action and escapes JSON output',()=>{
  assert.match(ui,/data-detail=/);
  assert.match(ui,/etranom_admin_get_player_v1/);
  assert.match(ui,/esc\(JSON\.stringify\(d\.save_data/);
});
test('owner UI is loaded only once after game startup',()=>{
  const matches=index.match(/owner-control-v1\.js/g)||[];
  assert.equal(matches.length,1);
  assert.match(index,/owner-control-v1\.js\?v=2013/);
});
