import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const root = new URL('../../content/packs/', import.meta.url);
for (const pack of readdirSync(root, { withFileTypes: true }).filter(x => x.isDirectory())) {
  const file = new URL(`${pack.name}/monsters/monsters.json`, root);
  let rows; try { rows = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
  for (const monster of rows) for (const drop of monster.drops || []) assert.equal(drop.chance, 0.3, `${pack.name}/${monster.id}/${drop.material_id}`);
}
const game = readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
assert.match(game, /randomFn\(\)<0\.30/);
console.log('Monster material drop rate 30%: PASS');
