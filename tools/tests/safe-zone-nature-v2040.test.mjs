import test from 'node:test';
import assert from 'node:assert/strict';
import { SAFE_ZONE_NATURE_V2040, drawSafeZoneNatureV2040 } from '../../systems/safe-zone/nature-v2040.js';
import { readFileSync } from 'node:fs';
const game=readFileSync(new URL('../../game.js',import.meta.url),'utf8');
test('V2040 defines four distinct safe-zone biome palettes',()=>{assert.deepEqual(Object.keys(SAFE_ZONE_NATURE_V2040),['city','grain','rootwood','iron']);assert.equal(new Set(Object.values(SAFE_ZONE_NATURE_V2040).map(x=>x.palette)).size,4);});
test('V2040 nature renderer is integrated after terrain depth',()=>{assert.match(game,/drawSafeZoneNatureV2040\(ctx,t,camX,camY\)/);assert.match(game,/nature-v2040\.js\?v=2040/);});
test('V2040 nature pass is render-only and callable with a canvas context',()=>{const noop=()=>{};const ctx=new Proxy({}, {get:(_,k)=>k==='save'||k==='restore'||k==='beginPath'||k==='ellipse'||k==='fill'||k==='stroke'||k==='fillRect'||k==='moveTo'||k==='lineTo'||k==='quadraticCurveTo'||k==='arc'||k==='translate'?noop:k==='measureText'?()=>({width:0}):undefined,set:()=>true});assert.doesNotThrow(()=>drawSafeZoneNatureV2040(ctx,1000,0,0));});
