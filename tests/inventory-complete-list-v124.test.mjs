import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../systems/ui/dark-fantasy-pages.css',import.meta.url),'utf8');

test('inventory normalization accepts legacy quantity fields and split material stores',()=>{
  const start=game.indexOf('// v124: normalize legacy and split inventory stores');
  const end=game.indexOf('  function inventoryItemKind(item)',start);
  assert.ok(start>=0&&end>start,'inventory normalization helper exists');
  const helper=game.slice(start,end);
  const state={inventory:[{id:'old_ore',name:'سنگ‌آهن',quantity:4}],materials:[{id:'wolf_pelt',name:'پوست گرگ',qty:3},{id:'catalog_only',name:'فقط تعریف کاتالوگ'}],items:{old_key:{name:'کلید قدیمی',count:2}}};
  const normalize=new Function('state',`${helper}; return normalizeInventoryState;`)(state);
  const entries=normalize();
  assert.equal(entries.find(x=>x.id==='old_ore')?.qty,4);
  assert.equal(entries.find(x=>x.id==='wolf_pelt')?.qty,3);
  assert.equal(entries.find(x=>x.id==='old_key')?.qty,2);
  assert.equal(entries.some(x=>x.id==='catalog_only'),false,'unowned catalogue definitions are not imported');
});

test('legacy inventory migration does not resurrect consumed items on later renders',()=>{
  const start=game.indexOf('// v124: normalize legacy and split inventory stores');
  const end=game.indexOf('  function inventoryItemKind(item)',start);
  const helper=game.slice(start,end);
  const state={inventory:[],materialInventory:[{id:'ash_shard',qty:2}]};
  const normalize=new Function('state',`${helper}; return normalizeInventoryState;`)(state);
  normalize();
  assert.equal(state.inventory.length,1);
  state.inventory[0].qty=0;
  state.inventory=[];
  normalize();
  assert.equal(state.inventory.length,0);
});

test('backpack renders all normalized positive entries across every category',()=>{
  assert.match(game,/const inventoryEntries=normalizeInventoryState\(\)/);
  assert.match(game,/const entries=inventoryEntries\.filter\(x=>x&&Number\(x\.qty\)>0\)/);
  for(const title of ['تجهیزات موجود در کیف','مواد و منابع','معجون‌ها و اقلام مصرفی','دستورها و نقشه‌ها','اقلام مأموریتی و کلیدها','سایر آیتم‌ها'])assert.ok(game.includes(title),`missing category: ${title}`);
  assert.match(game,/data-inventory-item=/);
  assert.match(game,/هیچ آیتم ناشناخته‌ای حذف یا پنهان نمی‌شود/);
});

test('legacy store migration is persisted on load and responsive category styling remains',()=>{
  assert.match(game,/state\._inventoryStoresMigratedV124/);
  assert.match(game,/migratedLegacyContent=true;normalizeInventoryState\(\)/);
  assert.match(css,/\.inventory-category-materials/);
  assert.match(css,/\.inventory-category-consumables/);
  assert.match(css,/\.inventory-category-recipes/);
});
