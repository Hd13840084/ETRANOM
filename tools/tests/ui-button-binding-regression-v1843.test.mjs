import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../../game.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');

test('missing world canvas no longer exits before combat UI handlers are bound', () => {
  assert.match(source, /const canvas=root\.querySelector\('#etranom-world'\);[\s\S]{0,260}if\(!canvas\)\{bindCriticalFallbackControls\(\);\}\s*else\s*\{/);
  assert.doesNotMatch(source, /if\(!canvas\)\{bindCriticalFallbackControls\(\);return;\}/);
  const mapClose = source.indexOf('end optional world-canvas/map binding');
  const menuBinder = source.indexOf("root.querySelectorAll('[data-menu-open]')");
  const combatBinder = source.indexOf("root.querySelectorAll('[data-fight]:not([data-fight=\"finish\"])')");
  assert.ok(mapClose > 0 && menuBinder > mapClose, 'scene-independent UI binding must be outside optional canvas branch');
  assert.ok(combatBinder > mapClose, 'combat action binding must run without a world canvas');
});

test('the game entry imports the V184.4 cache-busted repaired runtime', () => {
  assert.match(html, /game\.js\?v=1844&combat=1844/);
});
