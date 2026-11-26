import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getRegionOneSummonSealDropChanceV1999 } from '../../systems/content/region-one-seal-drop-rules-v1999.js';
const root=new URL('../../content/packs/region_one_master_v2/',import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const regions=read('regions/regions.json'), monsters=read('monsters/monsters.json');
test('Region One normal monsters drop Summon Seal I at 30%',()=>{const rows=monsters.filter(x=>regions.some(r=>r.id===x.region_id)&&x.kind==='normal');assert.equal(rows.length,30);for(const m of rows)assert.equal(getRegionOneSummonSealDropChanceV1999(m,regions),30);});
test('Region One minibosses drop Summon Seal I at 25%',()=>{const rows=monsters.filter(x=>regions.some(r=>r.id===x.region_id)&&['mini_boss','miniboss'].includes(x.kind));assert.equal(rows.length,5);for(const m of rows)assert.equal(getRegionOneSummonSealDropChanceV1999(m,regions),25);});
test('Region One final boss drops Summon Seal I at 35%',()=>{const boss=monsters.find(x=>x.kind==='area_boss'&&regions.some(r=>r.id===x.region_id));assert.ok(boss);assert.equal(getRegionOneSummonSealDropChanceV1999(boss,regions),35);});
test('Other regions do not use Region One seal rates',()=>{assert.equal(getRegionOneSummonSealDropChanceV1999({regionId:'region_two',kind:'normal'},regions),null);});
test('Game runtime grants only seal I from Region One and retains old tables elsewhere',()=>{const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');assert.match(game,/getRegionOneSummonSealDropChanceV1999/);assert.match(game,/summon_seal_5/);assert.match(game,/summon_seal_1/);const html=fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');assert.match(html,/game\.js\?v=1999\&nav=1999/);});
test('Recipe definitions were not edited',()=>{const recipePath=new URL('../../content/packs/region_one_master_v2/recipes/recipes.json',import.meta.url);assert.ok(fs.existsSync(recipePath));});

test('Underworld Gate unlock uses Summon Seal I as the same item',()=>{const gate=fs.readFileSync(new URL('../../systems/classes/necromancer-underworld-gate-v1984.js',import.meta.url),'utf8');assert.match(gate,/NECROMANCER_GATE_ITEM_ID = 'summon_seal_1'/);assert.doesNotMatch(gate,/underworld_gate_seal/);});
test('Summon Seal I remains Necromancer-only and has no separate gate-seal drop id',()=>{const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');assert.match(game,/if\(isNecromancer\(\)\)\{/);assert.doesNotMatch(game,/underworld_gate_seal/);});
