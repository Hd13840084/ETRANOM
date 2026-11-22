import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('v184 SQL patch renames the PL/pgSQL monsters variable and preserves table column', () => {
  const sql = read('../database/party_retreat_ambiguous_monsters_fix_v184.sql');
  assert.match(sql, /pg_get_functiondef/);
  assert.match(sql, /E'\\\\mmonsters\\\\M'/);
  assert.match(sql, /st\.v_monsters', 'st\.monsters/);
  assert.match(sql, /monsters\\\\2v_monsters/);
});

test('v184 party portrait is constrained to a compact image frame', () => {
  const css = read('../systems/party/party.css');
  assert.match(css, /width:52px!important;height:52px!important/);
  assert.match(css, /object-fit:cover!important/);
});

test('v184 retreat button is locked during pending action', () => {
  const ui = read('../systems/party/party-ui.js');
  assert.match(ui, /\[data-battle-action\],\[data-party-cast-skill\],\[data-party-retreat\]/);
});
