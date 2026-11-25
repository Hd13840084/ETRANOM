import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCharacterDirectionV2064, resolveCharacterAnimationV2064, getCharacterAnimationFrameV2064, getCharacterAnimationPoseV2064, auditCharacterAnimationV2064 } from '../../systems/characters/character-animation-v2064.js';

test('V2064 supports all eight independent directions',()=>{
 const dirs=[[0,1,'south'],[1,1,'south-east'],[1,0,'east'],[1,-1,'north-east'],[0,-1,'north'],[-1,-1,'north-west'],[-1,0,'west'],[-1,1,'south-west']];
 for(const [x,y,want] of dirs) assert.equal(resolveCharacterDirectionV2064(x,y),want);
 assert.equal(resolveCharacterDirectionV2064(0,0,'west'),'west');
});
test('V2064 selects idle, walk, run and one-shot interaction',()=>{
 assert.equal(resolveCharacterAnimationV2064({}), 'idle');
 assert.equal(resolveCharacterAnimationV2064({moving:true}), 'walk');
 assert.equal(resolveCharacterAnimationV2064({moving:true,running:true}), 'run');
 assert.equal(resolveCharacterAnimationV2064({moving:true,interacting:true}), 'interact');
});
test('all clips advance with correct loop semantics',()=>{
 for(const state of ['idle','walk','run']) { const a=getCharacterAnimationFrameV2064(state,0); const b=getCharacterAnimationFrameV2064(state,100000); assert.equal(a.loop,true); assert.ok(b.frame>=0&&b.frame<b.frameCount); }
 const end=getCharacterAnimationFrameV2064('interact',100000); assert.equal(end.loop,false); assert.equal(end.frame,end.frameCount-1); assert.equal(end.complete,true);
});
test('pose values remain finite for all animation states',()=>{
 for(const state of ['idle','walk','run','interact']) for(const t of [0,120,500,1200]) { const p=getCharacterAnimationPoseV2064(state,t); for(const k of ['bob','scaleX','scaleY','tilt','lean']) assert.ok(Number.isFinite(p[k])); }
});
test('direction/state contract is exactly 8 by 4',()=>{ const a=auditCharacterAnimationV2064(); assert.equal(a.valid,true); assert.equal(a.directions,8); assert.equal(a.states,4); });
