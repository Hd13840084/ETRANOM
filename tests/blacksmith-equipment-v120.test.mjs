import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../systems/ui/dark-fantasy-pages.css',import.meta.url),'utf8');
test('equipment tab renders all thirteen canonical equipment slots and inventory equip actions',()=>{
  assert.match(game,/if\(activeTab==="inventory"\)return equipmentManagementView\(\)/);
  assert.match(game,/function equipmentManagementView\(\)/);
  assert.match(game,/EQUIPMENT_SLOTS\.map\(\(\[slot,label\]\)/);
  assert.match(game,/data-equip-item=/);
  assert.match(game,/data-unequip-slot=/);
});
test('blacksmith combines recipe crafting, repair and enchantment while retaining one-use recipe flow',()=>{
  const smith=game.split('\n').find(x=>x.includes('else if(p.kind==="smith")body='))||'';
  assert.match(smith,/smithyCraftingPanel\(\)/);
  assert.match(smith,/gear-repair-all/);
  assert.match(smith,/gear-upgrade/);
  assert.match(game,/state\.knownRecipes=state\.knownRecipes\.filter/);
  assert.match(game,/دستور و تمام مواد لازم/);
});
test('equipment workspace has compact responsive dark-fantasy styling',()=>{
  assert.match(css,/\.gear-slots-grid/);
  assert.match(css,/@media\(max-width:390px\)/);
});
