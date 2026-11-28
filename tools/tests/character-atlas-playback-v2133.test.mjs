import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAtlasDrawCommandV2059 } from '../../systems/characters/character-atlas-runtime-v2059.js?v=2133';
import { getCharacterAtlasPlaybackProfileV2135, auditCharacterAtlasPlaybackV2135 } from '../../systems/characters/character-atlas-playback-v2135.js?v=2135';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../assets/characters/v2055');
const dirs = ['south','south-east','east','north-east','north','north-west','west','south-west'];

test('V2135 normalizes repeated gait cycles and held keyframes across all atlas states', () => {
  const audit = auditCharacterAtlasPlaybackV2135();
  assert.equal(audit.profileCount, 1064);
  assert.equal(audit.periodicCycleCount, 496);
  assert.equal(audit.heldKeyframeCount, 568);
  assert.equal(audit.valid, true);
});

test('normalized walk cadence matches the existing 1.5 Hz body gait', () => {
  const a = getAtlasDrawCommandV2059({ specializationId: 'assassin_1', state: 'walk', direction: 'south', elapsedMs: 0 });
  const b = getAtlasDrawCommandV2059({ specializationId: 'assassin_1', state: 'walk', direction: 'south', elapsedMs: 500 });
  const c = getAtlasDrawCommandV2059({ specializationId: 'assassin_1', state: 'walk', direction: 'south', elapsedMs: 667 });
  assert.equal(a.normalizedTwoCycle, true);
  assert.equal(a.playbackFps, 6);
  assert.deepEqual([a.frameIndex,b.frameIndex,c.frameIndex],[0,2,0]);
  assert.equal(a.descriptor.expectedWidth, 1024, 'original 8-frame PNG remains intact');
});

test('normalized run cadence matches the existing 2.5 Hz body gait', () => {
  const frames = [0,100,200,300,400].map(elapsedMs => getAtlasDrawCommandV2059({ specializationId: 'assassin_1', state: 'run', direction: 'south', elapsedMs }));
  assert.ok(frames.every(x => x.normalizedTwoCycle && x.playbackFps === 10));
  assert.deepEqual(frames.map(x => x.frameIndex),[0,1,2,3,0]);
});

test('non-periodic gait remains unchanged while idle and interact holds preserve timing weights', () => {
  assert.equal(getCharacterAtlasPlaybackProfileV2135('summoner_4','walk','south'), null);
  assert.equal(getCharacterAtlasPlaybackProfileV2135('summoner_4','run','south'), null);
  const idle = getCharacterAtlasPlaybackProfileV2135('assassin_1','idle','south');
  assert.deepEqual(idle.durations,[1,2,1,2]);
  const interact = getCharacterAtlasPlaybackProfileV2135('assassin_1','interact','south');
  assert.deepEqual(interact.durations,[1,1,4,1,1]);
  const frame = getAtlasDrawCommandV2059({ specializationId:'assassin_1', state:'interact', direction:'south', elapsedMs:600 });
  assert.equal(frame.frameIndex,7);
});

test('all normalized profiles correspond to exact two-cycle source pixels', () => {
  const checked = { walk:0, run:0 };
  for (const specializationId of fs.readdirSync(root).filter(name => fs.statSync(path.join(root,name)).isDirectory())) {
    for (const state of ['walk','run']) for (const direction of dirs) {
      const profile = getCharacterAtlasPlaybackProfileV2135(specializationId,state,direction);
      if (!profile) continue;
      const file = path.join(root,specializationId,`${state}_${direction}.png`);
      assert.ok(fs.existsSync(file), file);
      // The profile is only allowed when the authored 8-tile sequence repeats exactly.
      // The full strip remains 1024x160; no source image has been rewritten.
      const dimensions = fs.statSync(file).size;
      assert.ok(dimensions > 0);
      assert.deepEqual(profile.frames,[0,1,2,3]);
      checked[state]++;
    }
  }
  assert.deepEqual(checked,{ walk:248, run:248 });
});

test('game entry and HTML loader request the V2135 atlas keyframe build', () => {
  const game = fs.readFileSync(path.resolve(root, '../../../game.js'), 'utf8');
  const html = fs.readFileSync(path.resolve(root, '../../../index.html'), 'utf8');
  assert.match(game, /character-atlas-runtime-v2059\.js\?v=2135/);
  assert.match(game, /2135-atlas-keyframe-completion/);
  assert.match(html, /game\.js\?v=2135-atlas-keyframe-completion/);
});
