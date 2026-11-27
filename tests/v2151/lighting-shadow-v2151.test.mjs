import test from 'node:test';
import assert from 'node:assert/strict';
import {auditLightingShadowV2150,drawLightingShadowV2150,ETRANOM_LIGHTING_SHADOW_V2150} from '../../systems/world/lighting-shadow-v2151.js';
test('V2151 authored caster catalog and emitters are valid',()=>{const a=auditLightingShadowV2150();assert.equal(a.ok,true);assert.equal(a.emitters,19);assert.equal(a.shadowCasters,9);});
test('V2151 exposes polygonal sun shadows and point-light occlusion',()=>{assert.equal(ETRANOM_LIGHTING_SHADOW_V2150.version,2154);assert.equal(ETRANOM_LIGHTING_SHADOW_V2150.shadowCasters.length,9);assert.ok(ETRANOM_LIGHTING_SHADOW_V2150.limitations.some(x=>x.includes('polygonal occlusion')));});
test('V2151 render pass draws projected caster polygons on canvas-like context',()=>{let paths=0;const grad={addColorStop(){}};const ctx={canvas:{width:800,height:600},save(){},restore(){},fillRect(){},beginPath(){paths++},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},arc(){},createLinearGradient(){return grad},createRadialGradient(){return grad}};const r=drawLightingShadowV2150(ctx,0,0,12,0,900);assert.equal(r.ok,true);assert.equal(r.shadowCasters,9);assert.ok(paths>9);});
