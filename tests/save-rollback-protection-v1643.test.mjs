import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game = fs.readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sql = fs.readFileSync(new URL('../database/etranom_save_rollback_protection_v1643.sql', import.meta.url), 'utf8');

test('client save writes use a revision-checked RPC, not unconditional upsert', () => {
  assert.match(html, /etranom_save_game_state_v1643/);
  assert.match(html, /p_expected_updated_at:currentSaveRevision/);
  assert.match(html, /setSaveRevision:updatedAt=>/);
  assert.doesNotMatch(html, /saveUserGameState:async state=>\{[^}]*\.upsert\(/s);
});

test('server archives prior saves and quarantines stale client snapshots', () => {
  assert.match(sql, /create table if not exists public\.game_save_history/i);
  assert.match(sql, /create table if not exists public\.game_save_conflicts/i);
  assert.match(sql, /etranom_archive_game_save_v1643/i);
  assert.match(sql, /old\.save_data is distinct from new\.save_data/i);
  assert.match(sql, /v_current\.updated_at is distinct from p_expected_updated_at/i);
  assert.match(sql, /client_save_data,server_save_data/i);
  assert.match(sql, /revoke insert, update on public\.game_saves from authenticated/i);
});

test('cloud save is authoritative when it exists; newer local backup is preserved separately', () => {
  assert.match(game, /state=r\.state;lastCloudSaveSnapshot=saveClone\(r\.state\)/);
  assert.match(game, /etranom:save-recovery:/);
  assert.doesNotMatch(game, /state=localBackup\.state;migratedLegacyContent=true/);
});

test('stale snapshots are merged conservatively and retried against the new revision', () => {
  assert.match(game, /mergeSaveSnapshots\(lastCloudSaveSnapshot,snapshot,result\.state\)/);
  assert.match(game, /mergeInventoryAgainstBase/);
  assert.match(game, /result=await api\.saveUserGameState\(snapshot\)/);
  assert.match(game, /save_conflict_repeated/);
});
