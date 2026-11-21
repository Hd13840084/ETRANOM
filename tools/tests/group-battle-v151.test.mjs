import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sql = fs.readFileSync(path.join(root, 'database/party_group_battle_phase2_v151.sql'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'systems/party/party-ui.js'), 'utf8');
const combat = fs.readFileSync(path.join(root, 'systems/party/party-combat.js'), 'utf8');

test('v151 derives player combat profiles from saved server-side character data', () => {
  assert.match(sql, /etranom_party_character_combat_profile/);
  assert.match(sql, /game_saves/);
  assert.match(sql, /equipmentSlots/);
  assert.match(sql, /player_combat/);
});

test('v151 exposes HP and MP values in the group battle snapshot', () => {
  assert.match(sql, /'max_hp'/);
  assert.match(sql, /'max_mp'/);
  assert.match(sql, /'mp'/);
});

test('v151 supports server-validated attack, skill, guard, heal and potion actions', () => {
  for (const action of ['attack', 'skill', 'guard', 'heal', 'potion']) assert.ok(sql.includes(`'${action}'`));
  assert.match(sql, /insufficient_mana/);
  assert.match(sql, /party_potion_unavailable/);
});

test('v151 preserves the global monster coin bands', () => {
  for (const band of ['10;max_coins:=15', '100;max_coins:=200', '400;max_coins:=600', '1000;max_coins:=1800', '3000;max_coins:=5000']) assert.ok(sql.includes(band));
});

test('group battle UI displays MP, core actions and the specialization skill picker', () => {
  assert.match(ui, /battle-meter mp/);
  for (const action of ['attack', 'guard', 'heal', 'potion']) assert.ok(ui.includes(`data-battle-action="${action}"`));
  assert.match(ui, /data-party-cast-skill/);
});

test('client calls the server RPC and localizes common combat errors', () => {
  assert.match(combat, /battleAction\(session\.id, action, targetIndex\)/);
  assert.match(combat, /insufficient_mana/);
});
