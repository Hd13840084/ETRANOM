import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getCharacterAnimationPoseV2064 } from '../../systems/characters/character-animation-v2064.js';
const game = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
test('walk and run use visible feet-anchored scale, bob and lean variation', () => {
  const walkA = getCharacterAnimationPoseV2064('walk', 0);
  const walkB = getCharacterAnimationPoseV2064('walk', 70);
  const runA = getCharacterAnimationPoseV2064('run', 0);
  const runB = getCharacterAnimationPoseV2064('run', 45);
  assert.notEqual(walkA.scaleX, walkB.scaleX);
  assert.notEqual(runA.scaleY, runB.scaleY);
  assert.ok(runA.lean > walkA.lean);
  assert.ok(Math.abs(runB.bob) > 0);
});
test('atlas and fallback sprites both apply the animation pose around the feet anchor', () => {
  assert.match(game, /command\.sourceWidth, command\.sourceHeight, x \* \(pose\.scaleX/);
  assert.match(game, /ctx\.translate\(0, -playerPose\.lean \* 8\)/);
});
