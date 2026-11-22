import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../game.js', import.meta.url), 'utf8');

test('v1842 installs one persistent capture-phase delegated handler for rebuilt region combat controls', () => {
  assert.match(source, /function bindRegionCombatActionDelegation\(\)/);
  assert.match(source, /root\.dataset\.etranomRegionCombatDelegation==='1'/);
  assert.match(source, /root\.addEventListener\('click',event=>\{/);
  assert.match(source, /\},true\);\s*\}\s*function render\(/);
  assert.ok(source.includes('bindRegionCombatActionDelegation();bindCombatActionDelegation();try{bindGameWorld();'));
});

test('v1842 delegated handler covers normal, miniboss, boss, search, dungeon, ruins and return actions', () => {
  for (const selector of [
    '[data-region-battle]', '[data-region-mini]', '[data-region-boss]',
    '[data-region-search]', '[data-region-dungeon]', '[data-region-back]',
    '[data-dungeon-start]', '[data-dungeon-continue]',
    '[data-dungeon-abandon]', '[data-ruins-explore]'
  ]) assert.ok(source.includes(selector), `missing delegated selector ${selector}`);
  for (const route of ['combatStart({regionId:id})', 'combatStart({regionId:e.regionId,encounterId:e.id})', 'beginDungeonWave()']) {
    assert.ok(source.includes(route), `missing action route ${route}`);
  }
});
