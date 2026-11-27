import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLightingShadowV2150, resolveLightingCycleV2150, drawLightingShadowV2150, ETRANOM_LIGHTING_SHADOW_V2150 } from '../../systems/world/lighting-shadow-v2150.js';
test('V2150 emitter and shadow catalog audit passes',()=>{const a=auditLightingShadowV2150();assert.equal(a.ok,true);assert.equal(a.emitters,19);assert.equal(a.shadowCasters,5);});
test('V2150 daylight and night cycle are distinct',()=>{const d=resolveLightingCycleV2150(12,0),n=resolveLightingCycleV2150(0,0);assert.equal(d.ambientAlpha,0);assert.ok(n.ambientAlpha>d.ambientAlpha);assert.ok(n.night>d.night);});
test('V2150 draw pass safely handles a canvas-like context',()=>{const calls=[];const gradient={addColorStop(){}};const ctx={canvas:{width:800,height:600},save(){},restore(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},arc(){},createLinearGradient(){return gradient;},createRadialGradient(){return gradient;}};const r=drawLightingShadowV2150(ctx,0,0,0,0,1000);assert.equal(r.ok,true);assert.ok(r.emitters>0);});
test('V2150 catalog exposes explicit physical-rendering limits',()=>{assert.equal(ETRANOM_LIGHTING_SHADOW_V2150.stage,12);assert.ok(ETRANOM_LIGHTING_SHADOW_V2150.limitations.includes('no per-pixel shadow maps'));});
