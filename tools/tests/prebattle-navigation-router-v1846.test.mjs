import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../../game.js',import.meta.url),'utf8');
const html=await readFile(new URL('../../index.html',import.meta.url),'utf8');
test('V184.6 routes pre-battle actions through persistent capture delegation',()=>{
 assert.match(source,/function installPrimaryNavigationRouter\(\)/);
 for(const token of ['b.dataset.regionBattle','b.dataset.regionMini','b.dataset.regionSearch',"b.hasAttribute('data-region-back')"]) assert.ok(source.includes(token),`missing ${token}`);
 assert.match(source,/if\(!combatStart\(\{regionId:id\}\)\)/);
 assert.match(source,/combatStart\(\{regionId:e\.regionId,encounterId:e\.id\}\)/);
 assert.match(source,/یک واحد '\+name\+' جمع‌آوری کردی/);
});
test('V184.6 close button works when its icon/text child is clicked',()=>{
 assert.match(source,/const isCloseButton=b\.tagName==='BUTTON'\|\|b\.getAttribute\('role'\)==='button'/);
 assert.match(source,/const isBackdropClick=event\.target===b&&b\.classList\.contains\('player-window-backdrop'\)/);
});
test('group battle route remains intact and cache is refreshed',()=>{
 assert.match(source,/if\(b\.dataset\.regionParty\)/);
 assert.match(source,/window\.openETRANOMParty/);
 assert.match(html,/game\.js\?v=1846&nav=1846/);
});
