import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');
test('The 27-building registry retains all 12 Ash City buildings and facade identity details',()=>{
  const block=game.match(/const cityPOI\s*=\s*\[([\s\S]*?)\n    \];/);
  assert.ok(block,'cityPOI registry exists');
  assert.equal((block[1].match(/zone: \"city\"/g)||[]).length,12);
  assert.equal((block[1].match(/\{ id:/g)||[]).length,27);
  assert.match(game,/Individual masonry blocks and corner quoins/);
  assert.match(game,/kind\s*===\s*'guild'\s*\?\s*'#8a573d'\s*:\s*'#566f72'/);
  assert.match(html,/game\.js\?v=2161-physics-collision&build=20261127/);
});
