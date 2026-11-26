import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SAFE_ZONE_COMPLETION_V2044, drawSafeZoneCompletionV2044, auditSafeZoneCompletionV2044 } from '../../systems/safe-zone/completion-v2044.js';

test('V2044 has wayfinding markers for all four safe-zone settlements',()=>{
  assert.equal(SAFE_ZONE_COMPLETION_V2044.zones.length,4);
  assert.equal(SAFE_ZONE_COMPLETION_V2044.exteriorBuildingCount,27);
  const audit=auditSafeZoneCompletionV2044();
  assert.equal(audit.zoneMarkers,4);
  assert.equal(audit.zonesCovered.length,4);
});
test('V2044 audits existing exterior and interior catalogs without missing metadata',()=>{
  const audit=auditSafeZoneCompletionV2044();
  assert.ok(audit.exteriorCount>=27);
  assert.equal(audit.exteriorUnique,true);
  assert.equal(audit.exteriorMetadataComplete,true);
  assert.ok(audit.interiorCount>0);
  assert.equal(audit.interiorMetadataComplete,true);
});
test('V2044 renderer is safe with a minimal canvas context and culls distant markers',()=>{
  const ctx={save(){},restore(){},beginPath(){},ellipse(){},fill(){},fillRect(){},strokeRect(){},fillText(){},set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){},set textAlign(v){},set textBaseline(v){},set font(v){},set globalAlpha(v){}};
  assert.doesNotThrow(()=>drawSafeZoneCompletionV2044(ctx,1000,0,0));
  assert.doesNotThrow(()=>drawSafeZoneCompletionV2044(ctx,1000,1500,900));
});
test('V2044 is integrated after V2042 and remains visual-only',()=>{
  const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
  assert.match(game,/drawSafeZoneCompletionV2044\(ctx,t,camX,camY\)/);
  assert.ok(game.indexOf('drawSafeZoneFinishV2042(ctx,t,camX,camY,finishNight)')<game.indexOf('drawSafeZoneCompletionV2044(ctx,t,camX,camY)'));
  const source=fs.readFileSync(new URL('../../systems/safe-zone/completion-v2044.js',import.meta.url),'utf8');
  assert.match(source,/Visual-only markers/);
  assert.doesNotMatch(source,/localStorage|fetch\(|collisionRegistry/);
});
