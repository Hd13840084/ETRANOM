import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('pre-battle view and combat engine share the runtime encounter registry', () => {
  assert.match(source, /const REGION_ENCOUNTERS\s*=/);
  assert.match(source, /const FIRST_REGION_ENCOUNTERS\s*=/);
  assert.match(source, /FIRST_REGION_ENCOUNTERS\.splice\(0,FIRST_REGION_ENCOUNTERS\.length,\.\.\.REGION_ENCOUNTERS\)/);
  assert.match(source, /function firstRegionView\([\s\S]*?REGION_ENCOUNTERS\.find\(e=>e\.regionId===z\.id&&e\.kind==='miniboss'\)/);
  assert.match(source, /REGION_ENCOUNTERS\.find\(x=>x\.id===b\.dataset\.regionMini&&x\.kind==='miniboss'\)/);
});

test('pre-battle routes connect normal combat, miniboss combat, gathering, and return', () => {
  for (const route of [
    'combatStart({regionId:id,fromPreBattle:true})',
    'combatStart({regionId:encounter.regionId,encounterId:encounter.id,fromPreBattle:true})',
    'b.dataset.regionSearch',
    "activeTab='regionmap';worldPanelOpen=true;notice='';render();return"
  ]) assert.ok(source.includes(route), `missing route: ${route}`);
  assert.ok(source.includes('options.fromPreBattle===true&&state.preBattleRegionId===regionId'));
  for (const selector of ['[data-region-battle]', '[data-region-mini]', '[data-region-search]', '[data-region-back]']) {
    assert.ok(source.includes(selector), `missing selector: ${selector}`);
  }
});

test('close controls handle taps on nested icons and cloud runtime cache is refreshed', () => {
  assert.match(source, /if\(b\.hasAttribute\('data-menu-close'\)\)\{const isCloseButton=b\.tagName==='BUTTON'/);
  assert.match(html, /game\.js\?v=1847&nav=1847/);
});
