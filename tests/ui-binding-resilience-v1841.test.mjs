import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const game = readFileSync(resolve(root, 'game.js'), 'utf8');
const index = readFileSync(resolve(root, 'index.html'), 'utf8');
const sql = readFileSync(resolve(root, 'database/party_retreat_ambiguous_monsters_fix_v184.sql'), 'utf8');
test('render isolates optional world UI binding failures from the rest of control binding', () => {
  assert.match(game, /try\{bindGameWorld\(\);window\.__ETRANOM_UI_BIND_STATUS__=\{ok:true/);
  assert.match(game, /catch\(worldBindError\)/);
  assert.match(game, /try\{organizeInteractionTabs\(\);\}catch\(uiTabError\)/);
  assert.match(game, /if\(!canvas\)\{bindCriticalFallbackControls\(\);\}/);
  assert.match(game, /bindCriticalFallbackControls\(\)/);
});
test('fallback delegation covers top navigation, market and PvP entry points', () => {
  for (const selector of ['data-menu-open','data-menu-action','data-status-open','data-hub-tab','data-marketplace-launch','data-pvp-launch']) {
    assert.ok(game.includes(selector), `missing fallback selector ${selector}`);
  }
});
test('shared modules retain their identities and game entry uses the current cache-buster', () => {
  assert.match(index, /game\.js\?v=1850&nav=1850/);
  assert.match(index, /shared-skill-runtime\.js\?v=1841/);
  assert.match(index, /party\.js\?v=1841/);
  assert.match(index, /pvp-ui\.js\?v=1841/);
});
test('retreat SQL patch renames local variable but preserves party_battle_state.monsters column', () => {
  assert.match(sql, /st\.v_monsters', 'st\.monsters/);
  assert.ok(sql.includes("E'(set\\\\s+)v_monsters(\\\\s*=\\\\s*)v_monsters'"));
  assert.match(sql, /execute v_definition/);
});
