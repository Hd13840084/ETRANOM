import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../systems/ui/dark-fantasy-pages.css',import.meta.url),'utf8');
test('backpack renders every positive-quantity inventory entry, not only equipment',()=>{
  assert.match(game,/const entries=state\.inventory\.filter\(x=>x&&Number\(x\.qty\)>0\)/);
  assert.match(game,/const groups=\{equipment:\[\],materials:\[\],consumables:\[\],recipes:\[\],quest:\[\],other:\[\]\}/);
  assert.match(game,/section\('materials','مواد و منابع'/);
  assert.match(game,/section\('consumables','معجون‌ها و اقلام مصرفی'/);
  assert.match(game,/section\('recipes','دستورها و نقشه‌ها'/);
  assert.match(game,/section\('quest','اقلام مأموریتی و کلیدها'/);
  assert.match(game,/section\('other','سایر آیتم‌ها'/);
});
test('unknown and legacy items are retained in the other-items category',()=>{
  assert.match(game,/return 'other'/);
  assert.match(game,/تمام آیتم‌های دارای موجودی مثبت، بدون محدودیت دسته‌بندی/);
});
test('backpack category styling remains responsive and visually separated',()=>{
  assert.match(css,/\.inventory-category-materials/);
  assert.match(css,/\.inventory-category-consumables/);
  assert.match(css,/\.inventory-category-recipes/);
});
