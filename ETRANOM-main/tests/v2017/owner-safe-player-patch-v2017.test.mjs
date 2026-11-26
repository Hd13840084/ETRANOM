import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../../database/admin/etranom_owner_control_v12_safe_player_patch.sql', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../../systems/admin/owner-control-v1.js', import.meta.url), 'utf8');

test('V12 exposes only the typed player patch RPC', () => {
  assert.match(sql, /etranom_admin_patch_player_save_v12/);
  for (const field of ['gold','xp','level','hp','mp','stamina']) assert.match(sql, new RegExp(`when '${field}'`));
  assert.match(sql, /PLAYER_FIELD_NOT_ALLOWED/);
  assert.match(sql, /VALUE_OUT_OF_RANGE/);
  assert.match(sql, /OWNER_ACCOUNT_PROTECTED/);
});

test('V12 validates integer bounds and audits before/after values', () => {
  assert.match(sql, /n<>trunc\(n\)/);
  assert.match(sql, /jsonb_build_array\(min_n,max_n\)/);
  assert.match(sql, /player_save_typed_patch/);
  assert.match(sql, /for update/);
});

test('Owner UI no longer offers full JSON replacement', () => {
  assert.match(ui, /etranom_admin_patch_player_save_v12/);
  assert.doesNotMatch(ui, /etr-player-save-json/);
  assert.doesNotMatch(ui, /etranom_admin_update_player_save_v1/);
});
