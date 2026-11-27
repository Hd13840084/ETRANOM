import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SAFE_ZONE_WATER_V2041, drawSafeZoneWaterV2041 } from '../../systems/safe-zone/water-v2041.js';
const ctx={save(){},restore(){},translate(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},stroke(){},fill(){},ellipse(){},fillRect(){},closePath(){},set lineCap(v){},set lineJoin(v){},set strokeStyle(v){},set fillStyle(v){},set lineWidth(v){}};
test('V2041 defines the planned safe-zone water and ambient features',()=>{
  for(const item of ['Keshtezar irrigation stream','Rootwood woodland creek','Ash City reflecting pool','Sang-Ahan spring','stone and timber footbridges']) assert.ok(SAFE_ZONE_WATER_V2041.features.includes(item));
});
test('V2041 renderer runs with a canvas-compatible context',()=>assert.doesNotThrow(()=>drawSafeZoneWaterV2041(ctx,1200,0,0)));
test('V2041 renderer is integrated after V2040 nature layer',()=>{
  const source=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
  assert.match(source,/drawSafeZoneWaterV2041\(ctx,t,camX,camY\)/);
  assert.ok(source.indexOf('drawSafeZoneNatureV2040(ctx,t,camX,camY)') < source.indexOf('drawSafeZoneWaterV2041(ctx,t,camX,camY)'));
});
