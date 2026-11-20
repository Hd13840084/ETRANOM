import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const game = await readFile(new URL('../../game.js', import.meta.url), 'utf8');
assert.match(game, /return 5n\*\(3n\*\*BigInt\(n-1\)\)/);
assert.match(game, /state\.gold-=Number\(cost\);restoreAllResources\(\)/);
assert.match(game, /c\[1\]==='rest'\?'اتاقی برای استراحت/);
assert.match(game, /const cost=innRestCost\(\)/);
console.log('inn rest price v54: PASS');
