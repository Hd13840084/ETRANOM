import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  auditCharacterAnimationV2130,
  createCharacterAnimationClockV2130,
  getCharacterAnimationPoseV2130,
  getCharacterAnimationTimingV2130,
  hashCharacterAnimationSeedV2130,
  resolveCharacterAnimationV2130,
  resolveCharacterDirectionV2130
} from '../../systems/characters/character-animation-v2130.js';

const game = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
const presence = fs.readFileSync(new URL('../../systems/online/presence.js', import.meta.url), 'utf8');

test('V2130 keeps all eight movement directions and four animation states', () => {
  const directions = [[0,1,'south'],[1,1,'south-east'],[1,0,'east'],[1,-1,'north-east'],[0,-1,'north'],[-1,-1,'north-west'],[-1,0,'west'],[-1,1,'south-west']];
  for (const [x,y,want] of directions) assert.equal(resolveCharacterDirectionV2130(x,y), want);
  assert.equal(resolveCharacterDirectionV2130(0,0,'west'), 'west');
  assert.equal(resolveCharacterAnimationV2130({}), 'idle');
  assert.equal(resolveCharacterAnimationV2130({moving:true}), 'walk');
  assert.equal(resolveCharacterAnimationV2130({moving:true,running:true}), 'run');
  assert.equal(resolveCharacterAnimationV2130({interacting:true}), 'interact');
  assert.equal(auditCharacterAnimationV2130().valid, true);
});

test('state changes restart clips at frame zero instead of using page uptime', () => {
  const clocks = createCharacterAnimationClockV2130();
  const idle = getCharacterAnimationTimingV2130(clocks, 'local', 'idle', 180000);
  const walk = getCharacterAnimationTimingV2130(clocks, 'local', 'walk', 180500);
  assert.equal(idle.elapsedMs, 0);
  assert.equal(walk.elapsedMs, 0);
  assert.equal(walk.requestedState, 'walk');
  assert.equal(walk.state, 'walk');
});

test('interaction is a one-shot clip and then returns to idle', () => {
  const clocks = createCharacterAnimationClockV2130();
  const start = getCharacterAnimationTimingV2130(clocks, 'remote-1', 'interact', 10000);
  const middle = getCharacterAnimationTimingV2130(clocks, 'remote-1', 'interact', 10400);
  const finished = getCharacterAnimationTimingV2130(clocks, 'remote-1', 'interact', 11200);
  assert.equal(start.state, 'interact');
  assert.equal(start.elapsedMs, 0);
  assert.equal(middle.state, 'interact');
  assert.equal(middle.elapsedMs, 400);
  assert.equal(finished.state, 'idle');
  assert.equal(finished.interactionFinished, true);
  assert.ok(finished.elapsedMs >= 0);
});

test('each online player receives a stable animation phase independent of moving coordinates', () => {
  const clocks = createCharacterAnimationClockV2130();
  const seed = hashCharacterAnimationSeedV2130('remote:account-42');
  const a = getCharacterAnimationTimingV2130(clocks, 'remote:account-42', 'walk', 1000);
  const b = getCharacterAnimationTimingV2130(clocks, 'remote:account-42', 'walk', 1100);
  assert.equal(a.phaseSeed, b.phaseSeed);
  assert.equal(a.phaseSeed, seed);
  assert.equal(b.elapsedMs, 100);
});

test('walk and run keep the pixel character grounded with restrained body motion', () => {
  for (const state of ['idle','walk','run','interact']) {
    for (const t of [0,120,500,1200]) {
      const pose = getCharacterAnimationPoseV2130(state, t, 0);
      for (const key of ['bob','scaleX','scaleY','tilt','lean']) assert.ok(Number.isFinite(pose[key]));
      assert.ok(pose.scaleX > .95 && pose.scaleX < 1.05);
      assert.ok(pose.scaleY > .95 && pose.scaleY < 1.05);
    }
  }
});

test('game uses state-relative animation clocks for local, remote and overview-map avatars', () => {
  assert.match(game, /getCharacterAnimationTimingV2130\(characterAnimationClocks, '__local_player__'/);
  assert.match(game, /getCharacterAnimationTimingV2130\(characterAnimationClocks, remoteActorId/);
  assert.match(game, /assets\/characters\/v2055\/.*mapState.*mapDirection/);
  assert.match(game, /ETRANOM_PLAYER_INTERACT_UNTIL__/);
  assert.match(game, /etranom-map-sprite-v2130/);
});

test('Presence allows a bounded early publish for animation-state edges', () => {
  assert.match(presence, /animationEdgeReady = animationChanged && now - this\.lastLocationTrackAt >= 300/);
});
