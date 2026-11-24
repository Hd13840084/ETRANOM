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
test('safe-zone blacksmith services are removed pending the unified workshop redesign',()=>{
  const panel=game.slice(game.indexOf('function renderInteractionPanel(){'),game.indexOf('function renderHubTabs(){'));
  assert.doesNotMatch(panel,/smithyCraftingPanel|gear-repair-all|gear-upgrade|data-interact-action=\"craft/);
  assert.doesNotMatch(game,/function smithyCraftingPanel\(\)/);
  assert.match(game,/const EQUIPMENT_EFFECTS = \{/);
  assert.match(game,/function equipmentCatalogFor/);
});
test('equipment workspace has compact responsive dark-fantasy styling',()=>{
  assert.match(css,/\.gear-slots-grid/);
  assert.match(css,/@media\(max-width:390px\)/);
});
