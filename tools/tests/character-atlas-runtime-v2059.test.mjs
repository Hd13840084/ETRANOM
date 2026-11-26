import test from 'node:test';
import assert from 'node:assert/strict';
import { getAtlasDrawCommandV2059, loadAtlasForDrawV2059, getAtlasPreloadQueueSizeV2059 } from '../../systems/characters/character-atlas-runtime-v2059.js';

test('draw command resolves stable frame geometry for a specialization',()=>{
 const c=getAtlasDrawCommandV2059({specializationId:'wizard_necromancer',state:'walk',direction:'north-west',elapsedMs:250});
 assert.equal(c.descriptor.specializationId,'wizard_necromancer');
 assert.equal(c.sourceWidth,128); assert.equal(c.sourceHeight,160);
 assert.equal(c.sourceX,c.frameIndex*128); assert.equal(c.descriptor.direction,'north-west');
});
test('unknown clip safely resolves to idle',()=>{
 const c=getAtlasDrawCommandV2059({specializationId:'wizard_necromancer',state:'invalid'});
 assert.equal(c.descriptor.state,'idle');
});
test('renderer never receives an invalid image object',()=>{
 const c=getAtlasDrawCommandV2059({specializationId:'wizard_necromancer'});
 assert.equal(loadAtlasForDrawV2059(c),null);
 assert.equal(getAtlasPreloadQueueSizeV2059(),0);
});
