import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sql = await readFile(new URL('../../database/ETRANOM_V1969_COMBAT_RPC_IDEMPOTENCY_GATEWAY.sql', import.meta.url), 'utf8');
const party = await readFile(new URL('../../systems/party/party.js', import.meta.url), 'utf8');
const combat = await readFile(new URL('../../systems/party/party-combat.js', import.meta.url), 'utf8');
const index = await readFile(new URL('../../index.html', import.meta.url), 'utf8');

test('gateway stores per-user, per-mode, per-combat request receipts', () => {
  assert.match(sql, /primary key \(user_id, mode, combat_id, operation, request_id\)/i);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /revoke all on public\.combat_action_receipts_v1969 from public, anon, authenticated/i);
});

test('Party wrapper authorizes membership before replay and delegates to existing authoritative RPC', () => {
  assert.match(sql, /etranom_party_battle_act_v1969/i);
  assert.match(sql, /join public\.party_members pm on pm\.party_id=s\.party_id where s\.id=p_session_id and pm\.user_id=uid/i);
  assert.match(sql, /public\.etranom_party_battle_act\(p_session_id,p_action,p_target_index\)/i);
});

test('PvP action and skill wrappers validate match participation and preserve server RPC authority', () => {
  assert.match(sql, /etranom_pvp_action_v1969/i);
  assert.match(sql, /etranom_pvp_skill_action_v1969/i);
  assert.equal((sql.match(/uid in \(m\.player_a,m\.player_b\)/g) || []).length, 2);
  assert.match(sql, /public\.etranom_pvp_action\(p_match,p_action\)/i);
  assert.match(sql, /public\.etranom_pvp_skill_action\(p_match,p_skill_id,p_target_id,p_choice\)/i);
});

test('receipt replay is serialized and returns the original result', () => {
  assert.equal((sql.match(/pg_advisory_xact_lock\(hashtextextended/g) || []).length, 3);
  assert.equal((sql.match(/return cached \|\| jsonb_build_object\('duplicate',true/g) || []).length, 3);
});

test('Party client sends stable request id and retains it after ambiguous network errors', () => {
  assert.match(party, /etranom_party_battle_act_v1969/);
  assert.match(combat, /pendingAction\.requestId/);
  assert.match(combat, /Keep the same request UUID after ambiguous transport failures/);
});

test('PvP client uses the V1969 request gateway', () => {
  assert.match(index, /etranom_pvp_action_v1969/);
  assert.match(index, /etranom_pvp_skill_action_v1969/);
});
