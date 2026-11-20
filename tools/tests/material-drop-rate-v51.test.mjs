import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const game = readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

// Extract the actual production helper and execute it with deterministic rolls.
const marker = 'function rollMaterialDrops(';
const start = game.indexOf(marker);
assert.notEqual(start, -1, 'production material reward helper must exist');
const braceStart = game.indexOf('{', start);
let depth = 0, end = -1;
for (let i = braceStart; i < game.length; i++) {
  if (game[i] === '{') depth++;
  if (game[i] === '}' && --depth === 0) { end = i + 1; break; }
}
assert.ok(end > braceStart, 'production helper must have balanced braces');
const rollMaterialDrops = vm.runInNewContext(`(${game.slice(start, end)})`);

const alwaysDrop = () => 0.49;
const neverDrop = () => 0.5;
const sequence = values => { let i = 0; return () => values[i++]; };

const regular = { kind: 'normal', materialIds: ['ash', 'ignored'], materialNames: ['خاکستر', 'اضافی'] };
assert.deepEqual(JSON.parse(JSON.stringify(rollMaterialDrops(regular, alwaysDrop))), [{ id: 'ash', name: 'خاکستر' }]);
assert.deepEqual(JSON.parse(JSON.stringify(rollMaterialDrops(regular, neverDrop))), []);

const miniboss = { kind: 'miniboss', materialIds: ['a', 'b'], materialNames: ['A', 'B'] };
assert.deepEqual(JSON.parse(JSON.stringify(rollMaterialDrops(miniboss, sequence([0.1, 0.9])))), [{ id: 'a', name: 'A' }]);
assert.deepEqual(rollMaterialDrops(miniboss, alwaysDrop).length, 2);
assert.deepEqual(rollMaterialDrops(miniboss, neverDrop).length, 0);

const boss = { kind: 'boss', materialIds: ['a', 'b', 'c'], materialNames: ['A', 'B', 'C'] };
assert.deepEqual(rollMaterialDrops(boss, alwaysDrop).length, 3);
assert.deepEqual(rollMaterialDrops(boss, neverDrop).length, 0);
assert.deepEqual(JSON.parse(JSON.stringify(rollMaterialDrops({ ...boss, materialIds: ['a', 'a', 'b', 'c'] }, alwaysDrop).map(x => x.id))), ['a', 'b', 'c']);
assert.deepEqual(JSON.parse(JSON.stringify(rollMaterialDrops({ ...boss, towerOnly: true }, alwaysDrop))), []);

// Cache-busting and reward boundaries: recipes, tower rewards and dungeon treasure remain separate.
assert.match(html, /game\.js\?v=116/);
assert.match(game, /rollMaterialDrops\(def\)/);
assert.match(game, /dropSourceType==="dungeon_treasure"/);
assert.match(game, /dropSourceType==='tower_boss'/);
console.log('Material reward integration tests: PASS — normal/miniboss/boss limits, independent rolls, duplicates, names, and exclusions.');
