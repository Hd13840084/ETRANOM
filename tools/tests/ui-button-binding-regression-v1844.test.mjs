import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../../game.js',import.meta.url),'utf8');
const html=await readFile(new URL('../../index.html',import.meta.url),'utf8');
test('persistent navigation delegate is installed before optional world binding',()=>{
  assert.match(source,/bindCriticalFallbackControls\(\);bindRegionCombatActionDelegation\(\);bindCombatActionDelegation\(\);try\{bindGameWorld\(\)/);
  assert.match(source,/\[data-pvp-launch\],\[data-tab\]/);
  assert.match(source,/if\(b\.dataset\.tab\)\{stop\(\);activeTab=b\.dataset\.tab;notice='';render\(\);return;\}/);
});
test('combat action delegation covers attack, target, skill and consumables',()=>{
  assert.match(source,/function bindCombatActionDelegation\(\)/);
  for(const token of ['[data-fight]','[data-target-enemy]','[data-use-combat-item]','[data-use-combat-scroll]','[data-use-combat-skill]']) assert.ok(source.includes(token),token);
  assert.match(source,/bindCombatActionDelegation\(\);try\{bindGameWorld\(\)/);
});
test('region delegation covers solo, boss, dungeon, search and party entry',()=>{
  for(const token of ['[data-region-battle]','[data-region-mini]','[data-region-boss]','[data-region-search]','[data-region-dungeon]','[data-region-party]','[data-dungeon-start]','[data-dungeon-continue]','[data-dungeon-abandon]']) assert.ok(source.includes(token),token);
});
test('cache-busted game entry points to V184.4',()=>assert.match(html,/game\.js\?v=1844&combat=1844/));
