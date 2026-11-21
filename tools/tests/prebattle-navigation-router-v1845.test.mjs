import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../../game.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');

test('V184.5 installs a document capture router before first render', () => {
  assert.match(source, /function installPrimaryNavigationRouter\(\)/);
  assert.match(source, /document\.addEventListener\('click',event=>\{[\s\S]*?\},true\);/);
  assert.match(source, /installPrimaryNavigationRouter\(\);\s*render\(\);load\(\);/);
});

test('pre-battle buttons have explicit transitions', () => {
  for (const token of ['[data-region-battle]', '[data-region-mini]', '[data-region-search]', '[data-region-back]']) {
    assert.ok(source.includes(token), `missing ${token}`);
  }
  assert.match(source, /if\(b\.hasAttribute\('data-region-back'\)\)\{stop\(\);activeTab='regionmap';worldPanelOpen=true;notice='';render\(\);return;\}/);
  assert.match(source, /activeTab='hunt';worldPanelOpen=true;[\s\S]{0,180}combatStart\(\{regionId:id\}\)/);
  assert.match(source, /notice='در '\+zone\.name\+' یک واحد '\+name\+' جمع‌آوری کردی\.';save\(true\);render\(\);return;/);
});

test('region selection opens the page that contains the three pre-battle actions', () => {
  assert.match(source, /state\.scene='danger_zone';activeTab='hunt';worldPanelOpen=true;/);
  assert.match(source, /if\(activeTab==="hunt"\)return firstRegionView/);
});

test('top navigation and close controls are routed centrally', () => {
  for (const token of ['[data-menu-open]', '[data-menu-action]', '[data-status-open]', '[data-hub-tab]', '[data-panel-close]', '[data-tab]']) {
    assert.ok(source.includes(token), `missing ${token}`);
  }
  assert.match(source, /if\(b\.dataset\.hubTab\)\{stop\(\);activeTab=b\.dataset\.hubTab;worldPanelOpen=true;render\(\);return;\}/);
  assert.match(source, /if\(b\.hasAttribute\('data-panel-close'\)\)\{if\(event\.target===b\)\{stop\(\);worldPanelOpen=false;/);
});

test('HTML cache-busts the new navigation router', () => {
  assert.match(html, /game\.js\?v=1845&nav=1845/);
});
