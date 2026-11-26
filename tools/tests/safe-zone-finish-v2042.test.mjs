import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SAFE_ZONE_FINISH_V2042, drawSafeZoneFinishV2042 } from '../../systems/safe-zone/finish-v2042.js';

test('V2042 defines a combined finish pass for all four safe-zone areas',()=>{
  assert.deepEqual(SAFE_ZONE_FINISH_V2042.zones,['Ash City','Keshtezar','Rootwood','Sang-Ahan']);
  assert.ok(SAFE_ZONE_FINISH_V2042.features.includes('warm lantern pools'));
  assert.ok(SAFE_ZONE_FINISH_V2042.features.includes('flower beds'));
});

test('V2042 renderer is safe with a minimal canvas context and viewport culling',()=>{
  const gradient={addColorStop(){}};
  const ctx={save(){},restore(){},translate(){},rotate(){},beginPath(){},ellipse(){},fill(){},stroke(){},fillRect(){},moveTo(){},lineTo(){},arc(){},createRadialGradient(){return gradient;},set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){}};
  assert.doesNotThrow(()=>drawSafeZoneFinishV2042(ctx,1200,0,0,.5));
  assert.doesNotThrow(()=>drawSafeZoneFinishV2042(ctx,1200,2100,1000,1));
});

test('V2042 pass is integrated after water and remains visual-only',()=>{
  const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
  assert.match(game,/drawSafeZoneFinishV2042\(ctx,t,camX,camY,finishNight\)/);
  assert.ok(game.indexOf('drawSafeZoneWaterV2041(ctx,t,camX,camY)')<game.indexOf('drawSafeZoneFinishV2042(ctx,t,camX,camY,finishNight)'));
  const source=fs.readFileSync(new URL('../../systems/safe-zone/finish-v2042.js',import.meta.url),'utf8');
  assert.match(source,/Render-only decoration/);
  assert.doesNotMatch(source,/collisionRegistry|localStorage|fetch\(/);
});
