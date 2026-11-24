import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const game = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('nearest interaction resolver is defined once at module scope', () => {
  assert.equal((game.match(/function\s+openNearest\s*\(/g) || []).length, 1);
  assert.doesNotMatch(game, /let\s+openNearest\s*=/);
  assert.doesNotMatch(game, /openNearest\s*=\s*\(/);
});

test('primary capture router and map binder use the shared resolver', () => {
  assert.match(game, /if\(b\.dataset\.worldAction==='interact'\)\{stop\(event\);openNearest\(\);return;\}/);
  assert.match(game, /else if\(a==='interact'\)openNearest\(\)/);
  assert.match(game, /function\s+openNearest\s*\([\s\S]*?worldInteraction=\{\.\.\.near\.item/);
});

test('the shared resolver obtains position from state rather than a canvas-local variable', () => {
  const resolver = game.match(/function\s+openNearest\s*\([\s\S]*?\n  \}/)?.[0] || '';
  assert.match(resolver, /state\.worldPosition/);
  assert.doesNotMatch(resolver, /\bp\.x\b|\bp\.y\b/);
});

test('entry point cache-busts the interaction repair', () => {
  assert.match(html, /game\.js\?v=1908&nav=1908/);
});
