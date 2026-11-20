import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../systems/ui/dark-fantasy-pages.css',import.meta.url),'utf8');
test('inventory display keeps the complete v124 normalized list',()=>{
  assert.match(game,/const inventoryEntries=normalizeInventoryState\(\)/);
  assert.match(game,/const entries=inventoryEntries\.filter\(x=>x&&Number\(x\.qty\)>0\)/);
  for(const title of ['تجهیزات موجود در کیف','مواد و منابع','معجون‌ها و اقلام مصرفی','دستورها و نقشه‌ها','اقلام مأموریتی و کلیدها','سایر آیتم‌ها'])assert.ok(game.includes(title));
});
test('inventory categorization preserves unknown entries and classifies materials broadly',()=>{
  assert.match(game,/return 'other'/);
  assert.match(game,/material\|resource\|gather\|ore\|herb\|wood\|stone/);
});
test('inventory categories keep responsive styling',()=>{
  assert.match(css,/\.inventory-category-materials/);
  assert.match(css,/\.inventory-category-consumables/);
  assert.match(css,/\.inventory-category-recipes/);
});
