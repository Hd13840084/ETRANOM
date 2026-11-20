import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const game = readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
test('Burnt Forest ash-zone environment is placed in the actual southwest Region 1 polygon', () => {
  assert.match(game, /for\(let i=0;i<30;i\+\+\)\{const col=i%6,row=Math\.floor\(i\/6\),x=-2185\+col\*145\+\(row%2\)\*35,y=1595\+row\*128/);
  assert.match(game, /y=1570\+\(i\*71\)%690/);
  assert.match(game, /محدوده خاکستر/);
  assert.match(game, /حوضچه اخگر خاموش و کلبه دیده‌بانی فروریخته/);
});
test('Burnt Forest canopy uses charred woodland palette rather than green forest palette', () => {
  assert.match(game, /جنگل سوخته اکنون در جنوب‌غرب نقشه است؛ تاج‌درخت‌های زغالی/);
  assert.match(game, /rgba\(28,25,23,\.94\)/);
  assert.match(game, /rgba\(72,48,37,\.78\)/);
});
test('Existing map routing, dungeons, ruin, NPCs and city drawing remain present', () => {
  assert.match(game, /poiBadge\(-875,600,'dungeon'/);
  assert.match(game, /poiBadge\(-1800,600,'dungeon'/);
  assert.match(game, /poiBadge\(-875,2050,'ruin'/);
  assert.match(game, /safeNPCs\.forEach/);
  assert.match(game, /cityPOI\.forEach\(drawBuilding\)/);
});
