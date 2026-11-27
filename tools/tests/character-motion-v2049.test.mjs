import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCharacterDirectionV2049, resolveCharacterAnimationV2049, resolveCharacterMotionVectorV2049, CHARACTER_DIRECTIONS_V2049 } from '../../systems/characters/character-motion-v2049.js';

test('eight compass directions resolve deterministically',()=>{
  const vectors=[[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]];
  assert.deepEqual(vectors.map(([x,y])=>resolveCharacterDirectionV2049(x,y)),CHARACTER_DIRECTIONS_V2049);
});
test('movement vector is normalized for diagonal speed parity',()=>{
  const v=resolveCharacterMotionVectorV2049({stickX:1,stickY:1});
  assert.ok(Math.abs(Math.hypot(v.x,v.y)-1)<1e-9);
  assert.equal(v.moving,true);
});
test('idle, walk, run and interaction animation states are distinct',()=>{
  assert.equal(resolveCharacterAnimationV2049(), 'idle');
  assert.equal(resolveCharacterAnimationV2049({moving:true}), 'walk');
  assert.equal(resolveCharacterAnimationV2049({moving:true,running:true}), 'run');
  assert.equal(resolveCharacterAnimationV2049({moving:true,interacting:true}), 'interact');
});
test('near-zero input preserves idle state',()=>{
  assert.equal(resolveCharacterDirectionV2049(.01,.01,'west'),'west');
  assert.equal(resolveCharacterMotionVectorV2049({stickX:.01}).moving,false);
});

test('game runtime integrates the 40-sprite roster and keyboard plus joystick motion',async()=>{
  const {readFile}=await import('node:fs/promises');
  const game=await readFile(new URL('../../game.js',import.meta.url),'utf8');
  assert.match(game,/character-motion-v2049\.js\?v=2049/);
  assert.match(game,/CHARACTER_IDENTITY_ROSTER_V2047\.find/);
  assert.match(game,/data-stick/);
  assert.match(game,/worldKeyboardMotionBound/);
  assert.match(game,/playerAnimation==='run'/);
});
