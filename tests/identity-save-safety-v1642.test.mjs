import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getPlayerDisplayName, isSystemPlayerName, syncPlayerProfile } from '../systems/online/player-identity.js';

test('canonical identity rejects UUIDs and generated placeholders', () => {
  assert.equal(isSystemPlayerName('a7b8c9d0-1234-4abc-8def-1234567890ab'), true);
  assert.equal(isSystemPlayerName('wanderer-abc123'), true);
  assert.equal(isSystemPlayerName('مسافر-abc123'), true);
  assert.equal(isSystemPlayerName('آذرخش'), false);
});

test('display name prefers the real character name and never exposes IDs', () => {
  assert.equal(getPlayerDisplayName({ display_name: 'wanderer-a1', username: 'آذرخش' }), 'آذرخش');
  assert.equal(getPlayerDisplayName({ display_name: '123e4567-e89b-12d3-a456-426614174000' }, 'بازیکن'), 'بازیکن');
});

test('profile sync upserts missing rows and retries username collisions with stable internal handle', async () => {
  const calls = [];
  const supabase = { from(table) { assert.equal(table, 'player_profiles'); return { upsert: async (row, opts) => { calls.push({ row, opts }); return calls.length === 1 ? { error: { code: '23505' } } : { error: null }; } }; } };
  const result = await syncPlayerProfile(supabase, 'a7b8c9d0-1234-4abc-8def-1234567890ab', { name: 'آذرخش', level: 12, archetype: 'جادوگر' });
  assert.equal(result.display_name, 'آذرخش');
  assert.equal(calls.length, 2);
  assert.equal(calls[0].row.username, 'آذرخش');
  assert.match(calls[1].row.username, /^etranom_[a-f0-9]{16}$/);
  assert.equal(calls[1].row.display_name, 'آذرخش');
  assert.equal(calls[1].opts.onConflict, 'user_id');
});

test('game save pipeline has serialized cloud writes, local backup and periodic recovery attempts', () => {
  const game = fs.readFileSync(new URL('../game.js', import.meta.url), 'utf8');
  assert.match(game, /saveQueue\.catch\(\(\)=>\{\}\)\.then\(async\(\)=>\{/);
  assert.match(game, /lastCloudSaveSnapshot=saveClone\(snapshot\)/);
  assert.match(game, /etranom:save-backup:/);
  assert.match(game, /setInterval\(\(\)=>\{if\(!loaded\|\|!state\)return;/);
  assert.match(game, /12000\);/);
  assert.match(game, /addEventListener\('pagehide',flush\)/);
  assert.match(game, /readLocalSaveBackup\(\)/);
  assert.match(game, /for\(const key of \['hp','mp','xp','level'\]\)/);
  assert.match(game, /fresh\.knownRecipes/);
});

test('index syncs profile with upsert instead of update-only and requests save timestamp', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /select\('save_data,updated_at'\)/);
  assert.match(html, /syncPlayerProfile\(supabase,currentUser\.id,state\?\.character\|\|\{\}\)/);
  assert.match(html, /syncPlayerProfile\(supabase,currentUser\.id,character\)/);
  assert.match(html, /profile:socialOverview\?\.me\|\|null/);
});

test('SQL migration backfills profiles and installs save synchronization trigger', () => {
  const sql = fs.readFileSync(new URL('../database/etranom_identity_and_durable_save_v1642.sql', import.meta.url), 'utf8');
  assert.match(sql, /etranom_sync_player_profile_after_save/);
  assert.match(sql, /after insert or update of save_data on public\.game_saves/i);
  assert.match(sql, /etranom_player_display_name\(pm\.user_id\)/);
  assert.match(sql, /for r in select gs\.user_id,gs\.save_data from public\.game_saves/i);
});
