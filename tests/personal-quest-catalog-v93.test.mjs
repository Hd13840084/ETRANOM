import fs from 'node:fs';
import assert from 'node:assert/strict';
import {resetLegacySafeZoneProgress} from '../systems/safe-zone/safe-zone-engine.js';
const game=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
assert.equal(game.includes('const personalQuestPools='),false);assert.equal(game.includes('const personalQuestNpcPools='),false);assert.equal(game.includes('function personalQuestSpec('),false);assert.equal(game.includes('function dailyRequestFor('),false);
const save={personalQuests:{x:{}},dailyRequest:{active:true},inventory:[{id:'bread',qty:1},{id:'thorn_hide',qty:2}],gold:90};resetLegacySafeZoneProgress(save);assert.equal('personalQuests' in save,false);assert.equal('dailyRequest' in save,false);assert.deepEqual(save.inventory,[{id:'thorn_hide',qty:2}]);assert.equal(save.gold,90);
console.log('V1961: local personal quest/request content and local inventory items are reset.');
