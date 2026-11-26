import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SAFE_ZONE_GROUND_DRESSING_V2039 as dressing,SAFE_ZONE_GROUND_DRESSING_IDS_V2039 as ids} from '../../systems/safe-zone/ground-dressing-v2039.js';
const game=readFileSync(new URL('../../game.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../../index.html',import.meta.url),'utf8');
test('ground dressing covers all 27 safe-zone buildings',()=>{
 assert.equal(ids.length,27);
 assert.equal(new Set(ids).size,27);
 for(const id of ids){assert.ok(dressing[id],`missing ${id}`);assert.equal(dressing[id].length,2);}
});
test('live world renderer draws the new decorative dressing after buildings',()=>{
 assert.match(game,/SAFE_ZONE_GROUND_DRESSING_V2039/);
 assert.match(game,/function drawSafeZoneGroundDressing\(t\)/);
 assert.match(game,/cityPOI\.forEach\(drawBuilding\);\s*drawSafeZoneGroundDressing\(t\);/);
 assert.match(index,/game\.js\?v=2046/);
});
test('ground dressing is visual-only and not added to collision or interaction registries',()=>{
 const start=game.indexOf('// V2039: deterministic, decorative ground dressing');
 const end=game.indexOf('// مرحله مبلمان شهری',start);
 const section=game.slice(start,end);
 for(const forbidden of ['obstacles.push','fetch(','supabase','damage','quest','inventory'])assert.equal(section.includes(forbidden),false,forbidden);
});
