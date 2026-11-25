import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');
test('V2031 keeps nine functional city buildings and adds facade identity details',()=>{
  const block=game.match(/const cityPOI=\[([\s\S]*?)\n  \];/);
  assert.ok(block,'cityPOI registry exists');
  assert.equal((block[1].match(/\{id:/g)||[]).length,9);
  assert.match(game,/Individual masonry blocks and corner quoins/);
  assert.match(game,/kind==='guild'\?'#8a573d':'#566f72'/);
  assert.match(html,/game\.js\?v=2031&nav=2031/);
});
