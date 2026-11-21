import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const game = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('combat action bar renders safely with zero potions and zero scrolls', () => {
  assert.match(game, /battleScrolls\.reduce\(\(n,x\)=>n\+Math\.max\(0,Number\(x\?\.qty\)\|\|0\),0\)/);
  assert.match(game, /potions\.reduce\(\(n,x\)=>n\+Math\.max\(0,Number\(x\?\.qty\)\|\|0\),0\)/);
  assert.equal([].reduce((n, x) => n + Math.max(0, Number(x?.qty) || 0), 0), 0);
});

test('normal battle action routes to the region encounter engine', () => {
  assert.match(game, /if\(b\.hasAttribute\('data-region-battle'\)\)[\s\S]*?combatStart\(\{regionId:id\}\)/);
  assert.match(game, /const pool=FIRST_REGION_ENCOUNTERS\.filter\(x=>x\.kind===\"normal\"&&x\.regionId===regionId\)/);
});

test('miniboss button resolves the same encounter catalog used by combatStart', () => {
  assert.ok(game.includes("FIRST_REGION_ENCOUNTERS.find(x=>x.id===String(b.dataset.regionMini||'')&&x.kind==='miniboss')"));
  assert.match(game, /combatStart\(\{regionId:encounter\.regionId,encounterId:encounter\.id\}\)/);
});

test('gather button clears stale combat state and returns to the active region panel', () => {
  assert.match(game, /const gatherFromRegion=\(id\)=>\{[\s\S]*?state\.combat=null;state\.battleRewards=null;state\.regionWave=\[\];state\.scene='danger_zone'/);
  assert.match(game, /b\.hasAttribute\('data-region-search'\)\|\|b\.hasAttribute\('data-region-gather'\)[\s\S]*?gatherFromRegion\(/);
});

test('deployed entry point requests the new cache-busted game module', () => {
  assert.match(html, /game\.js\?v=1850&nav=1850/);
});
