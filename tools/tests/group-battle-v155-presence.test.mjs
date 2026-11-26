import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sql = fs.readFileSync(path.join(root, 'database/party_group_battle_phase5_v155.sql'), 'utf8');
const js = fs.readFileSync(path.join(root, 'systems/party/party.js'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'systems/party/party-ui.js'), 'utf8');

test('heartbeat is server-authenticated and limited to active party members', () => {
  assert.match(sql, /auth\.uid\(\)/);
  assert.match(sql, /join public\.party_members pm on pm\.party_id=s\.party_id and pm\.user_id=uid/);
  assert.match(sql, /on conflict\(session_id,user_id\) do update set last_seen_at=excluded\.last_seen_at/);
});
test('offline members do not block the turn barrier', () => {
  assert.match(sql, /last_seen_at>now\(\)-interval '45 seconds'/);
  assert.match(sql, /done_count>=alive_count and alive_count>0/);
});
test('enemy phase only damages currently connected party members', () => {
  assert.match(sql, /for m in select pm\.user_id from public\.party_members pm[\s\S]*?party_battle_presence/);
});
test('reconnect returns same authoritative battle state with online marker', () => {
  assert.match(sql, /'connected',exists\(select 1 from public\.party_battle_presence/);
  assert.match(sql, /etranom_party_battle_snapshot\(p_session_id\)/);
});
test('client sends heartbeat during battle and clears timer on destroy', () => {
  assert.match(js, /battleHeartbeat: sessionId/);
  assert.match(js, /setInterval\([\s\S]*?battleHeartbeat/);
  assert.match(js, /_battleHeartbeatTimer = null; this\.sync\.unsubscribe/);
});
test('battle UI distinguishes connected and disconnected members', () => {
  assert.match(ui, /m\.connected \? '🟢 آنلاین' : '⚫ آفلاین'/);
});
