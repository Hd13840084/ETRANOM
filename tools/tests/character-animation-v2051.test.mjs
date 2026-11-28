import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CHARACTER_ANIMATION_CLIPS_V2051, CHARACTER_ANIMATION_DIRECTIONS_V2051, resolveCharacterAnimationFrameV2051, getCharacterAnimationPoseV2051, isValidCharacterAnimationDirectionV2051 } from '../../systems/characters/character-animation-v2051.js';

test('V2051 defines all four required animation clips with bounded frame counts',()=>{
  assert.deepEqual(Object.keys(CHARACTER_ANIMATION_CLIPS_V2051),['idle','walk','run','interact']);
  for(const clip of Object.values(CHARACTER_ANIMATION_CLIPS_V2051)){assert.ok(clip.durationMs>0);assert.ok(clip.frames>=4);}
});
test('V2051 frame selection loops locomotion and clamps one-shot interaction',()=>{
  assert.equal(resolveCharacterAnimationFrameV2051('walk',0).frame,0);
  assert.equal(resolveCharacterAnimationFrameV2051('walk',440).frame,0);
  const done=resolveCharacterAnimationFrameV2051('interact',9999);
  assert.equal(done.frame,3);assert.equal(done.complete,true);
});
test('V2051 exposes stable pose values for local and remote renderers',()=>{
  for(const state of ['idle','walk','run','interact']){
    const pose=getCharacterAnimationPoseV2051(state,250,17);
    for(const key of ['bob','scaleX','scaleY','tilt','frame']) assert.ok(Number.isFinite(pose[key]));
  }
});
test('V2051 validates the eight supported directions',()=>{
  assert.equal(CHARACTER_ANIMATION_DIRECTIONS_V2051.length,8);
  assert.ok(CHARACTER_ANIMATION_DIRECTIONS_V2051.every(isValidCharacterAnimationDirectionV2051));
  assert.equal(isValidCharacterAnimationDirectionV2051('up-left'),false);
});
test('game renders both local and remote avatars through the current V2064 controller',async()=>{
  const source=await readFile(new URL('../../game.js',import.meta.url),'utf8');
  assert.match(source,/getCharacterAnimationPoseV2064\(playerAnimation,t\)/);
  assert.match(source,/getCharacterAnimationPoseV2064\(remoteAnimation,t,/);
  assert.match(source,/drawCharacterAtlasFrame\(ctx,other\.specialization_id/);
});
