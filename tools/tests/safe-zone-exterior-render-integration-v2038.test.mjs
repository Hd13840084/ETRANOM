import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SAFE_ZONE_EXTERIOR_CATALOG_V2037 as catalog,SAFE_ZONE_EXTERIOR_IDS_V2037 as ids} from '../../systems/safe-zone/exterior-catalog-v2037.js';

const game=readFileSync(new URL('../../game.js',import.meta.url),'utf8');

test('live game imports the approved exterior architecture catalog',()=>{
 assert.match(game,/SAFE_ZONE_EXTERIOR_CATALOG_V2037/);
 assert.match(game,/exterior-catalog-v2037\.js\?v=2037/);
});

test('live building renderer resolves an architecture record for each map POI',()=>{
 assert.match(game,/function drawBuilding\(o\)[\s\S]{0,600}SAFE_ZONE_EXTERIOR_CATALOG_V2037\[o\.id\]/);
 for(const id of ids) assert.ok(catalog[id],`missing exterior record: ${id}`);
});

test('exterior records drive roof material detail and nearby signature plaque',()=>{
 assert.match(game,/architecture\.materials/);
 assert.match(game,/architecture\.roof/);
 assert.match(game,/architecture\.signature/);
});

test('V2038 visual integration does not add gameplay or network mutations',()=>{
 const added=game.slice(game.indexOf('// V2038: live exterior rendering'),game.indexOf('// تابلوهای راهنما'));
 for(const forbidden of ['fetch(','supabase','damage','inventory','quest']) assert.equal(added.includes(forbidden),false,forbidden);
});
