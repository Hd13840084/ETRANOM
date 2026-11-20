import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');
test('v121 restores bounded flex tabs and touch scrolling for all mobile interior pages',()=>{
  assert.match(game,/etranom-v121-scroll-ownership/);
  assert.match(game,/\.player-window-backdrop>\.world-panel-window\{display:flex!important/);
  assert.match(game,/\.world-panel-window>\.panel,\.world-panel-window>section\.panel\{display:block!important;flex:1 1 auto!important/);
  assert.match(game,/overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important/);
});
test('v121 gives the battle screen one vertical mobile scroll owner',()=>{
  assert.match(game,/#etr-game-root>\.shell\.game-shell>\.combat-screen\{display:block!important;flex:1 1 auto!important/);
  assert.match(game,/\.combat-screen>\.etr-battle-screen\{display:block!important;width:100%!important;height:auto!important/);
});
test('index cache-busts the updated UI assets',()=>{
  assert.match(html,/dark-fantasy-pages\.css\?v=121/);
  assert.match(html,/battle-compact-v119\.css\?v=121/);
});
